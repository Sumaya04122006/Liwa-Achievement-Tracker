const API_URL = window.API_URL = "https://liwa-achievement-tracker-api.onrender.com";

// ==========================================
// AUTHENTICATION
// ==========================================

function getSessionToken() {

    return localStorage.getItem(
        "liwa_session_token"
    );
}


function getLoggedInUser() {

    const savedUser =
        localStorage.getItem(
            "liwa_user"
        );

    if (!savedUser) {
        return null;
    }

    try {

        return JSON.parse(
            savedUser
        );

    } catch (error) {

        console.error(
            "Invalid saved user:",
            error
        );

        return null;
    }
}


// ==========================================
// CHECK LOGIN
// ==========================================

function requireLogin() {

    const token =
        getSessionToken();

    if (!token) {

        window.location.href =
            "login.html";

        return false;
    }

    return true;
}


// ==========================================
// AUTHENTICATED FETCH
// ==========================================

async function authenticatedFetch(
    endpoint,
    options = {}
) {

    const token =
        getSessionToken();

    if (!token) {

        window.location.href =
            "login.html";

        throw new Error(
            "You are not logged in."
        );
    }


    const separator =
        endpoint.includes("?")
            ? "&"
            : "?";


    const url =
        `${API_URL}${endpoint}${separator}session_token=${encodeURIComponent(token)}`;


    const response =
        await fetch(
            url,
            options
        );


    // =========================================
    // SESSION INVALID
    // =========================================

    if (response.status === 401) {

        logout();

        throw new Error(
            "Your session has expired. Please log in again."
        );
    }


    return response;
}


// ==========================================
// VERIFY SESSION
// ==========================================

async function verifySession() {

    const token =
        getSessionToken();

    if (!token) {

        return false;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/auth/me?session_token=${encodeURIComponent(token)}`
            );


        if (!response.ok) {

            localStorage.removeItem(
                "liwa_session_token"
            );

            localStorage.removeItem(
                "liwa_user"
            );

            return false;
        }


        const user =
            await response.json();


        localStorage.setItem(
            "liwa_user",
            JSON.stringify({

                id:
                    user.user_id,

                name:
                    user.name,

                email:
                    user.email,

                university_id:
                    user.university_id

            })
        );


        return true;

    } catch (error) {

        console.error(
            "Session verification failed:",
            error
        );

        return false;
    }
}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem(
        "liwa_session_token"
    );

    localStorage.removeItem(
        "liwa_user"
    );

    // Remove old fake login data
    localStorage.removeItem(
        "liwa_logged_in"
    );

    window.location.href =
        "login.html";
}


// ==========================================
// PROFILE
// ==========================================

// IMPORTANT:
// Profile now comes from FastAPI.
// It is NOT stored as the source of truth
// in localStorage.

async function getProfile() {

    const response =
        await authenticatedFetch(
            "/profile"
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load profile (${response.status})`
        );
    }


    const profile =
        await response.json();


    // Convert backend snake_case
    // into frontend camelCase.

    return {

        id:
            profile.id,

        userId:
            profile.user_id,

        name:
            profile.name || "",

        email:
            profile.email || "",

        universityId:
            profile.university_id || "",

        program:
            profile.program || "",

        year:
            profile.year || "",

        bio:
            profile.bio || "",

        skills:
            profile.skills
                ? profile.skills
                    .split(",")
                    .map(
                        skill =>
                            skill.trim()
                    )
                    .filter(
                        skill =>
                            skill.length > 0
                    )
                : [],

        linkedin:
            profile.linkedin || "",

        github:
            profile.github || ""

    };
}


// ==========================================
// SAVE PROFILE
// ==========================================

async function saveProfile(
    data
) {

    const skills =
        Array.isArray(data.skills)
            ? data.skills.join(", ")
            : data.skills || "";


    const response =
        await authenticatedFetch(
            "/profile",
            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        name:
                            data.name,

                        email:
                            data.email,

                        university_id:
                            data.universityId ||
                            "",

                        program:
                            data.program ||
                            "",

                        year:
                            data.year ||
                            "",

                        bio:
                            data.bio ||
                            "",

                        skills:
                            skills,

                        linkedin:
                            data.linkedin ||
                            "",

                        github:
                            data.github ||
                            ""

                    })

            }
        );


    if (!response.ok) {

        let errorMessage =
            "Failed to save profile.";


        try {

            const error =
                await response.json();

            errorMessage =
                error.detail ||
                errorMessage;

        } catch (error) {

            // Ignore JSON parsing error
        }


        throw new Error(
            errorMessage
        );
    }


    return await response.json();
}


// ==========================================
// ACHIEVEMENTS
// ==========================================

// IMPORTANT:
// Achievements now come from FastAPI.
// localStorage is no longer used.

async function getAchievements() {

    const response =
        await authenticatedFetch(
            "/achievements"
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load achievements (${response.status})`
        );
    }


    return await response.json();
}


// ==========================================
// SAVE ACHIEVEMENTS
// ==========================================
//
// Kept temporarily for compatibility
// with older frontend files.
//
// New code should use the backend
// achievement endpoints instead.
//

function saveAchievements(data) {

    console.warn(
        "saveAchievements() is deprecated. Use the FastAPI achievement endpoints."
    );
}


// ==========================================
// INITIALS
// ==========================================

function initials(name) {

    if (!name) {
        return "ST";
    }


    return name
        .trim()
        .split(/\s+/)
        .map(
            word =>
                word[0]
        )
        .join("")
        .substring(0, 2)
        .toUpperCase();
}


// ==========================================
// RENDER LAYOUT
// ==========================================

function renderLayout(
    content
) {

    // Use the currently logged-in user
    // for the navigation header.

    const user =
        getLoggedInUser();


    const profile = {

        name:
            user?.name ||
            "Student",

        universityId:
            user?.university_id ||
            ""

    };


    const currentPage =
        window.location.pathname
            .split("/")
            .pop();


    document.getElementById(
        "app"
    ).innerHTML = `

        <button
            class="mobile-menu-button"
            onclick="toggleSidebar()"
        >
            ☰
        </button>


        <aside
            class="sidebar"
            id="sidebar"
        >

            <a
                href="dashboard.html"
                class="logo"
            >

                <div class="logo-mark">
                    LA
                </div>

                <span>
                    Liwa<span>Track</span>
                </span>

            </a>


            <div class="nav-section">

                <div class="nav-label">
                    Main
                </div>


                <a
                    href="dashboard.html"
                    class="sidebar-link ${
                        currentPage ===
                        "dashboard.html"
                            ? "active"
                            : ""
                    }"
                >
                    ◉ Dashboard
                </a>


                <a
                    href="achievements.html"
                    class="sidebar-link ${
                        currentPage ===
                        "achievements.html"
                            ? "active"
                            : ""
                    }"
                >
                    🏆 Achievements
                </a>


                <a
                    href="add-achievement.html"
                    class="sidebar-link ${
                        currentPage ===
                        "add-achievement.html"
                            ? "active"
                            : ""
                    }"
                >
                    ＋ Add Achievement
                </a>

            </div>


            <div class="nav-section">

                <div class="nav-label">
                    Profile
                </div>


                <a
                    href="profile.html"
                    class="sidebar-link ${
                        currentPage ===
                        "profile.html"
                            ? "active"
                            : ""
                    }"
                >
                    ◯ My Profile
                </a>


                <a
                    href="portfolio.html"
                    class="sidebar-link ${
                        currentPage ===
                        "portfolio.html"
                            ? "active"
                            : ""
                    }"
                >
                    ◎ Portfolio
                </a>


                <a
                    href="cv.html"
                    class="sidebar-link ${
                        currentPage ===
                        "cv.html"
                            ? "active"
                            : ""
                    }"
                >
                    ▤ My CV
                </a>

            </div>


            <div class="nav-section">

                <div class="nav-label">
                    Account
                </div>


                <a
                    href="settings.html"
                    class="sidebar-link ${
                        currentPage ===
                        "settings.html"
                            ? "active"
                            : ""
                    }"
                >
                    ⚙ Settings
                </a>

            </div>


            <div class="sidebar-bottom">

                <a
                    href="profile.html"
                    class="topbar-user"
                >

                    <div class="avatar">
                        ${initials(
                            profile.name
                        )}
                    </div>


                    <div>

                        <strong
                            style="font-size:12px;"
                        >
                            ${
                                escapeHTML(
                                    profile.name
                                )
                            }
                        </strong>


                        <small
                            style="
                                display:block;
                                color:#777;
                            "
                        >
                            Student
                        </small>

                    </div>

                </a>

            </div>

        </aside>


        <div class="main-wrapper">

            <header class="topbar">

                <div class="topbar-user">

                    <div class="avatar">

                        ${initials(
                            profile.name
                        )}

                    </div>


                    <div>

                        <strong
                            style="font-size:12px;"
                        >

                            ${
                                escapeHTML(
                                    profile.name
                                )
                            }

                        </strong>


                        <small
                            style="
                                display:block;
                                color:#777;
                            "
                        >

                            ${
                                escapeHTML(
                                    profile.universityId
                                )
                            }

                        </small>

                    </div>

                </div>

            </header>


            ${content}

        </div>

    `;
}


// ==========================================
// MOBILE SIDEBAR
// ==========================================

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (sidebar) {

        sidebar.classList.toggle(
            "open"
        );
    }
}


// ==========================================
// CATEGORY ICON
// ==========================================

function formatCategoryIcon(
    category
) {

    const icons = {

        Award:
            "🏆",

        Research:
            "🔬",

        Internship:
            "💼",

        Competition:
            "🥇",

        Certification:
            "📜",

        Project:
            "💻",

        Volunteering:
            "🤝",

        Leadership:
            "⭐"

    };


    return (
        icons[category] ||
        "🏆"
    );
}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(
    text
) {

    return String(
        text ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}

