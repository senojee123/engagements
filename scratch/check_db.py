import os
import sqlite3

def check():
    db_path = os.path.join(os.path.dirname(__file__), "..", "backend", "engagements.db")
    abs_path = os.path.abspath(db_path)
    print("Database file path:", abs_path)
    print("File exists:", os.path.exists(abs_path))
    
    if os.path.exists(abs_path):
        conn = sqlite3.connect(abs_path)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cur.fetchall()]
        print("Tables in SQLite database:", tables)

        if "users" in tables:
            cur.execute("SELECT id, email, role, full_name, created_at FROM users;")
            users = cur.fetchall()
            print(f"\n--- Registered Users ({len(users)}) ---")
            for u in users:
                print(f"ID: {u[0]} | Email: {u[1]} | Role: {u[2]} | Name: {u[3]} | Created: {u[4]}")
        else:
            print("No 'users' table found in the database.")
        conn.close()
    else:
        print("Local SQLite database file 'backend/engagements.db' does not exist yet (no local database has been initialized or seeded).")

if __name__ == '__main__':
    check()
