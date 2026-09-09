from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel, EmailStr

from typing import Optional

import hashlib
import hmac
import secrets
import os
import shutil

from database import (
    create_tables,
    get_connection
)


# =========================================
# CERTIFICATE STORAGE
# =========================================

CERTIFICATE_FOLDER = "certificates"

os.makedirs(
    CERTIFICATE_FOLDER,
    exist_ok=True
)


# =========================================
# FASTAPI APPLICATION
# =========================================

app = FastAPI(
    title="LiwaTrack API",
    description="Backend API for Liwa University Achievement Tracker",
    version="1.0.0"
)


# =========================================
# SERVE CERTIFICATE FILES
# =========================================

app.mount(
    "/certificates",
    StaticFiles(
        directory=CERTIFICATE_FOLDER
    ),
    name="certificates"
)


# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================
# PASSWORD HASHING
# =========================================

def hash_password(
    password: str
) -> str:

    salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        600000
    )

    return (
        f"{salt}${password_hash.hex()}"
    )


def verify_password(
    password: str,
    stored_password: str
) -> bool:

    try:

        salt, stored_hash = (
            stored_password.split(
                "$",
                1
            )
        )

        password_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            600000
        )

        return hmac.compare_digest(
            password_hash.hex(),
            stored_hash
        )

    except ValueError:

        return False


# =========================================
# SESSION TOKEN
# =========================================

def create_session_token() -> str:

    return secrets.token_urlsafe(32)


# =========================================
# ACTIVE SESSIONS
# =========================================

active_sessions = {}


def get_current_user_id(
    session_token: str
) -> int:

    user_id = active_sessions.get(
        session_token
    )

    if user_id is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session."
        )

    return user_id


# =========================================
# DATABASE STARTUP
# =========================================

@app.on_event("startup")
def startup():

    create_tables()


# =========================================
# MODELS
# =========================================

class Achievement(BaseModel):

    title: str

    category: str

    organization: Optional[str] = ""

    date: Optional[str] = ""

    description: Optional[str] = ""

    skills: Optional[str] = ""

    certificate: Optional[str] = ""

    visibility: Optional[str] = "public"


class Profile(BaseModel):

    name: str

    email: EmailStr

    university_id: Optional[str] = ""

    program: Optional[str] = ""

    year: Optional[str] = ""

    bio: Optional[str] = ""

    skills: Optional[str] = ""

    linkedin: Optional[str] = ""

    github: Optional[str] = ""


class RegisterRequest(BaseModel):

    name: str

    email: EmailStr

    university_id: str

    password: str


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


# =========================================
# ROOT
# =========================================

@app.get("/")
def root():

    return {

        "message":
            "LiwaTrack API is running",

        "status":
            "success"

    }


# =========================================
# HEALTH
# =========================================

@app.get("/health")
def health_check():

    return {

        "status":
            "healthy"

    }


# =========================================
# DATABASE CHECK
# =========================================

@app.get("/database")
def database_check():

    connection = get_connection()

    connection.close()

    return {

        "message":
            "Database connected successfully"

    }


# =========================================
# AUTHENTICATION
# =========================================

# -----------------------------------------
# REGISTER
# -----------------------------------------

@app.post("/auth/register")
def register_user(
    request: RegisterRequest
):

    name = request.name.strip()

    email = str(
        request.email
    ).strip().lower()

    university_id = (
        request.university_id.strip()
    )

    password = request.password


    # =========================================
    # VALIDATION
    # =========================================

    if not name:

        raise HTTPException(
            status_code=400,
            detail="Name is required."
        )


    if not university_id:

        raise HTTPException(
            status_code=400,
            detail="University ID is required."
        )


    if len(password) < 6:

        raise HTTPException(
            status_code=400,
            detail=(
                "Password must contain "
                "at least 6 characters."
            )
        )


    connection = get_connection()

    cursor = connection.cursor()


    # =========================================
    # CHECK EXISTING EMAIL
    # =========================================

    cursor.execute(
        """
        SELECT id
        FROM users
        WHERE email = ?
        """,
        (email,)
    )

    existing_email = (
        cursor.fetchone()
    )


    if existing_email:

        connection.close()

        raise HTTPException(
            status_code=409,
            detail=(
                "An account with this "
                "email already exists."
            )
        )


    # =========================================
    # CHECK EXISTING UNIVERSITY ID
    # =========================================

    cursor.execute(
        """
        SELECT id
        FROM users
        WHERE university_id = ?
        """,
        (university_id,)
    )

    existing_id = (
        cursor.fetchone()
    )


    if existing_id:

        connection.close()

        raise HTTPException(
            status_code=409,
            detail=(
                "An account with this "
                "University ID already exists."
            )
        )


    # =========================================
    # HASH PASSWORD
    # =========================================

    password_hash = hash_password(
        password
    )


    # =========================================
    # CREATE USER
    # =========================================

    cursor.execute(
        """
        INSERT INTO users
        (
            name,
            email,
            university_id,
            password_hash
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            name,
            email,
            university_id,
            password_hash
        )
    )

    user_id = cursor.lastrowid


    # =========================================
    # CREATE PROFILE
    # =========================================

    cursor.execute(
        """
        INSERT INTO student_profile
        (
            user_id,
            name,
            email,
            university_id,
            program,
            year,
            bio,
            skills,
            linkedin,
            github
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            name,
            email,
            university_id,
            "Bachelor of Information Technology — AI",
            "2nd Year",
            "",
            "",
            "",
            ""
        )
    )


    connection.commit()

    connection.close()


    return {

        "message":
            "Account created successfully",

        "user_id":
            user_id,

        "name":
            name,

        "email":
            email,

        "university_id":
            university_id

    }


# -----------------------------------------
# LOGIN
# -----------------------------------------

@app.post("/auth/login")
def login_user(
    request: LoginRequest
):

    email = str(
        request.email
    ).strip().lower()

    password = request.password


    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE email = ?
        """,
        (email,)
    )

    user = cursor.fetchone()

    connection.close()


    if user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    password_valid = verify_password(
        password,
        user["password_hash"]
    )


    if not password_valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    session_token = (
        create_session_token()
    )


    active_sessions[
        session_token
    ] = user["id"]


    return {

        "message":
            "Login successful",

        "session_token":
            session_token,

        "user_id":
            user["id"],

        "name":
            user["name"],

        "email":
            user["email"],

        "university_id":
            user["university_id"]

    }


# -----------------------------------------
# CURRENT USER
# -----------------------------------------

@app.get("/auth/me")
def get_current_user(
    session_token: str
):

    user_id = get_current_user_id(
        session_token
    )


    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT
            id,
            name,
            email,
            university_id
        FROM users
        WHERE id = ?
        """,
        (user_id,)
    )


    user = cursor.fetchone()

    connection.close()


    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )


    return {

        "authenticated":
            True,

        "user_id":
            user["id"],

        "name":
            user["name"],

        "email":
            user["email"],

        "university_id":
            user["university_id"]

    }


# =========================================
# ACHIEVEMENTS
# =========================================

# -----------------------------------------
# GET ALL ACHIEVEMENTS
# -----------------------------------------

@app.get("/achievements")
def get_achievements(
    session_token: str
):

    user_id = get_current_user_id(
        session_token
    )


    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM achievements
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (user_id,)
    )


    achievements = cursor.fetchall()

    connection.close()


    return [
        dict(achievement)
        for achievement in achievements
    ]


# -----------------------------------------
# ADD ACHIEVEMENT
# -----------------------------------------

@app.post("/achievements")
def add_achievement(
    achievement: Achievement,
    session_token: str
):

    user_id = get_current_user_id(
        session_token
    )


    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        INSERT INTO achievements
        (
            user_id,
            title,
            category,
            organization,
            date,
            description,
            skills,
            certificate,
            visibility
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            achievement.title,
            achievement.category,
            achievement.organization,
            achievement.date,
            achievement.description,
            achievement.skills,
            achievement.certificate,
            achievement.visibility
        )
    )


    connection.commit()

    achievement_id = (
        cursor.lastrowid
    )

    connection.close()


    return {

        "message":
            "Achievement added successfully",

        "id":
            achievement_id

    }


# -----------------------------------------
# GET ONE ACHIEVEMENT
# -----------------------------------------

@app.get(
    "/achievements/{achievement_id}"
)
def get_achievement(
    achievement_id: int,
    session_token: str
):

    user_id = get_current_user_id(
        session_token
    )


    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM achievements
        WHERE id = ?
        AND user_id = ?
        """,
        (
            achievement_id,
            user_id
        )
    )


    achievement = (
        cursor.fetchone()
    )

    connection.close()


    if achievement is None:

        raise HTTPException(
            status_code=404,
            detail="Achievement not found."
        )


    return dict(achievement)


# -----------------------------------------
# UPDATE ACHIEVEMENT
# -----------------------------------------

@app.put(
    "/achievements/{achievement_id}"
)
def update_achievement(
    achievement_id: int,
    achievement: Achievement,
    session_token: str
):

    user_id = get_current_user_id(
        session_token
    )


    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        UPDATE achievements

        SET
            title = ?,
            category = ?,
            organization = ?,
            date = ?,
            description = ?,
            skills = ?,
            certificate = ?,
            visibility = ?

        WHERE id = ?
        AND user_id = ?
        """,
        (
            achievement.title,
            achievement.category,
            achievement.organization,
            achievement.date,
            achievement.description,
            achievement.skills,
            achievement.certificate,
            achievement.visibility,
            achievement_id,
            user_id
        )
    )


    connection.commit()


    if cursor.rowcount == 0:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Achievement not found."
        )


    connection.close()


    return {

        "message":
            "Achievement updated successfully",

        "id":
            achievement_id

    }


# -----------------------------------------
# DELETE ACHIEVEMENT
# -----------------------------------------

@app.delete(
    "/achievements/{achievement_id}"
)
def delete_achievement(
    achievement_id: int,
    session_token: str
):

    user_id = get_current_user_id(
        session_token
    )


    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        DELETE FROM achievements
        WHERE id = ?
        AND user_id = ?
        """,
        (
            achievement_id,
            user_id
        )
    )


    connection.commit()


    if cursor.rowcount == 0:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Achievement not found."
        )


    connection.close()


    return {

        "message":
            "Achievement deleted successfully",

        "id":
            achievement_id

    }


# =========================================
# CERTIFICATE UPLOAD
# =========================================

@app.post(
    "/achievements/{achievement_id}/certificate"
)
async def upload_certificate(
    achievement_id: int,
    certificate: UploadFile = File(...),
    session_token: str = ""
):

    # =========================================
    # AUTHENTICATION
    # =========================================

    user_id = get_current_user_id(
        session_token
    )


    # =========================================
    # VALID FILE TYPES
    # =========================================

    allowed_extensions = {
        ".pdf",
        ".png",
        ".jpg",
        ".jpeg"
    }


    original_filename = (
        certificate.filename or ""
    )


    extension = os.path.splitext(
        original_filename
    )[1].lower()


    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail=(
                "Only PDF, PNG, JPG and "
                "JPEG files are allowed."
            )
        )


    # =========================================
    # FIND ACHIEVEMENT
    # =========================================

    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT id
        FROM achievements
        WHERE id = ?
        AND user_id = ?
        """,
        (
            achievement_id,
            user_id
        )
    )


    achievement = (
        cursor.fetchone()
    )


    if achievement is None:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Achievement not found."
        )


    # =========================================
    # CREATE USER FOLDER
    # =========================================

    user_folder = os.path.join(
        CERTIFICATE_FOLDER,
        str(user_id)
    )


    os.makedirs(
        user_folder,
        exist_ok=True
    )


    # =========================================
    # SAFE FILE NAME
    # =========================================

    filename = (
        f"achievement_"
        f"{achievement_id}"
        f"{extension}"
    )


    file_path = os.path.join(
        user_folder,
        filename
    )


    # =========================================
    # SAVE FILE
    # =========================================

    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                certificate.file,
                buffer
            )

    except Exception as error:

        connection.close()

        raise HTTPException(
            status_code=500,
            detail=(
                "Could not save certificate."
            )
        )


    # =========================================
    # SAVE PATH IN DATABASE
    # =========================================

    database_path = (
        f"/certificates/"
        f"{user_id}/"
        f"{filename}"
    )


    cursor.execute(
        """
        UPDATE achievements
        SET certificate = ?
        WHERE id = ?
        AND user_id = ?
        """,
        (
            database_path,
            achievement_id,
            user_id
        )
    )


    connection.commit()

    connection.close()


    # =========================================
    # RESPONSE
    # =========================================

    return {

        "message":
            "Certificate uploaded successfully",

        "achievement_id":
            achievement_id,

        "certificate":
            database_path

    }


# =========================================
# PROFILE
# =========================================

# -----------------------------------------
# GET PROFILE
# -----------------------------------------

@app.get("/profile")
def get_profile(
    session_token: str
):

    user_id = get_current_user_id(
        session_token
    )


    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM student_profile
        WHERE user_id = ?
        LIMIT 1
        """,
        (user_id,)
    )


    profile = cursor.fetchone()

    connection.close()


    if profile is None:

        raise HTTPException(
            status_code=404,
            detail="Profile not found."
        )


    return dict(profile)


# -----------------------------------------
# UPDATE PROFILE
# -----------------------------------------

@app.put("/profile")
def update_profile(
    profile: Profile,
    session_token: str
):

    user_id = get_current_user_id(
        session_token
    )


    connection = get_connection()

    cursor = connection.cursor()


    # =========================================
    # FIND THIS USER'S PROFILE
    # =========================================

    cursor.execute(
        """
        SELECT id
        FROM student_profile
        WHERE user_id = ?
        LIMIT 1
        """,
        (user_id,)
    )


    existing_profile = (
        cursor.fetchone()
    )


    # =========================================
    # UPDATE PROFILE
    # =========================================

    if existing_profile:

        profile_id = (
            existing_profile["id"]
        )


        cursor.execute(
            """
            UPDATE student_profile

            SET
                name = ?,
                email = ?,
                university_id = ?,
                program = ?,
                year = ?,
                bio = ?,
                skills = ?,
                linkedin = ?,
                github = ?

            WHERE id = ?
            AND user_id = ?
            """,
            (
                profile.name,
                str(profile.email),
                profile.university_id,
                profile.program,
                profile.year,
                profile.bio,
                profile.skills,
                profile.linkedin,
                profile.github,
                profile_id,
                user_id
            )
        )


    # =========================================
    # CREATE PROFILE IF MISSING
    # =========================================

    else:

        cursor.execute(
            """
            INSERT INTO student_profile
            (
                user_id,
                name,
                email,
                university_id,
                program,
                year,
                bio,
                skills,
                linkedin,
                github
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                profile.name,
                str(profile.email),
                profile.university_id,
                profile.program,
                profile.year,
                profile.bio,
                profile.skills,
                profile.linkedin,
                profile.github
            )
        )


        profile_id = (
            cursor.lastrowid
        )


    connection.commit()

    connection.close()


    return {

        "message":
            "Profile saved successfully",

        "id":
            profile_id

    }
