QUESTIONS = [
    dict(
        prompt="Which line comes next?",
        option_a="Rhythm on the shoreline, hearts in time",
        option_b="Midnight whispers fade into the dawn",
        option_c="Echoes of steel in the city rain",
        option_d="Silver birds glide over quiet pines",
        answer_index=0, order=1,
    ),
    dict(
        prompt="Pick the lyric that fits the vibe:",
        option_a="Cables hum and traffic sings",
        option_b="Sunlight skanks across the sea",
        option_c="Paper moons on window glass",
        option_d="Neon storms above the square",
        answer_index=1, order=2,
    ),
    dict(
        prompt="Complete the hook:",
        option_a="Step light, keep bright, move free",
        option_b="Cold stone roses in the wire",
        option_c="Blue smoke mirrors after tea",
        option_d="Rusted bells below the spire",
        answer_index=0, order=3,
    ),
    dict(
        prompt="Best match for the groove:",
        option_a="Lanterns drift on easy wind",
        option_b="Copper streets awake at nine",
        option_c="Towers drink the fading light",
        option_d="River writes its crooked line",
        answer_index=3, order=4,
    ),
    dict(
        prompt="Stick the landing:",
        option_a="Bassline paints the night in green",
        option_b="Clockwork moons forget to shine",
        option_c="Tin can radios confess",
        option_d="Clouds fold neatly into time",
        answer_index=0, order=5,
    ),
    dict(
        prompt="Find the chorus piece:",
        option_a="Hands up, hearts up, keep the peace",
        option_b="Mountains whistle broken keys",
        option_c="Old guitars grow cedar leaves",
        option_d="Quiet maps forget the east",
        answer_index=0, order=6,
    ),
]


def run_seed(db, Question):
    if Question.query.count() > 0:
        return
    for q in QUESTIONS:
        db.session.add(Question(**q))
    db.session.commit()
