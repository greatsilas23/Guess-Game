# Lyric Drop — Flask + MySQL

A fullstack rebuild of the original single-file "Lyric Drop" pixel reggae
lyrics quiz. Questions now live in MySQL instead of a hardcoded JS array, and
finishing a game saves your score to a real leaderboard.

## Stack
- **Backend:** Flask, Flask-SQLAlchemy (serves a small JSON API)
- **Database:** MySQL (via PyMySQL driver)
- **Frontend:** Jinja2 shell + vanilla JS game client (Web Audio, no external
  audio/image files — the "sprite" is drawn in pure CSS)

## Setup

1. **Create the database:**
   ```sql
   CREATE DATABASE lyricdrop CHARACTER SET utf8mb4;
   ```

2. **Install dependencies:**
   ```bash
   python -m venv venv
   source venv/bin/activate   # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # edit .env with your MySQL username/password
   ```

4. **Run:**
   ```bash
   python app.py
   ```
   Visit http://localhost:5002 — the 6 sample questions are seeded into the
   `questions` table automatically on first launch.

## What's included
- `/` — the game itself: enter your name, play the riff, guess the lyric
- `/api/questions` — JSON list of quiz rounds, fetched by the game client
- `/api/score` — POST endpoint that saves a finished game's score to the
  `scores` table and returns the current top 10
- `/leaderboard` — server-rendered top-10 scoreboard

## Notes
- Kept minimal on purpose: no per-user accounts, scores are just a name +
  number. Anyone can add real song lyric rounds by editing `seed.py` or
  inserting rows into `questions` directly.
- All audio is generated client-side with the Web Audio API, so there are no
  copyrighted lyrics or audio files bundled with the app — the quiz options
  are original placeholder lines, same as the source project.
