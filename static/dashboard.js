// ============================================
// Nexus — Dashboard Logic
// Personalisation engine based on branch/year
// ============================================

// ── GUARD: Require login ───────────────────
if (!localStorage.getItem('nexus_auth')) {
  window.location.href = 'login.html';
}

const student = JSON.parse(localStorage.getItem('nexus_student') || '{}');
const { name = 'Student', branch = 'CSE', year = '2', roll = '' } = student;

// ── BRANCH THEME SYSTEM ────────────────────
const BRANCH_THEMES = {
  CSE:  { color: '#3b82f6', grad: 'linear-gradient(135deg, #3b82f6, #6366f1)', dim: 'rgba(59,130,246,0.25)', label: 'Computer Science Eng.' },
  IT:   { color: '#6366f1', grad: 'linear-gradient(135deg, #6366f1, #8b5cf6)', dim: 'rgba(99,102,241,0.25)', label: 'Information Technology' },
  ECE:  { color: '#a855f7', grad: 'linear-gradient(135deg, #a855f7, #d946ef)', dim: 'rgba(168,85,247,0.25)', label: 'Electronics & Comm.' },
  EEE:  { color: '#8b5cf6', grad: 'linear-gradient(135deg, #8b5cf6, #a855f7)', dim: 'rgba(139,92,246,0.25)', label: 'Electrical Engineering' },
  ME:   { color: '#f97316', grad: 'linear-gradient(135deg, #f97316, #fb923c)', dim: 'rgba(249,115,22,0.25)',  label: 'Mechanical Engineering' },
  CE:   { color: '#84cc16', grad: 'linear-gradient(135deg, #84cc16, #a3e635)', dim: 'rgba(132,204,22,0.25)',  label: 'Civil Engineering' },
  BBA:  { color: '#10b981', grad: 'linear-gradient(135deg, #10b981, #34d399)', dim: 'rgba(16,185,129,0.25)',  label: 'Business Administration' },
  MBA:  { color: '#059669', grad: 'linear-gradient(135deg, #059669, #10b981)', dim: 'rgba(5,150,105,0.25)',   label: 'Master of Business Admin' },
  BCA:  { color: '#0ea5e9', grad: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', dim: 'rgba(14,165,233,0.25)',  label: 'Bachelor of Computer Apps' },
  MCA:  { color: '#06b6d4', grad: 'linear-gradient(135deg, #06b6d4, #22d3ee)', dim: 'rgba(6,182,212,0.25)',   label: 'Master of Computer Apps' },
  BCOM: { color: '#f59e0b', grad: 'linear-gradient(135deg, #f59e0b, #fbbf24)', dim: 'rgba(245,158,11,0.25)',  label: 'B.Com / M.Com' },
  BSc:  { color: '#14b8a6', grad: 'linear-gradient(135deg, #14b8a6, #2dd4bf)', dim: 'rgba(20,184,166,0.25)',  label: 'B.Sc Sciences' },
};

const theme = BRANCH_THEMES[branch] || BRANCH_THEMES['CSE'];

// Apply CSS variables
document.documentElement.style.setProperty('--branch-color', theme.color);
document.documentElement.style.setProperty('--branch-dim', theme.dim);
document.documentElement.style.setProperty('--branch-gradient', theme.grad);

// ── BRANCH SPLINE SCENES ────────────────────
// Different 3D scenes for different branch types
const BRANCH_SPLINE_SCENES = {
  // Tech/CS branches: futuristic abstract 3D scene
  CSE: 'https://prod.spline.design/kZDDjO5HuC9DJNFE/scene.splinecode',
  IT:  'https://prod.spline.design/kZDDjO5HuC9DJNFE/scene.splinecode',
  BCA: 'https://prod.spline.design/kZDDjO5HuC9DJNFE/scene.splinecode',
  MCA: 'https://prod.spline.design/kZDDjO5HuC9DJNFE/scene.splinecode',
  // Electronics/Engineering: different 3D scene
  ECE: 'https://prod.spline.design/Br7UXJsi9jKBVKAy/scene.splinecode',
  EEE: 'https://prod.spline.design/Br7UXJsi9jKBVKAy/scene.splinecode',
  ME:  'https://prod.spline.design/Br7UXJsi9jKBVKAy/scene.splinecode',
  CE:  'https://prod.spline.design/Br7UXJsi9jKBVKAy/scene.splinecode',
  // Business/Management: abstract design scene
  BBA:  'https://prod.spline.design/iLDrTFUYm1oqHhGI/scene.splinecode',
  MBA:  'https://prod.spline.design/iLDrTFUYm1oqHhGI/scene.splinecode',
  BCOM: 'https://prod.spline.design/iLDrTFUYm1oqHhGI/scene.splinecode',
  BSc:  'https://prod.spline.design/iLDrTFUYm1oqHhGI/scene.splinecode',
};

// Update spline scene for this student's branch
const dashSpline = document.getElementById('dash-spline');
if (dashSpline) {
  const sceneUrl = BRANCH_SPLINE_SCENES[branch] || BRANCH_SPLINE_SCENES['CSE'];
  dashSpline.setAttribute('url', sceneUrl);
}

// ── BRANCH CURRICULUM DATA ─────────────────
const BRANCH_DATA = {
  CSE: {
    subjects: ['Data Structures & Algo', 'Operating Systems', 'DBMS', 'Computer Networks', 'Software Engineering', 'Theory of Computation'],
    labs: [
      { icon: '💻', name: 'Programming Lab A', location: 'Block C, Room 101', status: 'open', timing: '8 AM – 8 PM' },
      { icon: '🔧', name: 'Systems Lab', location: 'Block C, Room 203', status: 'busy', timing: '9 AM – 6 PM' },
      { icon: '🌐', name: 'Networks Lab', location: 'Block D, Room 105', status: 'open', timing: '10 AM – 7 PM' },
      { icon: '🤖', name: 'AI & ML Lab', location: 'Block E, Room 301', status: 'open', timing: '9 AM – 9 PM' },
      { icon: '🛡️', name: 'Cybersecurity Lab', location: 'Block E, Room 204', status: 'closed', timing: 'Weekdays only' },
      { icon: '☁️', name: 'Cloud Computing Lab', location: 'Block F, Room 102', status: 'open', timing: '10 AM – 6 PM' },
    ],
    schedule: {
      Mon: [
        { time: '9:00', sub: 'Data Structures & Algo', room: 'LT-3', prof: 'Prof. Sharma', type: 'Lecture' },
        { time: '11:00', sub: 'Operating Systems', room: 'LT-5', prof: 'Prof. Verma', type: 'Lecture' },
        { time: '2:00', sub: 'Programming Lab A', room: 'C-101', prof: 'Prof. Nair', type: 'Lab' },
      ],
      Tue: [
        { time: '9:00', sub: 'DBMS', room: 'LT-2', prof: 'Prof. Mehta', type: 'Lecture' },
        { time: '11:00', sub: 'Computer Networks', room: 'LT-4', prof: 'Prof. Singh', type: 'Lecture' },
        { time: '3:00', sub: 'Tutorial — DSA', room: 'Room 202', prof: 'TA', type: 'Tutorial' },
      ],
      Wed: [
        { time: '10:00', sub: 'Software Engineering', room: 'LT-1', prof: 'Prof. Kapoor', type: 'Lecture' },
        { time: '2:00', sub: 'Networks Lab', room: 'D-105', prof: 'Prof. Singh', type: 'Lab' },
      ],
      Thu: [
        { time: '9:00', sub: 'Data Structures & Algo', room: 'LT-3', prof: 'Prof. Sharma', type: 'Lecture' },
        { time: '11:00', sub: 'Theory of Computation', room: 'LT-6', prof: 'Prof. Rao', type: 'Lecture' },
        { time: '3:00', sub: 'DBMS Lab', room: 'C-203', prof: 'Prof. Mehta', type: 'Lab' },
      ],
      Fri: [
        { time: '9:00', sub: 'Operating Systems', room: 'LT-5', prof: 'Prof. Verma', type: 'Lecture' },
        { time: '11:00', sub: 'Computer Networks', room: 'LT-4', prof: 'Prof. Singh', type: 'Lecture' },
        { time: '2:00', sub: 'AI & ML Lab', room: 'E-301', prof: 'Prof. Kumar', type: 'Lab' },
      ],
      Sat: [],
    },
    deadlines: [
      { name: 'DSA Assignment 3', sub: 'Data Structures', due: 'Oct 8', urgent: true },
      { name: 'OS Lab Report', sub: 'Operating Systems', due: 'Oct 11', urgent: false },
      { name: 'Mini Project Proposal', sub: 'Software Engineering', due: 'Oct 15', urgent: false },
    ],
    announcements: [
      { tag: 'Exam', title: 'Mid-Sem Schedule Released', body: 'Check the exam portal for your CSE mid-semester exam timetable. Exams begin Oct 20.' },
      { tag: 'Workshop', title: 'React & Next.js Workshop', body: 'A 3-day workshop on modern frontend development. Register by Oct 7. Venue: Tech Hub.' },
      { tag: 'Placement', title: 'Google Pre-Placement Talk', body: 'Google campus recruiters visit on Oct 14. All CSE 3rd & 4th year students must attend.' },
    ],
    resources: [
      { icon: '📒', title: 'DSA Notes — Unit 3', sub: 'Trees, Graphs, Heaps', meta: 'Uploaded Oct 3 · PDF', badge: 'New' },
      { icon: '📹', title: 'OS Lecture Recording', sub: 'Process Scheduling', meta: 'Video · 48 min', badge: 'Week 6' },
      { icon: '📝', title: 'DBMS Question Bank', sub: 'SQL, ER Diagrams, Normalisation', meta: 'PDF · 32 pages', badge: 'Exam Prep' },
      { icon: '🔗', title: 'Networking Lab Manual', sub: 'Subnetting & Routing Experiments', meta: 'PDF · 18 pages', badge: 'Lab' },
      { icon: '📖', title: 'Software Engg. Slides', sub: 'SDLC, Agile, Testing', meta: 'PPT · 85 slides', badge: 'Week 5' },
      { icon: '🎯', title: 'Placement Prep Kit', sub: 'DSA, System Design, HR', meta: 'PDF · 120 pages', badge: 'Career' },
    ],
    chatSuggestions: ['📌 Where is the AI Lab?', '📅 My next class?', '🖥️ Git best practices?', '📋 DSA assignment deadline?', '☕ Nearest café open?'],
    events: [
      { day: '07', mon: 'Oct', label: 'branch', title: 'Hackathon 2026 — 24hr Edition', desc: 'Open to all CSE/IT branches. Teams of 2–4. Register before Oct 5.', highlight: true },
      { day: '12', mon: 'Oct', label: 'academic', title: 'Research Symposium — AI & Society', desc: 'Seminar Hall A · 10 AM · Speakers from IIT & industry.', highlight: false },
      { day: '14', mon: 'Oct', label: 'placement', title: 'Google Pre-Placement Talk', desc: 'All 3rd & 4th year CSE students · Placement Cell Office', highlight: true },
    ],
    stats: { classes: 3, deadlines: 3, attendance: '87%', cgpa: '8.4' },
  },

  ECE: {
    subjects: ['Analog Electronics', 'Digital Signal Processing', 'VLSI Design', 'Microcontrollers', 'Communication Systems', 'Embedded Systems'],
    labs: [
      { icon: '⚡', name: 'Electronics Lab', location: 'Block B, Room 101', status: 'open', timing: '8 AM – 7 PM' },
      { icon: '📡', name: 'Communication Lab', location: 'Block B, Room 205', status: 'open', timing: '9 AM – 6 PM' },
      { icon: '🔌', name: 'VLSI Design Lab', location: 'Block B, Room 303', status: 'busy', timing: '10 AM – 8 PM' },
      { icon: '🤖', name: 'Embedded Systems Lab', location: 'Block C, Room 101', status: 'open', timing: '9 AM – 7 PM' },
      { icon: '📻', name: 'Antenna & RF Lab', location: 'Block B, Room 104', status: 'closed', timing: 'By appointment' },
      { icon: '🖥️', name: 'Signal Processing Lab', location: 'Block B, Room 202', status: 'open', timing: '10 AM – 6 PM' },
    ],
    schedule: {
      Mon: [
        { time: '9:00', sub: 'Analog Electronics', room: 'LT-7', prof: 'Prof. Rajan', type: 'Lecture' },
        { time: '11:00', sub: 'Digital Signal Processing', room: 'LT-8', prof: 'Prof. Ghosh', type: 'Lecture' },
        { time: '2:00', sub: 'Electronics Lab', room: 'B-101', prof: 'Prof. Rajan', type: 'Lab' },
      ],
      Tue: [
        { time: '9:00', sub: 'Communication Systems', room: 'LT-7', prof: 'Prof. Anand', type: 'Lecture' },
        { time: '11:00', sub: 'VLSI Design', room: 'B-303', prof: 'Prof. Iyer', type: 'Lab' },
      ],
      Wed: [
        { time: '10:00', sub: 'Microcontrollers', room: 'LT-9', prof: 'Prof. Pillai', type: 'Lecture' },
        { time: '2:00', sub: 'Signal Processing Lab', room: 'B-202', prof: 'Prof. Ghosh', type: 'Lab' },
      ],
      Thu: [
        { time: '9:00', sub: 'Embedded Systems', room: 'C-101', prof: 'Prof. Pillai', type: 'Lab' },
        { time: '2:00', sub: 'Analog Electronics', room: 'LT-7', prof: 'Prof. Rajan', type: 'Lecture' },
      ],
      Fri: [
        { time: '9:00', sub: 'Digital Signal Processing', room: 'LT-8', prof: 'Prof. Ghosh', type: 'Lecture' },
        { time: '11:00', sub: 'Communication Systems', room: 'LT-7', prof: 'Prof. Anand', type: 'Lecture' },
      ],
      Sat: [],
    },
    deadlines: [
      { name: 'DSP Assignment 2', sub: 'Digital Signal Processing', due: 'Oct 9', urgent: true },
      { name: 'VLSI Lab Report', sub: 'VLSI Design', due: 'Oct 12', urgent: false },
    ],
    announcements: [
      { tag: 'Workshop', title: 'Arduino & IoT Bootcamp', body: '2-day hands-on workshop. Oct 8–9, Embedded Systems Lab. Register at ECE office.' },
      { tag: 'Exam', title: 'Mid-Sem Practical Schedule', body: 'Practical exams for ECE students start Oct 21. Check notice board for slot details.' },
      { tag: 'Industry Visit', title: 'ISRO Visit — Oct 16', body: '3rd year ECE students are invited. Report to HOD office for registration by Oct 7.' },
    ],
    resources: [
      { icon: '📒', title: 'DSP Notes — Unit 2', sub: 'FFT, Z-Transform', meta: 'Uploaded Oct 4 · PDF', badge: 'New' },
      { icon: '🔌', title: 'VLSI Lab Manual', sub: 'Cadence, HDL coding', meta: 'PDF · 45 pages', badge: 'Lab' },
      { icon: '📡', title: 'Communication Systems Slides', sub: 'Modulation Techniques', meta: 'PPT · 60 slides', badge: 'Week 5' },
      { icon: '🤖', title: 'Embedded C Handbook', sub: 'AVR & ARM architecture', meta: 'PDF · 80 pages', badge: 'Lab' },
    ],
    chatSuggestions: ['⚡ Electronics Lab availability?', '📅 My next lecture?', '📻 VLSI lab booking?', '🔌 Embedded C resources?', '🎓 ISRO visit registration?'],
    events: [
      { day: '08', mon: 'Oct', label: 'branch', title: 'Arduino & IoT Bootcamp', desc: 'Embedded Systems Lab · 2 days · Hands-on with IoT sensors.', highlight: true },
      { day: '16', mon: 'Oct', label: 'industry', title: 'ISRO Industry Visit', desc: 'All 3rd year ECE · Register at HOD office by Oct 7.', highlight: true },
    ],
    stats: { classes: 2, deadlines: 2, attendance: '91%', cgpa: '8.1' },
  },

  ME: {
    subjects: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing Processes', 'CAD/CAM', 'Heat Transfer'],
    labs: [
      { icon: '⚙️', name: 'Machine Shop', location: 'Workshop Block, Level 1', status: 'busy', timing: '8 AM – 5 PM' },
      { icon: '🌡️', name: 'Thermal Lab', location: 'ME Block, Room 201', status: 'open', timing: '9 AM – 6 PM' },
      { icon: '💨', name: 'Fluid Mechanics Lab', location: 'ME Block, Room 102', status: 'open', timing: '9 AM – 5 PM' },
      { icon: '🖥️', name: 'CAD/CAM Lab', location: 'ME Block, Room 305', status: 'open', timing: '10 AM – 8 PM' },
      { icon: '🔩', name: 'Metrology Lab', location: 'Workshop Block, Level 2', status: 'closed', timing: 'By schedule' },
      { icon: '🔥', name: 'Heat Transfer Lab', location: 'ME Block, Room 104', status: 'open', timing: '10 AM – 6 PM' },
    ],
    schedule: {
      Mon: [
        { time: '8:30', sub: 'Thermodynamics', room: 'LT-10', prof: 'Prof. Pandey', type: 'Lecture' },
        { time: '11:00', sub: 'Machine Design', room: 'LT-11', prof: 'Prof. Joshi', type: 'Lecture' },
        { time: '2:00', sub: 'CAD/CAM Lab', room: 'ME-305', prof: 'Prof. Gupta', type: 'Lab' },
      ],
      Tue: [
        { time: '9:00', sub: 'Fluid Mechanics', room: 'LT-10', prof: 'Prof. Tiwari', type: 'Lecture' },
        { time: '11:00', sub: 'Heat Transfer', room: 'LT-12', prof: 'Prof. Das', type: 'Lecture' },
        { time: '2:00', sub: 'Fluid Mechanics Lab', room: 'ME-102', prof: 'Prof. Tiwari', type: 'Lab' },
      ],
      Wed: [
        { time: '9:00', sub: 'Manufacturing Processes', room: 'LT-11', prof: 'Prof. Rao', type: 'Lecture' },
        { time: '2:00', sub: 'Machine Shop', room: 'Workshop', prof: 'Prof. Rao', type: 'Lab' },
      ],
      Thu: [
        { time: '9:00', sub: 'Thermodynamics', room: 'LT-10', prof: 'Prof. Pandey', type: 'Lecture' },
        { time: '11:00', sub: 'Fluid Mechanics', room: 'LT-10', prof: 'Prof. Tiwari', type: 'Lecture' },
      ],
      Fri: [
        { time: '9:00', sub: 'Heat Transfer Lab', room: 'ME-104', prof: 'Prof. Das', type: 'Lab' },
        { time: '11:00', sub: 'Machine Design', room: 'LT-11', prof: 'Prof. Joshi', type: 'Lecture' },
      ],
      Sat: [],
    },
    deadlines: [
      { name: 'Thermodynamics Problem Set', sub: 'Thermodynamics', due: 'Oct 10', urgent: true },
      { name: 'CAD Model Submission', sub: 'CAD/CAM', due: 'Oct 14', urgent: false },
    ],
    announcements: [
      { tag: 'Industrial Visit', title: 'Tata Motors Plant Visit', body: '3rd Year ME students — visit to Tata Motors Pune facility. Oct 18. Apply by Oct 8.' },
      { tag: 'Workshop', title: 'SolidWorks Certification', body: '5-day intensive SolidWorks course. Limited seats (30). Registration open at ME office.' },
      { tag: 'Project', title: 'Mini Project Review', body: 'Mini project progress review scheduled for Oct 17. Submit reports by Oct 15 to your guide.' },
    ],
    resources: [
      { icon: '⚙️', name: 'ME Notes — Thermodynamics', sub: 'Cycles, Entropy, Availability', meta: 'PDF · 60 pages', badge: 'New' },
      { icon: '🖥️', name: 'CAD/CAM Manual', sub: 'SolidWorks step-by-step', meta: 'PDF · 40 pages', badge: 'Lab' },
      { icon: '💨', name: 'Fluid Mechanics Tutorials', sub: 'Bernoulli, Pipe Flow', meta: 'PDF · 25 pages', badge: 'Tutorial' },
    ],
    chatSuggestions: ['⚙️ Machine Shop open now?', '📅 Today\'s labs?', '🖥️ CAD lab slots?', '📊 Thermodynamics formula sheet?', '🚌 Tata Motors visit reg?'],
    events: [
      { day: '10', mon: 'Oct', label: 'branch', title: 'SolidWorks Certification Course', desc: 'ME Block, CAD Lab · 5 days · Certificate on completion.', highlight: true },
      { day: '18', mon: 'Oct', label: 'industry', title: 'Tata Motors Plant Visit', desc: '3rd Year ME · Apply by Oct 8 at ME office.', highlight: true },
    ],
    stats: { classes: 3, deadlines: 2, attendance: '89%', cgpa: '7.9' },
  },

  BBA: {
    subjects: ['Business Strategy', 'Marketing Management', 'Financial Accounting', 'HRM', 'Operations Management', 'Business Communication'],
    labs: [
      { icon: '💼', name: 'Business Simulation Lab', location: 'Management Block, 201', status: 'open', timing: '9 AM – 7 PM' },
      { icon: '📊', name: 'Finance & ERP Lab', location: 'Management Block, 105', status: 'open', timing: '9 AM – 6 PM' },
      { icon: '🗣️', name: 'Communication & GD Room', location: 'Management Block, 104', status: 'busy', timing: '10 AM – 5 PM' },
      { icon: '🖥️', name: 'Digital Marketing Lab', location: 'Management Block, 302', status: 'open', timing: '10 AM – 8 PM' },
    ],
    schedule: {
      Mon: [
        { time: '9:00', sub: 'Business Strategy', room: 'MB-301', prof: 'Prof. Malhotra', type: 'Lecture' },
        { time: '11:00', sub: 'Marketing Management', room: 'MB-302', prof: 'Prof. Khanna', type: 'Lecture' },
        { time: '2:00', sub: 'Finance Lab', room: 'MB-105', prof: 'Prof. Bajaj', type: 'Lab' },
      ],
      Tue: [
        { time: '9:00', sub: 'Financial Accounting', room: 'MB-303', prof: 'Prof. Bajaj', type: 'Lecture' },
        { time: '11:00', sub: 'HRM', room: 'MB-301', prof: 'Prof. Mehta', type: 'Lecture' },
      ],
      Wed: [
        { time: '10:00', sub: 'Operations Management', room: 'MB-304', prof: 'Prof. Sharma', type: 'Lecture' },
        { time: '2:00', sub: 'Business Communication', room: 'MB-104', prof: 'Prof. Nair', type: 'Tutorial' },
      ],
      Thu: [
        { time: '9:00', sub: 'Marketing Management', room: 'MB-302', prof: 'Prof. Khanna', type: 'Lecture' },
        { time: '11:00', sub: 'Business Strategy', room: 'MB-301', prof: 'Prof. Malhotra', type: 'Lecture' },
      ],
      Fri: [
        { time: '9:00', sub: 'HRM', room: 'MB-301', prof: 'Prof. Mehta', type: 'Lecture' },
        { time: '11:00', sub: 'Digital Marketing Lab', room: 'MB-302', prof: 'Prof. Khanna', type: 'Lab' },
      ],
      Sat: [],
    },
    deadlines: [
      { name: 'Marketing Plan Submission', sub: 'Marketing Management', due: 'Oct 9', urgent: true },
      { name: 'Financial Accounting Project', sub: 'Financial Accounting', due: 'Oct 15', urgent: false },
    ],
    announcements: [
      { tag: 'Industry Talk', title: 'CEO Series — Startup Ecosystems', body: 'Founder of Zomato speaks on campus. Oct 11. MB Auditorium. All BBA/MBA students.' },
      { tag: 'Competition', title: 'National B-Plan Competition', body: 'Register your startup idea. Prize pool ₹2L. Submission deadline Oct 12.' },
      { tag: 'Internship', title: 'Summer Internship Drive', body: 'Companies visiting for BBA internships: Oct 16–18. Submit your CV by Oct 10 to placement cell.' },
    ],
    resources: [
      { icon: '📊', name: 'Marketing Management Notes', sub: 'STP, 4Ps, Branding', meta: 'PDF · 55 pages', badge: 'New' },
      { icon: '💰', name: 'Accounting Formulas', sub: 'Ratios, Balance Sheet', meta: 'PDF · 15 pages', badge: 'Exam Prep' },
      { icon: '🎤', name: 'GD Practice Topics', sub: '30 trending topics with analysis', meta: 'PDF · 18 pages', badge: 'Career' },
    ],
    chatSuggestions: ['💼 B-Plan competition details?', '📅 My MBA classes?', '🗣️ GD room booking?', '📋 Internship deadline?', '📊 Financial Accounting notes?'],
    events: [
      { day: '11', mon: 'Oct', label: 'industry', title: 'CEO Series — Startup Ecosystems', desc: 'MB Auditorium · Zomato Founder · All BBA/MBA students.', highlight: true },
      { day: '12', mon: 'Oct', label: 'competition', title: 'National B-Plan Competition', desc: 'Submit your startup pitch. Prize: ₹2 Lakh. Deadline Oct 12.', highlight: true },
    ],
    stats: { classes: 3, deadlines: 2, attendance: '93%', cgpa: '8.7' },
  },
};

// Fallback to CSE data for unlisted branches
const data = BRANCH_DATA[branch] || BRANCH_DATA['CSE'];

// ── APPLY STUDENT INFO ─────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const firstName = name.split(' ')[0];
const yearLabel = year === 'PG' ? 'Post Graduate' : `${year}${['','st','nd','rd','th'][year]||'th'} Year`;

// Sidebar
document.getElementById('dash-avatar').textContent = firstName[0];
document.getElementById('dash-mini-name').textContent = firstName;
document.getElementById('dash-mini-meta').textContent = `${branch} · ${yearLabel}`;
document.getElementById('mobile-avatar').textContent = firstName[0];

// Hero
document.getElementById('hero-branch-pill').textContent = `${branch} · ${yearLabel}`;
document.getElementById('hero-greeting').textContent = `${getGreeting()}, ${firstName} 👋`;
document.getElementById('hero-subtext').textContent = `Here's your ${theme.label} personalised dashboard for today.`;

// Branch tags
['sched-branch-tag','labs-branch-tag','res-branch-tag'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.textContent = `${branch} · ${yearLabel}`;
});

// Stats
const stats = data.stats;
document.getElementById('sw-classes').textContent = stats.classes;
document.getElementById('sw-deadlines').textContent = stats.deadlines;
document.getElementById('sw-attendance').textContent = stats.attendance;
document.getElementById('sw-cgpa').textContent = stats.cgpa;

// Date
const today = new Date();
document.getElementById('today-date').textContent = today.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

// ── RENDER TODAY'S CLASSES ─────────────────
const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const todayKey = dayNames[today.getDay()] || 'Mon';
const todayClasses = data.schedule[todayKey] || [];

const classList = document.getElementById('class-list');
if (todayClasses.length === 0) {
  classList.innerHTML = `<div style="color:var(--muted);font-size:0.88rem;padding:1rem 0;">No classes scheduled for today! 🎉</div>`;
} else {
  classList.innerHTML = todayClasses.map(c => `
    <div class="class-item">
      <span class="class-time">${c.time}</span>
      <div>
        <div class="class-name">${c.sub}</div>
        <div class="class-room">${c.room} · ${c.prof}</div>
      </div>
      <span class="sched-type" style="margin-top:0;">${c.type}</span>
    </div>
  `).join('');
}

// ── RENDER DEADLINES ───────────────────────
const deadlineList = document.getElementById('deadline-list');
deadlineList.innerHTML = data.deadlines.map(d => `
  <div class="deadline-item">
    <div class="dl-left">
      <div class="dl-dot ${d.urgent ? 'urgent' : ''}"></div>
      <div>
        <div class="dl-name">${d.name}</div>
        <div class="dl-sub">${d.sub}</div>
      </div>
    </div>
    <div class="dl-due">Due ${d.due}</div>
  </div>
`).join('');

// ── RENDER ANNOUNCEMENTS ───────────────────
const annList = document.getElementById('announcement-list');
annList.innerHTML = data.announcements.map(a => `
  <div class="ann-card">
    <div class="ann-tag">${a.tag}</div>
    <div class="ann-title">${a.title}</div>
    <div class="ann-body">${a.body}</div>
  </div>
`).join('');

// ── RENDER SCHEDULE ────────────────────────
let activeDay = todayKey === 'Sun' ? 'Mon' : todayKey;

function renderSchedule(day) {
  const timeline = document.getElementById('schedule-timeline');
  const classes = data.schedule[day] || [];
  if (classes.length === 0) {
    timeline.innerHTML = `<div class="no-class">🎉 No classes scheduled for ${day}. Enjoy your day!</div>`;
    return;
  }
  timeline.innerHTML = classes.map((c, i) => `
    <div class="sched-item">
      <div class="sched-time-col">
        <span class="sched-time">${c.time} AM</span>
      </div>
      <div class="sched-dot-line">
        <div class="sched-dot"></div>
        ${i < classes.length - 1 ? '<div class="sched-line"></div>' : ''}
      </div>
      <div style="flex:1;padding-bottom:${i < classes.length-1?'0':'0'}">
        <div class="sched-card">
          <div class="sched-subject">${c.sub}</div>
          <div class="sched-meta">
            <span>🕐 ${c.time}</span>
            <span>📍 ${c.room}</span>
            <span>👤 ${c.prof}</span>
          </div>
          <span class="sched-type">${c.type}</span>
        </div>
      </div>
    </div>
  `).join('');
}

renderSchedule(activeDay);

document.querySelectorAll('.day-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    activeDay = this.dataset.day;
    renderSchedule(activeDay);
  });
});

// ── RENDER LABS ────────────────────────────
const labsGrid = document.getElementById('labs-grid');
labsGrid.innerHTML = data.labs.map(l => `
  <div class="lab-card">
    <div class="lab-icon">${l.icon}</div>
    <div class="lab-name">${l.name}</div>
    <div class="lab-location">📍 ${l.location}</div>
    <span class="lab-status lab-${l.status}">${l.status === 'open' ? '● Open' : l.status === 'busy' ? '◐ Busy' : '○ Closed'}</span>
    <div class="lab-timing">🕐 ${l.timing}</div>
  </div>
`).join('');

// ── RENDER EVENTS ──────────────────────────
const allEvents = [
  ...data.events,
  { day: '10', mon: 'Oct', label: 'cultural', title: 'Cultural Night — Rhythm & Roots', desc: 'Open Amphitheatre · 6 PM onwards · Free entry.', highlight: false },
  { day: '15', mon: 'Oct', label: 'sports', title: 'Inter-College Sports Meet', desc: 'Sports Complex · All day · Multiple disciplines.', highlight: false },
];

function renderEvents(filter = 'all') {
  const eventsGrid = document.getElementById('events-grid');
  const filtered = filter === 'all' ? allEvents :
    filter === 'branch' ? allEvents.filter(e => e.highlight) :
    allEvents.filter(e => e.label.includes(filter));

  eventsGrid.innerHTML = filtered.map(e => `
    <div class="ev-card" data-highlight="${e.highlight}">
      <div class="ev-date-row">
        <div class="ev-date-box">
          <span class="ev-day-n">${e.day}</span>
          <span class="ev-mon">${e.mon}</span>
        </div>
        <span class="ev-label">${e.highlight ? branch + ' Pick' : e.label.charAt(0).toUpperCase() + e.label.slice(1)}</span>
      </div>
      <div class="ev-title">${e.title}</div>
      <div class="ev-desc">${e.desc}</div>
      <button class="ev-rsvp-btn" onclick="toggleRsvp(this)">RSVP</button>
    </div>
  `).join('');
}

renderEvents();

window.toggleRsvp = function(btn) {
  btn.classList.toggle('rsvped');
  btn.textContent = btn.classList.contains('rsvped') ? '✓ Going!' : 'RSVP';
};

document.querySelectorAll('.ef-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.ef-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    renderEvents(this.dataset.filter);
  });
});

// ── RENDER RESOURCES ───────────────────────
const resGrid = document.getElementById('resources-grid');
resGrid.innerHTML = data.resources.map(r => `
  <div class="res-card">
    <div class="res-icon">${r.icon}</div>
    <div class="res-title">${r.title || r.name}</div>
    <div class="res-sub">${r.sub}</div>
    <div class="res-meta">${r.meta}</div>
    <br/><span class="res-badge">${r.badge}</span>
  </div>
`).join('');

// ── CHAT SUGGESTIONS ───────────────────────
const sugContainer = document.getElementById('chat-suggestions');
sugContainer.innerHTML = data.chatSuggestions.map(s => `
  <button class="sug-btn" data-q="${s.replace(/^[^\w]+ /, '')}">${s}</button>
`).join('');

sugContainer.querySelectorAll('.sug-btn').forEach(btn => {
  btn.addEventListener('click', () => sendDashChat(btn.dataset.q));
});

// ── PERSONALISED CHAT ──────────────────────
const CHAT_RESPONSES = {
  greetings: ['hello','hi','hey','howdy'],
  schedule: ['class','schedule','timetable','lecture','when','next','today'],
  deadline: ['deadline','assignment','due','submit','submission','exam'],
  lab: ['lab','room','available','open','empty','book'],
  dining: ['food','eat','menu','cafeteria','canteen','lunch','hungry'],
  resources: ['notes','slides','material','book','pdf','resource'],
  events: ['event','hackathon','fest','cultural','sports','competition'],
  general: [],
};

const branchReplies = {
  greetings: [
    `Hey ${firstName}! 👋 Ready for your ${branch} day? Ask me about your classes, labs, or anything on campus.`,
    `Hi ${firstName}! I've got your ${theme.label} schedule loaded. What do you need?`,
  ],
  schedule: [
    `📅 Your next class is **${data.schedule[todayKey]?.[0]?.sub || 'not scheduled today'}** at ${data.schedule[todayKey]?.[0]?.time || 'N/A'} in ${data.schedule[todayKey]?.[0]?.room || 'N/A'}. Need directions?`,
    `📋 You have ${todayClasses.length} classes scheduled today. Check your full schedule in the Schedule tab!`,
  ],
  deadline: [
    `⏰ Closest deadline: **${data.deadlines[0]?.name}** due **${data.deadlines[0]?.due}**. You've got time — want a reminder?`,
    `📋 You have ${data.deadlines.length} upcoming deadlines. The most urgent is ${data.deadlines.find(d=>d.urgent)?.name || data.deadlines[0]?.name}.`,
  ],
  lab: [
    `🔬 Your ${branch} lab **${data.labs.find(l=>l.status==='open')?.name || 'labs are'}** is currently open at ${data.labs.find(l=>l.status==='open')?.location || 'your block'}. Head over!`,
    `📍 Open labs right now: ${data.labs.filter(l=>l.status==='open').map(l=>l.name).join(', ')}. Busy: ${data.labs.filter(l=>l.status==='busy').map(l=>l.name).join(', ') || 'none'}.`,
  ],
  dining: [
    `🍽️ Main Cafeteria is serving Dal Makhani and Jeera Rice today! Wait time is ~5 mins. Tech Hub Café also open for coffee and snacks.`,
    `☕ Tech Hub Café has fresh sandwiches and zero queue right now. Main Cafeteria closes at 9 PM.`,
  ],
  resources: [
    `📚 I've found ${data.resources.length} resources for ${branch}. Check your Resources tab — all notes and lab manuals are there.`,
    `📒 Latest upload: **${data.resources[0]?.title}** — ${data.resources[0]?.sub}. Check the Resources section!`,
  ],
  events: [
    `🎉 ${branch}-relevant events: ${data.events.map(e=>e.title).join(', ')}. RSVP in the Events tab before spots fill up!`,
    `📅 Upcoming: **${data.events[0]?.title}** on Oct ${data.events[0]?.day}. Sounds right for you — interested?`,
  ],
  general: [
    `I'm your personalised ${branch} assistant! I know your schedule, labs, and deadlines. Ask me anything specific.`,
    `As a ${branch} student, I have your labs, timetable, and resources all set up. What would you like to know?`,
  ],
};

function categoriseChat(text) {
  const l = text.toLowerCase();
  for (const [cat, kws] of Object.entries(CHAT_RESPONSES)) {
    if (kws.some(k => l.includes(k))) return cat;
  }
  return 'general';
}

function getReply(text) {
  const cat = categoriseChat(text);
  const pool = branchReplies[cat] || branchReplies.general;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function appendMsg(text, isUser) {
  const msgs = document.getElementById('dash-chat-msgs');
  const div = document.createElement('div');
  div.className = `msg-${isUser ? 'user' : 'bot'}`;
  div.innerHTML = `
    <div class="chat-bubble">${text}</div>
    <div class="msg-time">${getTime()}</div>
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function appendTyping() {
  const msgs = document.getElementById('dash-chat-msgs');
  const div = document.createElement('div');
  div.className = 'msg-bot';
  div.innerHTML = `<div class="typing-row"><div class="t-dot"></div><div class="t-dot"></div><div class="t-dot"></div></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

async function sendDashChat(override) {
  const input = document.getElementById('dash-chat-input');
  const text = (override || input.value).trim();
  if (!text) return;
  input.value = '';

  appendMsg(text, true);
  const typer = appendTyping();

  await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
  typer.remove();
  appendMsg(getReply(text), false);
}

document.getElementById('dash-send-btn').addEventListener('click', () => sendDashChat());
document.getElementById('dash-chat-input').addEventListener('keypress', e => {
  if (e.key === 'Enter') sendDashChat();
});

// Initial greeting in chat
setTimeout(() => {
  appendMsg(`Hey ${firstName}! 👋 I'm your personalised Nexus assistant for <strong>${theme.label}</strong>. I know your schedule, labs, and deadlines. Ask me anything!`, false);
}, 400);

// ── SIDEBAR NAVIGATION ─────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    const sec = this.dataset.section;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
    this.classList.add('active');
    const target = document.getElementById(`section-${sec}`);
    if (target) target.classList.add('active');
    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
  });
});

// Quick actions on hero
document.querySelectorAll('.qa-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const sec = this.dataset.section;
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.section === sec);
    });
    document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${sec}`)?.classList.add('active');
  });
});

// Card links
document.querySelectorAll('.card-link[data-section]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const sec = this.dataset.section;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.section === sec));
    document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${sec}`)?.classList.add('active');
  });
});

// ── MOBILE HAMBURGER ───────────────────────
document.getElementById('hamburger-dash').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ── LOGOUT ────────────────────────────────
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('nexus_auth');
  localStorage.removeItem('nexus_student');
  window.location.href = 'login.html';
});

console.log(`%cNexus Dashboard — ${branch} Mode`, `color:${theme.color};font-size:14px;font-weight:bold;`);
