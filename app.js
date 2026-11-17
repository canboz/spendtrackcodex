(() => {
  'use strict';
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const CATEGORIES = ['Food', 'Transportation', 'Shopping', 'Bills', 'Other'];
  const STORAGE_KEY = 'spendtrack.expenses.v1';
  // Bound individual entries so all 60 amounts and their sums remain exact integers.
  const MAX_CENTS = Math.floor(Number.MAX_SAFE_INTEGER / 60);
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const format = cents => money.format(cents / 100);
  const blank = () => MONTHS.map(() => CATEGORIES.map(() => 0));
  const warning = document.getElementById('storage-warning');
  const status = document.getElementById('save-status');
  let expenses = blank();
  let chart;
  let storageAvailable = true;

  function storageWarning(message) {
    warning.textContent = message;
    warning.hidden = false;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const saved = JSON.parse(raw);
      if (saved.version !== 1 || !Array.isArray(saved.expenses) || saved.expenses.length !== 12 || !saved.expenses.every(row => Array.isArray(row) && row.length === 5 && row.every(value => Number.isSafeInteger(value) && value >= 0 && value <= MAX_CENTS))) {
        throw new SyntaxError('Invalid saved expenses');
      }
      expenses = saved.expenses;
    }
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof TypeError) {
      storageWarning('Saved expense data could not be read. Starting with a blank tracker. Your next valid edit will save a fresh copy.');
    } else {
      storageAvailable = false;
      status.textContent = 'Session only';
      storageWarning('Browser storage is unavailable. You can track expenses here, but changes may be lost when you close or refresh this page.');
    }
  }

  const rows = document.getElementById('expense-rows');
  rows.innerHTML = MONTHS.map((month, m) => `<tr><th scope="row"><span class="month-number" aria-hidden="true">${String(m + 1).padStart(2, '0')}</span>${month}</th>${CATEGORIES.map((category, c) => `<td><div class="money-input"><span aria-hidden="true">$</span><input type="text" inputmode="decimal" autocomplete="off" aria-label="${month} ${category} in USD" aria-describedby="input-hint" data-month="${m}" data-category="${c}" placeholder="0.00" value="${expenses[m][c] ? (expenses[m][c] / 100).toFixed(2) : ''}"></div></td>`).join('')}<td class="amount" id="month-total-${m}"></td></tr>`).join('');
  const breakdown = document.getElementById('monthly-breakdown');
  breakdown.innerHTML = MONTHS.map((month, m) => `<div class="monthly-total" role="row"><span role="rowheader">${month}</span><span role="cell" id="breakdown-${m}"></span></div>`).join('');

  function totals() { return expenses.map(row => row.reduce((sum, value) => sum + value, 0)); }

  function render() {
    const monthly = totals();
    const total = monthly.reduce((sum, value) => sum + value, 0);
    const highest = Math.max(...monthly);
    monthly.forEach((value, m) => {
      document.getElementById(`month-total-${m}`).textContent = format(value);
      document.getElementById(`breakdown-${m}`).textContent = format(value);
    });
    document.getElementById('yearly-total').textContent = format(total);
    document.getElementById('total-spending').textContent = format(total);
    document.getElementById('average-spending').textContent = format(Math.round(total / 12));
    document.getElementById('highest-month').textContent = highest ? MONTHS.filter((_, m) => monthly[m] === highest).join(', ') : 'No expenses yet';
    document.getElementById('highest-amount').textContent = highest ? `${format(highest)} in monthly expenses` : 'Your spending story starts here';
    if (chart) {
      chart.data.datasets[0].data = monthly.map(value => value / 100);
      chart.update(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : undefined);
    }
  }

  function save() {
    if (!storageAvailable) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, expenses }));
      status.textContent = 'Saved on this device';
      warning.hidden = true;
    } catch {
      status.textContent = 'Changes not saved';
      storageWarning('Your browser could not save these changes. Keep this page open to retain your current expenses.');
    }
  }

  rows.addEventListener('input', event => {
    const input = event.target;
    if (!input.matches('input')) return;
    const value = input.value.trim();
    const matches = /^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(value);
    const [whole = '', decimal = ''] = value.split('.');
    const cents = value === '' ? 0 : Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
    const valid = (value === '' || matches) && Number.isSafeInteger(cents) && cents >= 0 && cents <= MAX_CENTS;
    let message = '';
    if (!valid) {
      message = value.startsWith('-') ? 'Enter zero or a positive amount. Negative expenses are not allowed.' :
        !matches ? 'Enter a USD amount with up to two decimal places, such as 12.50. Do not include commas, currency symbols, or letters.' :
        `Enter an amount no greater than ${format(MAX_CENTS)}.`;
    }
    const errorId = `error-${input.dataset.month}-${input.dataset.category}`;
    let feedback = document.getElementById(errorId);
    if (!feedback) {
      feedback = document.createElement('span');
      feedback.id = errorId;
      feedback.className = 'field-error';
      input.closest('td').append(feedback);
    }
    feedback.textContent = message ? `${message} Totals and saved data keep the last valid amount.` : '';
    feedback.hidden = valid;
    input.setCustomValidity(message);
    input.setAttribute('aria-invalid', String(!valid));
    input.setAttribute('aria-describedby', valid ? 'input-hint' : `input-hint ${errorId}`);
    const announcement = document.getElementById('validation-message');
    announcement.textContent = message ? `${MONTHS[Number(input.dataset.month)]} ${CATEGORIES[Number(input.dataset.category)]}: ${feedback.textContent}` :
      rows.querySelector('[aria-invalid="true"]') ? 'This amount is valid. Other expense fields still have errors; their last valid amounts are retained.' : '';
    if (!valid) return;
    expenses[Number(input.dataset.month)][Number(input.dataset.category)] = cents;
    render();
    save();
  });
  rows.addEventListener('focusout', event => {
    const input = event.target;
    if (input.matches('input') && input.value.trim() && input.getAttribute('aria-invalid') !== 'true') {
      input.value = (expenses[Number(input.dataset.month)][Number(input.dataset.category)] / 100).toFixed(2);
    }
  });

  function ensureChart() {
    if (chart) return;
    if (typeof Chart === 'undefined') {
      document.getElementById('monthly-chart').hidden = true;
      document.getElementById('chart-warning').hidden = false;
      return;
    }
    chart = new Chart(document.getElementById('monthly-chart'), {
      type: 'bar',
      data: { labels: MONTHS.map(month => month.slice(0, 3)), datasets: [{ label: 'Monthly spending', data: totals().map(value => value / 100), backgroundColor: '#248875', hoverBackgroundColor: '#125e51', borderRadius: 5, maxBarThickness: 38 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 300 },
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#203936', padding: 12, displayColors: false, callbacks: { title: items => MONTHS[items[0].dataIndex], label: context => money.format(context.parsed.y) } } },
        scales: { x: { grid: { display: false }, border: { display: false }, ticks: { color: '#7d8c82', font: { size: 11 } } }, y: { beginAtZero: true, suggestedMax: 100, border: { display: false }, grid: { color: '#edf1eb' }, ticks: { maxTicksLimit: 6, color: '#87958a', font: { size: 10 }, callback: value => money.format(value) } } }
      }
    });
  }

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(selected, focus = false) {
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) selected.focus();
    if (selected.id === 'overview-tab') { ensureChart(); if (chart) chart.resize(); }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
      if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); }
    });
  });
  document.getElementById('view-overview').addEventListener('click', () => selectTab(tabs[1], true));
  render();
})();
