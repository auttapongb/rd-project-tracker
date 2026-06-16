# UX / library choices

## Spreadsheet grid (current)

Custom virtualized grid with Google Sheets chrome (A1 formula bar, row numbers, column letters, sticky headers, timeline markers ■◐○).

**Future upgrade path:** [@fortune-sheet/react](https://github.com/ruilisi/fortune-sheet) (MIT, 3.6k★) — full Excel parity, formulas, merge cells, xlsx import. Heavier; best for Milestone 2 when we sync Jira into FortuneSheet cell model.

Alternative: [Univer](https://github.com/dream-num/univer) (Apache-2.0, 13k★) — enterprise office SDK.

## Timeline / Gantt

| Library | License | Verdict |
|---------|---------|---------|
| ~~frappe-gantt~~ | MIT | Removed — too basic, not Excel-like |
| **Excel-style week bars** | custom | **Default for Sprint tabs** — matches Projects month columns |
| [gantt-task-react](https://github.com/MaTeMaTuK/gantt-task-react) | MIT | Timeline-only view; React 19 via `--legacy-peer-deps` |
| DHTMLX Gantt | GPL / commercial | Excel export, MS Project — overkill + license |
| SVAR React Gantt | MIT / PRO | Good enterprise option if we need MSP export later |

## Sprint tab views

- **Grid** — full Jira export sheet
- **Split** — grid + Excel-style timeline (default)
- **Timeline** — Excel bars + gantt-task-react detail view
