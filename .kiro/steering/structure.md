---
inclusion: always
---

# Project Structure

```
/
├── index.html          # Main HTML page with UI and inline/linked JS
├── app.js              # Application logic (fetch weather, render results)
├── start-server.ps1    # PowerShell script to serve files on localhost:8080
├── .kiro/
│   └── steering/       # AI steering documents
└── .gitignore
```

## Organization Rules
- Keep it flat — no nested src/ or dist/ folders needed
- All static assets live in the project root
- The PowerShell server script serves the root directory
- No separate CSS file required unless complexity warrants it
