// supabase.js - Final Polished and Structured

const supabaseUrl = 'https://yfobxujnrljyxpwgemnc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmb2J4dWpucmxqeXhwd2dlbW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTM5NTcsImV4cCI6MjA2MDcyOTk1N30.kh9rZ2ykxLTSJ0pv4Nof38ma2eN8xE2O0p6ULHNKO28';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let editMode = false;

// ========================
// Load Accounts
// ========================
async function loadAccounts() {
  try {
    const { data, error } = await supabase.from('critical_accounts').select('*');
    if (error) throw error;

    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    const agingData = [];

    data.forEach(account => {
      renderAccountRow(account);
      if (account.last_updated) {
        const daysOld = Math.floor((Date.now() - new Date(account.last_updated).getTime()) / (1000 * 60 * 60 * 24));
        agingData.push({ label: account.customer_name, days: daysOld });
      }
    });

    updateStatistics();
    renderAgingChart(agingData);

  } catch (err) {
    console.error('❌ Error loading accounts:', err.message);
    alert('❌ Failed to load accounts.');
  }
}

// ========================
// Render Single Account Row
// ========================
function renderAccountRow(account) {
  const tbody = document.querySelector('tbody');

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td contenteditable="true">${account.customer_name ?? ''}</td>
    <td contenteditable="true">${account.arr_value ?? ''}</td>
    <td contenteditable="true">${account.segment ?? ''}</td>
    <td contenteditable="true">${account.logo_importance ?? ''}</td>
    <td contenteditable="true">${account.products ?? ''}</td>
    <td contenteditable="true">${account.cap_status ?? ''}</td>
    <td contenteditable="true">${account.escalation_type ?? ''}</td>
    <td contenteditable="true">${account.open_srs ?? ''}</td>
    <td contenteditable="true">${account.sentiment ?? ''}</td>
    <td contenteditable="true">${account.risks ?? ''}</td>
    <td contenteditable="true">${account.next_exec_call ?? ''}</td>
    <td contenteditable="true">${account.owner ?? ''}</td>
    <td><button class="expand-button" onclick="toggleDetails('details-${account.id}')">Expand</button></td>
  `;
  tbody.appendChild(tr);

  const detailsTr = document.createElement('tr');
  detailsTr.id = `details-${account.id}`;
  detailsTr.className = 'details';
  detailsTr.innerHTML = `
    <td colspan="13">
      <strong>Deployment Phase:</strong> <span contenteditable="true">${account.deployment_phase ?? ''}</span><br>
      <strong>Blocker Type:</strong> <span contenteditable="true">${account.blocker_type ?? ''}</span><br>
      <strong>Critical Timeframe:</strong> <span contenteditable="true">${account.critical_timeframe ?? ''}</span><br>
      <strong>Feature Requests:</strong> <div contenteditable="true">${account.feature_requests ?? ''}</div><br>
      <strong>Support Tickets:</strong> <div contenteditable="true">${account.support_tickets ?? ''}</div><br>
      <strong>Comments:</strong> <textarea>${account.comments ?? ''}</textarea>
    </td>
  `;
  tbody.appendChild(detailsTr);
}

// ========================
// Save Data
// ========================
async function saveData() {
  try {
    const rows = document.querySelectorAll('tbody tr:not(.details)');
    const updates = Array.from(rows).map(row => {
      const cells = row.querySelectorAll('td');
      return {
        customer_name: cells[0]?.innerText.trim(),
        arr_value: parseFloat(cells[1]?.innerText.trim()) || null,
        segment: cells[2]?.innerText.trim(),
        logo_importance: cells[3]?.innerText.trim(),
        products: cells[4]?.innerText.trim(),
        cap_status: cells[5]?.innerText.trim(),
        escalation_type: cells[6]?.innerText.trim(),
        open_srs: cells[7]?.innerText.trim(),
        sentiment: cells[8]?.innerText.trim(),
        risks: cells[9]?.innerText.trim(),
        next_exec_call: cells[10]?.innerText.trim(),
        owner: cells[11]?.innerText.trim()
      };
    });

    for (const update of updates) {
      const { error } = await supabase.from('critical_accounts').upsert(update, { onConflict: 'customer_name' });
      if (error) throw error;
    }

    alert('✅ All changes saved!');
    await loadAccounts();

  } catch (err) {
    console.error('❌ Error saving data:', err.message);
    alert('❌ Failed to save data.');
  }
}

// ========================
// Add New Account
// ========================
async function addAccount() {
  try {
    const account = {
      customer_name: document.getElementById('customer_name').value.trim(),
      arr_value: parseFloat(document.getElementById('arr_value').value.trim()) || null,
      segment: document.getElementById('segment').value.trim(),
      logo_importance: document.getElementById('logo_importance').value.trim(),
      products: document.getElementById('products').value.trim(),
      cap_status: document.getElementById('cap_status').value.trim(),
      escalation_type: document.getElementById('escalation_type').value.trim(),
      open_srs: document.getElementById('open_srs').value.trim(),
      sentiment: document.getElementById('sentiment').value.trim(),
      risks: document.getElementById('risks').value.trim(),
      next_exec_call: document.getElementById('next_exec_call').value,
      owner: document.getElementById('owner').value.trim()
    };

    const { error } = await supabase.from('critical_accounts').insert([account]);
    if (error) throw error;

    alert('✅ Account added successfully!');
    await loadAccounts();
    clearFormFields();

  } catch (err) {
    console.error('❌ Error adding account:', err.message);
    alert('❌ Failed to add account.');
  }
}

// ========================
// Utility Functions
// ========================
function clearFormFields() {
  document.querySelectorAll('.add-account input').forEach(input => input.value = '');
}

function toggleDetails(id) {
  const details = document.getElementById(id);
  if (details) details.classList.toggle('open');
}

function applyFilters() {
  const risk = document.getElementById('riskFilter')?.value.toLowerCase() || '';
  const sentiment = document.getElementById('sentimentFilter')?.value.toLowerCase() || '';

  document.querySelectorAll('tbody tr:not(.details)').forEach(tr => {
    const riskCell = tr.querySelector('td:nth-child(10)')?.innerText.toLowerCase() ?? '';
    const sentimentCell = tr.querySelector('td:nth-child(9)')?.innerText.toLowerCase() ?? '';
    tr.style.display = (riskCell.includes(risk) && sentimentCell.includes(sentiment)) ? '' : 'none';
  });

  updateStatistics();
}

function updateStatistics() {
  let openSrsTotal = 0;
  let highRiskCount = 0;

  document.querySelectorAll('tbody tr:not(.details)').forEach(tr => {
    if (tr.style.display === 'none') return;
    const openSrs = parseInt(tr.querySelector('td:nth-child(8)')?.innerText) || 0;
    const risk = tr.querySelector('td:nth-child(10)')?.innerText.toLowerCase();

    openSrsTotal += openSrs;
    if (risk === 'high') highRiskCount++;
  });

  document.getElementById('openSrsCount').innerText = openSrsTotal;
  document.getElementById('highRiskCount').innerText = highRiskCount;
}

function renderAgingChart(data) {
  const ctx = document.getElementById('agingChart')?.getContext('2d');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        label: 'Days Open',
        data: data.map(d => d.days),
        backgroundColor: 'steelblue'
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function login() {
  const password = prompt('Enter password to enable editing:');
  if (password === 'admin123') {
    toggleEditMode();
    alert('✅ Editing unlocked!');
  } else {
    alert('❌ Incorrect password.');
  }
}

function toggleEditMode() {
  editMode = !editMode;
  const button = document.getElementById('toggleModeButton');
  const inputs = document.querySelectorAll('input, textarea');
  const editableCells = document.querySelectorAll('td[contenteditable]');

  if (editMode) {
    button.textContent = "Switch to View Mode";
    inputs.forEach(input => input.removeAttribute('readonly'));
    editableCells.forEach(cell => cell.setAttribute('contenteditable', 'true'));
  } else {
    button.textContent = "Switch to Edit Mode";
    inputs.forEach(input => input.setAttribute('readonly', true));
    editableCells.forEach(cell => cell.setAttribute('contenteditable', 'false'));
  }
}

// ========================
// Init
// ========================
document.addEventListener('DOMContentLoaded', loadAccounts);
