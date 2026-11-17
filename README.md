# SpendTrack

A static, responsive annual expense tracker. Track Food, Transportation, Shopping, Bills, and Other for January–December, then see live USD summaries and a monthly bar chart.

## Run locally

Open `index.html` in a browser, or serve this folder for a stable localStorage origin:

```powershell
node serve.js
```

Visit http://127.0.0.1:8000. The optional server requires Node.js; the tracker itself requires no installation or build step. Internet access is needed for Bootstrap 5.3.3 and Chart.js 4.4.8 from jsDelivr.

## Behavior

- Expenses is the default view. Overview displays the annual total, average across all 12 months, all highest-spending months, and a live bar chart.
- Inputs accept nonnegative USD amounts with up to two decimal places; blank means zero. Negative values, excess decimal places, letters, currency symbols, commas, and amounts above the entry limit are rejected. Invalid edits display a specific message associated with the field and announce feedback through a polite live region. Totals and storage retain the previous valid value until corrected. Calculations use integer cents; each entry is limited to $1,501,199,875,790.16 to keep the full annual sum within JavaScript's safe integer range.
- Valid changes save automatically to `spendtrack.expenses.v1` in localStorage. Data belongs to the current browser and origin; private browsing or clearing site data may remove it. Opening via `file:` can have browser-dependent storage behavior; use the local server for consistent persistence.
- Storage failures show a warning and allow session use. Corrupt saved data starts a blank tracker. If Chart.js cannot load, the monthly totals remain available.
- No accounts, server, analytics, or financial data transmission. The CDN receives ordinary asset requests.

## Files and libraries

`index.html` provides semantic markup, `styles.css` customizes Bootstrap with a sage-and-teal dashboard, and `app.js` manages validation, cents-based state, storage, tabs, and Chart.js updates. Bootstrap JavaScript is unnecessary: the small tab controller implements arrow, Home, and End navigation directly.

Libraries: [Bootstrap](https://getbootstrap.com/docs/5.3/) and [Chart.js](https://www.chartjs.org/docs/latest/).

The chart uses a dedicated sizing frame inside its padded container so it stays within the available space when switching views or resizing between desktop, tablet, and mobile widths.
