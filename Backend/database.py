import sqlite3


DATABASE_NAME = "liwatrack.db"


def get_connection():

    connection = sqlite3.connect(DATABASE_NAME)

    connection.row_factory = sqlite3.Row

    return connection


def column_exists(
    cursor,
    table_name,
    column_name
):

    cursor.execute(
        f"PRAGMA table_info({table_name})"
    )

    columns = cursor.fetchall()

    return any(
        column["name"] == column_name
        for column in columns
    )


def create_tables():

    connection = get_connection()

    cursor = connection.cursor()


    # =========================================
    # USERS TABLE
    # =========================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            email TEXT NOT NULL UNIQUE,

            university_id TEXT NOT NULL UNIQUE,

            password_hash TEXT NOT NULL,

            created_at TIMESTAMP
                DEFAULT CURRENT_TIMESTAMP
        )
    """)


    # =========================================
    # STUDENT PROFILE TABLE
    # =========================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_profile (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER UNIQUE,

            name TEXT NOT NULL,

            email TEXT NOT NULL,

            university_id TEXT,

            program TEXT,

            year TEXT,

            bio TEXT,

            skills TEXT,

            linkedin TEXT,

            github TEXT,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
        )
    """)


    # =========================================
    # MIGRATION:
    # ADD user_id TO EXISTING PROFILES
    # =========================================

    if not column_exists(
        cursor,
        "student_profile",
        "user_id"
    ):

        cursor.execute("""
            ALTER TABLE student_profile
            ADD COLUMN user_id INTEGER
        """)


    # =========================================
    # ACHIEVEMENTS TABLE
    # =========================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS achievements (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            title TEXT NOT NULL,

            category TEXT NOT NULL,

            organization TEXT,

            date TEXT,

            description TEXT,

            skills TEXT,

            certificate TEXT,

            visibility TEXT DEFAULT 'public'
        )
    """)


    # =========================================
    # MIGRATION:
    # ADD user_id TO ACHIEVEMENTS
    # =========================================

    if not column_exists(
        cursor,
        "achievements",
        "user_id"
    ):

        cursor.execute("""
            ALTER TABLE achievements
            ADD COLUMN user_id INTEGER
        """)


    connection.commit()

    connection.close()

