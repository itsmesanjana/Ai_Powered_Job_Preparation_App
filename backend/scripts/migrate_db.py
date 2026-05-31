import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "job_prep.db")

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN username VARCHAR;")
        print("Added 'username' column.")
    except sqlite3.OperationalError as e:
        print(f"'username' column might already exist: {e}")

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN password_hash VARCHAR;")
        print("Added 'password_hash' column.")
    except sqlite3.OperationalError as e:
        print(f"'password_hash' column might already exist: {e}")

    conn.commit()
    conn.close()
    print("Migration finished.")

if __name__ == "__main__":
    migrate()
