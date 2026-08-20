/* -------------------- Minimal audio engine (skank) ------------------- */
/* Generates a short reggae-y riff: offbeat chords + tiny bass drop. */
class Riff {
  constructor(){
    this.ctx = null;
    this.master = null;
    this.muted = false;
  }
  _ensure(){
    if(!this.ctx){
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
  }
  setMuted(m){ this.muted = m; if(this.master) this.master.gain.value = m?0:0.5 }
  async play(duration=3.2){
    this._ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime + 0.05;

    const bpm = 88, beat = 60/bpm;
    const bars = Math.max(1, Math.round(duration/(4*beat)));
    const root = 196; // G3-ish
    const prog = [0, 2, 5, 7];
    const gain = ctx.createGain(); gain.gain.value = this.muted?0:0.45; gain.connect(this.master);

    for(let b=0; b<bars*4; b++){
      const chordDegree = prog[b%prog.length];
      const base = root * Math.pow(2, chordDegree/12);
      const t = now + b*beat;
      const hit = t + beat*0.50;
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), o3 = ctx.createOscillator();
      o1.type='triangle'; o2.type='triangle'; o3.type='triangle';
      o1.frequency.value = base; o2.frequency.value = base*1.25; o3.frequency.value = base*1.5;

      const env = ctx.createGain(); env.gain.setValueAtTime(0, hit);
      env.gain.linearRampToValueAtTime(this.muted?0:0.35, hit+0.005);
      env.gain.exponentialRampToValueAtTime(0.001, hit+beat*0.40);

      o1.connect(env); o2.connect(env); o3.connect(env); env.connect(gain);
      o1.start(hit); o2.start(hit); o3.start(hit);
      o1.stop(hit+beat*0.45); o2.stop(hit+beat*0.45); o3.stop(hit+beat*0.45);
    }

    const bosc = ctx.createOscillator(); bosc.type='sawtooth';
    const benv = ctx.createGain(); benv.gain.value = 0; benv.connect(gain); bosc.connect(benv);
    const t0 = now + beat*0.0;
    bosc.frequency.setValueAtTime(root/2, t0);
    benv.gain.linearRampToValueAtTime(this.muted?0:0.28, t0+0.01);
    benv.gain.exponentialRampToValueAtTime(0.0001, t0+beat*0.9);
    bosc.start(t0); bosc.stop(t0+beat*1.0);

    const endAt = now + bars*4*beat;
    return new Promise(res=> setTimeout(res, Math.max(0,(endAt-ctx.currentTime))*1000));
  }
}

/* ---------------------------- Game logic ----------------------------- */
const riff = new Riff();

const els = {
  round: document.getElementById('round-pill'),
  streak: document.getElementById('streak'),
  score: document.getElementById('score'),
  play: document.getElementById('playBtn'),
  stop: document.getElementById('stopBtn'),
  next: document.getElementById('nextBtn'),
  choices: document.getElementById('choices'),
  feedback: document.getElementById('feedback'),
  prog: document.getElementById('progbar'),
  hint: document.getElementById('hint'),
  playerName: document.getElementById('playerName'),
};

let QUESTIONS = [];
let state = { idx: 0, canAnswer: false, score: 0, streak: 0, bestStreak: 0, answered:false, muted:false };

async function loadQuestions(){
  const res = await fetch('/api/questions');
  QUESTIONS = await res.json();
  renderQuestion();
}

function renderQuestion(){
  if(!QUESTIONS.length) return;
  const q = QUESTIONS[state.idx];
  els.round.textContent = `Round ${state.idx+1} / ${QUESTIONS.length}`;
  els.choices.innerHTML = '';
  q.options.forEach((opt,i)=>{
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.setAttribute('data-i', i);
    btn.disabled = true;
    btn.addEventListener('click', ()=> choose(i));
    els.choices.appendChild(btn);
  });
  els.feedback.textContent = '';
  els.feedback.className = 'feedback';
  state.canAnswer = false;
  state.answered = false;
  els.play.classList.remove('disabled');
  els.stop.classList.add('disabled');
  els.next.classList.add('disabled');
  els.hint.textContent = 'Tap "Play clip". When it stops, pick the correct line.';
  setProgress();
}

function setProgress(){
  const pct = (state.idx)/QUESTIONS.length*100;
  els.prog.style.width = `${pct}%`;
}
function setFinalProgress(){ els.prog.style.width = '100%'; }

async function playClip(){
  if(els.play.classList.contains('disabled')) return;
  els.play.classList.add('disabled');
  els.stop.classList.remove('disabled');
  els.hint.textContent = 'Listening… get ready!';
  await riff.play(3.2);
  revealAnswers();
}
function revealAnswers(){
  state.canAnswer = true;
  els.stop.classList.add('disabled');
  els.hint.textContent = 'Choose the correct lyric.';
  [...els.choices.children].forEach(b=> b.disabled = false);
}
function stopEarly(){
  if(els.stop.classList.contains('disabled')) return;
  revealAnswers();
}

function choose(i){
  if(!state.canAnswer || state.answered) return;
  state.answered = true;
  const q = QUESTIONS[state.idx];
  const kids = [...els.choices.children];
  kids.forEach((b,idx)=>{
    b.disabled = true;
    if(idx === q.answer) b.classList.add('correct');
  });

  if(i === q.answer){
    const gained = 100 + state.streak*10;
    state.score += gained;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    els.feedback.textContent = `Nice! +${gained} (streak ${state.streak})`;
    els.feedback.classList.add('good');
  } else {
    kids[i].classList.add('wrong');
    state.streak = 0;
    els.feedback.textContent = 'Missed it — keep grooving!';
    els.feedback.classList.add('bad');
  }
  els.score.textContent = state.score;
  els.streak.textContent = state.streak;
  els.next.classList.remove('disabled');
  els.next.focus();
}

function next(){
  if(els.next.classList.contains('disabled')) return;
  state.idx++;
  if(state.idx >= QUESTIONS.length){
    setFinalProgress();
    endScreen();
  } else {
    setProgress();
    renderQuestion();
  }
}

async function endScreen(){
  els.choices.innerHTML = '';
  els.hint.textContent = '';
  els.feedback.className = 'feedback good';
  els.feedback.innerHTML = `Show's over! Final score <b>${state.score}</b>. Press "Play again" to restart.`;
  els.play.textContent = 'Play again';
  els.play.classList.remove('disabled');
  els.play.onclick = restart;
  els.stop.classList.add('disabled');
  els.next.classList.add('disabled');
  els.round.textContent = `All rounds complete`;

  const playerName = (els.playerName.value || 'Anonymous').trim() || 'Anonymous';
  try{
    await fetch('/api/score', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({player_name: playerName, score: state.score, best_streak: state.bestStreak})
    });
  }catch(e){ /* leaderboard save is best-effort */ }
}

function restart(){
  els.play.onclick = playClip;
  els.play.textContent = 'Play clip';
  state = { idx:0, canAnswer:false, score:0, streak:0, bestStreak:0, answered:false, muted:state.muted };
  els.score.textContent = 0; els.streak.textContent = 0;
  setProgress();
  renderQuestion();
}

document.addEventListener('keydown', (e)=>{
  if(e.key>='1' && e.key<='4'){
    const idx = parseInt(e.key,10)-1;
    if(state.canAnswer && !state.answered){ choose(idx); }
  } else if(e.key===' '){
    e.preventDefault();
    if(!els.play.classList.contains('disabled')) playClip();
  } else if(e.key.toLowerCase()==='m'){
    state.muted = !state.muted;
    riff.setMuted(state.muted);
    els.feedback.textContent = state.muted ? 'Muted.' : 'Sound on.';
    els.feedback.className = 'feedback';
  }
});

els.play.addEventListener('click', playClip);
els.stop.addEventListener('click', stopEarly);
els.next.addEventListener('click', next);

loadQuestions();
