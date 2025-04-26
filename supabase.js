const supabaseUrl = 'https://yfobxujnrljyxpwgemnc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmb2J4dWpucmxqeXhwd2dlbW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTM5NTcsImV4cCI6MjA2MDcyOTk1N30.kh9rZ2ykxLTSJ0pv4Nof38ma2eN8xE2O0p6ULHNKO28';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function loadAccounts() {
  const { data, error } = await supabase.from('critical_accounts').select('*');
  if (error) {
    console.error('Error loading accounts:', error);
    return;
  }

  const tbody = document.querySelector('tbody');
  tbody.innerHTML = '';

  data.forEach(account => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td contenteditable="true">${account.customer_name}</td>
      <td contenteditable="true">${account.arr_value ?? ''}</td>
      <td contenteditable="true">${account.segment ?? ''}</td>
      <td contenteditable="true">${account.logo_importance ?? ''}</td>
      <td contenteditable="true">${account.products ?? ''}</td>
      <td contenteditable="true">${account.cap_status ?? ''}</td>
      <td contenteditable="true">${account.escalation_type ?? ''}</td>
      <td contenteditable="true">${account.open_srs ?? ''}</td>
      <td contenteditable="true" class="risk-${(account.sentiment ?? '').toLowerCase()}">${account.sentiment ?? ''}</td>
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
  });
}

document.addEventListener('DOMContentLoaded', loadAccounts);

function toggleDetails(id) {
  const details = document.getElementById(id);
  details.classList.toggle('open');
}

async function saveData() {
  const rows = document.querySelectorAll('tbody tr:not(.details)');
  const updates = [];

  rows.forEach((row, index) => {
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
    const { error } = await supabase
      .from('critical_accounts')
      .upsert(update, { onConflict: 'customer_name' }); // assumes `customer_name` is unique
    if (error) {
      console.error('Error saving data:', error);
    }
  }

  alert('Data saved!');
}
