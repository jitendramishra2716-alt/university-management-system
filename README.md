# Nexus — AI Smart Campus Assistant

A Gen Z-focused, student-personalized AI campus assistant with 3D Spline animations.

## Features
- 🎓 **Student Personalization** — Branch-specific dashboards (CSE, ECE, ME, BBA, IT, and more)
- 🌐 **Spline 3D Animations** — 3 different Spline 3D scenes across the site, branch-specific on dashboard
- 📅 **Smart Schedule** — Branch-wise class timetables and deadline tracking
- 💬 **AI Chat** — Intelligent campus Q&A with context-aware responses
- 🔬 **Lab Availability** — Real-time lab status and room finder
- 🎉 **Events** — Campus events with RSVP functionality
- 📚 **Resources** — Branch-specific study materials and notes

## Pages
- `/` — Landing page (Spline 3D hero, features, chat demo)
- `/login` — Student login (Spline 3D panel) with Sign Up
- `/dashboard` — Personalized student dashboard (branch-specific Spline scenes)

## Demo Accounts
| Roll | Branch | Year | Password |
|------|--------|------|----------|
| 22CSE001 | CSE | 2 | nexus123 |
| 22ECE042 | ECE | 2 | nexus123 |
| 21ME015 | ME | 3 | nexus123 |
| 23BBA007 | BBA | 1 | nexus123 |
| 22IT033 | IT | 2 | nexus123 |

## Vercel Deployment
This is a static frontend. Deploy directly to Vercel:

```bash
# Install Vercel CLI (requires Node.js)
npm i -g vercel

# Deploy from project root
vercel --prod
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) and it will auto-deploy.

The `vercel.json` is pre-configured to serve from the `static/` output directory.

## Made By
Jitendra Mishra — 2026
