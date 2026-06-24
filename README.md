# SplitSmart 💸

> Split group expenses without the awkwardness. Built in a weekend.

SplitSmart is a mobile-first web app that lets friend groups, roommates, and travel buddies track shared expenses and figure out who owes whom — with the **minimum number of payments** needed to settle up. No sign-ups, no servers, just open and go.

---

## 🤔 The Problem

Splitting bills in a group is messy. Someone pays for dinner, another for gas, someone else for the Airbnb. By the end of a trip, nobody remembers who owes what, and calculating the simplest way to settle is basically impossible in your head.

## ✨ Features

- **📱 PWA / Mobile-First** — Installable, works offline, feels native
- **👥 Group Management** — Create groups, invite via 6-character code
- **💰 Expense Tracking** — Log expenses with categories, splits, and payer info
- **⚡ Smart Debt Simplification** — Greedy algorithm reduces N*(N-1)/2 possible transactions to at most N-1
- **📊 Visual Dashboard** — See balances at a glance with charts
- **📂 Split Types** — Equal, exact amounts, percentage, or shares-based splits
- **🔄 Recurring Expenses** — Set up repeating bills (rent, utilities)
- **💳 UPI Integration** — One-tap payment links via UPI Intent API
- **📜 Expense History** — Full log with filters and category breakdowns
- **📤 Export to CSV/PDF** — Download or print expense data for records and reimbursements

## 🛠 Tech Stack

| What | Why |
|------|-----|
| React 18 | Component-based UI, hooks |
| Vite | Fast dev server + builds |
| React Router v6 | Client-side routing |
| Vanilla CSS | No bloated frameworks, custom properties for theming |
| localStorage | Zero backend, instant persistence |
| UPI Intent API | Deep-link payments on Android |
| Service Worker | Offline support & caching |

## 🚀 How to Run

```bash
# clone it
git clone <repo-url>
cd splitsmart

# install deps
npm install

# fire it up
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and you're good.

## 🏗 Architecture

```
src/
├── components/    # Reusable UI bits (Nav, charts, cards)
├── pages/         # Route-level components
├── utils/
│   ├── store.js       # localStorage CRUD wrapper
│   ├── debtEngine.js  # Balance calc + debt simplification
│   └── helpers.js     # Formatting, ID gen, CSV export
├── App.jsx        # Router setup
├── main.jsx       # Entry point + SW registration
└── index.css      # Global styles + CSS custom properties
```

Everything lives client-side. Data is stored in `localStorage` under three keys:
- `ss_groups` — group info + member lists
- `ss_expenses` — all expenses across groups
- `ss_settlements` — payment settlements and their status

## 🧠 Core Algorithm: Debt Simplification

The naive approach would have everyone pay everyone else individually — up to N*(N-1)/2 transactions for N people. We use a **greedy approach**:

1. Calculate net balance for each member (total owed - total paid)
2. Separate into creditors (+) and debtors (-)
3. Sort both lists by amount (descending)
4. Match the largest debtor with the largest creditor
5. Settle the minimum of their amounts, adjust, repeat

This guarantees **at most N-1 transactions** to fully settle all debts. 

**Time complexity:** O(N log N) for the sort, O(N) for the matching → O(N log N) overall.

## 👥 Team

**Team DevFusion** 🚀

Built with ☕ and sleep deprivation at DevFusion 3.0 | The Developers Hackathon 2025.

## 📸 Screenshots

> Coming soon — we're still polishing the UI! 

---

*Built with ❤️ for DevFusion 3.0 | #26ENSS5*
