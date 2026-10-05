// ============================================
// Nexus — Login Page Logic
// ============================================

// Demo credentials (in a real app, this is server-side)
const DEMO_USERS = [
  { roll: '22CSE001', branch: 'CSE', year: '2', password: 'nexus123', name: 'Arjun Mehta' },
  { roll: '22ECE042', branch: 'ECE', year: '2', password: 'nexus123', name: 'Priya Sharma' },
  { roll: '21ME015',  branch: 'ME',  year: '3', password: 'nexus123', name: 'Rohan Verma'  },
  { roll: '23BBA007', branch: 'BBA', year: '1', password: 'nexus123', name: 'Sneha Patel'  },
  { roll: '22IT033',  branch: 'IT',  year: '2', password: 'nexus123', name: 'Kabir Singh'  },
];

// ── AUTH TABS ──────────────────────────────
const tabLogin  = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const formLogin  = document.getElementById('login-form');
const formSignup = document.getElementById('signup-form');

tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabSignup.classList.remove('active');
  formLogin.classList.add('active');
  formSignup.classList.remove('active');
});

tabSignup.addEventListener('click', () => {
  tabSignup.classList.add('active');
  tabLogin.classList.remove('active');
  formSignup.classList.add('active');
  formLogin.classList.remove('active');
});

// ── PASSWORD TOGGLE ────────────────────────
const toggleBtn = document.getElementById('toggle-pass');
const passInput = document.getElementById('login-pass');
toggleBtn.addEventListener('click', () => {
  const isText = passInput.type === 'text';
  passInput.type = isText ? 'password' : 'text';
  document.getElementById('eye-icon').innerHTML = isText
    ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
    : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
});

// ── PASSWORD STRENGTH ──────────────────────
const suPass = document.getElementById('su-pass');
const strengthBar = document.getElementById('strength-bar');
const strengthLabel = document.getElementById('strength-label');

suPass && suPass.addEventListener('input', () => {
  const val = suPass.value;
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { pct: '25%', color: '#f87171', label: 'Weak' },
    { pct: '50%', color: '#fb923c', label: 'Fair' },
    { pct: '75%', color: '#facc15', label: 'Good' },
    { pct: '100%', color: '#4ade80', label: 'Strong' },
  ];

  const lvl = levels[Math.max(0, score - 1)] || { pct: '0%', color: 'transparent', label: '' };
  strengthBar.style.width = lvl.pct;
  strengthBar.style.background = lvl.color;
  strengthLabel.textContent = lvl.label;
  strengthLabel.style.color = lvl.color;
});

// ── TOAST ──────────────────────────────────
function showToast(msg, type = 'info') {
  const toast = document.getElementById('auth-toast');
  toast.textContent = msg;
  toast.className = `auth-toast show ${type}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── LOGIN SUBMIT ───────────────────────────
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const roll   = document.getElementById('login-roll').value.trim();
  const branch = document.getElementById('login-branch').value;
  const year   = document.getElementById('login-year').value;
  const pass   = document.getElementById('login-pass').value;
  const btn    = document.getElementById('login-btn');

  if (!roll || !branch || !year || !pass) {
    showToast('⚠️ Please fill in all fields', 'error');
    return;
  }

  btn.classList.add('loading');
  await sleep(1200);

  // Check demo users first
  const demoUser = DEMO_USERS.find(u => u.roll === roll && u.password === pass);

  // Persist session
  const studentData = demoUser
    ? { name: demoUser.name, roll, branch, year }
    : { name: rollToName(roll), roll, branch, year };

  localStorage.setItem('nexus_student', JSON.stringify(studentData));
  localStorage.setItem('nexus_auth', 'true');

  showToast('✅ Signed in! Loading your campus…', 'success');
  await sleep(800);
  window.location.href = 'dashboard.html';
});

// ── SIGNUP SUBMIT ──────────────────────────
formSignup.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name   = document.getElementById('su-name').value.trim();
  const roll   = document.getElementById('su-roll').value.trim();
  const email  = document.getElementById('su-email').value.trim();
  const branch = document.getElementById('su-branch').value;
  const year   = document.getElementById('su-year').value;
  const pass   = document.getElementById('su-pass').value;
  const btn    = document.getElementById('signup-btn');

  if (!name || !roll || !email || !branch || !year || !pass) {
    showToast('⚠️ Please fill in all fields', 'error');
    return;
  }
  if (pass.length < 8) {
    showToast('⚠️ Password must be at least 8 characters', 'error');
    return;
  }

  btn.classList.add('loading');
  await sleep(1400);

  const studentData = { name, roll, email, branch, year };
  localStorage.setItem('nexus_student', JSON.stringify(studentData));
  localStorage.setItem('nexus_auth', 'true');

  showToast('🎉 Account created! Welcome to Nexus!', 'success');
  await sleep(900);
  window.location.href = 'dashboard.html';
});

// ── HELPERS ────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function rollToName(roll) {
  // Generate a plausible name from roll number prefix
  const names = ['Arjun Kumar', 'Priya Singh', 'Rohan Gupta', 'Sneha Patel', 'Kabir Verma', 'Ananya Roy', 'Dev Nair', 'Riya Sharma'];
  const idx = parseInt(roll.replace(/\D/g, '').slice(-2)) % names.length;
  return names[idx] || 'Campus Student';
}

// ── REDIRECT IF ALREADY LOGGED IN ──────────
if (localStorage.getItem('nexus_auth') === 'true') {
  // Optional: Auto-redirect to dashboard
  // window.location.href = 'dashboard.html';
}

// ── FILL REMEMBERED LOGIN ──────────────────
const remembered = localStorage.getItem('nexus_remembered');
if (remembered) {
  const r = JSON.parse(remembered);
  document.getElementById('login-roll').value = r.roll || '';
  const br = document.getElementById('login-branch');
  if (r.branch) br.value = r.branch;
  document.getElementById('remember-me').checked = true;
}

document.getElementById('login-form').addEventListener('change', () => {
  if (document.getElementById('remember-me').checked) {
    localStorage.setItem('nexus_remembered', JSON.stringify({
      roll: document.getElementById('login-roll').value,
      branch: document.getElementById('login-branch').value
    }));
  }
});
