import sqlite3
import os

db_path = "devotional.db"
out_path = "devotional_schema.md"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = cursor.fetchall()
    
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("# SQLite Schemas in devotional.db\n\n")
        for name, sql in tables:
            if not sql:
                continue
            f.write(f"## Table: `{name}`\n")
            f.write("```sql\n")
            f.write(sql.strip() + "\n")
            f.write("```\n\n")
    conn.close()
    print("Done! Schemas dumped to devotional_schema.md")
else:
    print(f"File {db_path} not found.")
