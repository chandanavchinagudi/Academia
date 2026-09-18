function getCurrentIndustryAdmin(database) {
  const session = getSession();

  return database.industries.find(
    (industry) => industry.id === session.userId
  );
}

function getIndustryOpportunities(database, industryId) {
  return database.opportunities.filter(
    (opportunity) => opportunity.industryId === industryId
  );
}

function getIndustryApplications(database, industryId) {
  const opportunities = getIndustryOpportunities(
    database,
    industryId
  );

  const opportunityIds = opportunities.map(
    (opportunity) => opportunity.id
  );

  return database.students.flatMap((student) =>
    student.applications
      .filter((application) =>
        opportunityIds.includes(application.opportunityId)
      )
      .map((application) => ({
        ...application,
        studentId: student.id,
        student
      }))
  );
}

function renderIndustryPage(page) {
  const database = getDatabase();
  const industry = getCurrentIndustryAdmin(database);

  if (!industry) {
    showToast("Industry account could not be found.", "error");
    logout();
    return;
  }

  if (!industry.profileDone && page !== "Dashboard") {
    showIndustrySetupModal(industry);
    return;
  }

  if (page === "Dashboard") {
    renderIndustryDashboard(industry, database);
  } else if (page === "Post Job") {
    renderIndustryPostOpportunity(industry, database, "Job");
  } else if (page === "Post Internship") {
    renderIndustryPostOpportunity(industry, database, "Internship");
  } else if (page === "Skill Requirements") {
    renderIndustrySkillRequirements(industry, database);
  } else if (page === "Candidates") {
    renderIndustryCandidates(industry, database);
  } else if (page === "Applications") {
    renderIndustryApplications(industry, database);
  } else if (page === "Shortlisted") {
    renderIndustryShortlisted(industry, database);
  } else if (page === "College Collaboration") {
    renderIndustryCollegeCollaboration(industry, database);
  } else if (page === "Analytics") {
    renderIndustryAnalytics(industry, database);
  }
}

function renderIndustryDashboard(industry, database) {
  if (!industry.profileDone) {
    setPageContent(`
      <section class="card-panel">
        <div class="empty-state">
          <div class="empty-state-icon">🏢</div>
          <h3>Complete your company profile</h3>
          <p>
            Add company information before managing jobs, internships,
            and candidates.
          </p>
          <button class="btn btn-primary" id="openIndustrySetup">
            Complete company setup
          </button>
        </div>
      </section>
    `);

    document
      .getElementById("openIndustrySetup")
      .addEventListener("click", () => {
        showIndustrySetupModal(industry);
      });

    return;
  }

  const opportunities = getIndustryOpportunities(
    database,
    industry.id
  );

  const applications = getIndustryApplications(
    database,
    industry.id
  );

  const shortlisted = applications.filter(
    (application) => application.status === "Shortlisted"
  );

  const activeJobs = opportunities.filter(
    (opportunity) =>
      opportunity.type === "Job" &&
      opportunity.status === "Active"
  );

  const activeInternships = opportunities.filter(
    (opportunity) =>
      opportunity.type === "Internship" &&
      opportunity.status === "Active"
  );

  const recentApplications = [...applications]
    .sort(
      (first, second) =>
        new Date(second.appliedDate) -
        new Date(first.appliedDate)
    )
    .slice(0, 6);

  setPageContent(`
    <div class="dashboard-content">
      <div class="stat-grid">
        ${createStatCard(
          "Active jobs",
          activeJobs.length,
          "Published job openings",
          "💼",
          "icon-blue"
        )}

        ${createStatCard(
          "Active internships",
          activeInternships.length,
          "Published internship openings",
          "🧪",
          "icon-purple"
        )}

        ${createStatCard(
          "Total applications",
          applications.length,
          "Applications received",
          "📨",
          "icon-orange"
        )}

        ${createStatCard(
          "Shortlisted candidates",
          shortlisted.length,
          "Candidates moved forward",
          "🎯",
          "icon-green"
        )}
      </div>

      <section class="card-panel">
        <div class="panel-heading">
          <div>
            <h3>Recent applications</h3>
            <p>
              Students who recently applied to your opportunities.
            </p>
          </div>

          <span
            class="panel-link"
            data-industry-page="Applications"
          >
            View applications
          </span>
        </div>

        ${
          recentApplications.length
            ? `
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Opportunity</th>
                      <th>Application date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${recentApplications
                      .map((application) => {
                        const opportunity =
                          database.opportunities.find(
                            (item) =>
                              item.id === application.opportunityId
                          );

                        return `
                          <tr>
                            <td>
                              <div class="person-cell">
                                <div class="avatar">
                                  ${getInitials(
                                    application.student.name
                                  )}
                                </div>

                                <div>
                                  <strong>
                                    ${escapeHtml(
                                      application.student.name
                                    )}
                                  </strong>

                                  <small>
                                    ${escapeHtml(
                                      application.student.branch
                                    )}
                                  </small>
                                </div>
                              </div>
                            </td>

                            <td>
                              ${escapeHtml(
                                opportunity?.title || "Unknown"
                              )}
                            </td>

                            <td>
                              ${formatDate(application.appliedDate)}
                            </td>

                            <td>
                              ${createStatusBadge(
                                application.status
                              )}
                            </td>

                            <td>
                              <button
                                class="btn btn-outline btn-sm"
                                data-industry-view-student="${
                                  application.student.id
                                }"
                              >
                                View profile
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
            : createEmptyState(
                "📨",
                "No applications received yet"
              )
        }
      </section>

      <div class="content-grid">
        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Opportunity overview</h3>
              <p>
                Current jobs and internships posted by your company.
              </p>
            </div>

            <span
              class="panel-link"
              data-industry-page="Post Job"
            >
              Post opportunity
            </span>
          </div>

          <div class="activity-list">
            ${
              opportunities.length
                ? opportunities
                    .slice(0, 5)
                    .map(
                      (opportunity) => `
                        <div class="activity-item">
                          <div class="activity-icon">
                            ${
                              opportunity.type === "Job"
                                ? "💼"
                                : "🧪"
                            }
                          </div>

                          <div>
                            <h4>
                              ${escapeHtml(opportunity.title)}
                            </h4>

                            <p>
                              ${escapeHtml(opportunity.location)}
                              ·
                              ${escapeHtml(opportunity.mode)}
                              ·
                              ${opportunity.skills.length}
                              required skills
                            </p>
                          </div>
                        </div>
                      `
                    )
                    .join("")
                : createEmptyState(
                    "💼",
                    "No opportunities posted yet"
                  )
            }
          </div>
        </section>

        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Recruitment snapshot</h3>
              <p>
                Conversion from applications to shortlisted candidates.
              </p>
            </div>
          </div>

          <div class="progress-list">
            ${createAnalyticsMetric(
              "Applications",
              applications.length,
              Math.min(applications.length * 15, 100)
            )}

            ${createAnalyticsMetric(
              "Shortlisted",
              shortlisted.length,
              applications.length
                ? Math.round(
                    (shortlisted.length / applications.length) *
                      100
                  )
                : 0
            )}

            ${createAnalyticsMetric(
              "Active opportunities",
              opportunities.filter(
                (opportunity) => opportunity.status === "Active"
              ).length,
              Math.min(opportunities.length * 25, 100)
            )}
          </div>
        </section>
      </div>
    </div>
  `);

  bindIndustryNavigationLinks();
  bindIndustryStudentProfileButtons();
}

function showIndustrySetupModal(industry) {
  openModal(`
    <div class="modal-header">
      <div>
        <h2>Complete company profile</h2>
        <p class="muted small">
          Finish setup before publishing opportunities.
        </p>
      </div>

      <button class="modal-close" data-close-modal>×</button>
    </div>

    <form id="industrySetupForm">
      <div class="form-row">
        ${createFormField(
          "Company name",
          "industryName",
          industry.name || "",
          "text",
          true
        )}

        ${createFormField(
          "Industry type",
          "industryType",
          industry.industryType || "",
          "text",
          true
        )}
      </div>

      <div class="form-row">
        ${createFormField(
          "Website",
          "industryWebsite",
          industry.website || "",
          "url"
        )}

        ${createFormField(
          "Location",
          "industryLocation",
          industry.location || "",
          "text",
          true
        )}
      </div>

      ${createFormField(
        "Employee range",
        "industryEmployees",
        industry.employeeRange || "51-200",
        "text"
      )}

      <div class="form-group">
        <label for="industryDescription">
          Company description
        </label>

        <textarea
          id="industryDescription"
          class="form-control"
          required
        >${escapeHtml(industry.description || "")}</textarea>
      </div>

      <div class="form-row">
        ${createFormField(
          "Active jobs",
          "industryJobs",
          industry.activeJobs || 0,
          "number",
          true,
          "0"
        )}

        ${createFormField(
          "Active internships",
          "industryInternships",
          industry.activeInternships || 0,
          "number",
          true,
          "0"
        )}
      </div>

      <div class="modal-footer">
        <button class="btn btn-primary" type="submit">
          Save company profile
        </button>
      </div>
    </form>
  `);

  document
    .getElementById("industrySetupForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const database = getDatabase();
      const updatedIndustry = database.industries.find(
        (item) => item.id === industry.id
      );

      updatedIndustry.name =
        document.getElementById("industryName").value.trim();

      updatedIndustry.industryType =
        document.getElementById("industryType").value.trim();

      updatedIndustry.website =
        document.getElementById("industryWebsite").value.trim();

      updatedIndustry.location =
        document.getElementById("industryLocation").value.trim();

      updatedIndustry.employeeRange =
        document.getElementById("industryEmployees").value.trim();

      updatedIndustry.description =
        document.getElementById("industryDescription").value.trim();

      updatedIndustry.activeJobs = Number(
        document.getElementById("industryJobs").value
      );

      updatedIndustry.activeInternships = Number(
        document.getElementById("industryInternships").value
      );

      updatedIndustry.profileDone = true;

      saveDatabase(database);
      closeModal();

      showToast(
        "Company profile completed successfully.",
        "success"
      );

      renderIndustryPage("Dashboard");
    });

  bindCloseModalButtons();
}

function renderIndustryPostOpportunity(
  industry,
  database,
  type
) {
  const isJob = type === "Job";

  setPageContent(`
    <div class="dashboard-content">
      <section class="card-panel">
        <div class="panel-heading">
          <div>
            <h3>Post a ${isJob ? "job" : "internship"}</h3>
            <p>
              Publish a clear opportunity with eligibility criteria.
            </p>
          </div>
        </div>

        <form id="opportunityForm">
          <div class="form-row">
            ${createFormField(
              `${isJob ? "Job" : "Internship"} title`,
              "opportunityTitle",
              "",
              "text",
              true
            )}

            ${createFormField(
              "Domain",
              "opportunityDomain",
              isJob
                ? "Product Engineering"
                : "Engineering",
              "text",
              true
            )}
          </div>

          <div class="form-row">
            ${createFormField(
              "Location",
              "opportunityLocation",
              "Bengaluru, Karnataka",
              "text",
              true
            )}

            <div class="form-group">
              <label for="opportunityMode">
                Work mode
              </label>

              <select
                id="opportunityMode"
                class="form-control"
                required
              >
                <option>Hybrid</option>
                <option>Remote</option>
                <option>On-site</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            ${
              isJob
                ? createFormField(
                    "Salary",
                    "opportunitySalary",
                    "",
                    "text",
                    true
                  )
                : createFormField(
                    "Stipend",
                    "opportunityStipend",
                    "",
                    "text"
                  )
            }

            ${
              isJob
                ? createFormField(
                    "Minimum CGPA",
                    "opportunityCgpa",
                    "7",
                    "number",
                    true,
                    "0",
                    "10",
                    "0.1"
                  )
                : createFormField(
                    "Duration",
                    "opportunityDuration",
                    "6 months",
                    "text",
                    true
                  )
            }
          </div>

          <div class="form-row">
            ${createFormField(
              "Eligible branches",
              "opportunityBranches",
              "Computer Science, Information Science",
              "text",
              true
            )}

            ${
              !isJob
                ? createFormField(
                    "Internship type",
                    "opportunityInternshipType",
                    "Technical Internship",
                    "text",
                    true
                  )
                : createFormField(
                    "Required experience",
                    "opportunityExperience",
                    "0-2 years",
                    "text",
                    true
                  )
            }
          </div>

          ${
            !isJob
              ? createFormField(
                  "Required experience",
                  "opportunityExperience",
                  "No experience required",
                  "text",
                  true
                )
              : ""
          }

          ${createFormField(
            "Required skills",
            "opportunitySkills",
            "JavaScript, HTML/CSS, Git",
            "text",
            true
          )}

          ${createFormField(
            "Application deadline",
            "opportunityDeadline",
            "2026-12-31",
            "date",
            true
          )}

          <div class="form-group">
            <label for="opportunityEligibility">
              Eligibility details
            </label>

            <textarea
              id="opportunityEligibility"
              class="form-control"
              required
            >Final-year students and recent graduates.</textarea>
          </div>

          <div class="form-group">
            <label for="opportunityDescription">
              ${isJob ? "Job" : "Internship"} description
            </label>

            <textarea
              id="opportunityDescription"
              class="form-control"
              required
              placeholder="Explain responsibilities, expectations, and benefits."
            ></textarea>
          </div>

          <button class="btn btn-primary" type="submit">
            Publish ${isJob ? "job" : "internship"}
          </button>
        </form>
      </section>
    </div>
  `);

  document
    .getElementById("opportunityForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const skills = document
        .getElementById("opportunitySkills")
        .value.split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const branches = document
        .getElementById("opportunityBranches")
        .value.split(",")
        .map((branch) => branch.trim())
        .filter(Boolean);

      const database = getDatabase();

      const opportunity = {
        id: createId(type.toLowerCase()),
        industryId: industry.id,
        type,
        title: document
          .getElementById("opportunityTitle")
          .value.trim(),
        domain: document
          .getElementById("opportunityDomain")
          .value.trim(),
        location: document
          .getElementById("opportunityLocation")
          .value.trim(),
        mode: document.getElementById("opportunityMode").value,
        employmentType: isJob ? "Full-time" : "Internship",
        salary: isJob
          ? document
              .getElementById("opportunitySalary")
              .value.trim()
          : "",
        stipend: !isJob
          ? document
              .getElementById("opportunityStipend")
              .value.trim()
          : "",
        duration: !isJob
          ? document
              .getElementById("opportunityDuration")
              .value.trim()
          : "",
        minCgpa: isJob
          ? Number(
              document.getElementById("opportunityCgpa").value
            )
          : 0,
        branches,
        experience: document
          .getElementById("opportunityExperience")
          .value.trim(),
        skills,
        skillImportance: Object.fromEntries(
          skills.map((skill, index) => [
            skill,
            index < 2 ? "High" : "Medium"
          ])
        ),
        description: document
          .getElementById("opportunityDescription")
          .value.trim(),
        eligibility: document
          .getElementById("opportunityEligibility")
          .value.trim(),
        deadline: document
          .getElementById("opportunityDeadline")
          .value,
        postedDate: today(),
        status: "Active"
      };

      database.opportunities.push(opportunity);

      const currentIndustry = database.industries.find(
        (item) => item.id === industry.id
      );

      if (type === "Job") {
        currentIndustry.activeJobs =
          database.opportunities.filter(
            (item) =>
              item.industryId === industry.id &&
              item.type === "Job" &&
              item.status === "Active"
          ).length;
      } else {
        currentIndustry.activeInternships =
          database.opportunities.filter(
            (item) =>
              item.industryId === industry.id &&
              item.type === "Internship" &&
              item.status === "Active"
          ).length;
      }

      saveDatabase(database);

      showToast(
        `${type} published successfully.`,
        "success"
      );

      setActivePage("Dashboard");
    });
}

function renderIndustrySkillRequirements(industry, database) {
  const opportunities = getIndustryOpportunities(
    database,
    industry.id
  );

  const skillMap = {};

  opportunities.forEach((opportunity) => {
    opportunity.skills.forEach((skill) => {
      if (!skillMap[skill]) {
        skillMap[skill] = {
          count: 0,
          importance: "Medium",
          opportunities: []
        };
      }

      skillMap[skill].count += 1;
      skillMap[skill].opportunities.push(opportunity.title);

      const importance =
        opportunity.skillImportance?.[skill] || "Medium";

      if (importance === "High") {
        skillMap[skill].importance = "High";
      }
    });
  });

  setPageContent(`
    <div class="dashboard-content">
      <div class="toolbar">
        <div>
          <h3 style="margin: 0;">Skill requirements</h3>
          <p class="muted small">
            Consolidated skill requirements across your opportunities.
          </p>
        </div>

        <button
          class="btn btn-primary"
          data-industry-page="Post Job"
        >
          Add through opportunity
        </button>
      </div>

      <section class="card-panel">
        ${
          Object.keys(skillMap).length
            ? `
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Skill</th>
                      <th>Importance</th>
                      <th>Opportunities</th>
                      <th>Demand</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${Object.entries(skillMap)
                      .map(
                        ([skill, details]) => `
                          <tr>
                            <td>
                              <strong>${escapeHtml(skill)}</strong>
                            </td>

                            <td>
                              <span class="badge ${
                                details.importance === "High"
                                  ? "badge-danger"
                                  : "badge-warning"
                              }">
                                ${details.importance}
                              </span>
                            </td>

                            <td>
                              ${details.opportunities
                                .map(
                                  (opportunity) =>
                                    `<span class="skill-tag">
                                      ${escapeHtml(opportunity)}
                                    </span>`
                                )
                                .join("")}
                            </td>

                            <td>
                              ${details.count} opening(s)
                            </td>
                          </tr>
                        `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            `
            : createEmptyState(
                "🧠",
                "No skill requirements available"
              )
        }
      </section>
    </div>
  `);

  bindIndustryNavigationLinks();
}

function renderIndustryCandidates(industry, database) {
  const applications = getIndustryApplications(
    database,
    industry.id
  );

  renderCandidateTable(
    "Candidates",
    applications,
    database
  );
}

function renderIndustryApplications(industry, database) {
  const applications = getIndustryApplications(
    database,
    industry.id
  );

  renderCandidateTable(
    "Applications received",
    applications,
    database
  );
}

function renderIndustryShortlisted(industry, database) {
  const applications = getIndustryApplications(
    database,
    industry.id
  ).filter(
    (application) => application.status === "Shortlisted"
  );

  renderCandidateTable(
    "Shortlisted candidates",
    applications,
    database
  );
}

function renderCandidateTable(title, applications, database) {
  setPageContent(`
    <div class="dashboard-content">
      <section class="card-panel">
        <div class="toolbar">
          <div>
            <h3 style="margin: 0;">${title}</h3>
            <p class="muted small">
              Search candidates and update application status.
            </p>
          </div>

          <div class="search-box">
            <span>⌕</span>

            <input
              id="candidateSearch"
              type="search"
              placeholder="Search candidate or opportunity..."
            />
          </div>
        </div>

        <div id="candidateTable"></div>
      </section>
    </div>
  `);

  const renderRows = () => {
    const search = document
      .getElementById("candidateSearch")
      .value.toLowerCase();

    const filtered = applications.filter((application) => {
      const opportunity = database.opportunities.find(
        (item) => item.id === application.opportunityId
      );

      const opportunityTitle =
        opportunity?.title?.toLowerCase() || "";

      return (
        application.student.name.toLowerCase().includes(search) ||
        application.student.branch.toLowerCase().includes(search) ||
        opportunityTitle.includes(search)
      );
    });

    document.getElementById("candidateTable").innerHTML =
      filtered.length
        ? `
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Opportunity</th>
                  <th>Application date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                ${filtered
                  .map((application) => {
                    const opportunity =
                      database.opportunities.find(
                        (item) =>
                          item.id === application.opportunityId
                      );

                    return `
                      <tr>
                        <td>
                          <div class="person-cell">
                            <div class="avatar">
                              ${getInitials(
                                application.student.name
                              )}
                            </div>

                            <div>
                              <strong>
                                ${escapeHtml(
                                  application.student.name
                                )}
                              </strong>

                              <small>
                                ${escapeHtml(
                                  application.student.branch
                                )}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          ${escapeHtml(
                            opportunity?.title || "Unknown"
                          )}
                        </td>

                        <td>
                          ${formatDate(application.appliedDate)}
                        </td>

                        <td>
                          ${createStatusBadge(application.status)}
                        </td>

                        <td>
                          <div class="table-actions">
                            <button
                              class="btn btn-outline btn-sm"
                              data-industry-view-student="${
                                application.student.id
                              }"
                            >
                              Profile
                            </button>

                            <button
                              class="btn btn-primary btn-sm"
                              data-update-application="${
                                application.id
                              }"
                            >
                              Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
        `
        : createEmptyState(
            "👥",
            "No candidates found"
          );

    bindIndustryStudentProfileButtons();

    document
      .querySelectorAll("[data-update-application]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const application = applications.find(
            (item) => item.id === button.dataset.updateApplication
          );

          if (application) {
            openApplicationStatusModal(application);
          }
        });
      });
  };

  document
    .getElementById("candidateSearch")
    .addEventListener("input", renderRows);

  renderRows();
}

function openApplicationStatusModal(application) {
  openModal(`
    <div class="modal-header">
      <div>
        <h2>Update application status</h2>
        <p class="muted small">
          Update the candidate's recruitment stage.
        </p>
      </div>

      <button class="modal-close" data-close-modal>×</button>
    </div>

    <form id="applicationStatusForm">
      <div class="form-group">
        <label for="applicationStatus">
          Candidate
        </label>

        <input
          class="form-control"
          value="${escapeHtml(application.student.name)}"
          disabled
        />
      </div>

      <div class="form-group">
        <label for="applicationStatus">
          Status
        </label>

        <select id="applicationStatus" class="form-control">
          ${[
            "Applied",
            "Under Review",
            "Shortlisted",
            "Interview",
            "Selected",
            "Rejected"
          ]
            .map(
              (status) => `
                <option
                  value="${status}"
                  ${
                    application.status === status
                      ? "selected"
                      : ""
                  }
                >
                  ${status}
                </option>
              `
            )
            .join("")}
        </select>
      </div>

      <div class="form-group">
        <label for="applicationNote">
          Internal note
        </label>

        <textarea
          id="applicationNote"
          class="form-control"
          placeholder="Add a note for this application"
        >${escapeHtml(application.note || "")}</textarea>
      </div>

      <div class="modal-footer">
        <button class="btn btn-outline" type="button" data-close-modal>
          Cancel
        </button>

        <button class="btn btn-primary" type="submit">
          Save status
        </button>
      </div>
    </form>
  `);

  document
    .getElementById("applicationStatusForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const database = getDatabase();
      let targetApplication = null;
      let targetStudent = null;

      database.students.some((student) => {
        const foundApplication = student.applications.find(
          (item) => item.id === application.id
        );

        if (foundApplication) {
          targetApplication = foundApplication;
          targetStudent = student;
          return true;
        }

        return false;
      });

      if (!targetApplication || !targetStudent) {
        showToast("Application could not be found.", "error");
        return;
      }

      const newStatus =
        document.getElementById("applicationStatus").value;

      targetApplication.status = newStatus;
      targetApplication.note =
        document.getElementById("applicationNote").value.trim();

      const opportunity = database.opportunities.find(
        (item) => item.id === targetApplication.opportunityId
      );

      targetStudent.notifications.unshift({
        id: createId("notification"),
        title: "Application status updated",
        message: `Your application for ${
          opportunity?.title || "an opportunity"
        } is now marked as ${newStatus}.`,
        date: today(),
        type:
          newStatus === "Shortlisted" ||
          newStatus === "Selected"
            ? "success"
            : "info",
        unread: true
      });

      saveDatabase(database);
      closeModal();

      showToast("Application status updated.", "success");

      const session = getSession();

      if (session && session.role === "industry") {
        renderIndustryPage("Applications");
      }
    });

  bindCloseModalButtons();
}

function openIndustryStudentProfileModal(student, database) {
  const college = database.colleges.find(
    (item) => item.id === student.collegeId
  );

  openModal(`
    <div class="modal-header">
      <div>
        <h2>${escapeHtml(student.name)}</h2>
        <p class="muted small">
          Complete candidate profile
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
          <strong>Branch:</strong>
          ${escapeHtml(student.branch)}
        </p>

        <p>
          <strong>Year:</strong>
          ${escapeHtml(student.year)}
        </p>

        <p>
          <strong>College:</strong>
          ${escapeHtml(college?.name || "Unknown college")}
        </p>

        <p>
          <strong>CGPA:</strong>
          ${student.cgpa}
        </p>

        <p>
          <strong>Email:</strong>
          ${escapeHtml(student.email)}
        </p>
      </div>
    </div>

    <h3>Professional bio</h3>
    <p class="muted">
      ${escapeHtml(student.bio || "No bio provided.")}
    </p>

    <h3>Skills and levels</h3>

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

    <h3 style="margin-top: 22px;">
      Certificates
    </h3>

    ${
      student.certificates.length
        ? student.certificates
            .map(
              (certificate) => `
                <div class="notification-card">
                  <div class="activity-icon">📜</div>

                  <div>
                    <h4>
                      ${escapeHtml(certificate.name)}
                    </h4>

                    <p>
                      ${escapeHtml(certificate.organization)}
                      ·
                      ${formatDate(certificate.issueDate)}
                    </p>
                  </div>
                </div>
              `
            )
            .join("")
        : `<p class="muted">No certificates added.</p>`
    }

    <div class="modal-footer">
      <button class="btn btn-outline" data-close-modal>
        Close
      </button>
    </div>
  `);

  bindCloseModalButtons();
}

function renderIndustryCollegeCollaboration(industry, database) {
  const collaborations = database.collaborations.filter(
    (collaboration) => collaboration.industryId === industry.id
  );

  setPageContent(`
    <div class="dashboard-content">
      <div class="toolbar">
        <div>
          <h3 style="margin: 0;">College collaboration</h3>
          <p class="muted small">
            Colleges connected with ${escapeHtml(industry.name)}.
          </p>
        </div>

        <button
          class="btn btn-primary"
          id="addIndustryCollaborationButton"
        >
          + Add college
        </button>
      </div>

      <section class="card-panel">
        ${
          collaborations.length
            ? `
              <div class="content-grid">
                ${collaborations
                  .map((collaboration) => {
                    const college = database.colleges.find(
                      (item) =>
                        item.id === collaboration.collegeId
                    );

                    return `
                      <div class="skill-card">
                        <div class="skill-card-head">
                          <h4>
                            ${escapeHtml(
                              college?.name || "Unknown college"
                            )}
                          </h4>

                          ${createStatusBadge(
                            collaboration.status
                          )}
                        </div>

                        <p>
                          <strong>Type:</strong>
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
            : createEmptyState(
                "🏫",
                "No college collaborations added"
              )
        }
      </section>
    </div>
  `);

  document
    .getElementById("addIndustryCollaborationButton")
    .addEventListener("click", () => {
      openIndustryCollaborationModal(industry, database);
    });
}

function openIndustryCollaborationModal(industry, database) {
  openModal(`
    <div class="modal-header">
      <div>
        <h2>Add college collaboration</h2>
        <p class="muted small">
          Record a relationship with a college.
        </p>
      </div>

      <button class="modal-close" data-close-modal>×</button>
    </div>

    <form id="industryCollaborationForm">
      <div class="form-group">
        <label for="industryCollaborationCollege">
          College
        </label>

        <select
          id="industryCollaborationCollege"
          class="form-control"
          required
        >
          <option value="">Select college</option>

          ${database.colleges
            .map(
              (college) =>
                `<option value="${college.id}">
                  ${escapeHtml(college.name)}
                </option>`
            )
            .join("")}
        </select>
      </div>

      ${createFormField(
        "Collaboration type",
        "industryCollaborationType",
        "Placement Partnership",
        "text",
        true
      )}

      ${createFormField(
        "Since",
        "industryCollaborationSince",
        new Date().getFullYear(),
        "number",
        true
      )}

      ${createFormField(
        "Contact email",
        "industryCollaborationContact",
        industry.email,
        "email",
        true
      )}

      <div class="modal-footer">
        <button
          class="btn btn-outline"
          type="button"
          data-close-modal
        >
          Cancel
        </button>

        <button class="btn btn-primary" type="submit">
          Save collaboration
        </button>
      </div>
    </form>
  `);

  document
    .getElementById("industryCollaborationForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const updatedDatabase = getDatabase();

      updatedDatabase.collaborations.push({
        id: createId("collaboration"),
        collegeId: document
          .getElementById("industryCollaborationCollege")
          .value,
        industryId: industry.id,
        type: document
          .getElementById("industryCollaborationType")
          .value.trim(),
        since: document
          .getElementById("industryCollaborationSince")
          .value,
        status: "Active",
        contact: document
          .getElementById("industryCollaborationContact")
          .value.trim()
      });

      saveDatabase(updatedDatabase);
      closeModal();

      showToast("College collaboration added.", "success");
      renderIndustryPage("College Collaboration");
    });

  bindCloseModalButtons();
}

function renderIndustryAnalytics(industry, database) {
  const opportunities = getIndustryOpportunities(
    database,
    industry.id
  );

  const applications = getIndustryApplications(
    database,
    industry.id
  );

  const shortlisted = applications.filter(
    (application) => application.status === "Shortlisted"
  );

  const selected = applications.filter(
    (application) => application.status === "Selected"
  );

  const collegeCounts = {};
  applications.forEach((application) => {
    const college = database.colleges.find(
      (item) => item.id === application.student.collegeId
    );

    const collegeName = college?.shortName || college?.name || "Unknown";

    collegeCounts[collegeName] =
      (collegeCounts[collegeName] || 0) + 1;
  });

  const locationCounts = {};
  applications.forEach((application) => {
    const location = application.student.location || "Unknown";

    locationCounts[location] =
      (locationCounts[location] || 0) + 1;
  });

  const skillCounts = {};
  opportunities.forEach((opportunity) => {
    opportunity.skills.forEach((skill) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });

  setPageContent(`
    <div class="dashboard-content">
      <div class="stat-grid">
        ${createStatCard(
          "Students hired",
          selected.length,
          "Applications marked selected",
          "🎉",
          "icon-green"
        )}

        ${createStatCard(
          "Applications",
          applications.length,
          "Total applications received",
          "📨",
          "icon-blue"
        )}

        ${createStatCard(
          "Shortlisted",
          shortlisted.length,
          "Candidates in shortlist",
          "🎯",
          "icon-purple"
        )}

        ${createStatCard(
          "Opportunities",
          opportunities.length,
          "Jobs and internships",
          "💼",
          "icon-orange"
        )}
      </div>

      <div class="content-grid">
        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Applications by college</h3>
              <p>Distribution of candidates across institutions.</p>
            </div>
          </div>

          <div class="chart-container">
            <canvas id="industryCollegeChart"></canvas>
          </div>
        </section>

        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Applications by location</h3>
              <p>Location distribution of applicants.</p>
            </div>
          </div>

          <div class="chart-container">
            <canvas id="industryLocationChart"></canvas>
          </div>
        </section>
      </div>

      <div class="content-grid">
        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Skill demand</h3>
              <p>Skills most frequently used in your postings.</p>
            </div>
          </div>

          <div class="chart-container">
            <canvas id="industrySkillChart"></canvas>
          </div>
        </section>

        <section class="card-panel">
          <div class="panel-heading">
            <div>
              <h3>Hiring funnel</h3>
              <p>Application and selection overview.</p>
            </div>
          </div>

          <div class="progress-list">
            ${createAnalyticsMetric(
              "Applications received",
              applications.length,
              applications.length ? 100 : 0
            )}

            ${createAnalyticsMetric(
              "Shortlisted candidates",
              shortlisted.length,
              applications.length
                ? Math.round(
                    (shortlisted.length / applications.length) *
                      100
                  )
                : 0
            )}

            ${createAnalyticsMetric(
              "Students hired",
              selected.length,
              applications.length
                ? Math.round(
                    (selected.length / applications.length) *
                      100
                  )
                : 0
            )}
          </div>
        </section>
      </div>
    </div>
  `);

  window.chartRenderers = [
    () =>
      createBarChart(
        "industryCollegeChart",
        Object.keys(collegeCounts),
        Object.values(collegeCounts),
        {
          color: "#3157d5"
        }
      ),
    () =>
      createBarChart(
        "industryLocationChart",
        Object.keys(locationCounts),
        Object.values(locationCounts),
        {
          color: "#6c63ff"
        }
      ),
    () =>
      createBarChart(
        "industrySkillChart",
        Object.keys(skillCounts),
        Object.values(skillCounts),
        {
          color: "#18a673"
        }
      )
  ];

  renderCharts();
}

function bindIndustryNavigationLinks() {
  document
    .querySelectorAll("[data-industry-page]")
    .forEach((element) => {
      element.addEventListener("click", () => {
        setActivePage(element.dataset.industryPage);
      });
    });
}

function bindIndustryStudentProfileButtons() {
  document
    .querySelectorAll("[data-industry-view-student]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const database = getDatabase();

        const student = database.students.find(
          (item) => item.id === button.dataset.industryViewStudent
        );

        if (student) {
          openIndustryStudentProfileModal(student, database);
        }
      });
    });
}