// supabase.js - Final Polished Version

const supabaseUrl = 'https://yfobxujnrljyxpwgemnc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmb2J4dWpucmxqeXhwd2dlbW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTM5NTcsImV4cCI6MjA2MDcyOTk1N30.kh9rZ2ykxLTSJ0pv4Nof38ma2eN8xE2O0p6ULHNKO28';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let editMode = false;

// Load existing accounts
async function loadAccounts() {
  try {
    const { data, error } = await supabase.from('critical_accounts').select('*');
    if (error) throw error;

    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    const agingData = [];

    data.forEach(account => {
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

      if (account.last_updated) {
        const daysOld = Math.floor((Date.now() - new Date(account.last_updated).getTime()) / (1000 * 60 * 60 * 24));
        agingData.push({ label: account.customer_name, days: daysOld });
      }
    });

    updateStatistics();
    renderAgingChart(agingData);

  } catch (err) {
    console.error('Failed to load accounts:', err.message);
    alert('❌ Error loading accounts.');
  }
}

// Save edited data
async function saveData() {
  try {
    const rows = document.querySelectorAll('tbody tr:not(.details)');
    const updates = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const account = {
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
      updates.push(account);
    });

    for (const update of updates) {
      const { error } = await supabase.from('critical_accounts').upsert(update, { onConflict: 'customer_name' });
      if (error) throw error;
    }

    alert('✅ Data saved successfully!');
    await loadAccounts();

  } catch (err) {
    console.error('Failed to save:', err.message);
    alert('❌ Error saving data.');
  }
}

// Add a new account
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
    console.error('Failed to add account:', err.message);
    alert('❌ Error adding account.');
  }
}

// Clear Add Form after insert
function clearFormFields() {
  document.querySelectorAll('.add-account input').forEach(input => input.value = '');
}

// Filter by risk and sentiment
function applyFilters() {
  const risk = document.getElementById('riskFilter')?.value.toLowerCase() || '';
  const sentiment = document.getElementById('sentimentFilter')?.value.toLowerCase() || '';

  document.querySelectorAll('tbody tr:not(.details)').forEach(tr => {
    const riskCell = tr.querySelector('td:nth-child(10)')?.innerText.toLowerCase() ?? '';
    const sentimentCell = tr.querySelector('td:nth-child(9)')?.innerText.toLowerCase() ?? '';

    const matchesRisk = !risk || riskCell.includes(risk);
    const matchesSentiment = !sentiment || sentimentCell.includes(sentiment);

    tr.style.display = (matchesRisk && matchesSentiment) ? '' : 'none';
  });

  updateStatistics();
}

// Update statistics
function updateStatistics() {
  let openSrsTotal = 0;
  let highRiskCount = 0;

  document.querySelectorAll('tbody tr:not(.details)').forEach(tr => {
    if (tr.style.display === 'none') return;

    const openSrs = parseInt(tr.querySelector('td:nth-child(8)')?.innerText) || 0;
    const riskLevel = tr.querySelector('td:nth-child(10)')?.innerText.toLowerCase();

    openSrsTotal += openSrs;
    if (riskLevel === 'high') highRiskCount++;
  });

  document.getElementById('openSrsCount').innerText = openSrsTotal;
  document.getElementById('highRiskCount').innerText = highRiskCount;
}

// Render aging trends chart
function renderAgingChart(dataAgingArray) {
  const ctx = document.getElementById('agingChart')?.getContext('2d');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dataAgingArray.map(d => d.label),
      datasets: [{
        label: 'Days Open',
        data: dataAgingArray.map(d => d.days),
        backgroundColor: 'steelblue'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Toggle details row
function toggleDetails(id) {
  const details = document.getElementById(id);
  details.classList.toggle('open');
}

// Basic login
function login() {
  const password = prompt('Enter password to enable editing:');
  if (password === 'admin123') {
    toggleEditMode();
    alert('✅ Editing unlocked!');
  } else {
    alert('❌ Incorrect password. Access denied.');
  }
}

// Toggle edit mode
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

// Initialize
document.addEventListener('DOMContentLoaded', loadAccounts);
