

// ==========================================
// PAGE INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!requireLogin()) {
            return;
        }

        renderLoadingState();

        loadDashboard();

    }
);


// ==========================================
// LOAD DASHBOARD DATA
// ==========================================

async function loadDashboard() {

    try {

        // =====================================
        // LOAD ACHIEVEMENTS
        // =====================================

        const achievementsResponse =
            await authenticatedFetch(
                "/achievements"
            );


        if (!achievementsResponse.ok) {

            throw new Error(
                `Backend returned ${achievementsResponse.status}`
            );

        }


        const achievementsData =
            await achievementsResponse.json();


        const achievements =
            achievementsData.map(
                normalizeAchievement
            );


        // =====================================
        // LOAD PROFILE
        // =====================================

        const profile =
            await getProfile();


        // =====================================
        // RENDER DASHBOARD
        // =====================================

        renderDashboard(
            achievements,
            profile
        );

    } catch (error) {

        console.error(
            "Failed to load dashboard:",
            error
        );


        renderErrorState(
            error.message
        );

    }

}


// ==========================================
// NORMALIZE ACHIEVEMENT
// ==========================================

function normalizeAchievement(
    achievement
) {

    let skills =
        achievement.skills || [];


    // Backend stores skills
    // as comma-separated text.

    if (
        typeof skills ===
        "string"
    ) {

        skills =
            skills
                .split(",")
                .map(
                    skill =>
                        skill.trim()
                )
                .filter(
                    skill =>
                        skill.length > 0
                );

    }


    if (!Array.isArray(skills)) {

        skills = [];

    }


    return {

        ...achievement,

        skills:

            skills,

        title:

            achievement.title ||
            "",

        organization:

            achievement.organization ||
            "",

        category:

            achievement.category ||
            "",

        description:

            achievement.description ||
            "",

        date:

            achievement.date ||
            "",

        visibility:

            achievement.visibility ||
            "private"

    };

}


// ==========================================
// LOADING STATE
// ==========================================

function renderLoadingState() {

    const content = `

        <main class="main-content">

            <div class="dashboard-header">

                <div>

                    <p class="eyebrow">
                        STUDENT OVERVIEW
                    </p>

                    <h1>
                        Dashboard
                    </h1>

                    <p class="dashboard-subtitle">
                        Loading your achievement data...
                    </p>

                </div>

            </div>


            <section class="dashboard-panel">

                <div class="dashboard-empty">

                    <div class="empty-icon">
                        ...
                    </div>

                    <h3>
                        Loading dashboard
                    </h3>

                    <p>
                        Getting your latest achievements.
                    </p>

                </div>

            </section>

        </main>

    `;


    renderLayout(
        content
    );

}


// ==========================================
// ERROR STATE
// ==========================================

function renderErrorState(
    errorMessage = ""
) {

    const content = `

        <main class="main-content">

            <div class="dashboard-header">

                <div>

                    <p class="eyebrow">
                        STUDENT OVERVIEW
                    </p>

                    <h1>
                        Dashboard
                    </h1>

                    <p class="dashboard-subtitle">
                        We couldn't load your dashboard data.
                    </p>

                </div>

            </div>


            <section class="dashboard-panel">

                <div class="dashboard-empty">

                    <div class="empty-icon">
                        !
                    </div>

                    <h3>
                        Unable to load dashboard
                    </h3>

                    <p>
                        ${
                            escapeHTML(
                                errorMessage ||
                                "Please make sure the FastAPI backend is running and try again."
                            )
                        }
                    </p>

                    <button
                        onclick="loadDashboard()"
                        class="btn btn-primary"
                    >
                        Try Again
                    </button>

                </div>

            </section>

        </main>

    `;


    renderLayout(
        content
    );

}


// ==========================================
// RENDER DASHBOARD
// ==========================================

function renderDashboard(
    achievements,
    profile
) {

    // ======================================
    // STATISTICS
    // ======================================

    const total =
        achievements.length;


    const awards =
        achievements.filter(
            achievement =>
                achievement.category ===
                "Award"
        ).length;


    const research =
        achievements.filter(
            achievement =>
                achievement.category ===
                "Research"
        ).length;


    const internships =
        achievements.filter(
            achievement =>
                achievement.category ===
                "Internship"
        ).length;


    // ======================================
    // RECENT ACHIEVEMENTS
    // ======================================

    const recentAchievements =
        [...achievements]

            .sort(
                (a, b) =>
                    parseAchievementDate(
                        b.date
                    ) -
                    parseAchievementDate(
                        a.date
                    )
            )

            .slice(
                0,
                5
            );


    // ======================================
    // CATEGORY DISTRIBUTION
    // ======================================

    const categories = {};


    achievements.forEach(
        achievement => {

            const category =
                achievement.category ||
                "Other";


            categories[category] =
                (
                    categories[category] ||
                    0
                ) + 1;

        }
    );


    // ======================================
    // PROFILE STRENGTH
    // ======================================

    const profileStrength =
        calculateProfileStrength(
            profile
        );


    // ======================================
    // CONTENT
    // ======================================

    const content = `

        <main class="main-content">


            <!-- PAGE HEADER -->

            <div class="dashboard-header">

                <div>

                    <p class="eyebrow">
                        STUDENT OVERVIEW
                    </p>

                    <h1>
                        Dashboard
                    </h1>

                    <p class="dashboard-subtitle">

                        Keep track of your academic, professional
                        and extracurricular achievements.

                    </p>

                </div>


                <a
                    href="add-achievement.html"
                    class="btn btn-primary"
                >
                    + Add Achievement
                </a>

            </div>


            <!-- STATISTICS -->

            <section class="dashboard-stats">


                <div class="dashboard-stat">

                    <div class="stat-label">
                        Total Achievements
                    </div>

                    <div class="stat-value">
                        ${total}
                    </div>

                    <div class="stat-description">
                        Recorded accomplishments
                    </div>

                </div>


                <div class="dashboard-stat">

                    <div class="stat-label">
                        Awards
                    </div>

                    <div class="stat-value">
                        ${awards}
                    </div>

                    <div class="stat-description">
                        Awards & recognition
                    </div>

                </div>


                <div class="dashboard-stat">

                    <div class="stat-label">
                        Research
                    </div>

                    <div class="stat-value">
                        ${research}
                    </div>

                    <div class="stat-description">
                        Research activities
                    </div>

                </div>


                <div class="dashboard-stat">

                    <div class="stat-label">
                        Internships
                    </div>

                    <div class="stat-value">
                        ${internships}
                    </div>

                    <div class="stat-description">
                        Professional experience
                    </div>

                </div>


            </section>


            <!-- DASHBOARD COLUMNS -->

            <div class="dashboard-columns">


                <!-- RECENT ACHIEVEMENTS -->

                <section class="dashboard-panel">


                    <div class="panel-header">

                        <div>

                            <h2>
                                Recent achievements
                            </h2>

                            <p>
                                Your latest accomplishments
                            </p>

                        </div>


                        <a
                            href="achievements.html"
                            class="panel-link"
                        >
                            View all
                        </a>

                    </div>


                    <div class="achievement-list">


                        ${
                            recentAchievements.length

                            ? recentAchievements

                                .map(
                                    achievement => `

                                    <div
                                        class="dashboard-achievement"
                                    >

                                        <div
                                            class="achievement-mark"
                                        >

                                            ${formatCategoryIcon(
                                                achievement.category
                                            )}

                                        </div>


                                        <div
                                            class="achievement-content"
                                        >

                                            <strong>

                                                ${escapeHTML(
                                                    achievement.title
                                                )}

                                            </strong>


                                            <span>

                                                ${escapeHTML(
                                                    achievement.organization
                                                )}

                                            </span>

                                        </div>


                                        <div
                                            class="achievement-date"
                                        >

                                            ${escapeHTML(
                                                achievement.date
                                            )}

                                        </div>

                                    </div>

                                `
                                )

                                .join("")


                            : `

                                <div
                                    class="dashboard-empty"
                                >

                                    <div
                                        class="empty-icon"
                                    >
                                        +
                                    </div>


                                    <h3>
                                        No achievements yet
                                    </h3>


                                    <p>

                                        Add your first achievement
                                        to start building your profile.

                                    </p>


                                    <a
                                        href="add-achievement.html"
                                        class="btn btn-primary"
                                    >
                                        Add Achievement
                                    </a>

                                </div>

                            `

                        }

                    </div>


                </section>


                <!-- RIGHT COLUMN -->

                <div class="dashboard-side">


                    <!-- PROFILE COMPLETION -->

                    <section
                        class="dashboard-panel"
                    >

                        <div
                            class="panel-header"
                        >

                            <div>

                                <h2>
                                    Profile
                                </h2>

                                <p>
                                    Keep your profile updated
                                </p>

                            </div>

                        </div>


                        <div
                            class="profile-progress"
                        >


                            <div
                                class="progress-top"
                            >

                                <strong>
                                    Profile strength
                                </strong>


                                <span>
                                    ${profileStrength}%
                                </span>

                            </div>


                            <div
                                class="progress-bar"
                            >

                                <div
                                    class="progress-fill"
                                    style="width:${profileStrength}%;"
                                ></div>

                            </div>


                            <p>

                                ${
                                    profileStrength >= 90

                                    ? "Your profile is looking great."

                                    : profileStrength >= 70

                                    ? "Your profile is in good shape. Add a few more details."

                                    : "Complete your profile to improve your student portfolio."

                                }

                            </p>


                            <a
                                href="profile.html"
                                class="panel-action"
                            >
                                Update profile →
                            </a>


                        </div>


                    </section>


                    <!-- QUICK ACTIONS -->

                    <section
                        class="dashboard-panel"
                    >


                        <div
                            class="panel-header"
                        >

                            <div>

                                <h2>
                                    Quick actions
                                </h2>

                                <p>
                                    Frequently used tools
                                </p>

                            </div>

                        </div>


                        <div
                            class="dashboard-actions"
                        >


                            <a
                                href="add-achievement.html"
                                class="dashboard-action"
                            >

                                <span
                                    class="action-icon"
                                >
                                    +
                                </span>


                                <div>

                                    <strong>
                                        Add achievement
                                    </strong>

                                    <small>
                                        Record a new accomplishment
                                    </small>

                                </div>

                            </a>


                            <a
                                href="portfolio.html"
                                class="dashboard-action"
                            >

                                <span
                                    class="action-icon"
                                >
                                    ↗
                                </span>


                                <div>

                                    <strong>
                                        View portfolio
                                    </strong>

                                    <small>
                                        See your public profile
                                    </small>

                                </div>

                            </a>


                            <a
                                href="cv.html"
                                class="dashboard-action"
                            >

                                <span
                                    class="action-icon"
                                >
                                    CV
                                </span>


                                <div>

                                    <strong>
                                        View CV
                                    </strong>

                                    <small>
                                        Review your achievement CV
                                    </small>

                                </div>

                            </a>


                        </div>


                    </section>


                </div>


            </div>


            <!-- CATEGORY OVERVIEW -->

            <section
                class="dashboard-panel category-panel"
            >


                <div
                    class="panel-header"
                >

                    <div>

                        <h2>
                            Achievement overview
                        </h2>

                        <p>
                            Distribution across your achievement categories
                        </p>

                    </div>

                </div>


                <div
                    class="category-overview"
                >


                    ${
                        Object.keys(categories).length

                        ? Object.entries(categories)

                            .sort(
                                (a, b) =>
                                    b[1] -
                                    a[1]
                            )

                            .map(
                                ([category, count]) => `

                                    <div
                                        class="category-row"
                                    >

                                        <div
                                            class="category-name"
                                        >

                                            <span
                                                class="category-dot"
                                            ></span>


                                            ${escapeHTML(
                                                category
                                            )}

                                        </div>


                                        <div
                                            class="category-count"
                                        >

                                            ${count}

                                        </div>

                                    </div>

                                `
                            )

                            .join("")


                        : `

                            <p class="muted">

                                Add achievements to see your
                                category overview.

                            </p>

                        `

                    }

                </div>


            </section>


        </main>

    `;


    // ======================================
    // RENDER
    // ======================================

    renderLayout(
        content
    );

}


// ==========================================
// DATE PARSING
// ==========================================

function parseAchievementDate(
    date
) {

    if (!date) {

        return 0;

    }


    const parsed =
        new Date(
            date
        );


    if (
        !Number.isNaN(
            parsed.getTime()
        )
    ) {

        return parsed.getTime();

    }


    const year =
        Number(
            String(date)
                .match(/\d{4}/)?.[0]
        );


    if (year) {

        return new Date(
            `${year}-01-01`
        ).getTime();

    }


    return 0;

}


// ==========================================
// PROFILE STRENGTH
// ==========================================

function calculateProfileStrength(
    profile
) {

    if (!profile) {

        return 0;

    }


    const checks = [

        Boolean(
            profile.name &&
            profile.name.trim()
        ),

        Boolean(
            profile.email &&
            profile.email.trim()
        ),

        Boolean(
            profile.universityId &&
            profile.universityId.trim()
        ),

        Boolean(
            profile.program &&
            profile.program.trim()
        ),

        Boolean(
            profile.year &&
            profile.year.trim()
        ),

        Boolean(
            profile.bio &&
            profile.bio.trim()
        ),

        Array.isArray(
            profile.skills
        ) &&
        profile.skills.length > 0,

        Boolean(
            profile.linkedin &&
            profile.linkedin.trim()
        ),

        Boolean(
            profile.github &&
            profile.github.trim()
        )

    ];


    const completed =
        checks.filter(
            Boolean
        ).length;


    return Math.round(
        (
            completed /
            checks.length
        ) * 100
    );

}
