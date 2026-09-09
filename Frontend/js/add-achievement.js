document.addEventListener("DOMContentLoaded", function () {

    if (!requireLogin()) {
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("edit");
    let editingAchievement = null;

    if (editId) {
        const storedAchievement = localStorage.getItem("liwa_editing_achievement");

        if (storedAchievement) {
            try {
                editingAchievement = JSON.parse(storedAchievement);
            } catch (error) {
                console.error("Could not read editing achievement:", error);
            }
        }
    }

    const pageTitle = editingAchievement
        ? "Edit Achievement"
        : "Add Achievement";

    const pageDescription = editingAchievement
        ? "Update your achievement details."
        : "Add something you've accomplished.";

    const buttonText = editingAchievement
        ? "Update Achievement"
        : "Save Achievement";

    renderLayout(`
        <main class="main-content">

            <div class="page-header">
                <div>
                    <h1>${pageTitle}</h1>
                    <p>${pageDescription}</p>
                </div>
            </div>

            <form id="achievementForm">

                <div class="form-grid">

                    <section class="content-card">

                        <div class="form-group">
                            <label for="title">
                                Achievement Title *
                            </label>

                            <input
                                type="text"
                                id="title"
                                placeholder="e.g. Women in AI Award"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="category">
                                Category *
                            </label>

                            <select id="category" required>
                                <option value="">
                                    Select category
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

                        <div class="form-group">
                            <label for="organization">
                                Organization *
                            </label>

                            <input
                                type="text"
                                id="organization"
                                placeholder="e.g. Decoding Data Science"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="date">
                                Date *
                            </label>

                            <input
                                type="date"
                                id="date"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="description">
                                Description *
                            </label>

                            <textarea
                                id="description"
                                placeholder="Describe what you achieved..."
                                rows="5"
                                required
                            ></textarea>
                        </div>

                        <div class="form-group">
                            <label for="skills">
                                Skills
                            </label>

                            <input
                                type="text"
                                id="skills"
                                placeholder="Python, AI, Research"
                            >

                            <small class="muted">
                                Separate skills with commas.
                            </small>
                        </div>

                    </section>


                    <aside>

                        <section class="content-card">

                            <h2>Certificate</h2>

                            <div class="file-upload">

                                <div style="font-size:30px;">
                                    📄
                                </div>

                                <p>
                                    Upload your certificate
                                </p>

                                <input
                                    type="file"
                                    id="certificate"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                >

                                <small class="muted">
                                    PDF, PNG, JPG or JPEG
                                </small>

                            </div>

                        </section>


                        <section
                            class="content-card"
                            style="margin-top:15px;"
                        >

                            <h2>Visibility</h2>

                            <label class="checkbox-label">

                                <input
                                    type="checkbox"
                                    id="public"
                                    checked
                                >

                                Show on public portfolio

                            </label>

                        </section>

                    </aside>

                </div>


                <div
                    class="form-actions"
                    style="margin-top:20px;"
                >

                    <a
                        href="achievements.html"
                        class="btn btn-secondary"
                    >
                        Cancel
                    </a>

                    <button
                        type="submit"
                        class="btn btn-primary"
                    >
                        ${buttonText}
                    </button>

                </div>

            </form>

        </main>
    `);


    const form = document.getElementById("achievementForm");

    if (!form) {
        console.error(
            "ERROR: achievementForm was not found."
        );
        return;
    }


    // ==============================
    // LOAD EXISTING ACHIEVEMENT
    // ==============================

    if (editingAchievement) {

        document.getElementById("title").value =
            editingAchievement.title || "";

        document.getElementById("category").value =
            editingAchievement.category || "";

        document.getElementById("organization").value =
            editingAchievement.organization || "";

        document.getElementById("date").value =
            editingAchievement.date || "";

        document.getElementById("description").value =
            editingAchievement.description || "";


        const skills = Array.isArray(
            editingAchievement.skills
        )
            ? editingAchievement.skills.join(", ")
            : editingAchievement.skills || "";


        document.getElementById("skills").value =
            skills;


        document.getElementById("public").checked =
            editingAchievement.visibility === "public";
    }


    // ==============================
    // FORM SUBMISSION
    // ==============================

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            submitButton.disabled = true;

            submitButton.textContent =
                editingAchievement
                    ? "Updating..."
                    : "Saving...";


            try {

                // ==============================
                // GET FORM VALUES
                // ==============================

                const title =
                    document
                        .getElementById("title")
                        .value
                        .trim();


                const category =
                    document
                        .getElementById("category")
                        .value;


                const organization =
                    document
                        .getElementById("organization")
                        .value
                        .trim();


                const date =
                    document
                        .getElementById("date")
                        .value;


                const description =
                    document
                        .getElementById("description")
                        .value
                        .trim();


                const skillsValue =
                    document
                        .getElementById("skills")
                        .value
                        .trim();


                const skills = skillsValue
                    ? skillsValue
                        .split(",")
                        .map(skill => skill.trim())
                        .filter(skill => skill !== "")
                    : [];


                const visibility =
                    document
                        .getElementById("public")
                        .checked
                        ? "public"
                        : "private";


                // ==============================
                // VALIDATION
                // ==============================

                if (!title) {
                    alert(
                        "Please enter an achievement title."
                    );

                    submitButton.disabled = false;
                    submitButton.textContent = buttonText;

                    return;
                }


                if (!category) {
                    alert(
                        "Please select a category."
                    );

                    submitButton.disabled = false;
                    submitButton.textContent = buttonText;

                    return;
                }


                if (!organization) {
                    alert(
                        "Please enter the organization."
                    );

                    submitButton.disabled = false;
                    submitButton.textContent = buttonText;

                    return;
                }


                if (!date) {
                    alert(
                        "Please select a date."
                    );

                    submitButton.disabled = false;
                    submitButton.textContent = buttonText;

                    return;
                }


                if (!description) {
                    alert(
                        "Please enter a description."
                    );

                    submitButton.disabled = false;
                    submitButton.textContent = buttonText;

                    return;
                }


                // ==============================
                // CERTIFICATE FILE
                // ==============================

                const certificateInput =
                    document.getElementById(
                        "certificate"
                    );


                const selectedFile =
                    certificateInput &&
                    certificateInput.files.length > 0
                        ? certificateInput.files[0]
                        : null;


                // ==============================
                // ACHIEVEMENT DATA
                // ==============================

                const apiData = {

                    title: title,

                    category: category,

                    organization: organization,

                    date: date,

                    description: description,

                    skills: skills.join(", "),

                    certificate:
                        editingAchievement &&
                        editingAchievement.certificate
                            ? String(
                                editingAchievement.certificate
                            )
                            : "",

                    visibility: visibility
                };


                // ==============================
                // SAVE ACHIEVEMENT
                // ==============================

                let response;


                if (editingAchievement) {

                    response =
                        await authenticatedFetch(
                            `/achievements/${editingAchievement.id}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(apiData)
                            }
                        );

                } else {

                    response =
                        await authenticatedFetch(
                            "/achievements",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(apiData)
                            }
                        );
                }


                // ==============================
                // CHECK ACHIEVEMENT RESPONSE
                // ==============================

                if (!response.ok) {

                    let message =
                        `Server returned ${response.status}`;

                    try {

                        const error =
                            await response.json();

                        message =
                            error.detail ||
                            message;

                    } catch (error) {}

                    throw new Error(message);
                }


                const result =
                    await response.json();


                console.log(
                    "Achievement response:",
                    result
                );


                // ==============================
                // GET ACHIEVEMENT ID
                // ==============================

                const achievementId =
                    editingAchievement
                        ? editingAchievement.id
                        : result.id;


                if (!achievementId) {

                    throw new Error(
                        "Achievement was saved, but no achievement ID was returned."
                    );
                }


                // ==============================
                // UPLOAD CERTIFICATE
                // ==============================

                if (selectedFile) {

                    submitButton.textContent =
                        "Uploading certificate...";


                    const formData =
                        new FormData();


                    formData.append(
                        "certificate",
                        selectedFile
                    );


                    const uploadResponse =
                        await authenticatedFetch(
                            `/achievements/${achievementId}/certificate`,
                            {
                                method: "POST",

                                body: formData
                            }
                        );


                    if (!uploadResponse.ok) {

                        let message =
                            `Certificate upload failed (${uploadResponse.status})`;

                        try {

                            const error =
                                await uploadResponse.json();

                            message =
                                error.detail ||
                                message;

                        } catch (error) {}

                        throw new Error(message);
                    }


                    const uploadResult =
                        await uploadResponse.json();


                    console.log(
                        "Certificate upload response:",
                        uploadResult
                    );
                }


                // ==============================
                // SUCCESS
                // ==============================

                localStorage.removeItem(
                    "liwa_editing_achievement"
                );


                alert(
                    editingAchievement
                        ? "Achievement updated successfully!"
                        : "Achievement added successfully!"
                );


                window.location.href =
                    "achievements.html";


            } catch (error) {

                console.error(
                    "ERROR SAVING ACHIEVEMENT:",
                    error
                );


                alert(
                    error.message ||
                    "Could not save achievement."
                );


                submitButton.disabled = false;


                submitButton.textContent =
                    buttonText;
            }

        }
    );

});
