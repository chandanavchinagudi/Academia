const APP_NAME = "SkillBridge";

const STUDENT_NAVIGATION = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        icon: "▦"
      }
    ]
  },
  {
    label: "Career development",
    items: [
      {
        name: "My Profile",
        icon: "👤"
      },
      {
        name: "My Skills",
        icon: "🧠"
      },
      {
        name: "Certificates",
        icon: "📜"
      },
      {
        name: "Skill Gap Analysis",
        icon: "🎯"
      }
    ]
  },
  {
    label: "Opportunities",
    items: [
      {
        name: "Opportunities",
        icon: "💼"
      },
      {
        name: "Applications",
        icon: "📨"
      }
    ]
  },
  {
    label: "Account",
    items: [
      {
        name: "Analytics",
        icon: "📈"
      },
      {
        name: "Notifications",
        icon: "🔔"
      },
      {
        name: "Settings",
        icon: "⚙"
      }
    ]
  }
];

const COLLEGE_NAVIGATION = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        icon: "▦"
      }
    ]
  },
  {
    label: "College management",
    items: [
      {
        name: "Students",
        icon: "🎓"
      },
      {
        name: "Training Programs",
        icon: "📚"
      },
      {
        name: "Placements",
        icon: "🏆"
      },
      {
        name: "Industry Collaboration",
        icon: "🤝"
      }
    ]
  }
];

const INDUSTRY_NAVIGATION = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        icon: "▦"
      }
    ]
  },
  {
    label: "Recruitment",
    items: [
      {
        name: "Post Job",
        icon: "💼"
      },
      {
        name: "Post Internship",
        icon: "🧪"
      },
      {
        name: "Skill Requirements",
        icon: "🧠"
      },
      {
        name: "Candidates",
        icon: "👥"
      },
      {
        name: "Applications",
        icon: "📨"
      },
      {
        name: "Shortlisted",
        icon: "🎯"
      }
    ]
  },
  {
    label: "Partnerships",
    items: [
      {
        name: "College Collaboration",
        icon: "🏫"
      },
      {
        name: "Analytics",
        icon: "📈"
      }
    ]
  }
];

let activePage = "Dashboard";
let sidebarOpen = false;

function renderLandingPage() {
  const app = document.getElementById("app");

  if (!app) {
    return;
  }

  app.innerHTML = `
    <main class="landing-page">
      <nav class="landing-navbar">
        <div class="brand">
          <span class="brand-mark">S</span>
          <span>SkillBridge</span>
        </div>

        <button class="btn btn-light" id="landingLoginButton">
          Sign in
        </button>
      </nav>

      <section class="landing-content">
        <div>
          <span class="eyebrow">
            STUDENTS · COLLEGES · INDUSTRIES
          </span>

          <h1>
            Build skills.
            <span>Find opportunity.</span>
            Grow together.
          </h1>

          <p>
            SkillBridge is a unified platform for student skill development,
            training, internships, industry opportunities, and placements.
          </p>

          <div class="hero-actions">
            <button class="btn btn-light" id="heroStartButton">
              Open platform
            </button>

            <button class="btn btn-outline" id="heroDemoButton">
              Use demo credentials
            </button>
          </div>

          <div class="hero-stats">
            <div class="hero-stat">
              <strong>3</strong>
              <span>Integrated portals</span>
            </div>

            <div class="hero-stat">
              <strong>100%</strong>
              <span>Local prototype</span>
            </div>

            <div class="hero-stat">
              <strong>24/7</strong>
              <span>Career visibility</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="dashboard-preview">
            <div class="preview-topbar">
              <div class="preview-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <span class="small">
                SkillBridge dashboard
              </span>
            </div>

            <div class="preview-content">
              <div class="preview-sidebar">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>

              <div class="preview-main">
                <div class="preview-card-row">
                  <div class="preview-card">
                    <small>Skill score</small>
                    <strong>79%</strong>
                  </div>

                  <div class="preview-card">
                    <small>Applications</small>
                    <strong>12</strong>
                  </div>

                  <div class="preview-card">
                    <small>Shortlisted</small>
                    <strong>4</strong>
                  </div>
                </div>

                <div class="preview-chart">
                  <div class="fake-bars">
                    <span style="height: 40%;"></span>
                    <span style="height: 52%;"></span>
                    <span style="height: 45%;"></span>
                    <span style="height: 70%;"></span>
                    <span style="height: 62%;"></span>
                    <span style="height: 88%;"></span>
                    <span style="height: 76%;"></span>
                  </div>
                </div>

                <div class="preview-list">
                  <p></p>
                  <p style="width: 80%;"></p>
                  <p style="width: 62%;"></p>
                </div>
              </div>
            </div>
          </div>

          <div class="floating-card">
            <div class="floating-icon">✓</div>

            <div>
              <strong>Profile ready</strong>
              <small class="muted">
                Your next opportunity is closer.
              </small>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;

  document
    .getElementById("landingLoginButton")
    .addEventListener("click", renderLoginPage);

  document
    .getElementById("heroStartButton")
    .addEventListener("click", renderLoginPage);

  document
    .getElementById("heroDemoButton")
    .addEventListener("click", () => {
      selectedLoginRole = "student";
      renderLoginPage();

      setTimeout(() => {
        const identity = document.getElementById("loginIdentity");
        const password = document.getElementById("loginPassword");

        if (identity && password) {
          identity.value = "Aarav Sharma";
          password.value = "student123";
        }
      }, 50);
    });
}

function getNavigationForRole(role) {
  if (role === "student") {
    return STUDENT_NAVIGATION;
  }

  if (role === "college") {
    return COLLEGE_NAVIGATION;
  }

  return INDUSTRY_NAVIGATION;
}

function getCurrentUser(database, session) {
  if (!session) {
    return null;
  }

  if (session.role === "student") {
    return database.students.find(
      (student) => student.id === session.userId
    );
  }

  if (session.role === "college") {
    return database.colleges.find(
      (college) => college.id === session.userId
    );
  }

  if (session.role === "industry") {
    return database.industries.find(
      (industry) => industry.id === session.userId
    );
  }

  return null;
}

function getRoleLabel(role) {
  if (role === "student") {
    return "Student portal";
  }

  if (role === "college") {
    return "College admin portal";
  }

  return "Industry admin portal";
}

function renderApplication() {
  const session = getSession();

  if (!session) {
    renderLandingPage();
    return;
  }

  const database = getDatabase();
  const user = getCurrentUser(database, session);

  if (!user) {
    clearSession();
    renderLandingPage();
    return;
  }

  renderApplicationShell(session, user);
}

function renderApplicationShell(session, user) {
  const navigation = getNavigationForRole(session.role);

  const navigationMarkup = navigation
    .map(
      (section) => `
        <div class="sidebar-section-label">
          ${section.label}
        </div>

        <div class="sidebar-nav">
          ${section.items
            .map(
              (item) => `
                <button
                  class="nav-item ${
                    activePage === item.name ? "active" : ""
                  }"
                  data-page="${item.name}"
                  type="button"
                >
                  <span class="nav-icon">${item.icon}</span>
                  <span>${item.name}</span>
                </button>
              `
            )
            .join("")}
        </div>
      `
    )
    .join("");

  const unreadCount = getUnreadNotificationCount(session);

  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      <aside class="sidebar ${sidebarOpen ? "open" : ""}" id="sidebar">
        <div class="brand">
          <span class="brand-mark">S</span>
          <span>SkillBridge</span>
        </div>

        <nav>
          ${navigationMarkup}
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user">
            <div class="avatar">
              ${getInitials(user.name)}
            </div>

            <div>
              <strong>${escapeHtml(user.name)}</strong>
              <small>${getRoleLabel(session.role)}</small>
            </div>
          </div>
        </div>
      </aside>

      <main class="main-content">
        <header class="topbar">
          <div class="topbar-left">
            <button
              class="mobile-menu-btn"
              id="mobileMenuButton"
              type="button"
            >
              ☰
            </button>

            <div class="page-heading">
              <h1>${escapeHtml(activePage)}</h1>
              <p>${getPageDescription(session.role, activePage)}</p>
            </div>
          </div>

          <div class="topbar-actions">
            <button
              class="notification-btn"
              id="headerNotificationButton"
              type="button"
              title="Notifications"
            >
              🔔
              ${
                unreadCount > 0
                  ? `<span class="notification-dot"></span>`
                  : ""
              }
            </button>

            <div class="profile-menu">
              <div class="avatar">
                ${getInitials(user.name)}
              </div>

              <div>
                <strong>${escapeHtml(user.name)}</strong>
                <small>${getRoleLabel(session.role)}</small>
              </div>
            </div>
          </div>
        </header>

        <section id="pageContent"></section>
      </main>
    </div>
  `;

  bindApplicationNavigation();
  bindGlobalHeaderActions();

  if (session.role === "student") {
    renderStudentPage(activePage);
  } else if (session.role === "college") {
    renderCollegePage(activePage);
  } else if (session.role === "industry") {
    renderIndustryPage(activePage);
  }
}

function bindApplicationNavigation() {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      setActivePage(button.dataset.page);
    });
  });
}

function bindGlobalHeaderActions() {
  const mobileMenuButton =
    document.getElementById("mobileMenuButton");

  const sidebar = document.getElementById("sidebar");

  if (mobileMenuButton && sidebar) {
    mobileMenuButton.addEventListener("click", () => {
      sidebarOpen = !sidebarOpen;
      sidebar.classList.toggle("open", sidebarOpen);
    });
  }

  const notificationButton = document.getElementById(
    "headerNotificationButton"
  );

  if (notificationButton) {
    notificationButton.addEventListener("click", () => {
      const session = getSession();

      if (session?.role === "student") {
        setActivePage("Notifications");
      } else {
        showToast("No new system notifications.", "success");
      }
    });
  }
}

function setActivePage(page) {
  activePage = page;
  sidebarOpen = false;
  renderApplication();
}

function setPageContent(html) {
  const pageContent = document.getElementById("pageContent");

  if (!pageContent) {
    return;
  }

  pageContent.innerHTML = html;
}

function bindPageLinks() {
  document.querySelectorAll("[data-page-link]").forEach((element) => {
    element.addEventListener("click", () => {
      setActivePage(element.dataset.pageLink);
    });
  });
}

function getPageDescription(role, page) {
  if (role === "student" && typeof studentPageDescription === "function") {
    return studentPageDescription(page);
  }

  const descriptions = {
    college: {
      Dashboard: "Monitor student readiness and college placement activity.",
      Students: "View students belonging to your college.",
      "Training Programs":
        "Plan and manage skill development programs.",
      Placements: "Track student placement outcomes.",
      "Industry Collaboration":
        "Manage college-industry partnerships."
    },

    industry: {
      Dashboard: "Manage recruitment activity and talent engagement.",
      "Post Job": "Create and publish a new job opportunity.",
      "Post Internship":
        "Create and publish an internship opportunity.",
      "Skill Requirements":
        "Review skills required across your opportunities.",
      Candidates: "Search and review candidate profiles.",
      Applications: "Manage applications received from students.",
      Shortlisted: "Review candidates moved to your shortlist.",
      "College Collaboration":
        "Manage partnerships with colleges.",
      Analytics: "Review recruitment and hiring statistics."
    }
  };

  return descriptions[role]?.[page] || "";
}

function createStatCard(
  label,
  value,
  note,
  icon,
  iconClass
) {
  return `
    <div class="stat-card">
      <div>
        <span class="stat-label">${escapeHtml(label)}</span>
        <h3>${escapeHtml(String(value))}</h3>
        <small>${escapeHtml(note)}</small>
      </div>

      <div class="stat-icon ${iconClass}">
        ${icon}
      </div>
    </div>
  `;
}

function createAnalyticsMetric(label, value, percentage) {
  const safePercentage = Math.max(
    0,
    Math.min(100, Number(percentage) || 0)
  );

  return `
    <div>
      <div class="progress-header">
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(String(value))}</span>
      </div>

      <div class="progress-track">
        <div
          class="progress-value"
          style="width: ${safePercentage}%"
        ></div>
      </div>
    </div>
  `;
}

function createFormField(
  label,
  id,
  value = "",
  type = "text",
  required = false,
  min = "",
  max = "",
  step = ""
) {
  const attributes = [
    `id="${id}"`,
    `class="form-control"`,
    `type="${type}"`,
    required ? "required" : "",
    min ? `min="${min}"` : "",
    max ? `max="${max}"` : "",
    step ? `step="${step}"` : ""
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <div class="form-group">
      <label for="${id}">${escapeHtml(label)}</label>

      <input
        ${attributes}
        value="${escapeAttribute(value)}"
      />
    </div>
  `;
}

function createStatusBadge(status) {
  const normalizedStatus = String(status).toLowerCase();

  let className = "badge-neutral";

  if (
    normalizedStatus === "selected" ||
    normalizedStatus === "shortlisted" ||
    normalizedStatus === "placed" ||
    normalizedStatus === "active"
  ) {
    className = "badge-success";
  } else if (
    normalizedStatus === "under review" ||
    normalizedStatus === "interview" ||
    normalizedStatus === "open"
  ) {
    className = "badge-warning";
  } else if (
    normalizedStatus === "rejected" ||
    normalizedStatus === "closed"
  ) {
    className = "badge-danger";
  } else if (
    normalizedStatus === "applied" ||
    normalizedStatus === "internship"
  ) {
    className = "badge-info";
  }

  return `
    <span class="badge ${className}">
      ${escapeHtml(status)}
    </span>
  `;
}

function createNotificationActivity(notification) {
  return `
    <div class="activity-item">
      <div class="activity-icon">
        ${getNotificationIcon(notification.type)}
      </div>

      <div>
        <h4>${escapeHtml(notification.title)}</h4>
        <p>
          ${escapeHtml(notification.message)}
          <br />
          ${formatDate(notification.date)}
        </p>
      </div>
    </div>
  `;
}

function createNotificationCard(notification) {
  return `
    <div class="notification-card ${
      notification.unread ? "unread" : ""
    }">
      <div class="activity-icon">
        ${getNotificationIcon(notification.type)}
      </div>

      <div>
        <h4>${escapeHtml(notification.title)}</h4>
        <p>${escapeHtml(notification.message)}</p>
        <small class="muted">
          ${formatDate(notification.date)}
        </small>
      </div>
    </div>
  `;
}

function createNextStep(icon, title, description, page) {
  return `
    <div class="activity-item">
      <div class="activity-icon">${icon}</div>

      <div>
        <h4>${escapeHtml(title)}</h4>
        <p>
          ${escapeHtml(description)}
          <br />
          <span
            class="panel-link"
            data-page-link="${escapeAttribute(page)}"
          >
            Open section
          </span>
        </p>
      </div>
    </div>
  `;
}

function createEmptyState(icon, message) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function getNotificationIcon(type) {
  if (type === "success") {
    return "✅";
  }

  if (type === "warning") {
    return "⚠️";
  }

  if (type === "error") {
    return "❌";
  }

  return "ℹ️";
}

function getUnreadNotificationCount() {
  const session = getSession();

  if (!session || session.role !== "student") {
    return 0;
  }

  const database = getDatabase();
  const student = database.students.find(
    (item) => item.id === session.userId
  );

  if (!student) {
    return 0;
  }

  return student.notifications.filter(
    (notification) => notification.unread
  ).length;
}

function openModal(content) {
  const modalContainer =
    document.getElementById("modalContainer");

  if (!modalContainer) {
    return;
  }

  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        ${content}
      </div>
    </div>
  `;

  const overlay = modalContainer.querySelector(".modal-overlay");

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });
}

function closeModal() {
  const modalContainer =
    document.getElementById("modalContainer");

  if (modalContainer) {
    modalContainer.innerHTML = "";
  }
}

function bindCloseModalButtons() {
  document
    .querySelectorAll("[data-close-modal]")
    .forEach((button) => {
      button.addEventListener("click", closeModal);
    });
}

function showToast(message, type = "success") {
  const toastContainer =
    document.getElementById("toastContainer");

  if (!toastContainer) {
    return;
  }

  const toast = document.createElement("div");

  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

function getInitials(name) {
  if (!name) {
    return "SB";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function createId(prefix = "record") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

window.addEventListener("resize", () => {
  if (typeof renderCharts === "function") {
    renderCharts();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderApplication();
});