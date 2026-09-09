let allAchievements = [];


// ==========================================
// PAGE INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!requireLogin()) {
            return;
        }

        renderAchievements();

    }
);


// ==========================================
// LOAD ACHIEVEMENTS FROM BACKEND
// ==========================================

async function loadAchievements() {

    const grid =
        document.getElementById(
            "achievementGrid"
        );

    if (grid) {

        grid.innerHTML = `

            <div
                class="empty-state"
                style="grid-column:1/-1;"
            >

                <h2>
                    Loading achievements...
                </h2>

                <p>
                    Please wait.
                </p>

            </div>

        `;

    }

    try {

        const response =
            await authenticatedFetch(
                "/achievements"
            );

        if (!response.ok) {

            throw new Error(
                `Backend returned ${response.status}`
            );

        }

        const data =
            await response.json();


        // ======================================
        // NORMALIZE BACKEND DATA
        // ======================================

        allAchievements =
            data.map(
                achievement => {

                    let skills =
                        achievement.skills ||
                        [];

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

                    return {

                        ...achievement,

                        skills:
                            skills

                    };

                }
            );


        // ======================================
        // RENDER
        // ======================================

        renderCards(
            allAchievements
        );

    }

    catch (error) {

        console.error(
            "Failed to load achievements:",
            error
        );

        if (grid) {

            grid.innerHTML = `

                <div
                    class="empty-state"
                    style="grid-column:1/-1;"
                >

                    <h2>
                        Unable to load achievements
                    </h2>

                    <p>
                        ${
                            escapeHTML(
                                error.message ||
                                "Please make sure the FastAPI backend is running."
                            )
                        }
                    </p>

                    <button
                        onclick="loadAchievements()"
                        class="btn btn-primary"
                    >

                        Try Again

                    </button>

                </div>

            `;

        }

    }

}


// ==========================================
// RENDER PAGE
// ==========================================

function renderAchievements() {

    const content = `

        <main class="main-content">

            <div class="page-header">

                <div>

                    <h1>
                        Achievements
                    </h1>

                    <p>
                        Manage everything you've accomplished.
                    </p>

                </div>

                <a
                    href="add-achievement.html"
                    class="btn btn-primary"
                >

                    + Add Achievement

                </a>

            </div>


            <div class="toolbar">

                <input
                    type="search"
                    id="search"
                    placeholder="Search achievements..."
                >


                <select id="category">

                    <option value="">
                        All categories
                    </option>

                    <option value="Award">
                        Award
                    </option>

                    <option value="Research">
                        Research
                    </option>

                    <option value="Internship">
                        Internship
                    </option>

                    <option value="Competition">
                        Competition
                    </option>

                    <option value="Certification">
                        Certification
                    </option>

                    <option value="Project">
                        Project
                    </option>

                    <option value="Volunteering">
                        Volunteering
                    </option>

                    <option value="Leadership">
                        Leadership
                    </option>

                </select>

            </div>


            <div
                class="achievement-grid"
                id="achievementGrid"
            ></div>

        </main>

    `;


    renderLayout(
        content
    );


    // ======================================
    // SEARCH
    // ======================================

    document
        .getElementById("search")
        .addEventListener(
            "input",
            filterAchievements
        );


    // ======================================
    // CATEGORY FILTER
    // ======================================

    document
        .getElementById("category")
        .addEventListener(
            "change",
            filterAchievements
        );


    // ======================================
    // LOAD BACKEND DATA
    // ======================================

    loadAchievements();

}


// ==========================================
// RENDER ACHIEVEMENT CARDS
// ==========================================

function renderCards(data) {

    const grid =
        document.getElementById(
            "achievementGrid"
        );

    if (!grid) {
        return;
    }


    if (!data.length) {

        grid.innerHTML = `

            <div
                class="empty-state"
                style="grid-column:1/-1;"
            >

                <h2>
                    No achievements found
                </h2>

                <p>
                    Try another search or add your first achievement.
                </p>

                <a
                    href="add-achievement.html"
                    class="btn btn-primary"
                >

                    Add Achievement

                </a>

            </div>

        `;

        return;

    }


    grid.innerHTML =

        data
            .map(
                achievement => `

                    <article
                        class="achievement-card"
                    >

                        <div class="card-top">

                            <div class="category-icon">

                                ${formatCategoryIcon(
                                    achievement.category
                                )}

                            </div>

                            <span class="badge">

                                ${escapeHTML(
                                    achievement.category ||
                                    ""
                                )}

                            </span>

                        </div>


                        <h3>

                            ${escapeHTML(
                                achievement.title ||
                                ""
                            )}

                        </h3>


                        <p class="organization">

                            ${escapeHTML(
                                achievement.organization ||
                                ""
                            )}

                        </p>


                        <div class="tag-list">

                            ${
                                (
                                    achievement.skills ||
                                    []
                                )
                                .slice(0, 3)
                                .map(
                                    skill => `

                                        <span class="tag">

                                            ${escapeHTML(
                                                skill
                                            )}

                                        </span>

                                    `
                                )
                                .join("")
                            }

                        </div>


                        <span class="date">

                            📅

                            ${escapeHTML(
                                achievement.date ||
                                ""
                            )}

                        </span>


                        <!-- =================================
                             ACTION BUTTONS
                        ================================== -->

                        <div
                            style="
                                display:flex;
                                gap:8px;
                                margin-top:18px;
                                flex-wrap:wrap;
                            "
                        >

                            <!-- VIEW -->

                            <a
                                href="achievement-details.html?id=${achievement.id}"
                                class="btn btn-secondary"
                                style="
                                    flex:1;
                                    font-size:11px;
                                "
                            >

                                View

                            </a>


                            <!-- EDIT -->

                            <button
                                onclick="editAchievement(${achievement.id})"
                                class="btn btn-secondary"
                                style="
                                    font-size:11px;
                                "
                            >

                                Edit

                            </button>


                            <!-- DELETE -->

                            <button
                                onclick="removeAchievement(${achievement.id})"
                                class="btn btn-danger"
                                style="
                                    font-size:11px;
                                "
                            >

                                Delete

                            </button>


                            <!-- =================================
                                 CERTIFICATE
                            ================================== -->

                            ${
                                achievement.certificate &&
                                achievement.certificate !== "true" &&
                                achievement.certificate !== "false"
                                    ? `

                                        <a
                                            href="${API_URL}${achievement.certificate}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="btn btn-secondary"
                                            style="
                                                width:100%;
                                                font-size:11px;
                                                text-align:center;
                                            "
                                        >

                                            📄 View Certificate

                                        </a>

                                    `
                                    : ""
                            }

                        </div>

                    </article>

                `
            )
            .join("");

}


// ==========================================
// SEARCH + FILTER
// ==========================================

function filterAchievements() {

    const searchInput =
        document.getElementById(
            "search"
        );


    const categoryInput =
        document.getElementById(
            "category"
        );


    if (
        !searchInput ||
        !categoryInput
    ) {

        return;

    }


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const category =
        categoryInput.value;


    const filtered =
        allAchievements.filter(
            achievement => {

                const title =
                    (
                        achievement.title ||
                        ""
                    ).toLowerCase();


                const organization =
                    (
                        achievement.organization ||
                        ""
                    ).toLowerCase();


                const description =
                    (
                        achievement.description ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    title.includes(search) ||
                    organization.includes(search) ||
                    description.includes(search);


                const matchesCategory =
                    !category ||
                    achievement.category ===
                        category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    renderCards(
        filtered
    );

}


// ==========================================
// EDIT ACHIEVEMENT
// ==========================================

function editAchievement(id) {

    const achievement =
        allAchievements.find(
            item =>
                item.id === id
        );


    if (!achievement) {

        alert(
            "Achievement not found."
        );

        return;

    }


    localStorage.setItem(
        "liwa_editing_achievement",
        JSON.stringify(
            achievement
        )
    );


    window.location.href =
        "add-achievement.html?edit=" +
        id;

}


// ==========================================
// DELETE ACHIEVEMENT
// ==========================================

async function removeAchievement(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this achievement?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `/achievements/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            let message =
                `Delete failed: ${response.status}`;


            try {

                const error =
                    await response.json();


                message =
                    error.detail ||
                    message;

            }

            catch (error) {

                // Ignore parsing error

            }


            throw new Error(
                message
            );

        }


        // ==================================
        // REMOVE FROM FRONTEND
        // ==================================

        allAchievements =
            allAchievements.filter(
                achievement =>
                    achievement.id !== id
            );


        renderCards(
            allAchievements
        );


        alert(
            "Achievement deleted successfully."
        );

    }


    catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete achievement. Please try again."
        );

    }

}
