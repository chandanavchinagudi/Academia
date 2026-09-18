function getCurrentStudent(database) {
  const session = getSession();

  return database.students.find(
    (student) => student.id === session.userId
  );
}

function getCurrentCollege(database, student) {
  return database.colleges.find(
    (college) => college.id === student.collegeId
  );
}

function calculateOverallSkillScore(student) {
  if (!student.skills.length) {
    return 0;
  }

  const total = student.skills.reduce(
    (sum, skill) => sum + Number(skill.level),
    0
  );

  return Math.round(total / student.skills.length);
}

function calculateOpportunityMatch(student, opportunity) {
  if (!opportunity.skills || !opportunity.skills.length) {
    return 0;
  }

  const studentSkillMap = new Map(
    student.skills.map((skill) => [
      skill.name.toLowerCase(),
      Number(skill.level)
    ])
  );

  let score = 0;

  opportunity.skills.forEach((requiredSkill) => {
    const studentLevel =
      studentSkillMap.get(requiredSkill.toLowerCase()) || 0;

    const requiredImportance =
      opportunity.skillImportance?.[requiredSkill] || "Medium";

    const multiplier =
      requiredImportance === "High"
        ? 1.2
        : requiredImportance === "Low"
        ? 0.8
        : 1;

    score += Math.min(studentLevel * multiplier, 100);
  });

  return Math.min(
    100,
    Math.round(score / opportunity.skills.length)
  );
}

function studentPageDescription(page) {
  const descriptions = {
    Dashboard: "Track your skills, profile readiness, and career progress.",
    "My Profile": "Keep your personal and academic information up to date.",
    "My Skills": "Manage your skills and complete assessments.",
    Certificates: "Store your professional certificates and credentials.",
    "Skill Gap Analysis": "Identify the skills required for your target role.",
    Opportunities: "Discover jobs and internships matched to your skills.",
    Applications: "Track every opportunity application in one place.",
    Analytics: "Understand your skill progress and application performance.",
    Notifications: "Review updates from colleges, trainers, and companies.",
    Settings: "Manage your account and notification preferences."
  };

  return descriptions[page] || "";
}

function renderStudentPage(page) {
  const database = getDatabase();
  const student = getCurrentStudent(database);

  if (!student) {
    showToast("Student account could not be found.", "error");
    logout();
    return;
  }

  if (page === "Dashboard") {
    renderStudentDashboard(student, database);
  } else if (page === "My Profile") {
    renderStudentProfile(student, database);
  } else if (page === "My Skills") {
    renderStudentSkills(student, database);
  } else if (page === "Certificates") {
    renderStudentCertificates(student, database);
  } else if (page === "Skill Gap Analysis") {
    renderSkillGapAnalysis(student, database);
  } else if (page === "Opportunities") {
    renderStudentOpportunities(student, database);
  } else if (page === "Applications") {
    renderStudentApplications(student, database);
  } else if (page === "Analytics") {
    renderStudentAnalytics(student, database);
  } else if (page === "Notifications") {
    renderStudentNotifications(student, database);
  } else if (page === "Settings") {
    renderStudentSettings(student, database);
  }
}

function renderStudentDashboard(student, database) {
  const overallScore = calculateOverallSkillScore(student);
  const totalApplications = student.applications.length;
  const shortlisted = student.applications.filter(
    (application) => application.status === "Shortlisted"
  ).length;

  const recentNotifications = student.notifications.slice(0, 3);
  const historyLabels = student.skillHistory.map((point) => point.month);
  const historyValues = student.skillHistory.map((point) => point.score);

  setPageContent(`
    <div class="dashboard-content">
      <div class="stat-grid">
        ${createStatCard(
          "Overall Skill Score",
          `${overallScore}%`,
          "Average across assessed skills",
          "📊",
          "icon-blue"
        )}

        ${createStatCard(
          "Profile Completion",
          `${student.profileCompletion}%`,
          "Your profile is almost ready",
          "👤",
          "icon-purple"
        )}

        ${createStatCard(
          "Applications",
          totalApplications,
          "Opportunities applied to",
          "📨",
          "icon-orange"
        )}

        ${createStatCard(
          "Shortlisted",
          shortlisted,
          "Applications moved forward",
          "🎯",
          "icon-green"
        )}
      </div>

      <div class="content-grid wide-left">
        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Skill-wise performance</h3>
              <p>Your current proficiency across important skills.</p>
            </div>
            <span class="panel-link" data-page-link="My Skills">View skills</span>
          </div>

          <div class="progress-list">
            ${student.skills
              .map(
                (skill) => `
                  <div>
                    <div class="progress-header">
                      <strong>${escapeHtml(skill.name)}</strong>
                      <span>${skill.level}%</span>
                    </div>

                    <div class="progress-track">
                      <div
                        class="progress-value"
                        style="width: ${skill.level}%"
                      ></div>
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>

        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Profile readiness</h3>
              <p>Complete your profile for better matching.</p>
            </div>
          </div>

          <div class="doughnut-wrapper">
            <div
              class="doughnut-chart"
              style="
                background: conic-gradient(
                  var(--primary) 0deg ${
                    student.profileCompletion * 3.6
                  }deg,
                  #edf0f6 ${student.profileCompletion * 3.6}deg 360deg
                );
              "
            ></div>

            <div>
              <h3>${student.profileCompletion}% complete</h3>
              <p class="muted small">
                Add projects, certifications, and career preferences to
                improve your profile visibility.
              </p>
              <button class="btn btn-secondary btn-sm" data-page-link="My Profile">
                Update profile
              </button>
            </div>
          </div>
        </section>
      </div>

      <div class="content-grid">
        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Skill progress over time</h3>
              <p>Monthly improvement in your average score.</p>
            </div>
          </div>

          <div class="chart-container">
            <canvas id="studentProgressChart"></canvas>
          </div>
        </section>

        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Application status</h3>
              <p>Current distribution of your applications.</p>
            </div>
          </div>

          <div class="doughnut-wrapper">
            <canvas id="studentApplicationChart"></canvas>

            <div class="chart-legend">
              <div class="legend-item">
                <span
                  class="legend-dot"
                  style="background: var(--success);"
                ></span>
                Shortlisted
              </div>

              <div class="legend-item">
                <span
                  class="legend-dot"
                  style="background: var(--warning);"
                ></span>
                Under Review
              </div>

              <div class="legend-item">
                <span
                  class="legend-dot"
                  style="background: var(--danger);"
                ></span>
                Rejected
              </div>

              <div class="legend-item">
                <span
                  class="legend-dot"
                  style="background: #a4acc1;"
                ></span>
                Applied
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="content-grid">
        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Recent notifications</h3>
              <p>Important updates from your career journey.</p>
            </div>
            <span class="panel-link" data-page-link="Notifications">
              View all
            </span>
          </div>

          <div class="activity-list">
            ${
              recentNotifications.length
                ? recentNotifications
                    .map((notification) => createNotificationActivity(notification))
                    .join("")
                : createEmptyState("🔔", "No new notifications")
            }
          </div>
        </section>

        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Recommended next steps</h3>
              <p>Actions that can improve your employability.</p>
            </div>
          </div>

          <div class="activity-list">
            ${createNextStep(
              "🧠",
              "Complete a skill assessment",
              "Validate your current skill levels.",
              "My Skills"
            )}

            ${createNextStep(
              "📜",
              "Add your certificates",
              "Certificates improve profile credibility.",
              "Certificates"
            )}

            ${createNextStep(
              "🎯",
              "Review your skill gap",
              "Prepare for your preferred job role.",
              "Skill Gap Analysis"
            )}
          </div>
        </section>
      </div>
    </div>
  `);

  window.chartRenderers = [
    () =>
      createLineChart(
        "studentProgressChart",
        historyLabels,
        historyValues,
        {
          color: "#3157d5"
        }
      ),
    () => {
      const statuses = [
        "Shortlisted",
        "Under Review",
        "Rejected",
        "Applied"
      ];

      const values = statuses.map(
        (status) =>
          student.applications.filter(
            (application) => application.status === status
          ).length
      );

      createDonutChart(
        "studentApplicationChart",
        values.some((value) => value > 0) ? values : [1, 0, 0, 0],
        ["#18a673", "#f59e0b", "#e55353", "#a4acc1"],
        `${student.applications.length}`
      );
    }
  ];

  bindPageLinks();
  renderCharts();
}

function renderStudentProfile(student, database) {
  const college = getCurrentCollege(database, student);

  setPageContent(`
    <div class="dashboard-content">
      <section class="card-panel profile-header">
        <div class="profile-large-avatar">
          ${getInitials(student.name)}
        </div>

        <div>
          <h2>${escapeHtml(student.name)}</h2>
          <p>${escapeHtml(student.branch)} · ${escapeHtml(student.year)}</p>
          <p>${escapeHtml(college?.name || "College not available")}</p>
        </div>

        <div class="profile-progress">
          <div class="profile-progress-head">
            <span>Profile completion</span>
            <strong>${student.profileCompletion}%</strong>
          </div>

          <div class="progress-track">
            <div
              class="progress-value"
              style="width: ${student.profileCompletion}%"
            ></div>
          </div>
        </div>
      </section>

      <section class="card-panel">
        <div class="panel-heading">
          <div>
            <h3>Personal and academic details</h3>
            <p>Update your information whenever required.</p>
          </div>
        </div>

        <form id="studentProfileForm">
          <div class="form-row">
            ${createFormField(
              "Full name",
              "studentName",
              student.name,
              "text",
              true
            )}

            ${createFormField(
              "Email address",
              "studentEmail",
              student.email,
              "email",
              true
            )}
          </div>

          <div class="form-row">
            ${createFormField(
              "Phone number",
              "studentPhone",
              student.phone || "",
              "tel"
            )}

            ${createFormField(
              "Location",
              "studentLocation",
              student.location || "",
              "text"
            )}
          </div>

          <div class="form-row">
            ${createFormField(
              "Branch / Course",
              "studentBranch",
              student.branch || "",
              "text",
              true
            )}

            ${createFormField(
              "Academic year",
              "studentYear",
              student.year || "",
              "text"
            )}
          </div>

          <div class="form-row">
            ${createFormField(
              "CGPA",
              "studentCgpa",
              student.cgpa || "",
              "number",
              false,
              "0",
              "10",
              "0.1"
            )}

            ${createFormField(
              "Career goal",
              "studentCareerGoal",
              student.careerGoal || "Frontend Developer",
              "text"
            )}
          </div>

          <div class="form-group">
            <label for="studentBio">Professional bio</label>
            <textarea
              id="studentBio"
              class="form-control"
              placeholder="Write a short introduction about yourself"
            >${escapeHtml(student.bio || "")}</textarea>
          </div>

          <button class="btn btn-primary" type="submit">
            Save profile changes
          </button>
        </form>
      </section>
    </div>
  `);

  document
    .getElementById("studentProfileForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const updatedDatabase = getDatabase();
      const updatedStudent = updatedDatabase.students.find(
        (item) => item.id === student.id
      );

      updatedStudent.name = document.getElementById("studentName").value;
      updatedStudent.email = document.getElementById("studentEmail").value;
      updatedStudent.phone = document.getElementById("studentPhone").value;
      updatedStudent.location =
        document.getElementById("studentLocation").value;
      updatedStudent.branch =
        document.getElementById("studentBranch").value;
      updatedStudent.year = document.getElementById("studentYear").value;
      updatedStudent.cgpa = Number(
        document.getElementById("studentCgpa").value
      );
      updatedStudent.careerGoal =
        document.getElementById("studentCareerGoal").value;
      updatedStudent.bio = document.getElementById("studentBio").value;

      const requiredFields = [
        updatedStudent.name,
        updatedStudent.email,
        updatedStudent.phone,
        updatedStudent.location,
        updatedStudent.branch,
        updatedStudent.year,
        updatedStudent.cgpa,
        updatedStudent.bio
      ];

      const completedFields = requiredFields.filter(Boolean).length;
      updatedStudent.profileCompletion = Math.min(
        100,
        Math.round((completedFields / requiredFields.length) * 100)
      );

      saveDatabase(updatedDatabase);
      showToast("Profile updated successfully.", "success");
      renderStudentPage("My Profile");
    });
}

function renderStudentSkills(student, database) {
  setPageContent(`
    <div class="dashboard-content">
      <div class="toolbar">
        <div>
          <h3 style="margin: 0;">Your skill portfolio</h3>
          <p class="muted small">
            Add skills and validate them through assessments.
          </p>
        </div>

        <button class="btn btn-primary" id="addSkillButton">
          + Add skill
        </button>
      </div>

      <section class="card-panel">
        ${
          student.skills.length
            ? `
              <div class="skill-grid">
                ${student.skills
                  .map((skill) => createSkillCard(skill))
                  .join("")}
              </div>
            `
            : createEmptyState("🧠", "No skills added yet")
        }
      </section>

      <section class="card-panel">
        <div class="panel-heading">
          <div>
            <h3>Skill assessment center</h3>
            <p>
              Take a quick prototype assessment to update your skill score.
            </p>
          </div>
        </div>

        <div class="content-grid">
          ${student.skills
            .map(
              (skill) => `
                <div class="skill-card">
                  <div class="skill-card-head">
                    <h4>${escapeHtml(skill.name)}</h4>
                    <span class="badge ${
                      skill.assessed ? "badge-success" : "badge-neutral"
                    }">
                      ${skill.assessed ? "Assessed" : "Not assessed"}
                    </span>
                  </div>

                  <p>
                    Current score: <strong>${skill.level}%</strong>
                  </p>

                  <button
                    class="btn btn-secondary btn-sm"
                    data-assessment-id="${skill.id}"
                  >
                    Take assessment
                  </button>
                </div>
              `
            )
            .join("")}
        </div>
      </section>
    </div>
  `);

  document
    .getElementById("addSkillButton")
    .addEventListener("click", () => openSkillModal());

  document.querySelectorAll("[data-assessment-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const skill = student.skills.find(
        (item) => item.id === button.dataset.assessmentId
      );

      openAssessmentModal(skill);
    });
  });
}

function createSkillCard(skill) {
  return `
    <div class="skill-card">
      <div class="skill-card-head">
        <h4>${escapeHtml(skill.name)}</h4>

        <div class="table-actions">
          <button
            class="btn btn-outline btn-sm"
            data-edit-skill="${skill.id}"
          >
            Edit
          </button>

          <button
            class="btn btn-danger btn-sm"
            data-delete-skill="${skill.id}"
          >
            Delete
          </button>
        </div>
      </div>

      <p>${escapeHtml(skill.category || "Technical skill")}</p>

      <div class="progress-header">
        <strong>Skill level</strong>
        <span>${skill.level}%</span>
      </div>

      <div class="progress-track">
        <div
          class="progress-value"
          style="width: ${skill.level}%"
        ></div>
      </div>

      <p class="small">
        Last updated: ${formatDate(skill.lastUpdated)}
      </p>
    </div>
  `;
}

function openSkillModal(skill = null) {
  const isEdit = Boolean(skill);

  openModal(`
    <div class="modal-header">
      <div>
        <h2>${isEdit ? "Edit skill" : "Add new skill"}</h2>
        <p class="muted small">
          Keep your skill portfolio current.
        </p>
      </div>
      <button class="modal-close" data-close-modal>×</button>
    </div>

    <form id="skillForm">
      ${createFormField(
        "Skill name",
        "skillName",
        skill?.name || "",
        "text",
        true
      )}

      <div class="form-row">
        ${createFormField(
          "Current percentage",
          "skillLevel",
          skill?.level || 0,
          "number",
          true,
          "0",
          "100"
        )}

        <div class="form-group">
          <label for="skillCategory">Category</label>
          <select id="skillCategory" class="form-control">
            <option ${
              skill?.category === "Technical" ? "selected" : ""
            }>Technical</option>
            <option ${
              skill?.category === "Soft Skill" ? "selected" : ""
            }>Soft Skill</option>
            <option ${
              skill?.category === "Domain" ? "selected" : ""
            }>Domain</option>
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-outline" type="button" data-close-modal>
          Cancel
        </button>

        <button class="btn btn-primary" type="submit">
          ${isEdit ? "Update skill" : "Add skill"}
        </button>
      </div>
    </form>
  `);

  document
    .getElementById("skillForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const database = getDatabase();
      const student = getCurrentStudent(database);
      const name = document.getElementById("skillName").value.trim();
      const level = Number(document.getElementById("skillLevel").value);
      const category = document.getElementById("skillCategory").value;

      if (isEdit) {
        const target = student.skills.find(
          (item) => item.id === skill.id
        );

        target.name = name;
        target.level = level;
        target.category = category;
        target.lastUpdated = today();
      } else {
        student.skills.push({
          id: createId("skill"),
          name,
          level,
          category,
          assessed: false,
          lastUpdated: today()
        });
      }

      saveDatabase(database);
      closeModal();
      showToast(
        isEdit ? "Skill updated successfully." : "Skill added successfully.",
        "success"
      );
      renderStudentPage("My Skills");
    });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
}

function openAssessmentModal(skill) {
  openModal(`
    <div class="modal-header">
      <div>
        <h2>${escapeHtml(skill.name)} assessment</h2>
        <p class="muted small">
          Answer the prototype assessment to calculate a new score.
        </p>
      </div>
      <button class="modal-close" data-close-modal>×</button>
    </div>

    <form id="assessmentForm">
      <div class="form-group">
        <label>
          How comfortable are you using ${escapeHtml(skill.name)}?
        </label>

        <select class="form-control" id="assessmentComfort" required>
          <option value="">Choose an option</option>
          <option value="40">I am a beginner</option>
          <option value="60">I can complete guided tasks</option>
          <option value="75">I can independently complete projects</option>
          <option value="90">I can mentor others and solve advanced problems</option>
        </select>
      </div>

      <div class="form-group">
        <label>
          How many practical projects have you completed?
        </label>

        <select class="form-control" id="assessmentProjects" required>
          <option value="">Choose an option</option>
          <option value="10">None</option>
          <option value="20">1 project</option>
          <option value="30">2-3 projects</option>
          <option value="40">4 or more projects</option>
        </select>
      </div>

      <div class="form-group">
        <label>
          How confident are you in explaining this skill during an interview?
        </label>

        <select class="form-control" id="assessmentConfidence" required>
          <option value="">Choose an option</option>
          <option value="10">Not confident</option>
          <option value="20">Somewhat confident</option>
          <option value="30">Confident</option>
          <option value="40">Very confident</option>
        </select>
      </div>

      <div class="modal-footer">
        <button class="btn btn-outline" type="button" data-close-modal>
          Cancel
        </button>

        <button class="btn btn-primary" type="submit">
          Calculate score
        </button>
      </div>
    </form>
  `);

  document
    .getElementById("assessmentForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const comfort = Number(
        document.getElementById("assessmentComfort").value
      );
      const projects = Number(
        document.getElementById("assessmentProjects").value
      );
      const confidence = Number(
        document.getElementById("assessmentConfidence").value
      );

      const score = Math.min(
        100,
        Math.round(((comfort + projects + confidence) / 170) * 100)
      );

      const database = getDatabase();
      const student = getCurrentStudent(database);
      const target = student.skills.find((item) => item.id === skill.id);

      target.level = score;
      target.assessed = true;
      target.lastUpdated = today();

      saveDatabase(database);
      closeModal();

      showToast(
        `${skill.name} assessment completed. New score: ${score}%`,
        "success"
      );

      renderStudentPage("My Skills");
    });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
}

function renderStudentCertificates(student, database) {
  setPageContent(`
    <div class="dashboard-content">
      <div class="toolbar">
        <div>
          <h3 style="margin: 0;">Certificates</h3>
          <p class="muted small">
            Add credentials that support your career profile.
          </p>
        </div>

        <button class="btn btn-primary" id="addCertificateButton">
          + Add certificate
        </button>
      </div>

      <section class="card-panel">
        ${
          student.certificates.length
            ? `
              <div class="content-grid">
                ${student.certificates
                  .map((certificate) => createCertificateCard(certificate))
                  .join("")}
              </div>
            `
            : createEmptyState("📜", "No certificates added yet")
        }
      </section>
    </div>
  `);

  document
    .getElementById("addCertificateButton")
    .addEventListener("click", () => openCertificateModal());
}

function createCertificateCard(certificate) {
  return `
    <div class="skill-card">
      <div class="skill-card-head">
        <h4>${escapeHtml(certificate.name)}</h4>

        <button
          class="btn btn-danger btn-sm"
          data-delete-certificate="${certificate.id}"
        >
          Delete
        </button>
      </div>

      <p>
        Issued by <strong>${escapeHtml(certificate.organization)}</strong>
      </p>

      <p>
        Issue date: ${formatDate(certificate.issueDate)}
      </p>

      <p>
        Credential ID: ${escapeHtml(certificate.credentialId || "Not provided")}
      </p>

      <p class="muted">
        ${escapeHtml(certificate.description || "No description added.")}
      </p>
    </div>
  `;
}

function openCertificateModal() {
  openModal(`
    <div class="modal-header">
      <div>
        <h2>Add certificate</h2>
        <p class="muted small">
          Add a professional or academic credential.
        </p>
      </div>
      <button class="modal-close" data-close-modal>×</button>
    </div>

    <form id="certificateForm">
      ${createFormField(
        "Certificate name",
        "certificateName",
        "",
        "text",
        true
      )}

      ${createFormField(
        "Issuing organization",
        "certificateOrganization",
        "",
        "text",
        true
      )}

      <div class="form-row">
        ${createFormField(
          "Issue date",
          "certificateDate",
          today(),
          "date",
          true
        )}

        ${createFormField(
          "Credential ID",
          "certificateCredential",
          "",
          "text"
        )}
      </div>

      <div class="form-group">
        <label for="certificateDescription">Description</label>
        <textarea
          id="certificateDescription"
          class="form-control"
          placeholder="Briefly describe the certificate"
        ></textarea>
      </div>

      <div class="modal-footer">
        <button class="btn btn-outline" type="button" data-close-modal>
          Cancel
        </button>

        <button class="btn btn-primary" type="submit">
          Save certificate
        </button>
      </div>
    </form>
  `);

  document
    .getElementById("certificateForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const database = getDatabase();
      const student = getCurrentStudent(database);

      student.certificates.push({
        id: createId("certificate"),
        name: document.getElementById("certificateName").value.trim(),
        organization: document
          .getElementById("certificateOrganization")
          .value.trim(),
        issueDate: document.getElementById("certificateDate").value,
        credentialId: document
          .getElementById("certificateCredential")
          .value.trim(),
        description: document
          .getElementById("certificateDescription")
          .value.trim()
      });

      saveDatabase(database);
      closeModal();
      showToast("Certificate added successfully.", "success");
      renderStudentPage("Certificates");
    });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
}

function renderSkillGapAnalysis(student, database) {
  const selectedRole =
    student.targetRole || "Frontend Developer";

  const roleOptions = [
    "Frontend Developer",
    "Data Analyst",
    "IoT Engineer",
    "Full Stack Developer"
  ];

  const roleRequirements = {
    "Frontend Developer": [
      "JavaScript",
      "HTML/CSS",
      "Git",
      "Responsive Design",
      "Communication"
    ],
    "Data Analyst": [
      "SQL",
      "Python",
      "Data Analytics",
      "Excel",
      "Communication"
    ],
    "IoT Engineer": [
      "Embedded C",
      "IoT",
      "Microcontrollers",
      "Communication",
      "Problem Solving"
    ],
    "Full Stack Developer": [
      "JavaScript",
      "HTML/CSS",
      "SQL",
      "Node.js",
      "Git"
    ]
  };

  const requiredSkills = roleRequirements[selectedRole];
  const studentSkillMap = new Map(
    student.skills.map((skill) => [
      skill.name.toLowerCase(),
      Number(skill.level)
    ])
  );

  const availableSkills = requiredSkills.filter((skill) =>
    studentSkillMap.has(skill.toLowerCase())
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !studentSkillMap.has(skill.toLowerCase())
  );

  setPageContent(`
    <div class="dashboard-content">
      <section class="card-panel">
        <div class="panel-heading">
          <div>
            <h3>Choose a target job role</h3>
            <p>
              Compare your existing skills with the requirements for that role.
            </p>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="targetRoleSelect">Target role</label>

            <select id="targetRoleSelect" class="form-control">
              ${roleOptions
                .map(
                  (role) => `
                    <option
                      value="${role}"
                      ${role === selectedRole ? "selected" : ""}
                    >
                      ${role}
                    </option>
                  `
                )
                .join("")}
            </select>
          </div>

          <div style="display: flex; align-items: end;">
            <button
              class="btn btn-primary"
              id="analyzeGapButton"
              style="margin-bottom: 17px;"
            >
              Analyze skill gap
            </button>
          </div>
        </div>
      </section>

      <div class="content-grid">
        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Skills you already have</h3>
              <p>Keep improving these skills to become job-ready.</p>
            </div>
            <span class="badge badge-success">
              ${availableSkills.length} available
            </span>
          </div>

          ${
            availableSkills.length
              ? `
                <div class="progress-list">
                  ${availableSkills
                    .map((skillName) => {
                      const level = studentSkillMap.get(
                        skillName.toLowerCase()
                      );

                      return `
                        <div>
                          <div class="progress-header">
                            <strong>${skillName}</strong>
                            <span>${level}%</span>
                          </div>

                          <div class="progress-track">
                            <div
                              class="progress-value"
                              style="width: ${level}%"
                            ></div>
                          </div>
                        </div>
                      `;
                    })
                    .join("")}
                </div>
              `
              : createEmptyState("✅", "No matching skills found")
          }
        </section>

        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Recommended learning areas</h3>
              <p>Skills to learn for your selected target role.</p>
            </div>
            <span class="badge badge-warning">
              ${missingSkills.length} recommended
            </span>
          </div>

          ${
            missingSkills.length
              ? `
                <div class="activity-list">
                  ${missingSkills
                    .map(
                      (skill) => `
                        <div class="activity-item">
                          <div class="activity-icon">📚</div>
                          <div>
                            <h4>${skill}</h4>
                            <p>
                              Add a course, project, or assessment for this skill.
                            </p>
                          </div>
                        </div>
                      `
                    )
                    .join("")}
                </div>
              `
              : createEmptyState("🎉", "You have all required skills")
          }
        </section>
      </div>
    </div>
  `);

  document
    .getElementById("analyzeGapButton")
    .addEventListener("click", () => {
      const role = document.getElementById("targetRoleSelect").value;
      const updatedDatabase = getDatabase();
      const updatedStudent = getCurrentStudent(updatedDatabase);

      updatedStudent.targetRole = role;
      saveDatabase(updatedDatabase);

      showToast("Skill-gap analysis updated.", "success");
      renderStudentPage("Skill Gap Analysis");
    });
}

function renderStudentOpportunities(student, database) {
  const activeOpportunities = database.opportunities.filter(
    (opportunity) => opportunity.status === "Active"
  );

  setPageContent(`
    <div class="dashboard-content">
      <div class="toolbar">
        <div>
          <h3 style="margin: 0;">Jobs and internships</h3>
          <p class="muted small">
            Opportunities are ranked by your skill match.
          </p>
        </div>

        <div class="filter-group">
          <select class="filter-select" id="opportunityTypeFilter">
            <option value="All">All types</option>
            <option value="Job">Jobs</option>
            <option value="Internship">Internships</option>
          </select>

          <select class="filter-select" id="opportunityModeFilter">
            <option value="All">All modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>
      </div>

      <div class="opportunity-grid" id="opportunityGrid">
        ${activeOpportunities
          .map((opportunity) =>
            createOpportunityCard(opportunity, student, database)
          )
          .join("")}
      </div>
    </div>
  `);

  const renderFilteredOpportunities = () => {
    const type = document.getElementById("opportunityTypeFilter").value;
    const mode = document.getElementById("opportunityModeFilter").value;

    const filtered = activeOpportunities.filter((opportunity) => {
      const matchesType = type === "All" || opportunity.type === type;
      const matchesMode = mode === "All" || opportunity.mode === mode;

      return matchesType && matchesMode;
    });

    document.getElementById("opportunityGrid").innerHTML = filtered.length
      ? filtered
          .map((opportunity) =>
            createOpportunityCard(opportunity, student, database)
          )
          .join("")
      : createEmptyState("🔎", "No matching opportunities found");

    bindOpportunityActions(student);
  };

  document
    .getElementById("opportunityTypeFilter")
    .addEventListener("change", renderFilteredOpportunities);

  document
    .getElementById("opportunityModeFilter")
    .addEventListener("change", renderFilteredOpportunities);

  bindOpportunityActions(student);
}

function createOpportunityCard(opportunity, student, database) {
  const industry = database.industries.find(
    (item) => item.id === opportunity.industryId
  );

  const match = calculateOpportunityMatch(student, opportunity);
  const applied = student.applications.some(
    (application) => application.opportunityId === opportunity.id
  );

  return `
    <article class="opportunity-card">
      <div class="company-line">
        <div class="company-logo">
          ${escapeHtml(industry?.logoText || "CO")}
        </div>

        <div>
          <strong>${escapeHtml(industry?.name || "Industry")}</strong>
          <small>${escapeHtml(opportunity.domain || "Opportunity")}</small>
        </div>
      </div>

      <h3>${escapeHtml(opportunity.title)}</h3>

      <p>
        ${escapeHtml(opportunity.description)}
      </p>

      <div class="tag-list">
        ${opportunity.skills
          .map((skill) => `<span class="skill-tag">${escapeHtml(skill)}</span>`)
          .join("")}
      </div>

      <div class="opportunity-meta">
        <div class="meta-item">
          <small>Type</small>
          <strong>${escapeHtml(opportunity.type)}</strong>
        </div>

        <div class="meta-item">
          <small>Work mode</small>
          <strong>${escapeHtml(opportunity.mode)}</strong>
        </div>

        <div class="meta-item">
          <small>Location</small>
          <strong>${escapeHtml(opportunity.location)}</strong>
        </div>

        <div class="meta-item">
          <small>${opportunity.type === "Job" ? "Salary" : "Stipend"}</small>
          <strong>
            ${escapeHtml(
              opportunity.type === "Job"
                ? opportunity.salary
                : opportunity.stipend
            )}
          </strong>
        </div>
      </div>

      <div class="match-score">
        <span>Skill match</span>
        <span>${match}%</span>
      </div>

      <button
        class="btn ${
          applied ? "btn-outline" : "btn-primary"
        } w-full"
        data-apply-opportunity="${opportunity.id}"
        ${applied ? "disabled" : ""}
      >
        ${applied ? "Already applied" : "Apply now"}
      </button>
    </article>
  `;
}

function bindOpportunityActions(student) {
  document
    .querySelectorAll("[data-apply-opportunity]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        applyToOpportunity(
          button.dataset.applyOpportunity,
          student.id
        );
      });
    });
}

function applyToOpportunity(opportunityId, studentId) {
  const database = getDatabase();
  const student = database.students.find(
    (item) => item.id === studentId
  );
  const opportunity = database.opportunities.find(
    (item) => item.id === opportunityId
  );

  if (!student || !opportunity) {
    return;
  }

  const alreadyApplied = student.applications.some(
    (application) => application.opportunityId === opportunityId
  );

  if (alreadyApplied) {
    showToast("You have already applied to this opportunity.", "warning");
    return;
  }

  student.applications.push({
    id: createId("application"),
    opportunityId,
    appliedDate: today(),
    status: "Applied",
    note: "Application submitted successfully."
  });

  student.notifications.unshift({
    id: createId("notification"),
    title: "Application submitted",
    message: `Your application for ${opportunity.title} has been submitted.`,
    date: today(),
    type: "success",
    unread: true
  });

  saveDatabase(database);
  showToast("Application submitted successfully.", "success");
  renderStudentPage("Opportunities");
}

function renderStudentApplications(student, database) {
  const rows = student.applications.map((application) => {
    const opportunity = database.opportunities.find(
      (item) => item.id === application.opportunityId
    );

    const industry = database.industries.find(
      (item) => item.id === opportunity?.industryId
    );

    return `
      <tr>
        <td>
          <strong>${escapeHtml(opportunity?.title || "Unknown opportunity")}</strong>
          <small class="muted">
            ${escapeHtml(opportunity?.type || "")}
          </small>
        </td>

        <td>${escapeHtml(industry?.name || "Unknown company")}</td>
        <td>${formatDate(application.appliedDate)}</td>
        <td>${createStatusBadge(application.status)}</td>

        <td>
          <button
            class="btn btn-outline btn-sm"
            data-view-opportunity="${application.opportunityId}"
          >
            View
          </button>
        </td>
      </tr>
    `;
  });

  setPageContent(`
    <div class="dashboard-content">
      <section class="card-panel">
        <div class="panel-heading">
          <div>
            <h3>My applications</h3>
            <p>Monitor the progress of all your submitted applications.</p>
          </div>

          <span class="badge badge-info">
            ${student.applications.length} total
          </span>
        </div>

        ${
          rows.length
            ? `
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Opportunity</th>
                      <th>Company</th>
                      <th>Applied date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows.join("")}
                  </tbody>
                </table>
              </div>
            `
            : createEmptyState("📨", "You have not submitted any applications")
        }
      </section>
    </div>
  `);

  document
    .querySelectorAll("[data-view-opportunity]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const opportunity = database.opportunities.find(
          (item) => item.id === button.dataset.viewOpportunity
        );

        openOpportunityModal(opportunity, student, database);
      });
    });
}

function renderStudentAnalytics(student, database) {
  const historyLabels = student.skillHistory.map((point) => point.month);
  const historyValues = student.skillHistory.map((point) => point.score);

  const averageSkill = calculateOverallSkillScore(student);
  const assessedSkills = student.skills.filter(
    (skill) => skill.assessed
  ).length;

  setPageContent(`
    <div class="dashboard-content">
      <div class="stat-grid">
        ${createStatCard(
          "Average skill score",
          `${averageSkill}%`,
          "Across all listed skills",
          "📈",
          "icon-blue"
        )}

        ${createStatCard(
          "Assessed skills",
          assessedSkills,
          `Out of ${student.skills.length} skills`,
          "🧠",
          "icon-purple"
        )}

        ${createStatCard(
          "Certificates",
          student.certificates.length,
          "Credentials in profile",
          "📜",
          "icon-green"
        )}

        ${createStatCard(
          "Profile completion",
          `${student.profileCompletion}%`,
          "Career profile readiness",
          "✅",
          "icon-orange"
        )}
      </div>

      <div class="content-grid">
        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Skill progress over time</h3>
              <p>Monthly average skill development.</p>
            </div>
          </div>

          <div class="chart-container">
            <canvas id="analyticsProgressChart"></canvas>
          </div>
        </section>

        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Application performance</h3>
              <p>Current application funnel.</p>
            </div>
          </div>

          <div class="progress-list">
            ${createAnalyticsMetric(
              "Applications submitted",
              student.applications.length,
              Math.min(student.applications.length * 20, 100)
            )}

            ${createAnalyticsMetric(
              "Applications shortlisted",
              student.applications.filter(
                (application) => application.status === "Shortlisted"
              ).length,
              Math.min(
                student.applications.filter(
                  (application) => application.status === "Shortlisted"
                ).length * 40,
                100
              )
            )}

            ${createAnalyticsMetric(
              "Certificates added",
              student.certificates.length,
              Math.min(student.certificates.length * 30, 100)
            )}
          </div>
        </section>
      </div>
    </div>
  `);

  window.chartRenderers = [
    () =>
      createLineChart(
        "analyticsProgressChart",
        historyLabels,
        historyValues,
        {
          color: "#6c63ff"
        }
      )
  ];

  renderCharts();
}

function renderStudentNotifications(student, database) {
  setPageContent(`
    <div class="dashboard-content">
      <section class="card-panel">
        <div class="panel-heading">
          <div>
            <h3>Notifications</h3>
            <p>Updates related to applications, interviews, and training.</p>
          </div>

          <button class="btn btn-outline btn-sm" id="markNotificationsRead">
            Mark all as read
          </button>
        </div>

        <div class="notification-list">
          ${
            student.notifications.length
              ? student.notifications
                  .map((notification) =>
                    createNotificationCard(notification)
                  )
                  .join("")
              : createEmptyState("🔔", "No notifications available")
          }
        </div>
      </section>
    </div>
  `);

  document
    .getElementById("markNotificationsRead")
    .addEventListener("click", () => {
      const updatedDatabase = getDatabase();
      const updatedStudent = getCurrentStudent(updatedDatabase);

      updatedStudent.notifications.forEach((notification) => {
        notification.unread = false;
      });

      saveDatabase(updatedDatabase);
      showToast("Notifications marked as read.", "success");
      renderStudentPage("Notifications");
    });
}

function renderStudentSettings(student, database) {
  setPageContent(`
    <div class="dashboard-content">
      <section class="card-panel">
        <div class="panel-heading">
          <div>
            <h3>Account settings</h3>
            <p>Manage basic account and notification preferences.</p>
          </div>
        </div>

        <form id="studentSettingsForm">
          <div class="form-row">
            <div class="form-group">
              <label for="settingsEmailNotifications">
                Email notifications
              </label>

              <select id="settingsEmailNotifications" class="form-control">
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>

            <div class="form-group">
              <label for="settingsApplicationAlerts">
                Application alerts
              </label>

              <select id="settingsApplicationAlerts" class="form-control">
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="settingsCurrentPassword">
              Current password
            </label>

            <input
              id="settingsCurrentPassword"
              class="form-control"
              type="password"
              placeholder="Enter current password"
            />
          </div>

          <div class="form-group">
            <label for="settingsNewPassword">
              New password
            </label>

            <input
              id="settingsNewPassword"
              class="form-control"
              type="password"
              placeholder="Enter a new password"
            />
          </div>

          <button class="btn btn-primary" type="submit">
            Save settings
          </button>
        </form>
      </section>

      <section class="card-panel">
        <div class="panel-heading">
          <div>
            <h3>Prototype data controls</h3>
            <p>Use these controls while testing the localStorage prototype.</p>
          </div>
        </div>

        <button class="btn btn-danger" id="resetPrototypeData">
          Reset all demo data
        </button>
      </section>
    </div>
  `);

  document
    .getElementById("studentSettingsForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const database = getDatabase();
      const updatedStudent = getCurrentStudent(database);

      const currentPassword =
        document.getElementById("settingsCurrentPassword").value;
      const newPassword =
        document.getElementById("settingsNewPassword").value;

      if (newPassword) {
        if (currentPassword !== updatedStudent.password) {
          showToast("Current password is incorrect.", "error");
          return;
        }

        updatedStudent.password = newPassword;
      }

      saveDatabase(database);
      showToast("Settings saved successfully.", "success");
    });

  document
    .getElementById("resetPrototypeData")
    .addEventListener("click", () => {
      const confirmed = window.confirm(
        "Reset all localStorage demo data?"
      );

      if (confirmed) {
        resetDatabase();
      }
    });
}

function openOpportunityModal(opportunity, student, database) {
  const industry = database.industries.find(
    (item) => item.id === opportunity.industryId
  );

  const match = calculateOpportunityMatch(student, opportunity);

  openModal(`
    <div class="modal-header">
      <div>
        <h2>${escapeHtml(opportunity.title)}</h2>
        <p class="muted small">
          ${escapeHtml(industry?.name || "Industry")}
        </p>
      </div>
      <button class="modal-close" data-close-modal>×</button>
    </div>

    <div class="content-grid">
      <div>
        <p><strong>Type:</strong> ${escapeHtml(opportunity.type)}</p>
        <p><strong>Domain:</strong> ${escapeHtml(opportunity.domain)}</p>
        <p><strong>Location:</strong> ${escapeHtml(opportunity.location)}</p>
        <p><strong>Work mode:</strong> ${escapeHtml(opportunity.mode)}</p>
        <p><strong>Eligibility:</strong> ${escapeHtml(opportunity.eligibility)}</p>
      </div>

      <div>
        <p>
          <strong>
            ${opportunity.type === "Job" ? "Salary" : "Stipend"}:
          </strong>
          ${escapeHtml(
            opportunity.type === "Job"
              ? opportunity.salary
              : opportunity.stipend
          )}
        </p>

        <p><strong>Minimum CGPA:</strong> ${opportunity.minCgpa}</p>
        <p><strong>Experience:</strong> ${escapeHtml(opportunity.experience)}</p>
        <p><strong>Deadline:</strong> ${formatDate(opportunity.deadline)}</p>
        <p><strong>Your skill match:</strong> ${match}%</p>
      </div>
    </div>

    <hr />

    <p>
      <strong>Required skills</strong>
    </p>

    <div class="tag-list">
      ${opportunity.skills
        .map(
          (skill) =>
            `<span class="skill-tag">${escapeHtml(skill)}</span>`
        )
        .join("")}
    </div>

    <p>
      <strong>Description</strong>
    </p>

    <p class="muted">
      ${escapeHtml(opportunity.description)}
    </p>

    <div class="modal-footer">
      <button class="btn btn-outline" data-close-modal>
        Close
      </button>
    </div>
  `);

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
}