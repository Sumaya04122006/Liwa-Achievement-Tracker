document.addEventListener(
    "DOMContentLoaded",
    async function () {

        if (!requireLogin()) {
            return;
        }

        let profileData = null;

        // =========================================
        // LOAD PROFILE
        // =========================================

        async function loadProfile() {

            try {

                const response =
                    await authenticatedFetch(
                        "/profile"
                    );

                if (!response.ok) {

                    throw new Error(
                        `Server returned ${response.status}`
                    );

                }

                const data =
                    await response.json();

                if (
                    data &&
                    data.id &&
                    data.name
                ) {

                    profileData =
                        normalizeProfile(data);

                    return;

                }

                throw new Error(
                    "Profile data is incomplete."
                );

            } catch (error) {

                console.error(
                    "Failed to load profile:",
                    error
                );

                renderErrorState(
                    "Unable to load your profile. Make sure the LiwaTrack backend is running."
                );

            }

        }


        // =========================================
        // NORMALIZE PROFILE
        // =========================================

        function normalizeProfile(data) {

            let parsedSkills = [];

            if (Array.isArray(data.skills)) {

                parsedSkills =
                    data.skills;

            } else if (
                typeof data.skills === "string"
            ) {

                parsedSkills =
                    data.skills
                        .split(",")
                        .map(
                            skill =>
                                skill.trim()
                        )
                        .filter(Boolean);

            }

            return {

                id:
                    data.id,

                user_id:
                    data.user_id,

                name:
                    data.name || "",

                email:
                    data.email || "",

                university_id:
                    data.university_id || "",

                program:
                    data.program || "",

                year:
                    data.year || "",

                bio:
                    data.bio || "",

                skills:
                    parsedSkills,

                linkedin:
                    data.linkedin || "",

                github:
                    data.github || ""

            };

        }


        // =========================================
        // RENDER ERROR
        // =========================================

        function renderErrorState(message) {

            const app =
                document.getElementById(
                    "app"
                );

            if (!app) {
                return;
            }

            app.innerHTML = `

                <main class="main-content">

                    <div class="profile-card">

                        <div class="profile-section-header">

                            <div>

                                <p class="eyebrow">
                                    PROFILE
                                </p>

                                <h1>
                                    Unable to load profile
                                </h1>

                                <p>
                                    ${escapeHTML(message)}
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


        // =========================================
        // INITIAL LOAD
        // =========================================

        await loadProfile();

        if (!profileData) {
            return;
        }


        const skills =
            Array.isArray(
                profileData.skills
            )
                ? profileData.skills
                : [];


        const profileStrength =
            calculateProfileStrength(
                profileData
            );


        // =========================================
        // RENDER PAGE
        // =========================================

        renderLayout(`

            <main class="main-content">

                <!-- PAGE HEADER -->

                <div class="profile-page-header">

                    <div>

                        <p class="eyebrow">
                            STUDENT PROFILE
                        </p>

                        <h1>
                            My Profile
                        </h1>

                        <p>
                            Manage the information used across
                            your portfolio and CV.
                        </p>

                    </div>


                    <!-- PROFILE STRENGTH -->

                    <div class="profile-strength-card">

                        <div class="profile-strength-top">

                            <span>
                                Profile strength
                            </span>

                            <strong>
                                ${profileStrength}%
                            </strong>

                        </div>

                        <div class="profile-strength-bar">

                            <div
                                class="profile-strength-fill"
                                style="width:${profileStrength}%"
                            ></div>

                        </div>

                    </div>

                </div>


                <!-- PROFILE FORM -->

                <form id="profileForm">


                    <!-- PROFILE OVERVIEW -->

                    <section class="profile-card">

                        <div class="profile-card-header">

                            <div class="profile-avatar-large">

                                ${initials(
                                    profileData.name
                                )}

                            </div>

                            <div>

                                <h2>
                                    ${escapeHTML(
                                        profileData.name
                                    )}
                                </h2>

                                <p>
                                    ${escapeHTML(
                                        profileData.program
                                    )}
                                </p>

                                <span class="profile-status">
                                    Student Profile
                                </span>

                            </div>

                        </div>

                    </section>


                    <!-- PERSONAL INFORMATION -->

                    <section class="profile-card">

                        <div class="profile-section-header">

                            <div>

                                <h2>
                                    Personal information
                                </h2>

                                <p>
                                    Basic information about you.
                                </p>

                            </div>

                        </div>


                        <div class="profile-form-grid">


                            <div class="form-group">

                                <label for="name">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    id="name"
                                    value="${escapeHTML(
                                        profileData.name
                                    )}"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label for="email">
                                    University Email
                                </label>

                                <input
                                    type="email"
                                    id="email"
                                    value="${escapeHTML(
                                        profileData.email
                                    )}"
                                    required
                                >

                            </div>


                            <div class="form-group">

                                <label for="universityId">
                                    University ID
                                </label>

                                <input
                                    type="text"
                                    id="universityId"
                                    value="${escapeHTML(
                                        profileData.university_id
                                    )}"
                                >

                            </div>


                            <div class="form-group">

                                <label for="year">
                                    Year of Study
                                </label>

                                <input
                                    type="text"
                                    id="year"
                                    value="${escapeHTML(
                                        profileData.year
                                    )}"
                                >

                            </div>

                        </div>

                    </section>


                    <!-- ACADEMIC INFORMATION -->

                    <section class="profile-card">

                        <div class="profile-section-header">

                            <div>

                                <h2>
                                    Academic information
                                </h2>

                                <p>
                                    Your current university program.
                                </p>

                            </div>

                        </div>


                        <div class="form-group">

                            <label for="program">
                                Program
                            </label>

                            <input
                                type="text"
                                id="program"
                                value="${escapeHTML(
                                    profileData.program
                                )}"
                            >

                        </div>

                    </section>


                    <!-- ABOUT -->

                    <section class="profile-card">

                        <div class="profile-section-header">

                            <div>

                                <h2>
                                    About
                                </h2>

                                <p>
                                    Introduce yourself professionally.
                                </p>

                            </div>

                        </div>


                        <div class="form-group">

                            <label for="bio">
                                Professional Bio
                            </label>

                            <textarea
                                id="bio"
                                rows="5"
                                placeholder="Write a short professional introduction..."
                            >${escapeHTML(
                                profileData.bio
                            )}</textarea>

                        </div>

                    </section>


                    <!-- SKILLS -->

                    <section class="profile-card">

                        <div class="profile-section-header">

                            <div>

                                <h2>
                                    Skills
                                </h2>

                                <p>
                                    Skills that will appear across
                                    your portfolio and CV.
                                </p>

                            </div>

                        </div>


                        <div class="form-group">

                            <label for="skills">
                                Skills
                            </label>

                            <input
                                type="text"
                                id="skills"
                                value="${escapeHTML(
                                    skills.join(", ")
                                )}"
                                placeholder="Python, AI, SQL, JavaScript"
                            >

                            <small class="form-help">
                                Separate each skill with a comma.
                            </small>

                        </div>


                        <div
                            class="skill-preview"
                            id="skillPreview"
                        ></div>

                    </section>


                    <!-- PROFESSIONAL LINKS -->

                    <section class="profile-card">

                        <div class="profile-section-header">

                            <div>

                                <h2>
                                    Professional links
                                </h2>

                                <p>
                                    Add links to your professional profiles.
                                </p>

                            </div>

                        </div>


                        <div class="profile-form-grid">


                            <div class="form-group">

                                <label for="linkedin">
                                    LinkedIn
                                </label>

                                <input
                                    type="url"
                                    id="linkedin"
                                    value="${escapeHTML(
                                        profileData.linkedin
                                    )}"
                                    placeholder="https://linkedin.com/in/..."
                                >

                            </div>


                            <div class="form-group">

                                <label for="github">
                                    GitHub
                                </label>

                                <input
                                    type="url"
                                    id="github"
                                    value="${escapeHTML(
                                        profileData.github
                                    )}"
                                    placeholder="https://github.com/..."
                                >

                            </div>

                        </div>

                    </section>


                    <!-- SAVE BAR -->

                    <div class="profile-save-bar">

                        <div>

                            <strong>
                                Keep your profile updated
                            </strong>

                            <p>
                                Your portfolio and CV will use
                                this information automatically.
                            </p>

                        </div>


                        <button
                            class="btn btn-primary"
                            id="saveProfileButton"
                            type="submit"
                        >
                            Save Profile
                        </button>

                    </div>

                </form>

            </main>

        `);


        // =========================================
        // FORM
        // =========================================

        const form =
            document.getElementById(
                "profileForm"
            );

        if (!form) {

            console.error(
                "Profile form not found."
            );

            return;

        }


        // =========================================
        // SKILLS
        // =========================================

        const skillsInput =
            document.getElementById(
                "skills"
            );

        const skillPreview =
            document.getElementById(
                "skillPreview"
            );


        function renderSkillPreview() {

            if (!skillPreview) {
                return;
            }

            const values =
                skillsInput.value
                    .split(",")
                    .map(
                        skill =>
                            skill.trim()
                    )
                    .filter(Boolean);


            if (!values.length) {

                skillPreview.innerHTML =
                    "";

                return;

            }


            skillPreview.innerHTML =
                values
                    .map(
                        skill => `

                            <span class="profile-skill">

                                ${escapeHTML(skill)}

                            </span>

                        `
                    )
                    .join("");

        }


        renderSkillPreview();


        skillsInput.addEventListener(
            "input",
            renderSkillPreview
        );


        // =========================================
        // SAVE PROFILE
        // =========================================

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const name =
                    document
                        .getElementById("name")
                        .value
                        .trim();


                const email =
                    document
                        .getElementById("email")
                        .value
                        .trim();


                const universityId =
                    document
                        .getElementById(
                            "universityId"
                        )
                        .value
                        .trim();


                const program =
                    document
                        .getElementById("program")
                        .value
                        .trim();


                const year =
                    document
                        .getElementById("year")
                        .value
                        .trim();


                const bio =
                    document
                        .getElementById("bio")
                        .value
                        .trim();


                const linkedin =
                    document
                        .getElementById(
                            "linkedin"
                        )
                        .value
                        .trim();


                const github =
                    document
                        .getElementById(
                            "github"
                        )
                        .value
                        .trim();


                const updatedSkills =
                    skillsInput.value
                        .split(",")
                        .map(
                            skill =>
                                skill.trim()
                        )
                        .filter(Boolean);


                // =========================================
                // VALIDATION
                // =========================================

                if (!name) {

                    alert(
                        "Please enter your full name."
                    );

                    return;

                }


                if (!email) {

                    alert(
                        "Please enter your university email."
                    );

                    return;

                }


                if (!program) {

                    alert(
                        "Please enter your program."
                    );

                    return;

                }


                // =========================================
                // BUILD API PAYLOAD
                // =========================================

                const payload = {

                    name:
                        name,

                    email:
                        email,

                    university_id:
                        universityId,

                    program:
                        program,

                    year:
                        year,

                    bio:
                        bio,

                    skills:
                        updatedSkills.join(", "),

                    linkedin:
                        linkedin,

                    github:
                        github

                };


                // =========================================
                // SAVE BUTTON
                // =========================================

                const saveButton =
                    document.getElementById(
                        "saveProfileButton"
                    );


                const originalText =
                    saveButton.textContent;


                saveButton.disabled =
                    true;


                saveButton.textContent =
                    "Saving...";


                try {

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
                                    JSON.stringify(
                                        payload
                                    )
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            result.detail ||
                            result.message ||
                            "Failed to save profile."
                        );

                    }


                    profileData.name =
                        name;

                    profileData.email =
                        email;

                    profileData.university_id =
                        universityId;

                    profileData.program =
                        program;

                    profileData.year =
                        year;

                    profileData.bio =
                        bio;

                    profileData.skills =
                        updatedSkills;

                    profileData.linkedin =
                        linkedin;

                    profileData.github =
                        github;


                    alert(
                        "Profile saved successfully!"
                    );


                    window.location.reload();


                } catch (error) {

                    console.error(
                        "Profile save error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Unable to save your profile. Please try again."
                    );


                } finally {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        originalText;

                }

            }
        );

    }
);


// =========================================
// PROFILE STRENGTH
// =========================================

function calculateProfileStrength(
    profile
) {

    const skills =
        Array.isArray(profile.skills)

            ? profile.skills

            : (
                typeof profile.skills === "string"

                    ? profile.skills
                        .split(",")
                        .map(
                            skill =>
                                skill.trim()
                        )
                        .filter(Boolean)

                    : []
            );


    const fields = [

        profile.name,

        profile.email,

        profile.university_id,

        profile.program,

        profile.year,

        profile.bio,

        skills.length > 0,

        profile.linkedin,

        profile.github

    ];


    const completed =
        fields.filter(Boolean).length;


    return Math.round(
        (
            completed /
            fields.length
        ) * 100
    );

}
