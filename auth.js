const AUTH_STORAGE_KEY = "skillbridge_session";

const ROLE_CONFIG = {
  student: {
    label: "Student",
    identityLabel: "Student name or email",
    identityPlaceholder: "Example: Aarav Sharma",
    passwordPlaceholder: "Enter your college-provided password",
    icon: "🎓"
  },
  college: {
    label: "College Admin",
    identityLabel: "College name or email",
    identityPlaceholder: "Example: ABC Institute of Technology",
    passwordPlaceholder: "Enter college admin password",
    icon: "🏫"
  },
  industry: {
    label: "Industry Admin",
    identityLabel: "Company name or email",
    identityPlaceholder: "Example: TechNova Solutions",
    passwordPlaceholder: "Enter company admin password",
    icon: "🏢"
  }
};

let selectedLoginRole = "student";

function getSession() {
  const session = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!session) {
    return null;
  }

  try {
    return JSON.parse(session);
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function getRoleRecords(database, role) {
  if (role === "student") {
    return database.students;
  }

  if (role === "college") {
    return database.colleges;
  }

  return database.industries;
}

function findUser(role, identity, password) {
  const database = getDatabase();
  const records = getRoleRecords(database, role);
  const normalizedIdentity = identity.trim().toLowerCase();

  return records.find((record) => {
    const matchesIdentity =
      record.name.toLowerCase() === normalizedIdentity ||
      record.email.toLowerCase() === normalizedIdentity;

    return matchesIdentity && record.password === password;
  });
}

function renderLoginPage() {
  const config = ROLE_CONFIG[selectedLoginRole];

  document.getElementById("app").innerHTML = `
    <div class="auth-page">
      <section class="auth-brand-panel">
        <div class="brand">
          <span class="brand-mark">S</span>
          <span>SkillBridge</span>
        </div>

        <h1>Turn skills into meaningful opportunities.</h1>

        <p>
          A single digital ecosystem for students, colleges, and industries
          to collaborate on training, internships, and placements.
        </p>

        <ul class="auth-features">
          <li>Measure student skill development.</li>
          <li>Discover personalized career opportunities.</li>
          <li>Build stronger college-industry partnerships.</li>
        </ul>
      </section>

      <section class="auth-form-panel">
        <div class="auth-card">
          <div class="brand">
            <span class="brand-mark">S</span>
            <span>SkillBridge</span>
          </div>

          <h2>Welcome back</h2>
          <p class="subtitle muted">
            Sign in to access your personalized portal.
          </p>

          <div class="role-tabs">
            ${Object.entries(ROLE_CONFIG)
              .map(
                ([role, roleConfig]) => `
                  <button
                    class="role-tab ${
                      selectedLoginRole === role ? "active" : ""
                    }"
                    data-login-role="${role}"
                    type="button"
                  >
                    ${roleConfig.icon} ${roleConfig.label}
                  </button>
                `
              )
              .join("")}
          </div>

          <form id="loginForm">
            <div class="form-group">
              <label for="loginIdentity">${config.identityLabel}</label>
              <input
                id="loginIdentity"
                class="form-control"
                type="text"
                placeholder="${config.identityPlaceholder}"
                required
              />
            </div>

            <div class="form-group">
              <label for="loginPassword">Password</label>
              <input
                id="loginPassword"
                class="form-control"
                type="password"
                placeholder="${config.passwordPlaceholder}"
                required
              />
            </div>

            <button class="btn btn-primary w-full" type="submit">
              Sign in as ${config.label}
            </button>
          </form>

          <div class="demo-box">
            <strong>Demo credentials</strong><br />
            Student: Aarav Sharma / student123<br />
            College: ABC Institute of Technology / college123<br />
            Industry: TechNova Solutions / industry123
          </div>

          <button
            class="btn btn-outline w-full"
            type="button"
            style="margin-top: 12px;"
            id="backToLanding"
          >
            Back to landing page
          </button>
        </div>
      </section>
    </div>
  `;

  document
    .querySelectorAll("[data-login-role]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        selectedLoginRole = button.dataset.loginRole;
        renderLoginPage();
      });
    });

  document
    .getElementById("loginForm")
    .addEventListener("submit", handleLogin);

  document
    .getElementById("backToLanding")
    .addEventListener("click", renderLandingPage);
}

function handleLogin(event) {
  event.preventDefault();

  const identity = document.getElementById("loginIdentity").value;
  const password = document.getElementById("loginPassword").value;

  const user = findUser(selectedLoginRole, identity, password);

  if (!user) {
    showToast(
      "Invalid login details. Please check the demo credentials.",
      "error"
    );

    return;
  }

  const session = {
    role: selectedLoginRole,
    userId: user.id,
    loggedInAt: new Date().toISOString()
  };

  saveSession(session);
  showToast("Login successful.", "success");

  setTimeout(() => {
    if (typeof renderApplication === "function") {
      renderApplication();
    }
  }, 300);
}

function logout() {
  clearSession();
  selectedLoginRole = "student";
  renderLandingPage();
  showToast("You have been logged out.", "success");
}