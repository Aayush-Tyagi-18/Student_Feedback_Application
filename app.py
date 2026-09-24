import os
import sqlite3

from flask import Flask, flash, g, redirect, render_template, request, url_for


def create_app(db_path=None):
    app = Flask(__name__)
    app.config["DATABASE"] = db_path or os.environ.get("DATABASE", "feedback.db")
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-only-change-me")

    def get_db():
        if "db" not in g:
            g.db = sqlite3.connect(app.config["DATABASE"])
            g.db.row_factory = sqlite3.Row
        return g.db

    @app.teardown_appcontext
    def close_db(_error):
        db = g.pop("db", None)
        if db is not None:
            db.close()

    with app.app_context():
        get_db().execute(
            """CREATE TABLE IF NOT EXISTS feedback (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   name TEXT NOT NULL,
                   course TEXT NOT NULL,
                   message TEXT NOT NULL,
                   created_at TEXT DEFAULT CURRENT_TIMESTAMP
               )"""
        ).connection.commit()

    @app.get("/")
    def index():
        rows = get_db().execute(
            "SELECT name, course, message, created_at FROM feedback ORDER BY id DESC"
        ).fetchall()
        return render_template("index.html", entries=rows)

    @app.post("/submit")
    def submit():
        name = request.form.get("name", "").strip()
        course = request.form.get("course", "").strip()
        message = request.form.get("message", "").strip()

        if not (name and course and message):
            flash("Please fill in your name, course and feedback.", "error")
            return redirect(url_for("index"))

        db = get_db()
        db.execute(
            "INSERT INTO feedback (name, course, message) VALUES (?, ?, ?)",
            (name, course, message),
        )
        db.commit()
        flash("Thanks, your feedback was saved.", "ok")
        return redirect(url_for("index"))

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
