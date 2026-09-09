document.addEventListener(
    "DOMContentLoaded",
    async function () {

        // =========================================
        // AUTHENTICATION
        // =========================================

        if (!requireLogin()) {
            return;
        }


        try {

            // =========================================
            // LOAD REAL DATA FROM BACKEND
            // =========================================

            const cvProfile =
                await getProfile();

            const cvAchievements =
                await getAchievements();


            // =========================================
            // PREPARE SKILLS
            // =========================================

            const skills =
                Array.isArray(cvProfile.skills)
                    ? cvProfile.skills
                    : [];


            // =========================================
            // PREPARE ACHIEVEMENTS
            // =========================================

            const achievements =
                Array.isArray(cvAchievements)
                    ? cvAchievements
                    : [];


            // =========================================
            // ACHIEVEMENTS HTML
            // =========================================

            const achievementsHTML =
                achievements.length

                    ? achievements
                        .map(
                            achievement => `

                                <div
                                    class="cv-item"
                                >

                                    <strong>

                                        ${escapeHTML(
                                            achievement.title
                                        )}

                                    </strong>

                                    <small>

                                        ${escapeHTML(
                                            achievement.organization ||
                                            ""
                                        )}

                                        ${
                                            achievement.date
                                                ? ` · ${escapeHTML(
                                                    achievement.date
                                                )}`
                                                : ""
                                        }

                                    </small>

                                    ${
                                        achievement.description
                                            ? `
                                                <p>

                                                    ${escapeHTML(
                                                        achievement.description
                                                    )}

                                                </p>
                                            `
                                            : ""
                                    }

                                </div>

                            `
                        )
                        .join("")

                    : `

                        <p
                            style="
                                font-size:12px;
                                color:#777;
                            "
                        >
                            No achievements added yet.
                        </p>

                    `;


            // =========================================
            // SKILLS HTML
            // =========================================

            const skillsHTML =
                skills.length

                    ? skills
                        .map(
                            skill =>
                                escapeHTML(skill)
                        )
                        .join(" · ")

                    : "No skills added yet.";


            // =========================================
            // PROFILE BIO
            // =========================================

            const bio =
                cvProfile.bio &&
                cvProfile.bio.trim()
                    ? cvProfile.bio
                    : "No professional profile has been added yet.";


            // =========================================
            // MAIN PAGE
            // =========================================

            renderLayout(`

                <main class="main-content">


                    <!-- PAGE HEADER -->

                    <div class="page-header">

                        <div>

                            <h1>
                                My CV
                            </h1>

                            <p>
                                Automatically generated from
                                your profile and achievements.
                            </p>

                        </div>

                    </div>


                    <!-- TOOLBAR -->

                    <div class="cv-toolbar">

                        <button
                            class="btn btn-primary"
                            onclick="window.print()"
                        >

                            🖨 Print / Save PDF

                        </button>

                    </div>


                    <!-- CV PAPER -->

                    <div class="cv-paper">


                        <!-- HEADER -->

                        <header class="cv-header">

                            <h1>

                                ${escapeHTML(
                                    cvProfile.name
                                )}

                            </h1>


                            <p>

                                ${escapeHTML(
                                    cvProfile.program ||
                                    ""
                                )}

                                ${
                                    cvProfile.year
                                        ? ` · ${escapeHTML(
                                            cvProfile.year
                                        )}`
                                        : ""
                                }

                            </p>


                            <p>

                                ${escapeHTML(
                                    cvProfile.email ||
                                    ""
                                )}

                                ${
                                    cvProfile.universityId
                                        ? ` · ${escapeHTML(
                                            cvProfile.universityId
                                        )}`
                                        : ""
                                }

                            </p>

                        </header>


                        <!-- PROFILE -->

                        <section class="cv-section">

                            <h2>
                                Profile
                            </h2>

                            <p
                                style="
                                    font-size:12px;
                                "
                            >

                                ${escapeHTML(
                                    bio
                                )}

                            </p>

                        </section>


                        <!-- SKILLS -->

                        <section class="cv-section">

                            <h2>
                                Skills
                            </h2>

                            <p
                                style="
                                    font-size:12px;
                                "
                            >

                                ${skillsHTML}

                            </p>

                        </section>


                        <!-- ACHIEVEMENTS -->

                        <section class="cv-section">

                            <h2>
                                Achievements
                            </h2>

                            ${achievementsHTML}

                        </section>


                    </div>


                </main>

            `);


        } catch (error) {

            console.error(
                "CV loading error:",
                error
            );


            // =========================================
            // ERROR STATE
            // =========================================

            const app =
                document.getElementById(
                    "app"
                );


            if (app) {

                app.innerHTML = `

                    <main
                        class="main-content"
                    >

                        <div
                            class="profile-card"
                        >

                            <div
                                class="profile-section-header"
                            >

                                <div>

                                    <p
                                        class="eyebrow"
                                    >
                                        MY CV
                                    </p>

                                    <h1>
                                        Unable to load CV
                                    </h1>

                                    <p>
                                        Something went wrong
                                        while loading your
                                        profile data.
                                    </p>

                                </div>

                            </div>


                            <button
                                class="btn btn-primary"
                                onclick="window.location.reload()"
                            >
                                Retry
                            </button>

                        </div>

                    </main>

                `;

            }

        }

    }
);
