# SpendTrack project rules

These instructions apply to the entire project.

## Project structure

- Keep SpendTrack a static expense tracker using plain HTML, CSS, and JavaScript. No installation or build step is required for the app.
- Use `index.html` for semantic markup, `styles.css` for presentation, and `app.js` for state, validation, persistence, navigation, and charts.
- Keep `serve.js` an optional local preview server using Node.js built-in modules. Run it with `node serve.js` and open `http://127.0.0.1:8000`.
- Follow existing code conventions and keep changes focused. Do not add frameworks, dependencies, or build tools unless the task requires them.

## Data and calculations

- Store and calculate expense amounts as nonnegative integer cents. Validate safe integer bounds before updating state.
- Preserve the twelve-month, five-category model unless a requested feature changes it.
- Blank inputs mean zero. Invalid input must leave the previous valid value intact in totals and storage and show accessible validation feedback.
- Calculate the monthly average across all twelve months and include every tied highest-spending month.
- Preserve the `spendtrack.expenses.v1` storage format. If a schema change is required, provide a deliberate migration that preserves existing data.
- Keep financial data in the browser. Do not introduce remote data transmission, accounts, or analytics without an explicit requirement.
- Handle unavailable storage, corrupt saved data, and a missing Chart.js library gracefully. Totals must remain usable without the chart.

## Interface

- Maintain the existing responsive sage-and-teal visual style and USD formatting unless asked to change them.
- Preserve semantic labels, visible keyboard focus, accessible error messages, keyboard tab navigation, and reduced-motion support.
- Keep expense inputs and monthly totals usable at narrow viewport widths.

## Verification and documentation

- For JavaScript changes, run `node --check app.js` and `node --check serve.js` as applicable.
- For behavior changes, verify the affected flow in a browser. Relevant checks include input validation, accurate totals, persistence after reload, tab navigation, and chart fallback.
- For layout changes, inspect both desktop and mobile widths.
- Add automated tests when they provide meaningful regression coverage; avoid introducing a test framework for documentation-only or minor cosmetic changes.
- Update `README.md` when setup, behavior, dependencies, or storage details change.
- Report what changed, what was verified, and any remaining limitations accurately.
