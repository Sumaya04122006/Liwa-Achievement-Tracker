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
            // GET REAL USER DATA FROM BACKEND
            // =========================================

            const profile =
                await getProfile();

            const achievements =
                await getAchievements();


            // =========================================
            // PUBLIC ACHIEVEMENTS ONLY
            // =========================================

            const publicAchievements =
                achievements.filter(
                    achievement =>
                        achievement.visibility ===
                        "public"
                );


            // =========================================
            // PROJECTS
            // =========================================

            const portfolioProjects = [];


            // =========================================
            // STATISTICS
            // =========================================

            const totalAchievements =
                publicAchievements.length;

            const totalProjects =
                portfolioProjects.length;

            const totalSkills =
                profile.skills
                    ? profile.skills.length
                    : 0;

            const categories =
                new Set(
                    publicAchievements.map(
                        achievement =>
                            achievement.category
                    )
                ).size;


            // =========================================
            // ACHIEVEMENTS
            // =========================================

            const achievementHTML =
                publicAchievements.length

                    ? publicAchievements
                        .sort(
                            (a, b) =>
                                new Date(b.date) -
                                new Date(a.date)
                        )
                        .map(
                            achievement => `

                                <article
                                    class="portfolio-achievement"
                                >

                                    <div
                                        class="portfolio-achievement-icon"
                                    >

                                        ${formatCategoryIcon(
                                            achievement.category
                                        )}

                                    </div>

                                    <div
                                        class="portfolio-achievement-content"
                                    >

                                        <div
                                            class="portfolio-achievement-top"
                                        >

                                            <span
                                                class="portfolio-category"
                                            >

                                                ${escapeHTML(
                                                    achievement.category
                                                )}

                                            </span>

                                            <span
                                                class="portfolio-date"
                                            >

                                                ${escapeHTML(
                                                    achievement.date
                                                )}

                                            </span>

                                        </div>

                                        <h3>

                                            ${escapeHTML(
                                                achievement.title
                                            )}

                                        </h3>

                                        <p
                                            class="portfolio-organization"
                                        >

                                            ${escapeHTML(
                                                achievement.organization
                                            )}

                                        </p>

                                        <p
                                            class="portfolio-description"
                                        >

                                            ${escapeHTML(
                                                achievement.description
                                            )}

                                        </p>

                                    </div>

                                </article>

                            `
                        )
                        .join("")

                    : `

                        <div class="portfolio-empty">

                            <div
                                class="portfolio-empty-icon"
                            >
                                +
                            </div>

                            <h3>
                                No public achievements yet
                            </h3>

                            <p>
                                Add achievements and make them
                                public to display them here.
                            </p>

                            <a
                                href="add-achievement.html"
                                class="btn btn-primary"
                            >
                                Add Achievement
                            </a>

                        </div>

                    `;


            // =========================================
            // PROJECTS
            // =========================================

            const projectsHTML =
                portfolioProjects.length

                    ? portfolioProjects
                        .map(
                            project => `

                                <article
                                    class="portfolio-project"
                                >

                                    <div
                                        class="portfolio-project-icon"
                                    >
                                        ↗
                                    </div>

                                    <h3>

                                        ${escapeHTML(
                                            project.name
                                        )}

                                    </h3>

                                    <p>

                                        ${escapeHTML(
                                            project.description
                                        )}

                                    </p>

                                    <div
                                        class="portfolio-tags"
                                    >

                                        ${
                                            (
                                                project.technologies ||
                                                []
                                            )
                                                .map(
                                                    technology => `

                                                        <span>

                                                            ${escapeHTML(
                                                                technology
                                                            )}

                                                        </span>

                                                    `
                                                )
                                                .join("")
                                        }

                                    </div>

                                </article>

                            `
                        )
                        .join("")

                    : `

                        <div class="portfolio-empty">

                            <p>
                                No projects added yet.
                            </p>

                        </div>

                    `;


            // =========================================
            // SKILLS
            // =========================================

            const skillsHTML =
                profile.skills &&
                profile.skills.length

                    ? profile.skills
                        .map(
                            skill => `

                                <span
                                    class="portfolio-skill"
                                >

                                    ${escapeHTML(
                                        skill
                                    )}

                                </span>

                            `
                        )
                        .join("")

                    : `

                        <span class="muted">
                            No skills added yet.
                        </span>

                    `;


            // =========================================
            // LINKS
            // =========================================

            const linkedinHTML =
                profile.linkedin

                    ? `

                        <a
                            href="${escapeHTML(
                                profile.linkedin
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="portfolio-link"
                        >
                            LinkedIn ↗
                        </a>

                    `

                    : "";


            const githubHTML =
                profile.github

                    ? `

                        <a
                            href="${escapeHTML(
                                profile.github
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="portfolio-link"
                        >
                            GitHub ↗
                        </a>

                    `

                    : "";


            // =========================================
            // MAIN PAGE
            // =========================================

            const content = `

                <main
                    class="main-content portfolio-page"
                >


                    <!-- HERO -->

                    <section
                        class="portfolio-hero"
                    >

                        <div
                            class="portfolio-identity"
                        >

                            <div
                                class="portfolio-avatar"
                            >

                                ${initials(
                                    profile.name
                                )}

                            </div>

                            <div>

                                <span
                                    class="portfolio-label"
                                >
                                    STUDENT PORTFOLIO
                                </span>

                                <h1>

                                    ${escapeHTML(
                                        profile.name
                                    )}

                                </h1>

                                <p
                                    class="portfolio-program"
                                >

                                    ${escapeHTML(
                                        profile.program
                                    )}

                                </p>

                                <p
                                    class="portfolio-year"
                                >

                                    ${escapeHTML(
                                        profile.year
                                    )}

                                    ${
                                        profile.universityId
                                            ? ` · ${escapeHTML(
                                                profile.universityId
                                            )}`
                                            : ""
                                    }

                                </p>

                            </div>

                        </div>


                        <div
                            class="portfolio-links"
                        >

                            ${linkedinHTML}

                            ${githubHTML}

                        </div>

                    </section>


                    <!-- ABOUT -->

                    <section
                        class="portfolio-section"
                    >

                        <div
                            class="portfolio-section-heading"
                        >

                            <div>

                                <span>
                                    ABOUT
                                </span>

                                <h2>
                                    Profile
                                </h2>

                            </div>

                        </div>

                        <div
                            class="portfolio-about"
                        >

                            <p>

                                ${
                                    profile.bio
                                        ? escapeHTML(
                                            profile.bio
                                        )
                                        : "No professional bio has been added yet."
                                }

                            </p>

                        </div>

                    </section>


                    <!-- STATS -->

                    <section
                        class="portfolio-stats"
                    >

                        <div>

                            <strong>
                                ${totalAchievements}
                            </strong>

                            <span>
                                Public Achievements
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${totalProjects}
                            </strong>

                            <span>
                                Projects
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${totalSkills}
                            </strong>

                            <span>
                                Skills
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${categories}
                            </strong>

                            <span>
                                Categories
                            </span>

                        </div>

                    </section>


                    <!-- SKILLS -->

                    <section
                        class="portfolio-section"
                    >

                        <div
                            class="portfolio-section-heading"
                        >

                            <div>

                                <span>
                                    EXPERTISE
                                </span>

                                <h2>
                                    Skills
                                </h2>

                            </div>

                        </div>

                        <div
                            class="portfolio-skills"
                        >

                            ${skillsHTML}

                        </div>

                    </section>


                    <!-- ACHIEVEMENTS -->

                    <section
                        class="portfolio-section"
                    >

                        <div
                            class="portfolio-section-heading"
                        >

                            <div>

                                <span>
                                    EXPERIENCE & RECOGNITION
                                </span>

                                <h2>
                                    Achievements
                                </h2>

                            </div>

                            <a
                                href="achievements.html"
                                class="portfolio-view-link"
                            >
                                Manage achievements →
                            </a>

                        </div>

                        <div
                            class="portfolio-achievements"
                        >

                            ${achievementHTML}

                        </div>

                    </section>


                    <!-- PROJECTS -->

                    <section
                        class="portfolio-section"
                    >

                        <div
                            class="portfolio-section-heading"
                        >

                            <div>

                                <span>
                                    WORK
                                </span>

                                <h2>
                                    Projects
                                </h2>

                            </div>

                        </div>

                        <div
                            class="portfolio-projects"
                        >

                            ${projectsHTML}

                        </div>

                    </section>


                    <!-- FOOTER -->

                    <section
                        class="portfolio-footer"
                    >

                        <div>

                            <strong>
                                Keep building your profile.
                            </strong>

                            <p>
                                Your portfolio automatically updates
                                when you add or edit achievements.
                            </p>

                        </div>

                        <a
                            href="add-achievement.html"
                            class="btn btn-primary"
                        >
                            + Add Achievement
                        </a>

                    </section>


                </main>

            `;


            // =========================================
            // RENDER
            // =========================================

            renderLayout(content);


        } catch (error) {

            console.error(
                "Portfolio loading error:",
                error
            );

            const app =
                document.getElementById(
                    "app"
                );

            if (app) {

                app.innerHTML = `

                    <main class="main-content">

                        <div class="profile-card">

                            <div
                                class="profile-section-header"
                            >

                                <div>

                                    <p class="eyebrow">
                                        PORTFOLIO
                                    </p>

                                    <h1>
                                        Unable to load portfolio
                                    </h1>

                                    <p>
                                        Something went wrong while
                                        loading your profile data.
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
