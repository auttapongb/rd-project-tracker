# rd-project-tracker

Interactive project management dashboard — parity with the Google Sheet reference, with future Jira/Atlassian data sync.

## Milestone 1 (current)

Interactive web app in `web/` with all 7 sheet tabs:

- Projects
- Sprint Resource
- Resource Allocate
- Summarize Sprint 26 / Sprint 26
- Summarize Sprint 25 / Sprint 25

Features: editable cells, status dropdowns, color-coded progress, Frappe Gantt on sprint tabs.

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

### Import / refresh from Google Sheet

```bash
cd web
npm run import:sheet    # reads data/csv-raw/workbook.xlsx or fetches live via gviz
```

Use **Re-import sheet** in the UI to refresh without restarting dev server.

Data files land in `web/public/data/` and `data/csv/`.

## Stack

- **Frontend:** Next.js 16 + TanStack Table + Tailwind
- **Gantt:** Frappe Gantt
- **Backend (planned):** Supabase
- **Integrations (planned):** Atlassian MCP / Jira REST

## Repo

https://github.com/auttapongb/rd-project-tracker

## Reference

Google Sheet: [Project Tracking](https://docs.google.com/spreadsheets/d/1yhMYDkjllUlVUjFQGFe2PWy9Jq5NPWg3a1rKYJ_fdz4/edit)
