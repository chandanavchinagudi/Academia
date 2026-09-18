const DEFAULT_DATA = {
  students: [
    {
      id: "student-001",
      name: "Aarav Sharma",
      email: "aarav@example.com",
      password: "student123",
      collegeId: "college-001",
      branch: "Computer Science and Engineering",
      year: "Final Year",
      phone: "+91 98765 43210",
      location: "Bengaluru, Karnataka",
      cgpa: 8.6,
      bio: "Final-year computer science student interested in frontend development and data-driven products.",
      profileCompletion: 88,
      skills: [
        {
          id: "skill-001",
          name: "JavaScript",
          level: 82,
          category: "Technical",
          assessed: true,
          lastUpdated: "2026-08-12"
        },
        {
          id: "skill-002",
          name: "HTML/CSS",
          level: 90,
          category: "Technical",
          assessed: true,
          lastUpdated: "2026-07-22"
        },
        {
          id: "skill-003",
          name: "SQL",
          level: 68,
          category: "Technical",
          assessed: true,
          lastUpdated: "2026-07-28"
        },
        {
          id: "skill-004",
          name: "Communication",
          level: 76,
          category: "Soft Skill",
          assessed: false,
          lastUpdated: "2026-06-18"
        }
      ],
      certificates: [
        {
          id: "certificate-001",
          name: "Frontend Development",
          organization: "Coursera",
          issueDate: "2026-02-10",
          credentialId: "COU-FE-9821",
          description: "Modern HTML, CSS, JavaScript, and responsive interface development."
        },
        {
          id: "certificate-002",
          name: "SQL for Data Analysis",
          organization: "NPTEL",
          issueDate: "2026-04-18",
          credentialId: "NPTEL-SQL-2218",
          description: "SQL querying, joins, aggregation, and analytical reporting."
        }
      ],
      applications: [
        {
          id: "application-001",
          opportunityId: "job-001",
          appliedDate: "2026-08-12",
          status: "Shortlisted",
          note: "Technical interview scheduled."
        },
        {
          id: "application-002",
          opportunityId: "internship-001",
          appliedDate: "2026-08-20",
          status: "Under Review",
          note: "Application is being reviewed by the hiring team."
        }
      ],
      notifications: [
        {
          id: "notification-001",
          title: "Application shortlisted",
          message: "Your application for Frontend Developer at TechNova Solutions has been shortlisted.",
          date: "2026-08-14",
          type: "success",
          unread: true
        },
        {
          id: "notification-002",
          title: "New training recommendation",
          message: "A SQL and analytics training program matches your current skill gap.",
          date: "2026-08-10",
          type: "info",
          unread: true
        },
        {
          id: "notification-003",
          title: "Interview reminder",
          message: "Your technical interview is scheduled for the Frontend Developer opportunity.",
          date: "2026-08-09",
          type: "warning",
          unread: false
        }
      ],
      skillHistory: [
        {
          month: "Mar",
          score: 48
        },
        {
          month: "Apr",
          score: 56
        },
        {
          month: "May",
          score: 63
        },
        {
          month: "Jun",
          score: 68
        },
        {
          month: "Jul",
          score: 74
        },
        {
          month: "Aug",
          score: 79
        }
      ]
    },
    {
      id: "student-002",
      name: "Meera Nair",
      email: "meera@example.com",
      password: "student123",
      collegeId: "college-001",
      branch: "Information Science",
      year: "Third Year",
      phone: "+91 98200 11122",
      location: "Mysuru, Karnataka",
      cgpa: 8.9,
      bio: "Information science student focused on data analytics and backend engineering.",
      profileCompletion: 94,
      skills: [
        {
          id: "skill-005",
          name: "Python",
          level: 88,
          category: "Technical",
          assessed: true,
          lastUpdated: "2026-08-05"
        },
        {
          id: "skill-006",
          name: "SQL",
          level: 84,
          category: "Technical",
          assessed: true,
          lastUpdated: "2026-07-24"
        },
        {
          id: "skill-007",
          name: "Data Analytics",
          level: 80,
          category: "Technical",
          assessed: true,
          lastUpdated: "2026-07-14"
        }
      ],
      certificates: [],
      applications: [
        {
          id: "application-003",
          opportunityId: "job-002",
          appliedDate: "2026-08-15",
          status: "Applied",
          note: "Application submitted successfully."
        }
      ],
      notifications: [],
      skillHistory: [
        {
          month: "Mar",
          score: 54
        },
        {
          month: "Apr",
          score: 61
        },
        {
          month: "May",
          score: 67
        },
        {
          month: "Jun",
          score: 72
        },
        {
          month: "Jul",
          score: 78
        },
        {
          month: "Aug",
          score: 84
        }
      ]
    },
    {
      id: "student-003",
      name: "Rohan Verma",
      email: "rohan@example.com",
      password: "student123",
      collegeId: "college-001",
      branch: "Electronics and Communication",
      year: "Final Year",
      phone: "+91 98990 88991",
      location: "Hubballi, Karnataka",
      cgpa: 7.8,
      bio: "Electronics student exploring embedded systems and IoT engineering.",
      profileCompletion: 72,
      skills: [
        {
          id: "skill-008",
          name: "Embedded C",
          level: 77,
          category: "Technical",
          assessed: true,
          lastUpdated: "2026-07-08"
        },
        {
          id: "skill-009",
          name: "IoT",
          level: 70,
          category: "Technical",
          assessed: true,
          lastUpdated: "2026-06-30"
        },
        {
          id: "skill-010",
          name: "Communication",
          level: 64,
          category: "Soft Skill",
          assessed: false,
          lastUpdated: "2026-05-25"
        }
      ],
      certificates: [],
      applications: [],
      notifications: [],
      skillHistory: [
        {
          month: "Mar",
          score: 40
        },
        {
          month: "Apr",
          score: 48
        },
        {
          month: "May",
          score: 55
        },
        {
          month: "Jun",
          score: 61
        },
        {
          month: "Jul",
          score: 65
        },
        {
          month: "Aug",
          score: 70
        }
      ]
    }
  ],

  colleges: [
    {
      id: "college-001",
      name: "ABC Institute of Technology",
      shortName: "ABCIT",
      email: "admin@abc.edu",
      password: "college123",
      location: "Bengaluru, Karnataka",
      type: "Engineering College",
      established: 2004,
      contactPerson: "Dr. Priya Menon"
    },
    {
      id: "college-002",
      name: "National College of Engineering",
      shortName: "NCE",
      email: "admin@nce.edu",
      password: "college456",
      location: "Pune, Maharashtra",
      type: "Engineering College",
      established: 1998,
      contactPerson: "Dr. Sandeep Rao"
    }
  ],

  industries: [
    {
      id: "industry-001",
      name: "TechNova Solutions",
      email: "admin@technova.com",
      password: "industry123",
      logoText: "TN",
      profileDone: true,
      industryType: "Information Technology",
      website: "https://technova.example.com",
      location: "Bengaluru, Karnataka",
      description: "A technology company building cloud products and digital platforms for growing businesses.",
      employeeRange: "501-1000",
      activeJobs: 2,
      activeInternships: 1
    },
    {
      id: "industry-002",
      name: "GreenGrid Energy",
      email: "admin@greengrid.com",
      password: "industry456",
      logoText: "GG",
      profileDone: true,
      industryType: "Renewable Energy",
      website: "https://greengrid.example.com",
      location: "Hyderabad, Telangana",
      description: "Renewable energy company working on intelligent energy infrastructure.",
      employeeRange: "201-500",
      activeJobs: 1,
      activeInternships: 1
    }
  ],

  opportunities: [
    {
      id: "job-001",
      industryId: "industry-001",
      type: "Job",
      title: "Frontend Developer",
      domain: "Product Engineering",
      location: "Bengaluru, Karnataka",
      mode: "Hybrid",
      employmentType: "Full-time",
      salary: "8-12 LPA",
      stipend: "",
      minCgpa: 7.5,
      branches: ["Computer Science", "Information Science"],
      experience: "0-2 years",
      skills: ["JavaScript", "HTML/CSS", "Git", "Responsive Design"],
      skillImportance: {
        JavaScript: "High",
        "HTML/CSS": "High",
        Git: "Medium",
        "Responsive Design": "Medium"
      },
      description: "Build accessible, fast, and responsive interfaces for SaaS products.",
      eligibility: "Final-year students and recent graduates.",
      deadline: "2026-12-31",
      postedDate: "2026-08-01",
      status: "Active"
    },
    {
      id: "job-002",
      industryId: "industry-001",
      type: "Job",
      title: "Data Analyst",
      domain: "Business Intelligence",
      location: "Remote",
      mode: "Remote",
      employmentType: "Full-time",
      salary: "7-10 LPA",
      stipend: "",
      minCgpa: 7.0,
      branches: ["Computer Science", "Information Science", "Statistics"],
      experience: "0-1 year",
      skills: ["SQL", "Python", "Data Analytics", "Excel"],
      skillImportance: {
        SQL: "High",
        Python: "High",
        "Data Analytics": "High",
        Excel: "Medium"
      },
      description: "Convert operational data into insights used by product and business teams.",
      eligibility: "Students with strong analytical and quantitative skills.",
      deadline: "2026-11-30",
      postedDate: "2026-08-05",
      status: "Active"
    },
    {
      id: "internship-001",
      industryId: "industry-001",
      type: "Internship",
      title: "Software Engineering Intern",
      domain: "Engineering",
      location: "Bengaluru, Karnataka",
      mode: "On-site",
      employmentType: "Internship",
      salary: "",
      stipend: "₹25,000/month",
      duration: "6 months",
      minCgpa: 7.0,
      branches: ["Computer Science", "Information Science"],
      experience: "No experience required",
      skills: ["JavaScript", "SQL", "Problem Solving"],
      skillImportance: {
        JavaScript: "High",
        SQL: "Medium",
        "Problem Solving": "High"
      },
      description: "Work with engineering mentors on production software projects.",
      eligibility: "Pre-final and final-year students.",
      deadline: "2026-10-31",
      postedDate: "2026-08-10",
      status: "Active"
    },
    {
      id: "job-003",
      industryId: "industry-002",
      type: "Job",
      title: "IoT Engineer",
      domain: "Smart Energy",
      location: "Hyderabad, Telangana",
      mode: "On-site",
      employmentType: "Full-time",
      salary: "6-9 LPA",
      stipend: "",
      minCgpa: 7.0,
      branches: ["Electronics and Communication", "Electrical Engineering"],
      experience: "0-2 years",
      skills: ["Embedded C", "IoT", "Microcontrollers", "Communication"],
      skillImportance: {
        "Embedded C": "High",
        IoT: "High",
        Microcontrollers: "Medium",
        Communication: "Medium"
      },
      description: "Develop connected devices for renewable-energy monitoring systems.",
      eligibility: "Electronics and electrical engineering students.",
      deadline: "2026-12-15",
      postedDate: "2026-08-07",
      status: "Active"
    }
  ],

  trainingPrograms: [
    {
      id: "training-001",
      collegeId: "college-001",
      title: "Advanced JavaScript Bootcamp",
      skill: "JavaScript",
      trainer: "CodeCraft Academy",
      startDate: "2026-09-08",
      endDate: "2026-09-22",
      duration: "30 hours",
      eligible: "CSE and Information Science students",
      seats: 60,
      status: "Open"
    },
    {
      id: "training-002",
      collegeId: "college-001",
      title: "Interview Communication Lab",
      skill: "Communication",
      trainer: "CareerEdge Trainers",
      startDate: "2026-09-15",
      endDate: "2026-09-30",
      duration: "20 hours",
      eligible: "All final-year students",
      seats: 80,
      status: "Open"
    }
  ],

  collaborations: [
    {
      id: "collab-001",
      collegeId: "college-001",
      industryId: "industry-001",
      type: "Placement Partnership",
      since: "2024",
      status: "Active",
      contact: "campus@technova.example.com"
    },
    {
      id: "collab-002",
      collegeId: "college-001",
      industryId: "industry-002",
      type: "Training Partnership",
      since: "2025",
      status: "Active",
      contact: "talent@greengrid.example.com"
    },
    {
      id: "collab-003",
      collegeId: "college-002",
      industryId: "industry-001",
      type: "Internship Partnership",
      since: "2025",
      status: "Active",
      contact: "campus@technova.example.com"
    }
  ],

  placementRecords: [
    {
      id: "placement-001",
      studentId: "student-002",
      collegeId: "college-001",
      industryId: "industry-001",
      opportunityId: "job-002",
      package: "9 LPA",
      placedDate: "2026-08-18",
      status: "Placed"
    }
  ]
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function initializeDatabase() {
  const existing = localStorage.getItem("skillbridge_database");

  if (!existing) {
    localStorage.setItem(
      "skillbridge_database",
      JSON.stringify(deepClone(DEFAULT_DATA))
    );
  }
}

function getDatabase() {
  initializeDatabase();

  try {
    return JSON.parse(localStorage.getItem("skillbridge_database"));
  } catch (error) {
    localStorage.setItem(
      "skillbridge_database",
      JSON.stringify(deepClone(DEFAULT_DATA))
    );

    return deepClone(DEFAULT_DATA);
  }
}

function saveDatabase(database) {
  localStorage.setItem("skillbridge_database", JSON.stringify(database));
}

function resetDatabase() {
  localStorage.setItem(
    "skillbridge_database",
    JSON.stringify(deepClone(DEFAULT_DATA))
  );

  window.location.reload();
}

initializeDatabase();