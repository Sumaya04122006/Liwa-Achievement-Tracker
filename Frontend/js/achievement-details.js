document.addEventListener("DOMContentLoaded", async function () {

    if (!requireLogin()) {
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const achievementId = urlParams.get("id");

    if (!achievementId) {
        alert("Achievement not found.");
        window.location.href = "achievements.html";
        return;
    }

    try {

        const response = await authenticatedFetch(
            `/achievements/${achievementId}`
        );

        if (!response.ok) {
            throw new Error("Could not load achievement.");
        }

        const achievement = await response.json();

        const skills = achievement.skills
            ? achievement.skills
                .split(",")
                .map(skill => skill.trim())
                .filter(skill => skill)
            : [];

        const certificate = achievement.certificate;

        let certificateHTML = `
            <div class="content-card">
                <h2>Certificate</h2>

                <p class="muted">
                    No certificate uploaded for this achievement.
                </p>
            </div>
        `;

        if (
            certificate &&
            certificate !== "true" &&
            certificate !== "false"
        ) {

            const certificateURL =
                `${API_URL}${certificate}`;

            const fileExtension =
                certificate
                    .split(".")
                    .pop()
                    .toLowerCase();

            let fileTypeText = "Certificate";

            if (fileExtension === "pdf") {
                fileTypeText = "PDF Certificate";
            } else if (
                ["jpg", "jpeg", "png"].includes(fileExtension)
            ) {
                fileTypeText = "Image Certificate";
            }

            certificateHTML = `
                <div class="content-card">

                    <h2>Certificate</h2>

                    <div style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:15px;
                        padding:15px;
                        border:1px solid #e5e5e5;
                        border-radius:10px;
                        margin-top:15px;
                    ">

                        <div>
                            <div style="font-size:28px;">
                                📄
                            </div>

                            <strong>
                                ${fileTypeText}
                            </strong>

                            <p
                                class="muted"
                                style="margin:5px 0 0;"
                            >
                                Your uploaded certificate
                            </p>
                        </div>

                        <a
                            href="${certificateURL}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-primary"
                        >
                            View Certificate
                        </a>

                    </div>

                </div>
            `;
        }

        const skillsHTML = skills.length
            ? skills.map(skill => `
                <span class="skill-tag">
                    ${escapeHTML(skill)}
                </span>
            `).join("")
            : `<span class="muted">No skills added.</span>`;

        renderLayout(`
            <main class="main-content">

                <div class="page-header">

                    <div>
                        <a
                            href="achievements.html"
                            class="muted"
                            style="text-decoration:none;"
                        >
                            ← Back to Achievements
                        </a>

                        <h1 style="margin-top:10px;">
                            ${escapeHTML(achievement.title)}
                        </h1>

                        <p>
                            ${escapeHTML(
                                achievement.organization || ""
                            )}
                        </p>
                    </div>

                </div>


                <div class="content-card">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:flex-start;
                        gap:20px;
                        flex-wrap:wrap;
                    ">

                        <div>

                            <span class="achievement-category">
                                ${formatCategoryIcon(
                                    achievement.category
                                )}
                                ${escapeHTML(
                                    achievement.category
                                )}
                            </span>

                            <h2 style="margin-top:15px;">
                                Achievement Details
                            </h2>

                        </div>

                        <span class="badge">
                            ${escapeHTML(
                                achievement.visibility || "public"
                            )}
                        </span>

                    </div>


                    <div style="margin-top:25px;">

                        <p>
                            <strong>Organization:</strong>
                            ${escapeHTML(
                                achievement.organization || "—"
                            )}
                        </p>

                        <p>
                            <strong>Date:</strong>
                            ${escapeHTML(
                                achievement.date || "—"
                            )}
                        </p>

                        <div style="margin-top:20px;">

                            <strong>
                                Description
                            </strong>

                            <p style="
                                margin-top:8px;
                                line-height:1.7;
                            ">
                                ${escapeHTML(
                                    achievement.description || ""
                                )}
                            </p>

                        </div>


                        <div style="margin-top:20px;">

                            <strong>
                                Skills
                            </strong>

                            <div style="
                                display:flex;
                                gap:8px;
                                flex-wrap:wrap;
                                margin-top:10px;
                            ">
                                ${skillsHTML}
                            </div>

                        </div>

                    </div>

                </div>


                <div style="margin-top:15px;">

                    ${certificateHTML}

                </div>

            </main>
        `);

    } catch (error) {

        console.error(
            "ERROR LOADING ACHIEVEMENT:",
            error
        );

        document.getElementById("app").innerHTML = `
            <main class="main-content">

                <div class="content-card">

                    <h2>
                        Could not load achievement
                    </h2>

                    <p class="muted">
                        ${escapeHTML(
                            error.message ||
                            "Something went wrong."
                        )}
                    </p>

                    <a
                        href="achievements.html"
                        class="btn btn-primary"
                    >
                        Back to Achievements
                    </a>

                </div>

            </main>
        `;
    }
});
