from flask import Flask, render_template, request, jsonify

from config import Config
from models import db, Question, Score
from seed import run_seed

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/leaderboard")
def leaderboard():
    top_scores = Score.query.order_by(Score.score.desc()).limit(10).all()
    return render_template("leaderboard.html", scores=top_scores)


@app.route("/api/questions")
def api_questions():
    questions = Question.query.order_by(Question.order).all()
    return jsonify([q.to_dict() for q in questions])


@app.route("/api/score", methods=["POST"])
def api_score():
    data = request.get_json(silent=True) or {}
    player_name = (data.get("player_name") or "Anonymous").strip()[:60] or "Anonymous"
    score = int(data.get("score", 0))
    best_streak = int(data.get("best_streak", 0))

    entry = Score(player_name=player_name, score=score, best_streak=best_streak)
    db.session.add(entry)
    db.session.commit()

    top_scores = Score.query.order_by(Score.score.desc()).limit(10).all()
    return jsonify({
        "saved": True,
        "leaderboard": [
            {"player_name": s.player_name, "score": s.score, "best_streak": s.best_streak}
            for s in top_scores
        ],
    })


def bootstrap_db():
    with app.app_context():
        db.create_all()
        run_seed(db, Question)


if __name__ == "__main__":
    bootstrap_db()
    app.run(debug=True, port=5002)
else:
    bootstrap_db()
