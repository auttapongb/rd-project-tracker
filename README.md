# rd-project-tracker

Interactive project management dashboard — parity with the Google Sheet reference, with future Jira/Atlassian data sync.

## Milestone 1 (current)

Replicate these tabs with matching columns, dropdowns, colors, and layout:

- Projects
- Sprint Resource
- Resource Allocate
- Summarize Sprint 26 / Sprint 26
- Summarize Sprint 25 / Sprint 25

Data: static seed JSON (sheet export). Atlassian integration comes in Milestone 2.

## Stack (planned)

- **Frontend:** Next.js + TanStack Table + spreadsheet-style grid
- **Gantt:** Frappe Gantt or similar OSS
- **Backend:** Supabase (Postgres) for long-term scale
- **Integrations:** Atlassian MCP / Jira REST (Milestone 2)

## Repo

https://github.com/auttapongb/rd-project-tracker

## Reference

Google Sheet: [Project Tracking](https://docs.google.com/spreadsheets/d/1yhMYDkjllUlVUjFQGFe2PWy9Jq5NPWg3a1rKYJ_fdz4/edit)
