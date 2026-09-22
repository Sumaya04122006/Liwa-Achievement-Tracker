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
                            id="downloadCvButton"
                        >

                            ⬇ Download PDF

                        </button>

                        <button
                            class="btn btn-secondary"
                            onclick="window.print()"
                        >

                            🖨 Print

                        </button>

                    </div>


                    <!-- CV PAPER -->

                    <div class="cv-paper" id="cvPaper">


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


            // =========================================
            // DOWNLOAD / VIEW AS PDF
            // =========================================
            // Generates a real PDF client-side and opens it
            // in a new tab so the student can choose to save
            // it as a soft copy or print it from there,
            // instead of jumping straight into the browser's
            // physical print dialog.

            const downloadButton =
                document.getElementById(
                    "downloadCvButton"
                );

            const cvPaper =
                document.getElementById(
                    "cvPaper"
                );

            if (downloadButton && cvPaper) {

                downloadButton.addEventListener(
                    "click",
                    async function () {

                        const originalText =
                            downloadButton.textContent;

                        downloadButton.disabled = true;

                        downloadButton.textContent =
                            "Generating PDF...";

                        const fileName =
                            `${cvProfile.name || "CV"}-LiwaTrack-CV.pdf`
                                .replace(/\s+/g, "_");

                        const options = {

                            margin: 0,

                            filename: fileName,

                            image: {
                                type: "jpeg",
                                quality: 0.98
                            },

                            html2canvas: {
                                scale: 2,
                                useCORS: true
                            },

                            jsPDF: {
                                unit: "in",
                                format: "a4",
                                orientation: "portrait"
                            }

                        };

                        try {

                            if (typeof html2pdf === "undefined") {

                                throw new Error(
                                    "PDF generator failed to load."
                                );

                            }

                            const pdfBlobUrl =
                                await html2pdf()
                                    .set(options)
                                    .from(cvPaper)
                                    .outputPdf("bloburl");

                            // Open the generated PDF in a new tab.
                            // From there the student can save it
                            // (soft copy) or print it (hard copy)
                            // using their browser's PDF viewer.

                            window.open(
                                pdfBlobUrl,
                                "_blank"
                            );

                        } catch (error) {

                            console.error(
                                "PDF generation failed:",
                                error
                            );

                            alert(
                                "Could not generate the PDF. You can still use the Print button instead."
                            );

                        } finally {

                            downloadButton.disabled = false;

                            downloadButton.textContent =
                                originalText;

                        }

                    }
                );

            }


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
