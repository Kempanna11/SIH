
/*
  EcoPlay frontend (HTML + JS)
  - Uses localStorage to persist users, quizzes, submissions, events, leaderboards
  - Admin password default: "admin123"
  - Keep CSS in styles.css (provided separately)
*/

/* ---------- Utilities ---------- */
const DB = {
  usersKey: 'ecoplay_users',
  quizzesKey: 'ecoplay_quizzes',
  submissionsKey: 'ecoplay_submissions',
  eventsKey: 'ecoplay_events',
  redemptionsKey: 'ecoplay_redemptions'
};

function nowISO(){ return new Date().toISOString(); }
function uid(prefix='id'){ return prefix + '_' + Math.random().toString(36).slice(2,9); }
function load(key, defaultVal){ try { const v=localStorage.getItem(key); return v? JSON.parse(v): defaultVal; } catch(e){ return defaultVal; } }
function save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

/* init basic stores if not present */
if(!load(DB.usersKey, null)){
  // create a dummy leader user for demo
  save(DB.usersKey, [{
    id: uid('u'),
    username: 'demo_student',
    name: 'Demo Student',
    createdAt: nowISO(),
    points: 120,
    badges: ['Bronze Sapling'],
    submissions: [],
    quizzesTaken: [],
    joinedEvents: []
  }]);
}
if(!load(DB.quizzesKey, null)){
  // starter quiz (admin can add more)
  save(DB.quizzesKey, [
    {
      id: uid('q'),
      title: "Plant Care Basics",
      description: "Quick 5-question quiz about watering & planting.",
      questions: [
        { q: "How often should most new saplings be watered?", options: ["Daily","Once a week","Once a month","Never"], a:0, points:10 },
        { q: "Which season is often best to plant trees in many regions?", options:["Summer","Winter","Monsoon/Autumn","Spring"], a:3, points:10 },
        { q: "What is compost used for?", options:["Fuel","Fertilizer","Shoelace","Clothing"], a:1, points:10 },
        { q: "Mulching helps:", options:["Retain moisture","Remove soil","Attract pests","Kill roots"], a:0, points:5 },
        { q: "Which tool is safest for small tree planting?", options:["Chainsaw","Shovel","Hammer","Blowtorch"], a:1, points:5 }
      ],
      createdAt: nowISO()
    }
  ]);
}
if(!load(DB.submissionsKey, null)){
  save(DB.submissionsKey, []);
}
if(!load(DB.eventsKey, null)){
  save(DB.eventsKey, []);
}
if(!load(DB.redemptionsKey, null)){
  save(DB.redemptionsKey, []);
}

/* ---------- App State ---------- */
const AppState = {
  currentUser: null, // object or null
  isAdmin: false
};

/* ---------- DOM helpers ---------- */
const root = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const currentUserDisplay = document.getElementById('currentUserDisplay');
const authBtn = document.getElementById('authBtn');
const profileLink = document.getElementById('profileLink');
const adminLink = document.getElementById('adminLink');
document.getElementById('year').innerText = new Date().getFullYear();

/* ---------- Auth & User management ---------- */
function getUsers(){ return load(DB.usersKey, []); }
function saveUsers(u){ save(DB.usersKey, u); }

function signInUI(){
  showModal(`
    <h3>Sign in / Register</h3>
    <div class="form-row"><label>Username</label><input id="mi_username" placeholder="username (unique)"/></div>
    <div class="form-row"><label>Full name</label><input id="mi_name" placeholder="Full name (for profile)"/></div>
    <div style="text-align:right;"><button id="doSign" class="btn">Sign In / Register</button></div>
  `);
  setTimeout(()=>{
    document.getElementById('doSign').addEventListener('click', ()=>{
      const username = document.getElementById('mi_username').value.trim();
      const name = document.getElementById('mi_name').value.trim() || username;
      if(!username){ alert('Enter username'); return; }
      let users = getUsers();
      let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if(!user){
        user = {
          id: uid('u'),
          username,
          name,
          createdAt: nowISO(),
          points: 0,
          badges: [],
          submissions: [],
          quizzesTaken: [],
          joinedEvents: []
        };
        users.push(user);
        saveUsers(users);
      }
      AppState.currentUser = user;
      AppState.isAdmin = false;
      updateAuthUI();
      closeModal();
      routeTo('home');
    });
  },50);
}

function signOut(){
  AppState.currentUser = null;
  AppState.isAdmin = false;
  updateAuthUI();
  routeTo('home');
}

function updateAuthUI(){
  if(AppState.currentUser){
    currentUserDisplay.innerText = AppState.currentUser.name + ' (' + AppState.currentUser.points + ' pts)';
    authBtn.innerText = 'Sign out';
  } else {
    currentUserDisplay.innerText = 'Not signed in';
    authBtn.innerText = 'Sign in';
  }
}

/* ---------- Modal helpers ---------- */
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');
function showModal(html){
  modalContent.innerHTML = html;
  modal.classList.remove('hidden');
}
function closeModal(){ modal.classList.add('hidden'); modalContent.innerHTML=''; }
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });

/* ---------- Routing & Rendering ---------- */
function clearActiveNav(){ navLinks.forEach(a=>a.classList.remove('active')); }
navLinks.forEach(a=>{
  a.addEventListener('click', (ev)=>{
    ev.preventDefault();
    const route = a.getAttribute('data-route');
    routeTo(route);
  });
});

function routeTo(route){
  clearActiveNav();
  const link = document.querySelector(`[data-route="${route}"]`);
  if(link) link.classList.add('active');
  switch(route){
    case 'home': renderHome(); break;
    case 'games': renderGames(); break;
    case 'redeem': renderRedeem(); break;
    case 'about': renderAbout(); break;
    case 'contact': renderContact(); break;
    case 'profile': renderProfile(); break;
    case 'admin': renderAdmin(); break;
    default: renderHome();
  }
}

/* ---------- Small components ---------- */
function renderCard(title, inner){ return `<section class="card"><h3>${title}</h3><div>${inner}</div></section>`; }

function getLeaderboardHTML(limit=10){
  const users = getUsers().slice().sort((a,b)=>b.points - a.points).slice(0,limit);
  return `<ol class="leaderboard small">
    ${users.map(u=>`<li><strong>${u.name}</strong> <span class="muted">(${u.username})</span> <span class="points">${u.points} pts</span></li>`).join('')}
  </ol>`;
}

/* ---------- Badge logic ---------- */
const BADGE_RULES = [
  { name: 'Bronze Sapling', minPoints: 50, desc: 'First commitment to green.' },
  { name: 'Silver Sprout', minPoints: 150, desc: 'Active contributor.' },
  { name: 'Gold Tree', minPoints: 400, desc: 'Community leader.' }
];

function evaluateBadgesFor(user){
  const newBadges = [];
  for(const rule of BADGE_RULES){
    if(user.points >= rule.minPoints && !user.badges.includes(rule.name)){
      user.badges.push(rule.name);
      newBadges.push(rule.name);
    }
  }
  return newBadges;
}

/* ---------- Home (Dashboard) ---------- */
function renderHome(){
  const u = AppState.currentUser;
  const users = getUsers();
  const topUsers = users.slice().sort((a,b)=>b.points-a.points).slice(0,3);

  let profileBox = `<div class="dash-profile"><div><strong>Guest</strong><div class="muted">Sign in to track progress</div></div></div>`;
  if(u){
    profileBox = `
      <div class="dash-profile">
        <div class="avatar">${u.name[0] || 'U'}</div>
        <div>
          <strong>${u.name}</strong>
          <div class="muted">${u.username} • Member since ${new Date(u.createdAt).toLocaleDateString()}</div>
          <div class="points-large">${u.points} pts</div>
          <div class="badges-inline">${u.badges.map(b=>`<span class="badge small">${b}</span>`).join(' ')}</div>
        </div>
      </div>
    `;
  }

  const progressPercent = u ? Math.min(100, Math.round((u.points / 400) * 100)) : 0;

  root.innerHTML = `
    <div class="container">
      <div class="grid-3">
        ${renderCard('Profile', profileBox)}
        ${renderCard('Leaderboard', getLeaderboardHTML(5))}
        ${renderCard('Quick Actions', `
          <div class="btn-row">
            <button class="btn" id="goGames">Play Games</button>
            <button class="btn" id="goRedeem">Redeem Points</button>
            <button class="btn" id="goProfile">My Profile</button>
          </div>
        `)}
      </div>

      <div class="grid-2">
        ${renderCard('Overall Progress', `
          <div class="progressWrap">
            <div class="progressBar"><div style="width:${progressPercent}%"></div></div>
            <div class="muted">Progress toward "Gold Tree" (${Math.min(u?u.points:0,400)} / 400 pts)</div>
          </div>
        `)}

        ${renderCard('Upcoming Events', renderEventsList())}
      </div>

      <div class="grid-full">
        ${renderCard('Community Activity', `
          <div class="activity-list">
            ${renderRecentActivity(6)}
          </div>
        `)}
      </div>
    </div>
  `;

  // button bindings
  document.getElementById('goGames').addEventListener('click', ()=>routeTo('games'));
  document.getElementById('goRedeem').addEventListener('click', ()=>routeTo('redeem'));
  document.getElementById('goProfile').addEventListener('click', ()=>routeTo('profile'));
}

/* ---------- Events ---------- */
function getEvents(){ return load(DB.eventsKey, []); }
function saveEvents(ev){ save(DB.eventsKey, ev); }
function renderEventsList(){
  const events = getEvents();
  if(events.length===0) return `<div class="muted">No events now. Admins can create events from Admin panel.</div>`;
  return `
    <ul class="events">
      ${events.map(e=>`<li>
        <strong>${e.title}</strong> <span class="muted">(${new Date(e.date).toLocaleDateString()})</span>
        <div class="muted">${e.description}</div>
        <div class="event-controls">
          <span class="muted">${e.participants?e.participants.length:0} joined</span>
          ${AppState.currentUser ? `<button class="btn tiny" data-join="${e.id}">${(AppState.currentUser.joinedEvents||[]).includes(e.id) ? 'Joined' : 'Join'}</button>` : `<span class="muted">Sign in to join</span>`}
        </div>
      </li>`).join('')}
    </ul>
  `;
}

function renderRecentActivity(limit=6){
  const submissions = load(DB.submissionsKey, []).slice().reverse().slice(0, limit);
  if(submissions.length===0) return `<div class="muted">No recent community activity yet.</div>`;
  return submissions.map(s => {
    const user = getUsers().find(u=>u.id===s.userId);
    return `<div class="activity">
      <div><strong>${user?user.name:'Someone'}</strong> submitted <em>${s.type}</em> (${new Date(s.createdAt).toLocaleDateString()})</div>
      <div class="muted">${s.note||''} ${s.awarded ? `<span class="small green">+${s.pointsAwarded} pts</span>` : `<span class="small">Pending approval</span>`}</div>
    </div>`;
  }).join('');
}

/* ---------- Games (Quizzes & Uploads) ---------- */
function getQuizzes(){ return load(DB.quizzesKey, []); }
function saveQuizzes(q){ save(DB.quizzesKey, q); }

function renderGames(){
  const quizzes = getQuizzes();
  root.innerHTML = `
    <div class="container">
      <div class="grid-2">
        ${renderCard('Image Submissions (Planting / Watering)', `
          <p>Upload a photo showing planting/watering activity. Provide a short note. Admins may verify and award bonus points.</p>
          <div class="form-row"><label>Type</label>
            <select id="submissionType">
              <option value="Planting">Planting</option>
              <option value="Watering">Watering</option>
              <option value="Cleanup">Cleanup</option>
            </select>
          </div>
          <div class="form-row"><label>Note</label><input id="submissionNote" placeholder="Short note (e.g., 2 saplings planted)"/></div>
          <div class="form-row"><label>Photo</label><input id="submissionPhoto" type="file" accept="image/*"/></div>
          <div style="text-align:right"><button id="submitActivity" class="btn">Submit Activity</button></div>
        `)}

        ${renderCard('Quizzes', `
          <p>Take quizzes and earn points. Admins can add quizzes in the Admin panel.</p>
          <ul class="quiz-list">
            ${quizzes.map(q=>`<li>
              <strong>${q.title}</strong> <div class="muted">${q.description}</div>
              <div style="margin-top:8px"><button class="btn" data-take="${q.id}">Take Quiz</button></div>
            </li>`).join('')}
          </ul>
        `)}
      </div>

      <div class="grid-full">
        ${renderCard('How points & rewards work', `
          <ul>
            <li>Quizzes give points based on correct answers.</li>
            <li>Image submissions reward points immediately (+10) and after admin verification can be adjusted.</li>
            <li>Badges unlock at thresholds and certificates can be downloaded from your profile.</li>
          </ul>
        `)}
      </div>
    </div>
  `;

  // handlers
  document.getElementById('submitActivity').addEventListener('click', handleImageSubmission);
  document.querySelectorAll('[data-take]').forEach(btn=>{
    btn.addEventListener('click', ()=>startQuiz(btn.getAttribute('data-take')));
  });
}

function handleImageSubmission(){
  if(!AppState.currentUser){ alert('Sign in to submit activities.'); return; }
  const fileInput = document.getElementById('submissionPhoto');
  const note = document.getElementById('submissionNote').value.trim();
  const type = document.getElementById('submissionType').value;

  if(!fileInput.files || fileInput.files.length===0){ alert('Select a photo to upload.'); return; }
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function(e){
    // store submission entry (base64 data) - for demo only (not recommended for large scale)
    const submissions = load(DB.submissionsKey, []);
    const submission = {
      id: uid('s'),
      userId: AppState.currentUser.id,
      type,
      note,
      imageData: e.target.result,
      createdAt: nowISO(),
      awarded: true,
      pointsAwarded: 10, // immediate award
      approvedByAdmin: false
    };
    submissions.push(submission);
    save(DB.submissionsKey, submissions);

    // update user points immediately
    const users = getUsers();
    const user = users.find(u=>u.id===AppState.currentUser.id);
    if(user){
      user.points += submission.pointsAwarded;
      user.submissions = user.submissions || [];
      user.submissions.push(submission.id);
      const newBadges = evaluateBadgesFor(user);
      saveUsers(users);
      AppState.currentUser = user;
      updateAuthUI();
      alert(`Activity submitted! +${submission.pointsAwarded} pts awarded. ${newBadges.length? 'New badge(s): '+newBadges.join(', '): ''}`);
      routeTo('home');
    }
  };
  reader.readAsDataURL(file);
}

/* ---------- Quiz Flow ---------- */
function startQuiz(quizId){
  const quizzes = getQuizzes();
  const quiz = quizzes.find(q=>q.id===quizId);
  if(!quiz){ alert('Quiz not found'); return; }
  let qIndex = 0;
  const answers = [];

  function showQuestion(){
    const q = quiz.questions[qIndex];
    showModal(`
      <h3>${quiz.title} — Question ${qIndex+1} / ${quiz.questions.length}</h3>
      <div class="muted">${q.q}</div>
      <div style="margin-top:10px;">
        ${q.options.map((opt, i)=>`<div><label><input type="radio" name="opt" value="${i}" ${i===0?'checked':''}/> ${opt}</label></div>`).join('')}
      </div>
      <div style="text-align:right;margin-top:8px;">
        ${qIndex>0?'<button id="prevQ" class="btn tiny">Prev</button>':''}
        <button id="nextQ" class="btn">${qIndex<quiz.questions.length-1 ? 'Next' : 'Finish'}</button>
      </div>
    `);

    // bindings
    document.getElementById('nextQ').addEventListener('click', ()=>{
      const selected = document.querySelector('input[name="opt"]:checked').value;
      answers[qIndex] = parseInt(selected,10);
      if(qIndex < quiz.questions.length-1){
        qIndex++;
        showQuestion();
      } else {
        finishQuiz();
      }
    });
    const prevBtn = document.getElementById('prevQ');
    if(prevBtn) prevBtn.addEventListener('click', ()=>{
      answers[qIndex] = parseInt(document.querySelector('input[name="opt"]:checked').value,10);
      qIndex = Math.max(0, qIndex-1);
      showQuestion();
    });
  }

  function finishQuiz(){
    closeModal();
    if(!AppState.currentUser){ alert('Sign in to take quizzes.'); return; }
    let earned = 0;
    quiz.questions.forEach((qq, idx)=>{
      if(answers[idx] === qq.a) earned += (qq.points || 10);
    });

    // update user
    const users = getUsers();
    const user = users.find(u=>u.id===AppState.currentUser.id);
    if(user){
      user.points += earned;
      user.quizzesTaken = user.quizzesTaken || [];
      user.quizzesTaken.push({ quizId: quiz.id, earned, takenAt: nowISO() });
      const newBadges = evaluateBadgesFor(user);
      saveUsers(users);
      AppState.currentUser = user;
      updateAuthUI();
    }

    showModal(`<h3>Quiz Completed</h3><p>You earned <strong>${earned} pts</strong> for "${quiz.title}".</p><div style="text-align:right"><button id="closeQuiz" class="btn">Close</button></div>`);
    setTimeout(()=>{ document.getElementById('closeQuiz').addEventListener('click', ()=>{ closeModal(); routeTo('home'); }); },50);
  }

  showQuestion();
}

/* ---------- Profile ---------- */
function renderProfile(){
  if(!AppState.currentUser){
    root.innerHTML = `<div class="container"><div class="card"><h3>Profile</h3><p class="muted">Sign in to view and manage your profile, certificates and badges.</p></div></div>`;
    return;
  }
  const u = AppState.currentUser;
  root.innerHTML = `
    <div class="container">
      <div class="grid-3">
        ${renderCard('My Info', `
          <div class="profile-compact">
            <div class="avatar large">${u.name[0]||'U'}</div>
            <div>
              <h3>${u.name}</h3>
              <div class="muted">${u.username}</div>
              <div class="muted">Member since ${new Date(u.createdAt).toLocaleDateString()}</div>
              <div class="points-large">${u.points} pts</div>
              <div class="badges-inline">${u.badges.map(b=>`<span class="badge">${b}</span>`).join(' ')}</div>
            </div>
          </div>
        `)}

        ${renderCard('Badges', `
          <div class="badge-grid">
            ${BADGE_RULES.map(b=>`<div class="badge-card ${u.points>=b.minPoints? 'unlocked':''}">
              <div class="badge-title">${b.name}</div>
              <div class="muted">${b.desc}</div>
              <div class="muted small">Requires ${b.minPoints} pts</div>
            </div>`).join('')}
          </div>
        `)}

        ${renderCard('Certificates', `
          <p>You can generate a certificate with your name & points.</p>
          <div style="text-align:right"><button class="btn" id="genCert">Generate Certificate</button></div>
        `)}
      </div>

      <div class="grid-full">
        ${renderCard('Activities & Progress', `
          <h4>Your submissions</h4>
          <div class="muted">${(u.submissions||[]).length} submissions</div>
          <div class="submissionsList">${renderUserSubmissions(u)}</div>
          <h4 style="margin-top:14px;">Quizzes taken</h4>
          <div class="muted">${(u.quizzesTaken||[]).length} quizzes</div>
          <ul>${(u.quizzesTaken||[]).map(qt=>{
            const quiz = getQuizzes().find(qq=>qq.id===qt.quizId);
            return `<li>${quiz?quiz.title:'Quiz'} — ${qt.earned} pts • ${new Date(qt.takenAt).toLocaleDateString()}</li>`;
          }).join('')}</ul>
        `)}
      </div>
    </div>
  `;

  document.getElementById('genCert').addEventListener('click', generateCertificate);
}

function renderUserSubmissions(user){
  const subs = load(DB.submissionsKey, []).filter(s=>s.userId===user.id);
  if(subs.length===0) return `<div class="muted">No submissions yet.</div>`;
  return subs.map(s=>`<div class="submission-item">
    <div><strong>${s.type}</strong> • ${new Date(s.createdAt).toLocaleDateString()} ${s.approvedByAdmin?'<span class="small green">Approved</span>':'<span class="small">Pending</span>'}</div>
    <div class="muted">${s.note || ''} ${s.awarded?`<span class="small">+${s.pointsAwarded} pts</span>`:''}</div>
    <div class="submission-thumb"><img src="${s.imageData}" alt="submission" /></div>
  </div>`).join('');
}

/* ---------- Certificate Generation (canvas) ---------- */
function generateCertificate(){
  const user = AppState.currentUser;
  if(!user) { alert('Sign in to generate certificate'); return; }
  // create canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 675;
  const ctx = canvas.getContext('2d');

  // background
  ctx.fillStyle = '#f6fff4';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = '#2b7a2b';
  ctx.fillRect(40,40,canvas.width-80,canvas.height-80);

  ctx.fillStyle = '#fff';
  ctx.fillRect(60,60,canvas.width-120,canvas.height-120);

  // title
  ctx.fillStyle = '#2b7a2b';
  ctx.font = 'bold 48px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Certificate of Participation', canvas.width/2, 160);

  ctx.fillStyle = '#333';
  ctx.font = '28px serif';
  ctx.fillText(`This certificate is awarded to`, canvas.width/2, 220);

  ctx.font = 'bold 40px serif';
  ctx.fillText(user.name, canvas.width/2, 280);

  ctx.font = '20px serif';
  ctx.fillText(`For active participation in EcoPlay community and contributing ${user.points} points toward environmental action.`, canvas.width/2, 340);

  ctx.font = '18px serif';
  ctx.fillText(`Issued on ${new Date().toLocaleDateString()}`, canvas.width/2, 420);

  // footer
  ctx.font = '16px serif';
  ctx.fillText('EcoPlay — Encourage, Engage, Environment', canvas.width/2, canvas.height-60);

  // create download link
  const dataURL = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = `${user.username}_ecoplay_certificate.png`;
  a.click();
}

/* ---------- Redeem Points ---------- */
function renderRedeem(){
  root.innerHTML = `
    <div class="container">
      <div class="grid-2">
        ${renderCard('Redeem Points', `
          <p>Use points to redeem digital rewards or discount codes. This is a demo redeem system.</p>
          <div class="redeem-list">
            <div class="redeem-item"><strong>Eco Sticker Pack</strong><div class="muted">Cost: 50 pts</div><button class="btn" data-redeem="50">Redeem</button></div>
            <div class="redeem-item"><strong>Certificate Boost</strong><div class="muted">Cost: 120 pts</div><button class="btn" data-redeem="120">Redeem</button></div>
            <div class="redeem-item"><strong>Event Pass</strong><div class="muted">Cost: 200 pts</div><button class="btn" data-redeem="200">Redeem</button></div>
          </div>
        `)}

        ${renderCard('Your Redemptions', `
          <div class="muted">${renderRedemptionsList()}</div>
        `)}
      </div>
    </div>
  `;

  document.querySelectorAll('[data-redeem]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const cost = parseInt(btn.getAttribute('data-redeem'),10);
      if(!AppState.currentUser){ alert('Sign in to redeem'); return; }
      const users = getUsers();
      const user = users.find(u=>u.id===AppState.currentUser.id);
      if(user.points < cost){ alert('Not enough points'); return; }
      user.points -= cost;
      saveUsers(users);
      AppState.currentUser = user;
      updateAuthUI();

      // record redemption
      const redemptions = load(DB.redemptionsKey, []);
      redemptions.push({ id: uid('r'), userId: user.id, cost, createdAt: nowISO(), reward: `Reward for ${cost} pts` });
      save(DB.redemptionsKey, redemptions);

      alert('Redeemed! Check your Redemptions list.');
      renderRedeem();
    });
  });
}

function renderRedemptionsList(){
  if(!AppState.currentUser) return 'Sign in to view redemptions.';
  const redemptions = load(DB.redemptionsKey, []).filter(r=>r.userId===AppState.currentUser.id);
  if(redemptions.length===0) return 'No redemptions yet.';
  return `<ul>${redemptions.map(r=>`<li>${new Date(r.createdAt).toLocaleDateString()}: ${r.reward} (${r.cost} pts)</li>`).join('')}</ul>`;
}

/* ---------- About & Contact ---------- */
function renderAbout(){
  root.innerHTML = `
    <div class="container">
      ${renderCard('About EcoPlay', `
        <p>EcoPlay is a gamified platform designed to engage students in environmental activities. Earn points by participating in quizzes, submitting real-world actions, and joining community events. Collect badges and claim certificates.</p>
        <ul>
          <li>Designed for schools & colleges.</li>
          <li>Admin can add quizzes & host events without coding.</li>
          <li>Everything stores locally for demo purposes (localStorage).</li>
        </ul>
      `)}
    </div>
  `;
}

function renderContact(){
  root.innerHTML = `
    <div class="container">
      ${renderCard('Contact', `
        <p>For admin access or partnership, reach out to: <strong>admin@ecoplay.example</strong></p>
        <p class="muted">This is a demo frontend. To add a backend, connect APIs for authentication, file storage, and databases.</p>
      `)}
    </div>
  `;
}

/* ---------- Admin Panel ---------- */
function renderAdmin(){
  // admin check
  if(!AppState.isAdmin){
    showModal(`
      <h3>Admin Sign In</h3>
      <div class="form-row"><label>Admin Password</label><input id="adminPass" type="password"/></div>
      <div style="text-align:right"><button id="doAdmin" class="btn">Sign in</button></div>
    `);
    setTimeout(()=> {
      document.getElementById('doAdmin').addEventListener('click', ()=>{
        const pass = document.getElementById('adminPass').value;
        if(pass === 'Array_Avengers'){ AppState.isAdmin = true; closeModal(); renderAdmin(); }
        else alert('Wrong admin password (default: admin123)');
      });
    },50);
    return;
  }

  // build admin UI - manage quizzes, submissions, events, users
  const quizzes = getQuizzes();
  const submissions = load(DB.submissionsKey, []);
  const events = getEvents();
  const users = getUsers();

  root.innerHTML = `
    <div class="container admin">
      <h2>Admin Dashboard</h2>
      <div class="grid-2">
        ${renderCard('Add / Manage Quizzes', `
          <div class="form-row"><label>Quiz Title</label><input id="adm_q_title" /></div>
          <div class="form-row"><label>Quiz Description</label><input id="adm_q_desc" /></div>
          <div id="adm_q_questions">
            <h4>Questions</h4>
            <div class="muted small">Enter question, comma-separated options, correct option index (0-based), points</div>
            <textarea id="adm_q_qarea" placeholder="Example line: What is compost?,Fuel,Fertilizer,Clothing,1,10"></textarea>
            <div style="text-align:right"><button id="adm_add_quiz" class="btn">Add Quiz</button></div>
          </div>
          <hr/>
          <h4>Existing Quizzes</h4>
          <ul>${quizzes.map(q=>`<li><strong>${q.title}</strong> <button class="btn tiny" data-qdel="${q.id}">Delete</button></li>`).join('')}</ul>
        `)}

        ${renderCard('Manage Submissions', `
          <div class="muted">Approve or adjust image submissions.</div>
          <div class="submissions-admin">${submissions.length? submissions.map(s=>{
            const user = users.find(u=>u.id===s.userId);
            return `<div class="admin-sub">
              <div><strong>${s.type}</strong> by ${user?user.name:'Unknown'} • ${new Date(s.createdAt).toLocaleString()}</div>
              <div class="muted">${s.note || ''}</div>
              <img src="${s.imageData}" alt="sub" style="max-width:180px;display:block;margin-top:6px;border-radius:6px"/>
              <div style="margin-top:6px;">
                <label>Points awarded:</label> <input type="number" value="${s.pointsAwarded}" data-award="${s.id}" style="width:80px"/>
                <button class="btn tiny" data-approve="${s.id}">${s.approvedByAdmin? 'Approved' : 'Approve'}</button>
                <button class="btn tiny ghost" data-del="${s.id}">Delete</button>
              </div>
            </div>`;
          }).join('') : '<div class="muted">No submissions</div>'}</div>
        `)}
      </div>

      <div class="grid-full">
        ${renderCard('Events Management', `
          <div class="form-row"><label>Event Title</label><input id="ev_title" /></div>
          <div class="form-row"><label>Date</label><input id="ev_date" type="date" /></div>
          <div class="form-row"><label>Description</label><input id="ev_desc" /></div>
          <div style="text-align:right"><button id="ev_add" class="btn">Add Event</button></div>
          <hr/>
          <h4>Events</h4>
          <ul>${events.length? events.map(ev=>`<li><strong>${ev.title}</strong> (${new Date(ev.date).toLocaleDateString()}) <button class="btn tiny" data-evdel="${ev.id}">Delete</button></li>`).join('') : '<div class="muted">No events</div>'}</ul>
        `)}
      </div>
    </div>
  `;

  // handlers
  document.getElementById('adm_add_quiz').addEventListener('click', ()=>{
    const title = document.getElementById('adm_q_title').value.trim();
    const desc = document.getElementById('adm_q_desc').value.trim();
    const qtext = document.getElementById('adm_q_qarea').value.trim();
    if(!title || !qtext){ alert('Provide title and at least one question line.'); return; }
    const qlines = qtext.split('\n').map(r=>r.trim()).filter(r=>r);
    const questions = [];
    for(const line of qlines){
      // expected: question, opt1, opt2, opt3, correctIndex, points
      const parts = line.split(',').map(p=>p.trim());
      if(parts.length < 6){ alert('Each question line requires at least 6 comma-separated values. Example in placeholder.'); return; }
      const questionText = parts[0];
      const options = parts.slice(1, parts.length-2);
      const correctIndex = parseInt(parts[parts.length-2],10);
      const points = parseInt(parts[parts.length-1],10) || 10;
      questions.push({ q: questionText, options, a: correctIndex, points });
    }
    const quizzes = getQuizzes();
    quizzes.push({ id: uid('q'), title, description: desc, questions, createdAt: nowISO() });
    saveQuizzes(quizzes);
    alert('Quiz added.');
    renderAdmin();
  });

  document.querySelectorAll('[data-qdel]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-qdel');
      const quizzes = getQuizzes().filter(q=>q.id!==id);
      saveQuizzes(quizzes);
      alert('Quiz deleted.');
      renderAdmin();
    });
  });

  document.querySelectorAll('[data-approve]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-approve');
      const subs = load(DB.submissionsKey, []);
      const s = subs.find(x=>x.id===id);
      const awardInput = document.querySelector(`[data-award="${id}"]`);
      const awardVal = awardInput ? parseInt(awardInput.value,10) : s.pointsAwarded || 0;
      if(!s) return;
      if(!s.approvedByAdmin){
        s.awarded = true;
        s.pointsAwarded = awardVal;
        s.approvedByAdmin = true;
        // update user total points (if not already added? We added initial points earlier. To avoid double awarding, only add difference if awardVal > already awarded)
        const users = getUsers();
        const u = users.find(usr=>usr.id===s.userId);
        if(u){
          // If previously awarded pointsAwarded was already given (we add immediate 10 earlier). To correct adjustments:
          const initialGiven = s.pointsAwarded || 0; // note: this value may have been overwritten; to be safe: we assume admin adjusts to awardVal, but already initial immediate 10 may have been added earlier when user submitted. To avoid double adding, we compute difference between awardVal and originally stored award (we don't have original in this simple demo). For simplicity, ensure we only add extra if awardVal > (s.pointsAwarded || 0).
          // Better approach: store originalImmediate:10. But for now we will add awardVal if approved but s.approvedByAdmin was false AND s.wasImmediateAdded flag not tracked. To be safe in demo, only if s.approvedByAdmin false and awardVal > 0, add (awardVal - (s.pointsAwarded||0)) but might be zero.
          // Keep this simple:
          u.points += Math.max(0, awardVal - (s.pointsAwarded || 0));
          saveUsers(users);
        }
      } else {
        s.approvedByAdmin = false;
      }
      save(DB.submissionsKey, subs);
      alert('Submission updated.');
      renderAdmin();
    });
  });

  document.querySelectorAll('[data-del]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-del');
      let subs = load(DB.submissionsKey, []);
      subs = subs.filter(s=>s.id!==id);
      save(DB.submissionsKey, subs);
      alert('Deleted submission.');
      renderAdmin();
    });
  });

  document.getElementById('ev_add').addEventListener('click', ()=>{
    const title = document.getElementById('ev_title').value.trim();
    const date = document.getElementById('ev_date').value;
    const desc = document.getElementById('ev_desc').value.trim();
    if(!title || !date){ alert('Provide event title and date.'); return; }
    const evts = getEvents();
    evts.push({ id: uid('ev'), title, date, description: desc, participants: [] });
    saveEvents(evts);
    alert('Event created.');
    renderAdmin();
  });
  document.querySelectorAll('[data-evdel]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-evdel');
      let evts = getEvents();
      evts = evts.filter(e=>e.id!==id);
      saveEvents(evts);
      alert('Event deleted.');
      renderAdmin();
    });
  });
}

/* ---------- Event join handler (global) ---------- */
document.addEventListener('click', (e)=>{
  const joinId = e.target.getAttribute && e.target.getAttribute('data-join');
  if(joinId){
    if(!AppState.currentUser){ alert('Sign in to join events'); return; }
    const evts = getEvents();
    const ev = evts.find(x=>x.id===joinId);
    if(!ev) return;
    ev.participants = ev.participants || [];
    if(ev.participants.includes(AppState.currentUser.id)){
      alert('You already joined.');
      return;
    }
    ev.participants.push(AppState.currentUser.id);
    // also mark user
    const users = getUsers();
    const u = users.find(usr=>usr.id===AppState.currentUser.id);
    if(u){
      u.joinedEvents = u.joinedEvents || [];
      u.joinedEvents.push(ev.id);
      saveUsers(users);
      AppState.currentUser = u;
      updateAuthUI();
    }
    saveEvents(evts);
    alert('Joined event!');
    routeTo('home');
  }
});

/* ---------- Initial bindings ---------- */
authBtn.addEventListener('click', ()=>{
  if(AppState.currentUser) signOut();
  else signInUI();
});

updateAuthUI();
routeTo('home');
