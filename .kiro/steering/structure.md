# Project Structure

```
/
├── index.html          # Main HTML page with inline CSS and UI structure
├── app.js              # All application logic (geocoding, API calls, rendering)
├── start-server.ps1    # PowerShell script to serve files on localhost:8080
├── .kiro/
│   └── steering/       # AI steering documents
└── .gitignore
```

## Organization Rules
- Keep it flat — no nested src/ or dist/ folders
- All static assets live in the project root
- The PowerShell server script serves the root directory
- No separate CSS file; styles live in a `<style>` block in index.html
- `app.js` is loaded via a `<script>` tag at the bottom of `<body>`
