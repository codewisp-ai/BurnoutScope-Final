# 🔥 EmberMind

> Developer burnout detection and recovery — built for MINDCODE 2026

EmberMind helps developers understand and address burnout before it breaks them. By analysing real GitHub commit patterns and calendar meeting load, it produces a clear burnout score, visualises 30-day activity trends, and delivers personalised recovery steps — without making medical claims or using dark patterns.

**Live Demo → [burnout-scope-final.vercel.app](https://burnout-scope-final.vercel.app)**

---

## 📌 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Ethics & Privacy](#ethics--privacy)
- [Limitations](#limitations)
- [Contributors](#contributors)
- [License](#license)

---

## 🧩 Overview

EmberMind analyses your GitHub activity over the last 30 days — looking at when you commit, how often, and whether your workload spikes and crashes. Optionally, upload a calendar export (CSV or ICS) to layer in meeting load analysis.

The result is a single 0–100 burnout score backed by transparent, explainable data. Every number shown is traceable to a real pattern in your actual work history.

This is not a mood tracker. This is your work data, reflected back at you honestly.

---

## ✨ Key Features

- GitHub commit pattern analysis — late nights, early mornings, weekends, spikes, crashes
- Calendar load analysis — meeting overload, back-to-back blocks, focus time (optional)
- Burnout score (0–100) with plain-English insight
- Behavioral pattern detection across the 30-day window
- 30-day interactive timeline — scrollable, zoomable, filterable
- Personalised recovery recommendations filtered by category and urgency
- PDF export for timeline and recommendations
- Recovery Mode — auto-triggered at score ≥ 70
- Support Mode — guided box-breathing and supportive chat, always available
- User accounts — save your GitHub username for auto-analysis on every visit
- Hackathon-ready with real-world potential

---

## 🔄 How It Works

### 1. Enter Your GitHub Username

EmberMind calls the GitHub Public Events API and filters your `PushEvent` activity from the last 30 days. For each commit it records the hour, day of week, and date — building a complete picture of when and how intensely you work.

### 2. Upload Your Calendar (Optional)

Drop in a CSV or ICS export from any calendar app. EmberMind parses it to find overloaded days, back-to-back meeting blocks, total meeting hours, and remaining focus time. This step is optional but significantly improves score accuracy.

### 3. Run the Analysis

Both data sources are processed in parallel. The burnout score is computed as a composite of:

- Late-night commits (after 11 PM)
- Early-morning commits (before 7 AM)
- Weekend commits
- Workload spikes — a week exceeding 2× the 30-day weekly average
- Post-spike crashes — the week after a spike dropping below 50% of spike volume
- Calendar overload signals (if uploaded)

Every factor is visible and explained. Nothing is hidden.

### 4. Review Your Results

Your burnout score and risk level appear immediately. Below it, a full breakdown of your GitHub patterns and calendar load gives you the exact signals behind the number.

If your score hits 70 or above, Recovery Mode activates automatically — showing a data-driven recovery checklist, a Code Sabbath countdown, and a pattern breakdown of what got you there.

### 5. Explore the Timeline

The 30-day activity chart lets you scroll through your commit and meeting intensity day by day. Zoom in, filter by weekends, spikes, or crashes, and click any day for a detailed breakdown. Export the full chart to PDF.

### 6. Act on Recommendations

A personalised action plan is generated from your actual patterns — not generic advice. Each recommendation is tagged by category (GitHub habits, Meeting load, Wellness, Productivity) and urgency (High, Medium, Low). Filter, review, and export to PDF.

### 7. Support Mode

Available at any time via the button in the bottom right. Opens a calm, dimmed overlay with guided box-breathing and a supportive chat for moments when work stress becomes too much. Not therapy — but always there.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router v6 |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JSON Web Tokens (JWT) |
| GitHub Data | GitHub Public Events API |
| Deployment | Vercel |

No unnecessary libraries. Every dependency has a purpose.

---

## ⚙️ Installation

The fastest way to try EmberMind is the live demo — no setup required.

**Live Demo → [burnout-scope-final.vercel.app](https://burnout-scope-final.vercel.app)**

To run it locally:

**1. Clone the repository**

```bash
git clone https://github.com/codewisp-ai/BurnoutScope-Final.git
cd BurnoutScope-Final
```

**2. Install dependencies**

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

**3. Run the backend**

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**4. Run the frontend**

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

> To run locally you will need to configure environment variables for MongoDB, JWT, and the GitHub API. Refer to `.env.example` in the repository for the required variable names.

---

## ⚖️ Ethics & Privacy

- **Privacy first** — no user data is sold or shared. GitHub data is fetched per-request only. Calendar files are processed in memory and never stored.
- **No medical diagnoses** — EmberMind produces signals and suggestions, not clinical assessments. The burnout score is a pattern indicator, not a diagnosis.
- **No dark patterns** — the UI is calm, opt-in, and fully transparent. Support Mode clearly states it is not therapy.
- **Transparency** — every score is explained with the specific data that produced it. Nothing is a black box.
---

## ⚠️ Limitations

- **Public GitHub profiles only** — private repository activity is not accessible via the public Events API.
- **30-day event window** — the GitHub Events API returns a maximum of 90 events. Very high-volume contributors may not see a complete 30-day picture.
- **API rate limits** — without a GitHub token the API allows 60 requests per hour per IP. Providing a token raises this to 5,000 per hour.
- **Calendar formats** — only standard CSV and ICS exports are supported. Non-standard formats may not parse correctly.
- **Simulation only** — EmberMind analyses historical patterns. It is not a live monitoring or production observability tool.

---

## 👤 Contributors

**Anmol Maheshwari**
[github.com/codewisp-ai](https://github.com/codewisp-ai)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

🔥 **EmberMind** · MINDCODE 2026 · *Code That Cares*

[Live Demo](https://burnout-scope-final.vercel.app) · [GitHub](https://github.com/codewisp-ai/BurnoutScope-Final)

</div>
