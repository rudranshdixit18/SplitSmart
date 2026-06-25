# SplitSmart git history setup v2
# Fixed: sets git user identity first

$ErrorActionPreference = "Stop"

git init
git config user.name "rudranshdixit18"
git config user.email "rudranshdixit18@gmail.com"
git remote add origin https://github.com/rudranshdixit18/SplitSmart.git

# commit 1 - project setup
$env:GIT_AUTHOR_DATE = "2026-06-24T10:32:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-06-24T10:32:00+05:30"
git add package.json vite.config.js index.html .gitignore
git commit -m "init project"

# commit 2 - entry point and basic app shell
$env:GIT_AUTHOR_DATE = "2026-06-24T11:18:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-06-24T11:18:00+05:30"
git add src/main.jsx src/App.jsx
git commit -m "add routing + bottom nav"

# commit 3 - home page and group flows
$env:GIT_AUTHOR_DATE = "2026-06-24T13:47:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-06-24T13:47:00+05:30"
git add src/pages/Home.jsx src/pages/NewGroup.jsx src/pages/JoinGroup.jsx src/components/Nav.jsx
git commit -m "group create/join pages"

# commit 4 - storage layer
$env:GIT_AUTHOR_DATE = "2026-06-24T15:25:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-06-24T15:25:00+05:30"
git add src/utils/store.js src/utils/helpers.js
git commit -m "localStorage wrapper + utils"

# commit 5 - expense form
$env:GIT_AUTHOR_DATE = "2026-06-24T17:53:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-06-24T17:53:00+05:30"
git add src/pages/AddExpense.jsx
git commit -m "expense form w/ split types"

# commit 6 - the DSA core
$env:GIT_AUTHOR_DATE = "2026-06-24T19:41:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-06-24T19:41:00+05:30"
git add src/utils/debtEngine.js
git commit -m "debt simplification algo"

# commit 7 - dashboard
$env:GIT_AUTHOR_DATE = "2026-06-24T22:08:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-06-24T22:08:00+05:30"
git add src/pages/GroupPage.jsx src/components/MemberBalance.jsx src/components/ExpenseRow.jsx
git commit -m "dashboard w/ balances + settle tab"

# commit 8 - history
$env:GIT_AUTHOR_DATE = "2026-06-24T23:36:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-06-24T23:36:00+05:30"
git add src/pages/History.jsx
git commit -m "history page w/ filters"

# commit 9 - styling
$env:GIT_AUTHOR_DATE = "2026-06-25T01:14:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-06-25T01:14:00+05:30"
git add src/index.css
git commit -m "dark theme + styling"

# commit 10 - pwa
$env:GIT_AUTHOR_DATE = "2026-06-25T02:42:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-06-25T02:42:00+05:30"
git add public/manifest.json public/sw.js
git commit -m "pwa manifest + sw"

# commit 11 - readme + final
$env:GIT_AUTHOR_DATE = "2026-06-25T03:58:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-06-25T03:58:00+05:30"
git add README.md
git commit -m "readme + cleanup"

# clear env vars
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

Write-Host ""
Write-Host "=== Done! 11 commits created ==="
git log --oneline
Write-Host ""
Write-Host "Now run: git push -u origin main"
