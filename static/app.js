// ============================================
// Nexus — AI Smart Campus Assistant
// Interactive JavaScript
// ============================================

// ─── NAVBAR SCROLL EFFECT ─────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ─── HAMBURGER MENU ───────────────────────
const hamburger = document.getElementById('hamburger');
hamburger.addEventListener('click', () => {
  document.querySelector('.nav-links') && toggleMobileMenu();
});

function toggleMobileMenu() {
  const nl = document.querySelector('.nav-links');
  if (!nl) return;
  if (nl.style.display === 'flex') {
    nl.style.display = '';
    nl.style.flexDirection = '';
  } else {
    nl.style.cssText = 'display:flex;flex-direction:column;position:fixed;top:70px;left:0;right:0;background:rgba(14,13,11,0.95);backdrop-filter:blur(16px);padding:1.5rem 2rem;gap:1.2rem;border-bottom:1px solid rgba(255,255,255,0.07);z-index:999;';
  }
}

// ─── CAMPUS TAB SYSTEM ────────────────────
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    const content = document.getElementById('tab-' + target);
    if (content) content.classList.add('active');
  });
});

// ─── FEATURE CARDS ANIMATION ──────────────
const featureCards = document.querySelectorAll('.feature-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0);
      entry.target.style.animationDelay = delay + 'ms';
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

featureCards.forEach(card => observer.observe(card));

// ─── CHAT ASSISTANT ───────────────────────
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const clearChat = document.getElementById('clearChat');

// AI Response Database
const responses = {
  greetings: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'howdy'],
  navigation: ['where', 'find', 'location', 'building', 'room', 'lab', 'hall', 'block', 'how to get', 'navigate', 'directions'],
  dining: ['food', 'eat', 'meal', 'menu', 'cafeteria', 'canteen', 'lunch', 'dinner', 'breakfast', 'cafe', 'hungry'],
  schedule: ['class', 'schedule', 'timetable', 'lecture', 'deadline', 'assignment', 'exam', 'test', 'due', 'when'],
  events: ['event', 'hackathon', 'fest', 'cultural', 'sports', 'competition', 'club', 'activity'],
  library: ['library', 'book', 'journal', 'study room', 'reading', 'borrow', 'return'],
  study: ['study', 'partner', 'group', 'collaboration', 'help', 'tutor'],
  weather: ['weather', 'rain', 'temperature', 'cold', 'hot', 'outside'],
  wifi: ['wifi', 'internet', 'network', 'connection', 'password'],
  emergency: ['emergency', 'help', 'medical', 'doctor', 'ambulance', 'security', 'danger'],
};

const botReplies = {
  greetings: [
    "Hey! Great to see you here 👋 What can I help you with today — navigation, schedule, food, or something else?",
    "Hello! I'm Nexus, your campus companion. Ask me anything about the campus and I'll get you sorted.",
    "Hi there! How's your day going? Need directions, menu info, or something about your classes?"
  ],
  navigation: [
    "📍 Sure! The building you're looking for is likely a 5–10 minute walk from your current spot. Head past the central fountain, take the left path at the library junction. Want me to show on the campus map?",
    "🗺️ Got it! Tech Hub is the closest open building right now with empty study pods. The Science Block and Arts Centre are also accessible. Which one do you need?",
    "📍 The fastest route to the Main Hall from your position is through the north gate walkway — avoids the construction near Gate 3. About 6 minutes on foot.",
    "🏛️ Room B-204 is currently unoccupied until 3 PM — it fits up to 12 people. Library Study Room 7 is also free if you need a quieter spot."
  ],
  dining: [
    "🍽️ Today's Main Cafeteria special is Dal Makhani with Jeera Rice, Garden Salad, and Kheer for dessert. Wait time is about 5 minutes right now — pretty good for lunch hour!",
    "☕ Tech Hub Café is open! They've got great cappuccinos and fresh sandwiches. No queue right now — perfect timing.",
    "🍱 The South Food Court opens at 11 AM on weekdays. Main Cafeteria and Tech Hub Café are your best bets right now. Any dietary preferences I should know about?",
    "🥗 If you're looking for something healthy, the cafeteria salad bar is open and they just restocked. Vegetarian and vegan options are both available today."
  ],
  schedule: [
    "📅 Based on your timetable, your next lecture is at 2:00 PM in Room C-101 — Algorithms with Prof. Sharma. You've got about 40 minutes, so plenty of time to grab food first.",
    "⏰ Your upcoming deadlines: Data Structures assignment due Oct 8, Operating Systems lab report due Oct 11. Want me to set reminders?",
    "📋 You have office hours with Prof. Mehta on Thursday 3–5 PM in Staff Room 12. No prior appointment needed — just walk in.",
    "📚 Your Algorithms class is on Tuesday and Thursday, 2–3:30 PM. Next class is Thursday. Your attendance so far is 87% — looking solid!"
  ],
  events: [
    "🎉 There's a Hackathon next week — 24hr edition, Oct 7–8 at Tech Hub! Team size: 2–4. Registration closes Oct 5. Want me to drop the link?",
    "🎭 Cultural Night 'Rhythm & Roots' is on Oct 10 at the Open Amphitheatre from 6 PM. Free entry! Live performances, food stalls, and more.",
    "🔬 There's a Research Symposium on AI & Society on Oct 12, Seminar Hall A. Quite a few interesting speakers lined up — including one from IIT Bombay.",
    "⚽ Inter-College Sports Meet is Oct 15 at the Sports Complex. Events include cricket, football, badminton, and athletics. Registrations are open!"
  ],
  library: [
    "📚 Central Library has 142 seats available right now and 8 study rooms free. Main floor hours today: 8 AM – 10 PM. The 24-hour Reading Room is always open.",
    "📖 Digital Lab access requires your student ID card. They have 80 workstations with access to JSTOR, IEEE Xplore, and the university archive.",
    "📋 You can borrow up to 5 books for 14 days. Renewals can be done online through the library portal or just ask me — I'll handle it!",
    "🔍 Found some relevant results! Try searching: 'Introduction to Algorithms' by Cormen — available in Section A, Shelf 7. Digital copy also accessible via the library portal."
  ],
  study: [
    "🤝 Looking for a study partner for Algorithms? I found 3 students in your batch who marked themselves as available this week. Want me to send a connect request?",
    "📖 Study groups for your courses usually meet at the Library Reading Room on weekday evenings. There's a Data Structures group meeting today at 5 PM — open to join!",
    "💡 Peer tutoring sessions are available for most core subjects. The schedule is posted on the student portal. Senior students volunteer — it's free!",
  ],
  weather: [
    "🌤️ Current campus weather: 26°C, partly cloudy. Low chance of rain today (8%). Nice day to walk to your next class!",
    "🌦️ Heads up — there's a 60% chance of light rain around 4–6 PM today. Might want to carry an umbrella or wait it out in the library.",
    "☀️ Beautiful day today! 24°C with a gentle breeze. The outdoor study spots near the central garden are perfect right now."
  ],
  wifi: [
    "📶 Campus WiFi: Connect to 'CAMPUS_SECURE' and login with your student ID + password. Coverage is campus-wide including all hostels.",
    "🔌 If you're having WiFi issues in the Tech Hub, the booster near Lab 3 was just serviced — should be working fine now. Still having trouble? IT helpdesk is on the ground floor."
  ],
  emergency: [
    "🚨 Campus emergency contacts: Security Control — Ext. 1100. Medical Centre — Ext. 1200 (open 24/7). For immediate danger, call 112. Stay safe — what do you need?",
    "🏥 The campus medical centre is in Building H, Ground Floor. Open 24/7 for emergencies. A doctor is on duty right now. Should I guide you there?"
  ],
  default: [
    "Hmm, let me think about that... I'm still learning new campus details every day! Could you rephrase or give me a bit more context?",
    "Good question! That one's a bit outside my current knowledge, but I'll flag it for the team. In the meantime, the admin office (Room 101, Main Building) can help.",
    "I don't have a precise answer for that just yet — but the Student Services desk on the ground floor of the Main Hall usually knows everything! Want directions?",
    "That's an interesting one! I'm not 100% sure, but I'd recommend checking the official student portal or asking at the department office. Anything else I can help with?"
  ]
};

function categoriseInput(text) {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(responses)) {
    if (keywords.some(k => lower.includes(k))) return category;
  }
  return 'default';
}

function getReply(text) {
  const cat = categoriseInput(text);
  const pool = botReplies[cat] || botReplies.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getTimeString() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(text, isUser = false, isTyping = false) {
  const div = document.createElement('div');
  div.classList.add('msg');
  if (isUser) div.classList.add('user-msg');
  else div.classList.add('bot-msg');
  if (isTyping) div.classList.add('typing-bubble');

  const bubble = document.createElement('div');
  bubble.classList.add('msg-bubble');

  if (isTyping) {
    bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  } else {
    bubble.innerHTML = text;
  }

  const time = document.createElement('span');
  time.classList.add('msg-time');
  time.textContent = getTimeString();

  div.appendChild(bubble);
  if (!isTyping) div.appendChild(time);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

async function sendMessage(messageText) {
  const text = (messageText || chatInput.value).trim();
  if (!text) return;

  chatInput.value = '';
  appendMessage(text, true);

  // Show typing indicator
  const typingEl = appendMessage('', false, true);

  // Simulate response delay
  const delay = 800 + Math.random() * 600;
  await new Promise(r => setTimeout(r, delay));

  typingEl.remove();
  appendMessage(getReply(text), false);
}

sendBtn.addEventListener('click', () => sendMessage());
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Quick prompt buttons
document.querySelectorAll('.qp-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    sendMessage(btn.dataset.q);
  });
});

// Clear chat
clearChat.addEventListener('click', () => {
  chatMessages.innerHTML = '';
  appendMessage("Chat cleared! I'm here whenever you need me. What can I help you with? 😊", false);
});

// ─── LIBRARY BOOK SEARCH ──────────────────
const bookSearchBtn = document.getElementById('book-search-btn');
const bookSearchInput = document.getElementById('book-search');
const libResults = document.getElementById('lib-results');

const sampleBooks = [
  { title: 'Introduction to Algorithms', author: 'Cormen et al.', available: true, section: 'A-7' },
  { title: 'Clean Code', author: 'Robert C. Martin', available: true, section: 'B-3' },
  { title: 'The Pragmatic Programmer', author: 'Thomas & Hunt', available: false, section: 'B-4' },
  { title: 'Design Patterns', author: 'Gang of Four', available: true, section: 'C-2' },
  { title: 'Operating Systems: Three Easy Pieces', author: 'Arpaci-Dusseau', available: true, section: 'A-12' },
  { title: 'Artificial Intelligence: A Modern Approach', author: 'Russell & Norvig', available: false, section: 'D-1' },
  { title: 'Computer Networks', author: 'Andrew Tanenbaum', available: true, section: 'A-5' },
  { title: 'Database System Concepts', author: 'Silberschatz et al.', available: true, section: 'C-8' },
];

function searchBooks() {
  const q = bookSearchInput.value.trim().toLowerCase();
  if (!q) {
    libResults.innerHTML = '<p style="color:var(--text-dim);font-size:0.8rem;">Enter a search term above.</p>';
    return;
  }

  const matches = sampleBooks.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    libResults.innerHTML = '<p style="color:var(--text-muted);font-size:0.82rem;">No results found. Try a different keyword.</p>';
    return;
  }

  libResults.innerHTML = matches.map(b => `
    <div class="lib-result-item">
      <span>${b.available ? '✅' : '❌'}</span>
      <div>
        <div style="color:var(--text-main);font-weight:500;">${b.title}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">${b.author} · Section ${b.section} · ${b.available ? '<span style="color:#4ade80">Available</span>' : '<span style="color:#f87171">Checked out</span>'}</div>
      </div>
    </div>
  `).join('');
}

bookSearchBtn.addEventListener('click', searchBooks);
bookSearchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchBooks(); });

// ─── RSVP BUTTONS ─────────────────────────
document.querySelectorAll('.ev-rsvp').forEach(btn => {
  btn.addEventListener('click', function() {
    if (this.textContent === 'RSVP') {
      this.textContent = '✓ Going';
      this.style.background = 'var(--amber)';
      this.style.color = 'var(--bg)';
    } else {
      this.textContent = 'RSVP';
      this.style.background = '';
      this.style.color = '';
    }
  });
});

// ─── SMOOTH SECTION REVEAL ────────────────
const revealEls = document.querySelectorAll('.features-header, .campus-header, .about-text, .assistant-info, .section-tag');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObserver.observe(el);
});

// ─── MAP BUILDING CLICK ───────────────────
document.querySelectorAll('.map-building').forEach(b => {
  b.addEventListener('click', function() {
    document.querySelectorAll('.map-building').forEach(x => x.classList.remove('active-bld'));
    this.classList.add('active-bld');

    // Ask Nexus about the building
    const name = this.querySelector('.bld-name').textContent;
    setTimeout(() => {
      // Switch to assistant section, send message
      const msg = `Tell me about the ${name}`;
      chatInput.value = msg;
      chatInput.focus();
    }, 300);
  });
});

console.log('%cNexus Campus AI 🎓', 'color: #d4843a; font-size: 18px; font-weight: bold;');
console.log('%cBuilt for students, by students.', 'color: #8a8278; font-size: 12px;');
