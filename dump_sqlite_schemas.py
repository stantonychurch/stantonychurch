import sqlite3
import os

def dump_db(filename):
    if not os.path.exists(filename):
        print(f"File {filename} not found.")
        return
    print(f"\n=== Schema for {filename} ===")
    conn = sqlite3.connect(filename)
    cursor = conn.cursor()
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    for name, sql in tables:
        print(f"\nTable: {name}")
        print(sql)
    conn.close()

dump_db("app.db")
dump_db("devotional.db")
