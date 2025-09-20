// EcoPlay - Enhanced Environmental Awareness Platform
// Features: Authentication, Daily Plant Watering, Certificate Generation

// Database keys for localStorage
const DB = {
  usersKey: "ecoplay_users",
  quizzesKey: "ecoplay_quizzes",
  submissionsKey: "ecoplay_submissions",
  eventsKey: "ecoplay_events",
  redemptionsKey: "ecoplay_redemptions",
  wateringKey: "ecoplay_watering_records",
}

// Utility functions
function nowISO() {
  return new Date().toISOString()
}
function uid(prefix = "id") {
  return prefix + "_" + Math.random().toString(36).slice(2, 9)
}
function load(key, defaultVal) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : defaultVal
  } catch (e) {
    return defaultVal
  }
}
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

// App State
const AppState = {
  currentUser: null,
  isAdmin: false,
  currentView: "home",
}

// Initialize data stores
function initializeData() {
  if (!load(DB.usersKey, null)) {
    save(DB.usersKey, [])
  }

  if (!load(DB.quizzesKey, null)) {
    save(DB.quizzesKey, [
      {
        id: uid("q"),
        title: "Plant Care Basics",
        description: "Quick 5-question quiz about watering & planting.",
        questions: [
          {
            q: "How often should most new saplings be watered?",
            options: ["Daily", "Once a week", "Once a month", "Never"],
            a: 0,
            points: 10,
          },
          {
            q: "Which season is often best to plant trees in many regions?",
            options: ["Summer", "Winter", "Monsoon/Autumn", "Spring"],
            a: 3,
            points: 10,
          },
          { q: "What is compost used for?", options: ["Fuel", "Fertilizer", "Shoelace", "Clothing"], a: 1, points: 10 },
          {
            q: "Mulching helps:",
            options: ["Retain moisture", "Remove soil", "Attract pests", "Kill roots"],
            a: 0,
            points: 5,
          },
          {
            q: "Which tool is safest for small tree planting?",
            options: ["Chainsaw", "Shovel", "Hammer", "Blowtorch"],
            a: 1,
            points: 5,
          },
        ],
        createdAt: nowISO(),
      },
    ])
  }

  if (!load(DB.submissionsKey, null)) {
    save(DB.submissionsKey, [])
  }

  if (!load(DB.eventsKey, null)) {
    save(DB.eventsKey, [])
  }

  if (!load(DB.redemptionsKey, null)) {
    save(DB.redemptionsKey, [])
  }

  if (!load(DB.wateringKey, null)) {
    save(DB.wateringKey, [])
  }
}

// User management functions
function getUsers() {
  return load(DB.usersKey, [])
}
function saveUsers(users) {
  save(DB.usersKey, users)
}

function showSignUpForm() {
  const app = document.getElementById("app")
  app.innerHTML = `
        <div class="container">
            <div class="main-content">
                <div class="text-center">
                    <h1>Create Your EcoPlay Account</h1>
                    <p class="muted">Join our environmental community and start making a difference!</p>
                </div>
                
                <div class="card" style="max-width: 500px; margin: 2rem auto;">
                    <form id="signupForm">
                        <div class="form-group">
                            <label for="fullName">Full Name *</label>
                            <input type="text" id="fullName" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="username">Username *</label>
                            <input type="text" id="username" class="form-control" required>
                            <small class="muted">Choose a unique username</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="email">Email Address *</label>
                            <input type="email" id="email" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="password">Password *</label>
                            <input type="password" id="password" class="form-control" required>
                            <small class="muted">Minimum 6 characters</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password *</label>
                            <input type="password" id="confirmPassword" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="school">School/Institution</label>
                            <input type="text" id="school" class="form-control">
                        </div>
                        
                        <div class="form-group">
                            <label for="grade">Grade/Year</label>
                            <input type="text" id="grade" class="form-control">
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;">
                            Create Account
                        </button>
                        
                        <div class="text-center">
                            <p>Already have an account? <a href="#" id="showSignIn">Sign In</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `

  document.getElementById("signupForm").addEventListener("submit", handleSignUp)
  document.getElementById("showSignIn").addEventListener("click", (e) => {
    e.preventDefault()
    showSignInForm()
  })
}

function showSignInForm() {
  const app = document.getElementById("app")
  app.innerHTML = `
        <div class="container">
            <div class="main-content">
                <div class="text-center">
                    <h1>Welcome Back to EcoPlay</h1>
                    <p class="muted">Sign in to continue your environmental journey</p>
                </div>
                
                <div class="card" style="max-width: 400px; margin: 2rem auto;">
                    <form id="signinForm">
                        <div class="form-group">
                            <label for="loginUsername">Username or Email</label>
                            <input type="text" id="loginUsername" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <input type="password" id="loginPassword" class="form-control" required>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;">
                            Sign In
                        </button>
                        
                        <div class="text-center">
                            <p>Don't have an account? <a href="#" id="showSignUp">Sign Up</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `

  document.getElementById("signinForm").addEventListener("submit", handleSignIn)
  document.getElementById("showSignUp").addEventListener("click", (e) => {
    e.preventDefault()
    showSignUpForm()
  })
}

function handleSignUp(e) {
  e.preventDefault()

  const fullName = document.getElementById("fullName").value.trim()
  const username = document.getElementById("username").value.trim()
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const school = document.getElementById("school").value.trim()
  const grade = document.getElementById("grade").value.trim()

  // Validation
  if (!fullName || !username || !email || !password) {
    alert("Please fill in all required fields")
    return
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters long")
    return
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match")
    return
  }

  const users = getUsers()

  // Check if username or email already exists
  if (users.find((u) => u.username.toLowerCase() === username.toLowerCase())) {
    alert("Username already exists. Please choose a different one.")
    return
  }

  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    alert("Email already registered. Please use a different email or sign in.")
    return
  }

  // Create new user
  const newUser = {
    id: uid("u"),
    fullName,
    username,
    email,
    password, // In real app, this should be hashed
    school,
    grade,
    createdAt: nowISO(),
    points: 0,
    badges: [],
    submissions: [],
    quizzesTaken: [],
    joinedEvents: [],
    wateringStreak: 0,
    lastWateringDate: null,
  }

  users.push(newUser)
  saveUsers(users)

  // Auto sign in
  AppState.currentUser = newUser
  AppState.isAdmin = false

  alert("Account created successfully! Welcome to EcoPlay!")
  renderApp()
}

function handleSignIn(e) {
  e.preventDefault()

  const loginInput = document.getElementById("loginUsername").value.trim()
  const password = document.getElementById("loginPassword").value

  if (!loginInput || !password) {
    alert("Please enter both username/email and password")
    return
  }

  const users = getUsers()
  const user = users.find(
    (u) =>
      (u.username.toLowerCase() === loginInput.toLowerCase() || u.email.toLowerCase() === loginInput.toLowerCase()) &&
      u.password === password,
  )

  if (!user) {
    alert("Invalid username/email or password")
    return
  }

  AppState.currentUser = user
  AppState.isAdmin = false

  alert(`Welcome back, ${user.fullName}!`)
  renderApp()
}

function signOut() {
  AppState.currentUser = null
  AppState.isAdmin = false
  AppState.currentView = "home"
  renderApp()
}

function renderApp() {
  const app = document.getElementById("app")

  if (!AppState.currentUser) {
    // Show landing page for non-authenticated users
    app.innerHTML = `
            <div class="container">
                <header class="header">
                    <div class="header-content">
                        <a href="#" class="logo"> EcoPlay</a>
                        <nav class="nav">
                            <a href="#" class="nav-link active">Home</a>
                            <a href="#" onclick="showAboutPublic()">About</a>
                            <a href="#" onclick="showContactPublic()">Contact</a>
                        </nav>
                        <div class="auth-buttons">
                            <button class="btn btn-secondary" onclick="showSignInForm()">Sign In</button>
                            <button class="btn btn-primary" onclick="showSignUpForm()">Sign Up</button>
                        </div>
                    </div>
                </header>
                
                <div class="main-content text-center">
                    <h1 style="font-size: 3rem; margin-bottom: 1rem; color: #2b7a2b;">
                        Welcome to EcoPlay
                    </h1>
                    <p style="font-size: 1.2rem; margin-bottom: 2rem; color: #666;">
                        Join our gamified environmental awareness platform and make a difference!
                    </p>
                    
                    <div class="grid">
                        <div class="card">
                            <h3> Earn Points</h3>
                            <p>Complete quizzes, submit environmental activities, and participate in community events to earn points and badges.</p>
                        </div>
                        
                        <div class="card">
                            <h3> Daily Watering</h3>
                            <p>Track your plant care journey with daily watering submissions. Build streaks and show your commitment!</p>
                        </div>
                        
                        <div class="card">
                            <h3> Certificates</h3>
                            <p>Download personalized certificates showcasing your environmental contributions and achievements.</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 3rem;">
                        <button class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;" onclick="showSignUpForm()">
                            Get Started Today
                        </button>
                    </div>
                </div>
            </div>
        `
    return
  }

  // Render authenticated user interface
  renderAuthenticatedApp()
}

function showAboutPublic() {
  const app = document.getElementById("app")
  app.innerHTML = `
        <div class="container">
            <header class="header">
                <div class="header-content">
                    <a href="#" class="logo" onclick="renderApp()"> EcoPlay</a>
                    <nav class="nav">
                        <a href="#" onclick="renderApp()">Home</a>
                        <a href="#" class="nav-link active" onclick="showAboutPublic()">About</a>
                        <a href="#" onclick="showContactPublic()">Contact</a>
                    </nav>
                    <div class="auth-buttons">
                        <button class="btn btn-secondary" onclick="showSignInForm()">Sign In</button>
                        <button class="btn btn-primary" onclick="showSignUpForm()">Sign Up</button>
                    </div>
                </div>
            </header>
            
            <div class="main-content">
                ${getAboutContent()}
            </div>
        </div>
    `
}

function showContactPublic() {
  const app = document.getElementById("app")
  app.innerHTML = `
        <div class="container">
            <header class="header">
                <div class="header-content">
                    <a href="#" class="logo" onclick="renderApp()"> EcoPlay</a>
                    <nav class="nav">
                        <a href="#" onclick="renderApp()">Home</a>
                        <a href="#" onclick="showAboutPublic()">About</a>
                        <a href="#" class="nav-link active" onclick="showContactPublic()">Contact</a>
                    </nav>
                    <div class="auth-buttons">
                        <button class="btn btn-secondary" onclick="showSignInForm()">Sign In</button>
                        <button class="btn btn-primary" onclick="showSignUpForm()">Sign Up</button>
                    </div>
                </div>
            </header>
            
            <div class="main-content">
                <div class="text-center mb-2">
                    <h1>Contact Us</h1>
                    <p class="muted">Get in touch with the EcoPlay team</p>
                </div>
                
                <div class="grid">
                    <div class="card">
                        <h3> General Inquiries</h3>
                        <p>For general questions about EcoPlay, partnerships, or feedback:</p>
                        <p><strong>ecoplay.team@example.com</strong></p>
                    </div>
                    
                    <div class="card">
                        <h3> Educational Institutions</h3>
                        <p>Interested in implementing EcoPlay at your school or college?</p>
                        <p><strong>education@ecoplay.example.com</strong></p>
                    </div>
                    
                    <div class="card">
                        <h3>🔧 Technical Support</h3>
                        <p>Need help with the platform or experiencing technical issues?</p>
                        <p><strong>support@ecoplay.example.com</strong></p>
                    </div>
                </div>
                
                <div class="card">
                    <h3> Send us a Message</h3>
                    <form id="contactForm">
                        <div class="form-group">
                            <label for="contactName">Your Name</label>
                            <input type="text" id="contactName" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="contactEmail">Your Email</label>
                            <input type="email" id="contactEmail" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="contactSubject">Subject</label>
                            <input type="text" id="contactSubject" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="contactMessage">Message</label>
                            <textarea id="contactMessage" class="form-control" rows="5" required></textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">Send Message</button>
                    </form>
                </div>
                
                <div class="text-center">
                    <p>Ready to join EcoPlay?</p>
                    <button class="btn btn-primary" onclick="showSignUpForm()" style="margin-right: 1rem;">
                        Sign Up Now
                    </button>
                    <button class="btn btn-secondary" onclick="showSignInForm()">
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    `

  document.getElementById("contactForm").addEventListener("submit", (e) => {
    e.preventDefault()
    alert("Thank you for your message! We will get back to you soon.")
    renderApp()
  })
}

function getAboutContent() {
  return `
        <div class="text-center mb-2">
            <h1>About EcoPlay</h1>
            <p class="muted">Gamified Environmental Awareness Platform</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>Our Mission</h3>
                <p>EcoPlay is designed to engage students and environmental enthusiasts in meaningful environmental activities through gamification. We believe that making environmental action fun and rewarding leads to lasting behavioral change.</p>
            </div>
            
            <div class="card">
                <h3>  Key Features</h3>
                <ul style="text-align: left; padding-left: 1rem;">
                    <li>Daily plant watering challenges with photo verification</li>
                    <li>Interactive environmental quizzes and learning modules</li>
                    <li>Points and badge system to track progress</li>
                    <li>Downloadable certificates for achievements</li>
                    <li>Community events and group challenges</li>
                    <li>Reward redemption system</li>
                </ul>
            </div>
            
            <div class="card">
                <h3> Perfect for Educational Institutions</h3>
                <p>EcoPlay is specifically designed for schools, colleges, and educational institutions looking to promote environmental awareness among students. Our platform encourages real-world environmental action while providing measurable engagement metrics.</p>
            </div>
        </div>
        
        <div class="card">
            <h3> Development Team</h3>
            <p style="margin-bottom: 1.5rem;">EcoPlay was developed by a dedicated team of students passionate about environmental conservation and technology:</p>
            
            <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
                <div class="card" style="text-align: center; background: #f6fff4;">
                    <div class="avatar" style="margin: 0 auto 1rem auto; background: #2b7a2b;">S</div>
                    <h4>Shreya Pavaskar</h4>
                    <p class="muted">Leader</p>
                </div>
                
                <div class="card" style="text-align: center; background: #f6fff4;">
                    <div class="avatar" style="margin: 0 auto 1rem auto; background: #2b7a2b;">B</div>
                    <h4>Bhagyashri Bhagwat</h4>
                    <p class="muted">Member</p>
                </div>
                
                <div class="card" style="text-align: center; background: #f6fff4;">
                    <div class="avatar" style="margin: 0 auto 1rem auto; background: #2b7a2b;">A</div>
                    <h4>Anvit Naik</h4>
                    <p class="muted">Member</p>
                </div>
                
                <div class="card" style="text-align: center; background: #f6fff4;">
                    <div class="avatar" style="margin: 0 auto 1rem auto; background: #2b7a2b;">K</div>
                    <h4>Kempanna Kadabi</h4>
                    <p class="muted">Member</p>
                </div>
                
                <div class="card" style="text-align: center; background: #f6fff4;">
                    <div class="avatar" style="margin: 0 auto 1rem auto; background: #2b7a2b;">N</div>
                    <h4>Nivrutti Patil</h4>
                    <p class="muted">Member</p>
                </div>
                
                <div class="card" style="text-align: center; background: #f6fff4;">
                    <div class="avatar" style="margin: 0 auto 1rem auto; background: #2b7a2b;">K</div>
                    <h4>Kedar Nimbalkar</h4>
                    <p class="muted">Member</p>
                </div>
            </div>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3> Technical Implementation</h3>
                <p>EcoPlay is built using modern web technologies with a focus on simplicity and accessibility. The platform uses local storage for data persistence in this demo version, making it easy to deploy and test without requiring backend infrastructure.</p>
            </div>
            
            <div class="card">
                <h3> Environmental Impact</h3>
                <p>By encouraging daily plant care, environmental education, and community engagement, EcoPlay aims to create lasting positive environmental habits. Every photo submitted and quiz completed represents a step toward greater environmental awareness.</p>
            </div>
            
            <div class="card">
                <h3> Contact & Support</h3>
                <p>For questions, suggestions, or partnership opportunities, please reach out to our development team. We're always looking for ways to improve and expand EcoPlay's impact.</p>
                <p class="muted">Email: ecoplay.team@example.com</p>
            </div>
        </div>
        
        <div class="card text-center">
            <h3> Join the Movement</h3>
            <p>Ready to start your environmental journey? Create an account and begin making a difference today!</p>
            ${
              !AppState.currentUser
                ? `
                <div style="margin-top: 1.5rem;">
                    <button class="btn btn-primary" onclick="showSignUpForm()" style="margin-right: 1rem;">
                        Sign Up Now
                    </button>
                    <button class="btn btn-secondary" onclick="showSignInForm()">
                        Sign In
                    </button>
                </div>
            `
                : `
                <div style="margin-top: 1.5rem;">
                    <button class="btn btn-primary" onclick="navigateTo('watering')">
                        Start Daily Watering Challenge
                    </button>
                </div>
            `
            }
        </div>
    `
}

function renderAboutView(content) {
  content.innerHTML = getAboutContent()
}

function renderAuthenticatedApp() {
  const app = document.getElementById("app")
  const user = AppState.currentUser

  app.innerHTML = `
        <div class="container">
            <header class="header">
                <div class="header-content">
                    <a href="#" class="logo" onclick="navigateTo('home')">🌱 EcoPlay</a>
                    <nav class="nav">
                        <a href="#" class="nav-link ${AppState.currentView === "home" ? "active" : ""}" onclick="navigateTo('home')">Dashboard</a>
                        <a href="#" class="nav-link ${AppState.currentView === "watering" ? "active" : ""}" onclick="navigateTo('watering')">Daily Watering</a>
                        <a href="#" class="nav-link ${AppState.currentView === "games" ? "active" : ""}" onclick="navigateTo('games')">Games</a>
                        <a href="#" class="nav-link ${AppState.currentView === "profile" ? "active" : ""}" onclick="navigateTo('profile')">Profile</a>
                        <a href="#" class="nav-link ${AppState.currentView === "redeem" ? "active" : ""}" onclick="navigateTo('redeem')">Redeem</a>
                        <a href="#" class="nav-link ${AppState.currentView === "about" ? "active" : ""}" onclick="navigateTo('about')">About</a>
                        ${AppState.isAdmin ? `<a href="#" class="nav-link ${AppState.currentView === "admin" ? "active" : ""}" onclick="navigateTo('admin')">Admin</a>` : ""}
                    </nav>
                    <div class="auth-buttons">
                        <span style="margin-right: 1rem; color: #2b7a2b; font-weight: bold;">
                            ${user.fullName} (${user.points} pts)
                        </span>
                        <button class="btn btn-secondary" onclick="signOut()">Sign Out</button>
                    </div>
                </div>
            </header>
            
            <div class="main-content" id="mainContent">
                <!-- Content will be loaded here -->
            </div>
        </div>
    `

  // Load the current view
  loadView(AppState.currentView)
}

function navigateTo(view) {
  AppState.currentView = view
  renderAuthenticatedApp()
}

function loadView(view) {
  const content = document.getElementById("mainContent")

  switch (view) {
    case "home":
      renderDashboard(content)
      break
    case "watering":
      renderWateringView(content)
      break
    case "games":
      renderGamesView(content)
      break
    case "profile":
      renderProfileView(content)
      break
    case "redeem":
      renderRedeemView(content)
      break
    case "about":
      renderAboutView(content)
      break
    case "admin":
      renderAdminView(content)
      break
    default:
      renderDashboard(content)
  }
}

function renderDashboard(content) {
  const user = AppState.currentUser
  const wateringRecords = getWateringRecords().filter((r) => r.userId === user.id)
  const streak = calculateStreak(wateringRecords)
  const today = new Date().toDateString()
  const todayRecord = wateringRecords.find((r) => new Date(r.date).toDateString() === today)

  content.innerHTML = `
      <div class="dashboard-header">
          <div class="user-info">
              <div class="avatar">${user.fullName[0]}</div>
              <div class="user-details">
                  <h2>Welcome back, ${user.fullName}!</h2>
                  <p class="muted">@${user.username} • Member since ${new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
          </div>
          <div class="points-badge">
              ${user.points} Points
          </div>
      </div>
      
      <div class="grid">
          <div class="card">
              <h3> Daily Watering Streak</h3>
              <div style="text-align: center; margin: 1rem 0;">
                  <div style="font-size: 2rem; font-weight: bold; color: #2b7a2b;">
                      ${streak} Days
                  </div>
                  <p class="muted">Current streak</p>
              </div>
              ${
                todayRecord
                  ? '<p style="color: #2b7a2b; font-weight: bold;"> Today\'s watering complete!</p>'
                  : '<p style="color: #f57c00; font-weight: bold;"> Don\'t forget to water today!</p>'
              }
              <button class="btn btn-primary" onclick="navigateTo('watering')" style="width: 100%; margin-top: 1rem;">
                  ${todayRecord ? "View Watering History" : "Submit Today's Watering"}
              </button>
          </div>
          
          <div class="card">
              <h3> Quick Stats</h3>
              <div style="display: flex; justify-content: space-between; margin: 1rem 0;">
                  <div style="text-align: center;">
                      <div style="font-size: 1.5rem; font-weight: bold; color: #2b7a2b;">${user.points}</div>
                      <p class="muted">Total Points</p>
                  </div>
                  <div style="text-align: center;">
                      <div style="font-size: 1.5rem; font-weight: bold; color: #2b7a2b;">${wateringRecords.length}</div>
                      <p class="muted">Plants Watered</p>
                  </div>
                  <div style="text-align: center;">
                      <div style="font-size: 1.5rem; font-weight: bold; color: #2b7a2b;">${user.badges ? user.badges.length : 0}</div>
                      <p class="muted">Badges Earned</p>
                  </div>
              </div>
          </div>
          
          <div class="card">
              <h3> Quick Actions</h3>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  <button class="btn btn-primary" onclick="navigateTo('games')" style="width: 100%;">
                      Take Quiz
                  </button>
                  <button class="btn btn-secondary" onclick="navigateTo('profile')" style="width: 100%;">
                      View Profile
                  </button>
                  <button class="btn btn-secondary" onclick="navigateTo('redeem')" style="width: 100%;">
                      Redeem Points
                  </button>
              </div>
          </div>
      </div>
      
      <div class="card">
          <h3> Recent Activity</h3>
          ${renderRecentActivity()}
      </div>
  `
}

function renderRecentActivity() {
  const user = AppState.currentUser
  const wateringRecords = getWateringRecords()
    .filter((r) => r.userId === user.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  if (wateringRecords.length === 0) {
    return '<p class="muted">No recent activity. Start by submitting your first watering photo!</p>'
  }

  return wateringRecords
    .map(
      (record) => `
      <div class="submission-item">
          <div>
              <strong> Plant Watering</strong>
              <span class="submission-date">${new Date(record.date).toLocaleDateString()}</span>
          </div>
          <div class="muted">${record.note} • +${record.points} points</div>
      </div>
  `,
    )
    .join("")
}

function renderWateringView(content) {
  const user = AppState.currentUser
  const today = new Date().toDateString()
  const wateringRecords = getWateringRecords().filter((r) => r.userId === user.id)
  const todayRecord = wateringRecords.find((r) => new Date(r.date).toDateString() === today)

  // Calculate streak
  let streak = 0
  const sortedRecords = wateringRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
  let currentDate = new Date()

  for (const record of sortedRecords) {
    const recordDate = new Date(record.date)
    const daysDiff = Math.floor((currentDate - recordDate) / (1000 * 60 * 60 * 24))

    if (daysDiff === streak) {
      streak++
      currentDate = recordDate
    } else {
      break
    }
  }

  content.innerHTML = `
        <div class="watering-section">
            <div class="watering-header">
                <h2> Daily Plant Watering Challenge</h2>
                <div class="streak-counter">
                     ${streak} Day Streak
                </div>
            </div>
            
            <p>Upload a photo of you watering plants daily to maintain your streak and earn points!</p>
            
            ${
              todayRecord
                ? `
                <div class="card" style="background: #e8f5e8; border: 2px solid #2b7a2b;">
                    <h3> Today's Watering Complete!</h3>
                    <p>Great job! You've already submitted your watering photo for today.</p>
                    <img src="${todayRecord.imageData}" alt="Today's watering" class="image-preview">
                    <p class="muted">Submitted at: ${new Date(todayRecord.date).toLocaleString()}</p>
                    <p class="muted">Note: ${todayRecord.note}</p>
                </div>
            `
                : `
                <div class="card">
                    <h3> Submit Today's Watering Photo</h3>
                    
                    <div class="upload-area" id="uploadArea" onclick="document.getElementById('wateringPhoto').click()">
                        <div id="uploadContent">
                            <p>Click here or drag & drop your watering photo</p>
                            <p class="muted">Show yourself watering plants to maintain authenticity</p>
                        </div>
                        <img id="imagePreview" class="image-preview hidden" alt="Preview">
                    </div>
                    
                    <input type="file" id="wateringPhoto" accept="image/*" style="display: none;">
                    
                    <div class="form-group">
                        <label for="wateringNote">Add a note about your watering activity:</label>
                        <input type="text" id="wateringNote" class="form-control" 
                               placeholder="e.g., Watered my tomato plants in the garden">
                    </div>
                    
                    <button id="submitWatering" class="btn btn-primary" style="width: 100%;" disabled>
                        Submit Today's Watering
                    </button>
                </div>
            `
            }
        </div>
        
        <div class="card">
            <h3> Your Watering History</h3>
            <div class="watering-history">
                ${renderWateringHistory(wateringRecords)}
            </div>
        </div>
        
        <div class="card">
            <h3> Watering Achievements</h3>
            <div class="grid">
                <div class="card ${streak >= 3 ? "card-unlocked" : "card-locked"}">
                    <h4> Seedling Caretaker</h4>
                    <p>Water plants for 3 consecutive days</p>
                    <p class="muted">${streak >= 3 ? "Unlocked!" : `${Math.max(0, 3 - streak)} days to go`}</p>
                </div>
                <div class="card ${streak >= 7 ? "card-unlocked" : "card-locked"}">
                    <h4> Green Thumb</h4>
                    <p>Water plants for 7 consecutive days</p>
                    <p class="muted">${streak >= 7 ? "Unlocked!" : `${Math.max(0, 7 - streak)} days to go`}</p>
                </div>
                <div class="card ${streak >= 30 ? "card-unlocked" : "card-locked"}">
                    <h4> Plant Master</h4>
                    <p>Water plants for 30 consecutive days</p>
                    <p class="muted">${streak >= 30 ? "Unlocked!" : `${Math.max(0, 30 - streak)} days to go`}</p>
                </div>
            </div>
        </div>
    `

  if (!todayRecord) {
    setupWateringUpload()
  }
}

function setupWateringUpload() {
  const photoInput = document.getElementById("wateringPhoto")
  const uploadArea = document.getElementById("uploadArea")
  const imagePreview = document.getElementById("imagePreview")
  const uploadContent = document.getElementById("uploadContent")
  const submitBtn = document.getElementById("submitWatering")

  // Drag and drop functionality
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault()
    uploadArea.classList.add("dragover")
  })

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover")
  })

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault()
    uploadArea.classList.remove("dragover")

    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      photoInput.files = files
      handleImagePreview(files[0])
    }
  })

  photoInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleImagePreview(e.target.files[0])
    }
  })

  function handleImagePreview(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.src = e.target.result
      imagePreview.classList.remove("hidden")
      uploadContent.classList.add("hidden")
      submitBtn.disabled = false
    }
    reader.readAsDataURL(file)
  }

  submitBtn.addEventListener("click", submitWateringRecord)
}

function submitWateringRecord() {
  const photoInput = document.getElementById("wateringPhoto")
  const note = document.getElementById("wateringNote").value.trim()
  const user = AppState.currentUser

  if (!photoInput.files || photoInput.files.length === 0) {
    alert("Please select a photo first")
    return
  }

  const file = photoInput.files[0]
  const reader = new FileReader()

  reader.onload = (e) => {
    const wateringRecords = getWateringRecords()
    const today = new Date().toDateString()

    // Check if already submitted today
    if (wateringRecords.find((r) => r.userId === user.id && new Date(r.date).toDateString() === today)) {
      alert("You have already submitted your watering photo for today!")
      return
    }

    const newRecord = {
      id: uid("w"),
      userId: user.id,
      date: nowISO(),
      imageData: e.target.result,
      note: note || "Daily watering activity",
      verified: false,
      points: 15, // Points for daily watering
    }

    wateringRecords.push(newRecord)
    saveWateringRecords(wateringRecords)

    // Update user points and streak
    const users = getUsers()
    const userIndex = users.findIndex((u) => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex].points += newRecord.points
      users[userIndex].lastWateringDate = today

      // Update streak
      const userRecords = wateringRecords.filter((r) => r.userId === user.id)
      users[userIndex].wateringStreak = calculateStreak(userRecords)

      saveUsers(users)
      AppState.currentUser = users[userIndex]
    }

    alert(`Great job! You've earned ${newRecord.points} points for today's watering. Keep up the streak!`)
    navigateTo("watering") // Refresh the view
  }

  reader.readAsDataURL(file)
}

function calculateStreak(records) {
  if (records.length === 0) return 0

  const sortedRecords = records.sort((a, b) => new Date(b.date) - new Date(a.date))
  let streak = 0
  let currentDate = new Date()

  for (const record of sortedRecords) {
    const recordDate = new Date(record.date)
    const daysDiff = Math.floor((currentDate - recordDate) / (1000 * 60 * 60 * 24))

    if (daysDiff === streak) {
      streak++
      currentDate = recordDate
    } else {
      break
    }
  }

  return streak
}

function renderWateringHistory(records) {
  if (records.length === 0) {
    return '<p class="muted text-center">No watering records yet. Start your streak today!</p>'
  }

  const last30Days = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateString = date.toDateString()

    const record = records.find((r) => new Date(r.date).toDateString() === dateString)

    last30Days.push({
      date: dateString,
      day: date.getDate(),
      hasRecord: !!record,
      isToday: dateString === today.toDateString(),
    })
  }

  return last30Days
    .map(
      (day) => `
        <div class="day-indicator ${day.hasRecord ? "day-completed" : day.isToday ? "day-today" : "day-missed"}">
            ${day.day}
        </div>
    `,
    )
    .join("")
}

function renderGamesView(content) {
  const quizzes = getQuizzes()

  content.innerHTML = `
        <div class="text-center mb-2">
            <h1> Environmental Games & Quizzes</h1>
            <p class="muted">Test your environmental knowledge and earn points!</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3> Available Quizzes</h3>
                ${
                  quizzes.length === 0
                    ? '<p class="muted">No quizzes available yet. Check back later!</p>'
                    : quizzes
                        .map(
                          (quiz) => `
                        <div class="quiz-item" style="border: 1px solid #e1e5e9; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                            <h4>${quiz.title}</h4>
                            <p class="muted">${quiz.description}</p>
                            <p><strong>${quiz.questions.length} questions</strong> • Up to ${quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0)} points</p>
                            <button class="btn btn-primary" onclick="startQuiz('${quiz.id}')" style="margin-top: 0.5rem;">
                                Take Quiz
                            </button>
                        </div>
                    `,
                        )
                        .join("")
                }
            </div>
            
            <div class="card">
                <h3> Your Quiz History</h3>
                ${renderQuizHistory()}
            </div>
            
            <div class="card">
                <h3> Submit Environmental Activity</h3>
                <p>Upload photos of your environmental activities for bonus points!</p>
                
                <div class="form-group">
                    <label for="activityType">Activity Type</label>
                    <select id="activityType" class="form-control">
                        <option value="Planting">Tree/Plant Planting</option>
                        <option value="Cleanup">Environmental Cleanup</option>
                        <option value="Recycling">Recycling Activity</option>
                        <option value="Conservation">Water/Energy Conservation</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="activityNote">Description</label>
                    <input type="text" id="activityNote" class="form-control" 
                           placeholder="Describe your environmental activity">
                </div>
                
                <div class="form-group">
                    <label for="activityPhoto">Photo Evidence</label>
                    <input type="file" id="activityPhoto" class="form-control" accept="image/*">
                </div>
                
                <button id="submitActivity" class="btn btn-primary" style="width: 100%;">
                    Submit Activity
                </button>
            </div>
        </div>
        
        <div class="card">
            <h3> How to Earn Points</h3>
            <div class="grid">
                <div class="card" style="background: #f6fff4;">
                    <h4> Quizzes</h4>
                    <p>Complete environmental knowledge quizzes to earn 5-10 points per correct answer.</p>
                </div>
                <div class="card" style="background: #f6fff4;">
                    <h4> Daily Watering</h4>
                    <p>Submit daily plant watering photos to earn 15 points and maintain your streak.</p>
                </div>
                <div class="card" style="background: #f6fff4;">
                    <h4> Activities</h4>
                    <p>Upload photos of environmental activities for 10-20 points (subject to verification).</p>
                </div>
            </div>
        </div>
    `

  // Set up activity submission
  document.getElementById("submitActivity").addEventListener("click", handleActivitySubmission)
}

function renderQuizHistory() {
  const user = AppState.currentUser
  if (!user || !user.quizzesTaken || user.quizzesTaken.length === 0) {
    return '<p class="muted">No quizzes taken yet. Start with your first quiz above!</p>'
  }

  const quizzes = getQuizzes()
  return user.quizzesTaken
    .map((qt) => {
      const quiz = quizzes.find((q) => q.id === qt.quizId)
      return `
            <div class="submission-item">
                <div>
                    <strong>${quiz ? quiz.title : "Quiz"}</strong>
                    <span class="submission-date">${new Date(qt.takenAt).toLocaleDateString()}</span>
                </div>
                <div class="muted">Earned ${qt.earned} points</div>
            </div>
        `
    })
    .join("")
}

function handleActivitySubmission() {
  const user = AppState.currentUser
  if (!user) {
    alert("Please sign in to submit activities")
    return
  }

  const type = document.getElementById("activityType").value
  const note = document.getElementById("activityNote").value.trim()
  const photoInput = document.getElementById("activityPhoto")

  if (!note) {
    alert("Please provide a description of your activity")
    return
  }

  if (!photoInput.files || photoInput.files.length === 0) {
    alert("Please select a photo of your activity")
    return
  }

  const file = photoInput.files[0]
  const reader = new FileReader()

  reader.onload = (e) => {
    const submissions = getSubmissions()
    const newSubmission = {
      id: uid("s"),
      userId: user.id,
      type,
      note,
      imageData: e.target.result,
      createdAt: nowISO(),
      verified: false,
      points: 10, // Base points, can be adjusted by admin
    }

    submissions.push(newSubmission)
    saveSubmissions(submissions)

    // Update user points
    const users = getUsers()
    const userIndex = users.findIndex((u) => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex].points += newSubmission.points
      users[userIndex].submissions = users[userIndex].submissions || []
      users[userIndex].submissions.push(newSubmission.id)
      saveUsers(users)
      AppState.currentUser = users[userIndex]
    }

    alert(`Activity submitted successfully! You earned ${newSubmission.points} points.`)

    // Clear form
    document.getElementById("activityNote").value = ""
    document.getElementById("activityPhoto").value = ""

    // Refresh view
    navigateTo("games")
  }

  reader.readAsDataURL(file)
}

function startQuiz(quizId) {
  const quizzes = getQuizzes()
  const quiz = quizzes.find((q) => q.id === quizId)
  if (!quiz) {
    alert("Quiz not found")
    return
  }

  let currentQuestion = 0
  const answers = []

  function showQuestion() {
    const q = quiz.questions[currentQuestion]
    const content = document.getElementById("mainContent")

    content.innerHTML = `
            <div class="quiz-container">
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h2>${quiz.title}</h2>
                        <span class="muted">Question ${currentQuestion + 1} of ${quiz.questions.length}</span>
                    </div>
                    
                    <div class="question">
                        <h4>${q.q}</h4>
                        <div class="options">
                            ${q.options
                              .map(
                                (option, index) => `
                                <label class="option" onclick="selectOption(${index})">
                                    <input type="radio" name="answer" value="${index}" style="margin-right: 0.5rem;">
                                    ${option}
                                </label>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: 1rem;">
                        ${
                          currentQuestion > 0
                            ? '<button class="btn btn-secondary" onclick="previousQuestion()">Previous</button>'
                            : "<div></div>"
                        }
                        <button class="btn btn-primary" onclick="nextQuestion()" id="nextBtn" disabled>
                            ${currentQuestion === quiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
                        </button>
                    </div>
                </div>
            </div>
        `
  }

  window.selectOption = (index) => {
    answers[currentQuestion] = index
    document.getElementById("nextBtn").disabled = false

    // Update visual selection
    document.querySelectorAll(".option").forEach((opt, i) => {
      opt.classList.toggle("selected", i === index)
    })
  }

  window.nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      currentQuestion++
      showQuestion()
    } else {
      finishQuiz()
    }
  }

  window.previousQuestion = () => {
    if (currentQuestion > 0) {
      currentQuestion--
      showQuestion()
    }
  }

  function finishQuiz() {
    let totalPoints = 0
    let correctAnswers = 0

    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.a) {
        totalPoints += q.points || 10
        correctAnswers++
      }
    })

    // Update user data
    const users = getUsers()
    const userIndex = users.findIndex((u) => u.id === AppState.currentUser.id)
    if (userIndex !== -1) {
      users[userIndex].points += totalPoints
      users[userIndex].quizzesTaken = users[userIndex].quizzesTaken || []
      users[userIndex].quizzesTaken.push({
        quizId: quiz.id,
        earned: totalPoints,
        takenAt: nowISO(),
        correctAnswers,
        totalQuestions: quiz.questions.length,
      })
      saveUsers(users)
      AppState.currentUser = users[userIndex]
    }

    // Show results
    const content = document.getElementById("mainContent")
    content.innerHTML = `
            <div class="quiz-container">
                <div class="card text-center">
                    <h2> Quiz Complete!</h2>
                    <div style="margin: 2rem 0;">
                        <div style="font-size: 3rem; color: #2b7a2b; margin-bottom: 1rem;">
                            ${totalPoints}
                        </div>
                        <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">Points Earned</p>
                        <p class="muted">You got ${correctAnswers} out of ${quiz.questions.length} questions correct!</p>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="navigateTo('games')">
                            Take Another Quiz
                        </button>
                        <button class="btn btn-secondary" onclick="navigateTo('home')">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `
  }

  showQuestion()
}

function renderProfileView(content) {
  const user = AppState.currentUser
  if (!user) {
    content.innerHTML =
      '<div class="card"><h3>Profile</h3><p class="muted">Please sign in to view your profile.</p></div>'
    return
  }

  const wateringRecords = getWateringRecords().filter((r) => r.userId === user.id)
  const submissions = getSubmissions().filter((s) => s.userId === user.id)

  content.innerHTML = `
        <div class="dashboard-header">
            <div class="user-info">
                <div class="avatar" style="width: 80px; height: 80px; font-size: 2rem;">${user.fullName[0]}</div>
                <div class="user-details">
                    <h2>${user.fullName}</h2>
                    <p class="muted">@${user.username} • ${user.email}</p>
                    <p class="muted">Member since ${new Date(user.createdAt).toLocaleDateString()}</p>
                    ${user.school ? `<p class="muted">${user.school}${user.grade ? ` • ${user.grade}` : ""}</p>` : ""}
                </div>
            </div>
            <div class="points-badge" style="font-size: 1.2rem; padding: 1rem 1.5rem;">
                ${user.points} Points
            </div>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3> Your Statistics</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: #f6fff4; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #2b7a2b;">${user.points}</div>
                        <p class="muted">Total Points</p>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #f6fff4; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #2b7a2b;">${wateringRecords.length}</div>
                        <p class="muted">Plants Watered</p>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #f6fff4; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #2b7a2b;">${user.quizzesTaken ? user.quizzesTaken.length : 0}</div>
                        <p class="muted">Quizzes Taken</p>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #f6fff4; border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #2b7a2b;">${submissions.length}</div>
                        <p class="muted">Activities Submitted</p>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3> Achievements & Badges</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    ${renderBadges(user)}
                </div>
            </div>
            
            <div class="card">
                <h3> Generate Certificate</h3>
                <p>Download a personalized certificate showcasing your environmental contributions!</p>
                <div style="text-align: center; margin: 1.5rem 0;">
                    <div style="font-size: 1.2rem; margin-bottom: 1rem;">
                        Certificate will include:
                    </div>
                    <ul style="text-align: left; max-width: 300px; margin: 0 auto;">
                        <li>Your name and achievements</li>
                        <li>Total points earned: ${user.points}</li>
                        <li>Environmental activities completed</li>
                        <li>Date of issue</li>
                    </ul>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="generateCertificate('png')">
                        Download as Image
                    </button>
                    <button class="btn btn-secondary" onclick="generateCertificate('pdf')">
                        Download as PDF
                    </button>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3> Recent Activity</h3>
            ${renderDetailedActivity(user)}
        </div>
    `
}

function renderBadges(user) {
  const badges = [
    { name: "First Steps", requirement: "Join EcoPlay", earned: true, icon: "🌱" },
    {
      name: "Quiz Master",
      requirement: "Complete 3 quizzes",
      earned: (user.quizzesTaken?.length || 0) >= 3,
      icon: "",
    },
    { name: "Green Thumb", requirement: "7-day watering streak", earned: user.wateringStreak >= 7, icon: "🌿" },
    { name: "Point Collector", requirement: "Earn 100 points", earned: user.points >= 100, icon: "💎" },
    { name: "Eco Warrior", requirement: "Earn 500 points", earned: user.points >= 500, icon: "🏆" },
    { name: "Plant Master", requirement: "30-day watering streak", earned: user.wateringStreak >= 30, icon: "🌳" },
  ]

  return badges
    .map(
      (badge) => `
        <div class="card ${badge.earned ? "card-unlocked" : "card-locked"}" style="text-align: center; padding: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${badge.icon}</div>
            <h4>${badge.name}</h4>
            <p class="muted" style="font-size: 0.8rem;">${badge.requirement}</p>
            <p style="font-size: 0.8rem; font-weight: bold; color: ${badge.earned ? "#2b7a2b" : "#999"};">
                ${badge.earned ? "Earned!" : "Not yet earned"}
            </p>
        </div>
    `,
    )
    .join("")
}

function renderDetailedActivity(user) {
  const wateringRecords = getWateringRecords()
    .filter((r) => r.userId === user.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)

  const quizHistory = user.quizzesTaken || []
  const submissions = getSubmissions()
    .filter((s) => s.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const allActivity = [
    ...wateringRecords.map((r) => ({
      type: "watering",
      date: r.date,
      description: `Watered plants: ${r.note}`,
      points: r.points,
    })),
    ...quizHistory.map((q) => ({
      type: "quiz",
      date: q.takenAt,
      description: `Completed quiz`,
      points: q.earned,
    })),
    ...submissions.map((s) => ({
      type: "activity",
      date: s.createdAt,
      description: `${s.type}: ${s.note}`,
      points: s.points,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)

  if (allActivity.length === 0) {
    return '<p class="muted">No activity yet. Start by taking a quiz or submitting your first watering photo!</p>'
  }

  return allActivity
    .map(
      (activity) => `
        <div class="submission-item">
            <div>
                <strong>${activity.type === "watering" ? "" : activity.type === "quiz" ? "" : ""} ${activity.description}</strong>
                <span class="submission-date">${new Date(activity.date).toLocaleDateString()}</span>
            </div>
            <div class="muted">+${activity.points} points</div>
        </div>
    `,
    )
    .join("")
}

function generateCertificate(format = "png") {
  const user = AppState.currentUser
  if (!user) {
    alert("Please sign in to generate certificate")
    return
  }

  // Create canvas for certificate
  const canvas = document.createElement("canvas")
  canvas.width = 1200
  canvas.height = 800
  const ctx = canvas.getContext("2d")

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, "#f6fff4")
  gradient.addColorStop(1, "#e8f5e8")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Border
  ctx.strokeStyle = "#2b7a2b"
  ctx.lineWidth = 8
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

  // Inner border
  ctx.strokeStyle = "#4caf50"
  ctx.lineWidth = 2
  ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120)

  // Title
  ctx.fillStyle = "#2b7a2b"
  ctx.font = "bold 48px serif"
  ctx.textAlign = "center"
  ctx.fillText("Certificate of Environmental Achievement", canvas.width / 2, 150)

  // Subtitle
  ctx.fillStyle = "#333"
  ctx.font = "24px serif"
  ctx.fillText("This certificate is proudly awarded to", canvas.width / 2, 220)

  // User name
  ctx.fillStyle = "#2b7a2b"
  ctx.font = "bold 42px serif"
  ctx.fillText(user.fullName, canvas.width / 2, 290)

  // Achievement text
  ctx.fillStyle = "#333"
  ctx.font = "20px serif"
  const achievementText = `For outstanding commitment to environmental conservation and sustainability,`
  ctx.fillText(achievementText, canvas.width / 2, 350)

  const pointsText = `earning ${user.points} points through active participation in EcoPlay activities.`
  ctx.fillText(pointsText, canvas.width / 2, 380)

  // Details
  ctx.font = "18px serif"
  const wateringCount = getWateringRecords().filter((r) => r.userId === user.id).length
  const quizCount = user.quizzesTaken ? user.quizzesTaken.length : 0

  ctx.fillText(
    `Environmental Activities: ${wateringCount} plant watering sessions, ${quizCount} educational quizzes completed`,
    canvas.width / 2,
    450,
  )

  // Date
  ctx.font = "16px serif"
  ctx.fillText(`Issued on ${new Date().toLocaleDateString()}`, canvas.width / 2, 520)

  // Footer
  ctx.font = "italic 16px serif"
  ctx.fillStyle = "#666"
  ctx.fillText("EcoPlay Environmental Awareness Platform", canvas.width / 2, 600)
  ctx.fillText("Making Environmental Action Fun and Rewarding", canvas.width / 2, 625)

  // Decorative elements
  ctx.fillStyle = "#2b7a2b"
  ctx.font = "40px serif"
  ctx.fillText("", 150, 300)
  ctx.fillText("", canvas.width - 150, 300)
  ctx.fillText("", canvas.width / 2, 550)

  if (format === "pdf") {
    // For PDF, we'll use jsPDF library (would need to be included)
    // For now, we'll download as image and inform user
    alert("PDF generation requires additional library. Downloading as image instead.")
    format = "png"
  }

  // Download as image
  const dataURL = canvas.toDataURL("image/png")
  const link = document.createElement("a")
  link.download = `${user.username}_ecoplay_certificate.${format}`
  link.href = dataURL
  link.click()

  alert("Certificate downloaded successfully!")
}

function renderRedeemView(content) {
  const user = AppState.currentUser
  const userRedemptions = getRedemptions().filter((r) => r.userId === user.id)

  content.innerHTML = `
        <div class="text-center mb-2">
            <h1> Redeem Your Points</h1>
            <p class="muted">Exchange your hard-earned points for exciting rewards!</p>
            <div class="points-badge" style="font-size: 1.2rem; margin: 1rem 0;">
                Available Points: ${user.points}
            </div>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3> Eco Rewards</h3>
                <div class="reward-list">
                    ${renderRewardItem("Digital Plant Care Guide", 50, "Comprehensive guide to caring for indoor and outdoor plants", "")}
                    ${renderRewardItem("Eco-Friendly Tips Collection", 75, "Collection of 100 practical environmental tips", "")}
                    ${renderRewardItem("Virtual Tree Planting Certificate", 100, "Plant a virtual tree and get a personalized certificate", "")}
                </div>
            </div>
            
            <div class="card">
                <h3>  Achievement Rewards</h3>
                <div class="reward-list">
                    ${renderRewardItem("Environmental Hero Badge", 150, "Special digital badge for your profile", "")}
                    ${renderRewardItem("Sustainability Champion Title", 200, "Exclusive title and profile enhancement", "")}
                    ${renderRewardItem("Eco Mentor Status", 300, "Become a mentor and help other users", "")}
                </div>
            </div>
            
            <div class="card">
                <h3> Platform Perks</h3>
                <div class="reward-list">
                    ${renderRewardItem("Quiz Streak Multiplier", 120, "Double points for next 5 quizzes", "")}
                    ${renderRewardItem("Custom Profile Theme", 180, "Personalize your profile with custom colors", "")}
                    ${renderRewardItem("Early Access Features", 250, "Get early access to new platform features", "")}
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3> Your Redemption History</h3>
            ${
              userRedemptions.length === 0
                ? '<p class="muted">No redemptions yet. Start earning points and redeem your first reward!</p>'
                : userRedemptions
                    .map(
                      (redemption) => `
                    <div class="submission-item">
                        <div>
                            <strong>${redemption.reward}</strong>
                            <span class="submission-date">${new Date(redemption.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div class="muted">${redemption.cost} points</div>
                    </div>
                `,
                    )
                    .join("")
            }
        </div>
        
        <div class="card text-center">
            <h3> Earn More Points</h3>
            <p>Need more points? Here are some quick ways to earn them:</p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem;">
                <button class="btn btn-primary" onclick="navigateTo('watering')">
                    Daily Watering (+15 pts)
                </button>
                <button class="btn btn-primary" onclick="navigateTo('games')">
                    Take Quiz (+10-50 pts)
                </button>
                <button class="btn btn-secondary" onclick="navigateTo('games')">
                    Submit Activity (+10-20 pts)
                </button>
            </div>
        </div>
    `
}

function renderRewardItem(name, cost, description, icon) {
  const user = AppState.currentUser
  const canAfford = user.points >= cost

  return `
        <div class="reward-item" style="border: 1px solid #e1e5e9; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; ${!canAfford ? "opacity: 0.6;" : ""}">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="font-size: 2rem;">${icon}</div>
                <div style="flex: 1;">
                    <h4>${name}</h4>
                    <p class="muted" style="margin: 0.5rem 0;">${description}</p>
                    <p style="font-weight: bold; color: #2b7a2b; margin: 0;">${cost} points</p>
                </div>
                <button class="btn ${canAfford ? "btn-primary" : "btn-secondary"}" 
                        onclick="redeemReward('${name}', ${cost})" 
                        ${!canAfford ? "disabled" : ""}>
                    ${canAfford ? "Redeem" : "Need " + (cost - user.points) + " more"}
                </button>
            </div>
        </div>
    `
}

function redeemReward(rewardName, cost) {
  const user = AppState.currentUser

  if (user.points < cost) {
    alert(`You need ${cost - user.points} more points to redeem this reward.`)
    return
  }

  if (!confirm(`Are you sure you want to redeem "${rewardName}" for ${cost} points?`)) {
    return
  }

  // Update user points
  const users = getUsers()
  const userIndex = users.findIndex((u) => u.id === user.id)
  if (userIndex !== -1) {
    users[userIndex].points -= cost
    saveUsers(users)
    AppState.currentUser = users[userIndex]
  }

  // Record redemption
  const redemptions = getRedemptions()
  redemptions.push({
    id: uid("r"),
    userId: user.id,
    reward: rewardName,
    cost,
    createdAt: nowISO(),
  })
  saveRedemptions(redemptions)

  alert(`Congratulations! You've successfully redeemed "${rewardName}"!`)
  navigateTo("redeem") // Refresh the view
}

function getQuizzes() {
  return load(DB.quizzesKey, [])
}
function saveQuizzes(quizzes) {
  save(DB.quizzesKey, quizzes)
}

function getSubmissions() {
  return load(DB.submissionsKey, [])
}
function saveSubmissions(submissions) {
  save(DB.submissionsKey, submissions)
}

function getRedemptions() {
  return load(DB.redemptionsKey, [])
}
function saveRedemptions(redemptions) {
  save(DB.redemptionsKey, redemptions)
}

function getWateringRecords() {
  return load(DB.wateringKey, [])
}
function saveWateringRecords(records) {
  save(DB.wateringKey, records)
}

function renderAdminView(content) {
  content.innerHTML = `<h2>Admin Panel</h2><p>Manage users, quizzes, and submissions here.</p>`
}

document.addEventListener("DOMContentLoaded", () => {
  initializeData()
  renderApp()
})

window.showSignUpForm = showSignUpForm
window.showSignInForm = showSignInForm
window.signOut = signOut
window.navigateTo = navigateTo
window.showAboutPublic = showAboutPublic
window.showContactPublic = showContactPublic
window.renderApp = renderApp
window.startQuiz = startQuiz
window.generateCertificate = generateCertificate
window.redeemReward = redeemReward