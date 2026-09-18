function getCurrentCollegeAdmin(database) {
  const session = getSession();

  return database.colleges.find(
    (college) => college.id === session.userId
  );
}

function getCollegeStudents(database, collegeId) {
  return database.students.filter(
    (student) => student.collegeId === collegeId
  );
}

function getCollegeCollaborations(database, collegeId) {
  return database.collaborations.filter(
    (collaboration) => collaboration.collegeId === collegeId
  );
}

function getCollegePlacements(database, collegeId) {
  return database.placementRecords.filter(
    (placement) => placement.collegeId === collegeId
  );
}

function renderCollegePage(page) {
  const database = getDatabase();
  const college = getCurrentCollegeAdmin(database);

  if (!college) {
    showToast("College account could not be found.", "error");
    logout();
    return;
  }

  if (page === "Dashboard") {
    renderCollegeDashboard(college, database);
  } else if (page === "Students") {
    renderCollegeStudents(college, database);
  } else if (page === "Training Programs") {
    renderCollegeTrainingPrograms(college, database);
  } else if (page === "Placements") {
    renderCollegePlacements(college, database);
  } else if (page === "Industry Collaboration") {
    renderCollegeCollaboration(college, database);
  }
}

function renderCollegeDashboard(college, database) {
  const students = getCollegeStudents(database, college.id);
  const collaborations = getCollegeCollaborations(database, college.id);
  const opportunities = database.opportunities.filter(
    (opportunity) => opportunity.status === "Active"
  );

  const verifiedStudents = students.filter(
    (student) => student.profileCompletion >= 75
  ).length;

  const skillCounts = {};
  students.forEach((student) => {
    student.skills.forEach((skill) => {
      if (!skillCounts[skill.name]) {
        skillCounts[skill.name] = 0;
      }

      skillCounts[skill.name] += 1;
    });
  });

  const skillLabels = Object.keys(skillCounts);
  const skillValues = Object.values(skillCounts);

  const demandCounts = {};

  opportunities.forEach((opportunity) => {
    opportunity.skills.forEach((skill) => {
      demandCounts[skill] = (demandCounts[skill] || 0) + 1;
    });
  });

  const demandLabels = Object.keys(demandCounts);
  const demandValues = Object.values(demandCounts);

  setPageContent(`
    <div class="dashboard-content">
      <div class="stat-grid">
        ${createStatCard(
          "Total students",
          students.length,
          "Students registered with the college",
          "🎓",
          "icon-blue"
        )}

        ${createStatCard(
          "Verified students",
          verifiedStudents,
          "Profile completion above 75%",
          "✅",
          "icon-green"
        )}

        ${createStatCard(
          "Partner companies",
          collaborations.length,
          "Active industry collaborations",
          "🤝",
          "icon-purple"
        )}

        ${createStatCard(
          "Opportunities",
          opportunities.length,
          "Active jobs and internships",
          "💼",
          "icon-orange"
        )}
      </div>

      <div class="content-grid">
        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Student skill distribution</h3>
              <p>Skills represented in your college student profiles.</p>
            </div>
          </div>

          <div class="chart-container">
            <canvas id="collegeSkillChart"></canvas>
          </div>
        </section>

        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Industry skill demand</h3>
              <p>Skills requested by active opportunities.</p>
            </div>
          </div>

          <div class="chart-container">
            <canvas id="collegeDemandChart"></canvas>
          </div>
        </section>
      </div>

      <div class="content-grid">
        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Students needing support</h3>
              <p>Students with lower profile completion.</p>
            </div>

            <span class="panel-link" data-college-page="Students">
              View students
            </span>
          </div>

          <div class="activity-list">
            ${students
              .filter((student) => student.profileCompletion < 85)
              .map(
                (student) => `
                  <div class="activity-item">
                    <div class="avatar">${getInitials(student.name)}</div>
                    <div>
                      <h4>${escapeHtml(student.name)}</h4>
                      <p>
                        Profile completion: ${student.profileCompletion}%
                      </p>
                    </div>
                  </div>
                `
              )
              .join("") || createEmptyState("🎉", "All student profiles are healthy")}
          </div>
        </section>

        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Training recommendations</h3>
              <p>Prioritized based on current skill demand.</p>
            </div>

            <span class="panel-link" data-college-page="Training Programs">
              Manage training
            </span>
          </div>

          <div class="activity-list">
            ${demandLabels
              .slice(0, 4)
              .map(
                (skill, index) => `
                  <div class="activity-item">
                    <div class="activity-icon">📚</div>
                    <div>
                      <h4>${escapeHtml(skill)}</h4>
                      <p>
                        Requested by ${demandValues[index]} active opportunity
                        ${
                          demandValues[index] === 1 ? "" : "opportunities"
                        }.
                      </p>
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
      </div>
    </div>
  `);

  window.chartRenderers = [
    () =>
      createBarChart(
        "collegeSkillChart",
        skillLabels,
        skillValues,
        {
          color: "#3157d5",
          maxValue: Math.max(...skillValues, 5)
        }
      ),
    () =>
      createBarChart(
        "collegeDemandChart",
        demandLabels,
        demandValues,
        {
          color: "#6c63ff",
          maxValue: Math.max(...demandValues, 5)
        }
      )
  ];

  document.querySelectorAll("[data-college-page]").forEach((element) => {
    element.addEventListener("click", () => {
      setActivePage(element.dataset.collegePage);
    });
  });

  renderCharts();
}

function renderCollegeStudents(college, database) {
  const students = getCollegeStudents(database, college.id);

  setPageContent(`
    <div class="dashboard-content">
      <section class="card-panel">
        <div class="toolbar">
          <div>
            <h3 style="margin: 0;">College students</h3>
            <p class="muted small">
              View and manage students belonging to ${escapeHtml(college.name)}.
            </p>
          </div>

          <div class="filter-group">
            <div class="search-box">
              <span>⌕</span>
              <input
                id="studentSearch"
                type="search"
                placeholder="Search students..."
              />
            </div>

            <select class="filter-select" id="studentBranchFilter">
              <option value="All">All branches</option>
              ${[
                ...new Set(students.map((student) => student.branch))
              ]
                .map(
                  (branch) =>
                    `<option value="${escapeHtml(branch)}">${escapeHtml(
                      branch
                    )}</option>`
                )
                .join("")}
            </select>
          </div>
        </div>

        <div id="collegeStudentsTable"></div>
      </section>
    </div>
  `);

  const renderStudents = () => {
    const search =
      document.getElementById("studentSearch").value.toLowerCase();
    const branch =
      document.getElementById("studentBranchFilter").value;

    const filtered = students.filter((student) => {
      const skills = student.skills
        .map((skill) => skill.name)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        student.name.toLowerCase().includes(search) ||
        student.branch.toLowerCase().includes(search) ||
        skills.includes(search);

      const matchesBranch =
        branch === "All" || student.branch === branch;

      return matchesSearch && matchesBranch;
    });

    document.getElementById("collegeStudentsTable").innerHTML =
      filtered.length
        ? `
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Branch / Year</th>
                  <th>Skills</th>
                  <th>Avg. skill score</th>
                  <th>Profile</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                ${filtered
                  .map((student) => {
                    const score = calculateOverallSkillScore(student);

                    return `
                      <tr>
                        <td>
                          <div class="person-cell">
                            <div class="avatar">
                              ${getInitials(student.name)}
                            </div>

                            <div>
                              <strong>${escapeHtml(student.name)}</strong>
                              <small>${escapeHtml(student.email)}</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          ${escapeHtml(student.branch)}
                          <br />
                          <small class="muted">${escapeHtml(student.year)}</small>
                        </td>

                        <td>
                          <div class="tag-list">
                            ${student.skills
                              .slice(0, 3)
                              .map(
                                (skill) =>
                                  `<span class="skill-tag">${escapeHtml(
                                    skill.name
                                  )}</span>`
                              )
                              .join("")}
                          </div>
                        </td>

                        <td>
                          <strong>${score}%</strong>
                        </td>

                        <td>
                          <div style="min-width: 100px;">
                            <div class="progress-header">
                              <span>${student.profileCompletion}%</span>
                            </div>

                            <div class="progress-track">
                              <div
                                class="progress-value"
                                style="width: ${student.profileCompletion}%"
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <button
                            class="btn btn-outline btn-sm"
                            data-college-view-student="${student.id}"
                          >
                            Open profile
                          </button>
                        </td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
        `
        : createEmptyState("🎓", "No students match your search");
  };

  document
    .getElementById("studentSearch")
    .addEventListener("input", renderStudents);

  document
    .getElementById("studentBranchFilter")
    .addEventListener("change", renderStudents);

  document.addEventListener("click", handleCollegeStudentView);
  renderStudents();
}

function handleCollegeStudentView(event) {
  const button = event.target.closest("[data-college-view-student]");

  if (!button) {
    return;
  }

  const database = getDatabase();
  const student = database.students.find(
    (item) => item.id === button.dataset.collegeViewStudent
  );

  if (student) {
    openStudentProfileModal(student, database);
  }
}

function renderCollegeTrainingPrograms(college, database) {
  const programs = database.trainingPrograms.filter(
    (program) => program.collegeId === college.id
  );

  setPageContent(`
    <div class="dashboard-content">
      <div class="toolbar">
        <div>
          <h3 style="margin: 0;">Training programs</h3>
          <p class="muted small">
            Organize focused training based on student skill gaps.
          </p>
        </div>

        <button class="btn btn-primary" id="addTrainingButton">
          + Organize training
        </button>
      </div>

      <section class="card-panel">
        ${
          programs.length
            ? `
              <div class="content-grid">
                ${programs
                  .map((program) => createTrainingCard(program))
                  .join("")}
              </div>
            `
            : createEmptyState("📚", "No training programs created yet")
        }
      </section>
    </div>
  `);

  document
    .getElementById("addTrainingButton")
    .addEventListener("click", () => openTrainingModal(college));
}

function createTrainingCard(program) {
  return `
    <div class="skill-card">
      <div class="skill-card-head">
        <h4>${escapeHtml(program.title)}</h4>
        ${createStatusBadge(program.status)}
      </div>

      <p>
        <strong>Skill/domain:</strong> ${escapeHtml(program.skill)}
      </p>

      <p>
        <strong>Trainer:</strong> ${escapeHtml(program.trainer)}
      </p>

      <p>
        <strong>Dates:</strong>
        ${formatDate(program.startDate)} –
        ${formatDate(program.endDate)}
      </p>

      <p>
        <strong>Duration:</strong> ${escapeHtml(program.duration)}
      </p>

      <p>
        <strong>Eligible students:</strong> ${escapeHtml(program.eligible)}
      </p>

      <p>
        <strong>Seats:</strong> ${program.seats}
      </p>
    </div>
  `;
}

function openTrainingModal(college) {
  openModal(`
    <div class="modal-header">
      <div>
        <h2>Organize training program</h2>
        <p class="muted small">
          Add a training opportunity for your students.
        </p>
      </div>
      <button class="modal-close" data-close-modal>×</button>
    </div>

    <form id="trainingForm">
      ${createFormField(
        "Training title",
        "trainingTitle",
        "",
        "text",
        true
      )}

      <div class="form-row">
        ${createFormField(
          "Skill/domain",
          "trainingSkill",
          "",
          "text",
          true
        )}

        ${createFormField(
          "Trainer/company",
          "trainingTrainer",
          "",
          "text",
          true
        )}
      </div>

      <div class="form-row">
        ${createFormField(
          "Start date",
          "trainingStart",
          today(),
          "date",
          true
        )}

        ${createFormField(
          "End date",
          "trainingEnd",
          today(),
          "date",
          true
        )}
      </div>

      <div class="form-row">
        ${createFormField(
          "Duration",
          "trainingDuration",
          "",
          "text",
          true
        )}

        ${createFormField(
          "Seats",
          "trainingSeats",
          "50",
          "number",
          true
        )}
      </div>

      ${createFormField(
        "Eligible students",
        "trainingEligible",
        "Final-year students",
        "text",
        true
      )}

      <div class="modal-footer">
        <button class="btn btn-outline" type="button" data-close-modal>
          Cancel
        </button>

        <button class="btn btn-primary" type="submit">
          Save training
        </button>
      </div>
    </form>
  `);

  document
    .getElementById("trainingForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const database = getDatabase();

      database.trainingPrograms.push({
        id: createId("training"),
        collegeId: college.id,
        title: document.getElementById("trainingTitle").value.trim(),
        skill: document.getElementById("trainingSkill").value.trim(),
        trainer: document.getElementById("trainingTrainer").value.trim(),
        startDate: document.getElementById("trainingStart").value,
        endDate: document.getElementById("trainingEnd").value,
        duration: document
          .getElementById("trainingDuration")
          .value.trim(),
        seats: Number(document.getElementById("trainingSeats").value),
        eligible: document
          .getElementById("trainingEligible")
          .value.trim(),
        status: "Open"
      });

      saveDatabase(database);
      closeModal();
      showToast("Training program created.", "success");
      renderCollegePage("Training Programs");
    });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
}

function renderCollegePlacements(college, database) {
  const placements = getCollegePlacements(database, college.id);
  const students = getCollegeStudents(database, college.id);

  const placedStudentIds = placements.map(
    (placement) => placement.studentId
  );

  const companies = [
    ...new Set(
      placements.map((placement) => {
        const industry = database.industries.find(
          (item) => item.id === placement.industryId
        );

        return industry?.name || "Unknown company";
      })
    )
  ];

  setPageContent(`
    <div class="dashboard-content">
      <div class="stat-grid">
        ${createStatCard(
          "Students placed",
          placements.length,
          "Successful placement records",
          "🎉",
          "icon-green"
        )}

        ${createStatCard(
          "Placement rate",
          students.length
            ? `${Math.round((placements.length / students.length) * 100)}%`
            : "0%",
          "Based on registered students",
          "📈",
          "icon-blue"
        )}

        ${createStatCard(
          "Hiring companies",
          companies.length,
          "Companies hiring your students",
          "🏢",
          "icon-purple"
        )}

        ${createStatCard(
          "Highest package",
          getHighestPackage(placements),
          "Recorded package",
          "💰",
          "icon-orange"
        )}
      </div>

      <section class="card-panel">
        <div class="panel-heading">
          <div>
            <h3>Placement records</h3>
            <p>Track company-wise placement information.</p>
          </div>

          <button class="btn btn-primary btn-sm" id="addPlacementButton">
            + Add placement
          </button>
        </div>

        ${
          placements.length
            ? `
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Company</th>
                      <th>Opportunity</th>
                      <th>Package</th>
                      <th>Placed date</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${placements
                      .map((placement) => {
                        const student = database.students.find(
                          (item) => item.id === placement.studentId
                        );

                        const industry = database.industries.find(
                          (item) => item.id === placement.industryId
                        );

                        const opportunity = database.opportunities.find(
                          (item) => item.id === placement.opportunityId
                        );

                        return `
                          <tr>
                            <td>${escapeHtml(student?.name || "Unknown")}</td>
                            <td>${escapeHtml(industry?.name || "Unknown")}</td>
                            <td>${escapeHtml(opportunity?.title || "Unknown")}</td>
                            <td><strong>${escapeHtml(placement.package)}</strong></td>
                            <td>${formatDate(placement.placedDate)}</td>
                            <td>${createStatusBadge(placement.status)}</td>
                          </tr>
                        `;
                      })
                      .join("")}
                  </tbody>
                </table>
              </div>
            `
            : createEmptyState("🎉", "No placement records added yet")
        }
      </section>
    </div>
  `);

  document
    .getElementById("addPlacementButton")
    .addEventListener("click", () => openPlacementModal(college, database));
}

function openPlacementModal(college, database) {
  const students = getCollegeStudents(database, college.id);
  const industries = database.industries;
  const opportunities = database.opportunities;

  openModal(`
    <div class="modal-header">
      <div>
        <h2>Add placement record</h2>
        <p class="muted small">
          Record a successful student placement.
        </p>
      </div>
      <button class="modal-close" data-close-modal>×</button>
    </div>

    <form id="placementForm">
      <div class="form-group">
        <label for="placementStudent">Student</label>
        <select id="placementStudent" class="form-control" required>
          <option value="">Select student</option>
          ${students
            .map(
              (student) =>
                `<option value="${student.id}">${escapeHtml(
                  student.name
                )}</option>`
            )
            .join("")}
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="placementIndustry">Company</label>
          <select id="placementIndustry" class="form-control" required>
            <option value="">Select company</option>
            ${industries
              .map(
                (industry) =>
                  `<option value="${industry.id}">${escapeHtml(
                    industry.name
                  )}</option>`
              )
              .join("")}
          </select>
        </div>

        <div class="form-group">
          <label for="placementOpportunity">Opportunity</label>
          <select id="placementOpportunity" class="form-control" required>
            <option value="">Select opportunity</option>
            ${opportunities
              .filter((opportunity) => opportunity.type === "Job")
              .map(
                (opportunity) =>
                  `<option value="${opportunity.id}">${escapeHtml(
                    opportunity.title
                  )}</option>`
              )
              .join("")}
          </select>
        </div>
      </div>

      <div class="form-row">
        ${createFormField(
          "Package / LPA",
          "placementPackage",
          "",
          "text",
          true
        )}

        ${createFormField(
          "Placed date",
          "placementDate",
          today(),
          "date",
          true
        )}
      </div>

      <div class="modal-footer">
        <button class="btn btn-outline" type="button" data-close-modal>
          Cancel
        </button>

        <button class="btn btn-primary" type="submit">
          Save placement
        </button>
      </div>
    </form>
  `);

  document
    .getElementById("placementForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const updatedDatabase = getDatabase();

      updatedDatabase.placementRecords.push({
        id: createId("placement"),
        studentId: document.getElementById("placementStudent").value,
        collegeId: college.id,
        industryId: document.getElementById("placementIndustry").value,
        opportunityId: document.getElementById("placementOpportunity").value,
        package: document.getElementById("placementPackage").value.trim(),
        placedDate: document.getElementById("placementDate").value,
        status: "Placed"
      });

      saveDatabase(updatedDatabase);
      closeModal();
      showToast("Placement record added.", "success");
      renderCollegePage("Placements");
    });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
}

function renderCollegeCollaboration(college, database) {
  const collaborations = getCollegeCollaborations(
    database,
    college.id
  );

  setPageContent(`
    <div class="dashboard-content">
      <div class="toolbar">
        <div>
          <h3 style="margin: 0;">Industry collaboration</h3>
          <p class="muted small">
            Manage companies collaborating with your college.
          </p>
        </div>

        <button class="btn btn-primary" id="addCollaborationButton">
          + Add collaboration
        </button>
      </div>

      <section class="card-panel">
        ${
          collaborations.length
            ? `
              <div class="content-grid">
                ${collaborations
                  .map((collaboration) => {
                    const industry = database.industries.find(
                      (item) => item.id === collaboration.industryId
                    );

                    return `
                      <div class="skill-card">
                        <div class="skill-card-head">
                          <h4>${escapeHtml(industry?.name || "Unknown company")}</h4>
                          ${createStatusBadge(collaboration.status)}
                        </div>

                        <p>
                          <strong>Collaboration:</strong>
                          ${escapeHtml(collaboration.type)}
                        </p>

                        <p>
                          <strong>Since:</strong>
                          ${escapeHtml(collaboration.since)}
                        </p>

                        <p>
                          <strong>Contact:</strong>
                          ${escapeHtml(collaboration.contact)}
                        </p>
                      </div>
                    `;
                  })
                  .join("")}
              </div>
            `
            : createEmptyState("🤝", "No collaborations added yet")
        }
      </section>
    </div>
  `);

  document
    .getElementById("addCollaborationButton")
    .addEventListener("click", () => {
      openCollaborationModal(college, database);
    });
}

function openCollaborationModal(college, database) {
  openModal(`
    <div class="modal-header">
      <div>
        <h2>Add industry collaboration</h2>
        <p class="muted small">
          Create a relationship record for your college.
        </p>
      </div>
      <button class="modal-close" data-close-modal>×</button>
    </div>

    <form id="collaborationForm">
      <div class="form-group">
        <label for="collaborationIndustry">Company</label>
        <select id="collaborationIndustry" class="form-control" required>
          <option value="">Select company</option>
          ${database.industries
            .map(
              (industry) =>
                `<option value="${industry.id}">${escapeHtml(
                  industry.name
                )}</option>`
            )
            .join("")}
        </select>
      </div>

      ${createFormField(
        "Collaboration type",
        "collaborationType",
        "Placement Partnership",
        "text",
        true
      )}

      ${createFormField(
        "Start year",
        "collaborationSince",
        new Date().getFullYear(),
        "number",
        true
      )}

      ${createFormField(
        "Contact email",
        "collaborationContact",
        "",
        "email",
        true
      )}

      <div class="modal-footer">
        <button class="btn btn-outline" type="button" data-close-modal>
          Cancel
        </button>

        <button class="btn btn-primary" type="submit">
          Save collaboration
        </button>
      </div>
    </form>
  `);

  document
    .getElementById("collaborationForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const updatedDatabase = getDatabase();

      updatedDatabase.collaborations.push({
        id: createId("collaboration"),
        collegeId: college.id,
        industryId: document.getElementById("collaborationIndustry").value,
        type: document.getElementById("collaborationType").value.trim(),
        since: document.getElementById("collaborationSince").value,
        status: "Active",
        contact: document
          .getElementById("collaborationContact")
          .value.trim()
      });

      saveDatabase(updatedDatabase);
      closeModal();
      showToast("Collaboration added.", "success");
      renderCollegePage("Industry Collaboration");
    });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
}

function openStudentProfileModal(student, database) {
  const college = getCurrentCollege(database, student);

  openModal(`
    <div class="modal-header">
      <div>
        <h2>${escapeHtml(student.name)}</h2>
        <p class="muted small">
          ${escapeHtml(student.branch)} · ${escapeHtml(student.year)}
        </p>
      </div>
      <button class="modal-close" data-close-modal>×</button>
    </div>

    <div class="profile-header" style="padding: 0 0 20px;">
      <div class="profile-large-avatar">
        ${getInitials(student.name)}
      </div>

      <div>
        <p>
          <strong>Email:</strong>
          ${escapeHtml(student.email)}
        </p>

        <p>
          <strong>College:</strong>
          ${escapeHtml(college?.name || "Unknown")}
        </p>

        <p>
          <strong>CGPA:</strong>
          ${student.cgpa}
        </p>
      </div>
    </div>

    <h3>Skills</h3>

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

    <h3 style="margin-top: 22px;">Certificates</h3>

    ${
      student.certificates.length
        ? student.certificates
            .map(
              (certificate) => `
                <p>
                  <strong>${escapeHtml(certificate.name)}</strong>
                  · ${escapeHtml(certificate.organization)}
                </p>
              `
            )
            .join("")
        : `<p class="muted">No certificates available.</p>`
    }

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

function getHighestPackage(placements) {
  if (!placements.length) {
    return "—";
  }

  const values = placements
    .map((placement) =>
      Number.parseFloat(String(placement.package).replace(/[^\d.]/g, ""))
    )
    .filter((value) => !Number.isNaN(value));

  return values.length ? `${Math.max(...values)} LPA` : "—";
}