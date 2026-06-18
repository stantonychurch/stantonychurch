import sqlite3
import os

def list_tables(filename):
    if not os.path.exists(filename):
        print(f"File {filename} not found.")
        return
    print(f"\nTables in {filename}:")
    conn = sqlite3.connect(filename)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    for t in tables:
        print(f"  - {t[0]}")
    conn.close()

list_tables("app.db")
list_tables("devotional.db")
