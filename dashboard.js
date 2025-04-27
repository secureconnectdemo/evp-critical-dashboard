// dashboard.js
let editMode = false;

// Toggle Add Account Section
function toggleAddAccount() {
  const section = document.getElementById('add-account-section');
  const toggleButton = document.getElementById('toggleAddAccountButton');
  section.style.display = (section.style.display === 'none') ? 'block' : 'none';
  toggleButton.innerHTML = (section.style.display === 'block') ? '➖ Cancel New Account' : '➕ Postulate New Account';
}

// Add New Account
async function addAccount() {
  const addButton = document.querySelector('.add-button');
  const originalText = addButton.innerHTML;

  try {
    addButton.disabled = true;
    addButton.innerHTML = '<span class="spinner"></span> Adding...';

    const account = {
      customer_name: document.getElementById('customer_name').value.trim() || 'N/A',
      arr_value: parseFloat(document.getElementById('arr_value').value.trim()) || 0,
      segment: document.getElementById('segment').value.trim() || 'N/A',
      logo_importance: document.getElementById('logo_importance').value.trim() || 'N/A',
      products: document.getElementById('products').value.trim() || 'N/A',
      cap_status: document.getElementById('cap_status').value.trim() || 'N/A',
      escalation_type: document.getElementById('escalation_type').value.trim() || 'N/A',
      open_srs: document.getElementById('open_srs').value.trim() || '0',
      sentiment: document.getElementById('sentiment').value.trim() || 'Neutral',
      risks: document.getElementById('risks').value.trim() || 'None',
      next_exec_call: document.getElementById('next_exec_call').value || null,
      owner: document.getElementById('owner').value.trim() || 'Unknown'
    };

    const { error } = await supabase.from('critical_accounts').insert([account]);
    if (error) throw error;

    showToast('✅ Account added successfully!');
    await loadAccounts();
    clearFormFields();
    toggleAddAccount();

  } catch (err) {
    console.error('❌ Error adding account:', err.message);
    showToast(`❌ Failed: ${err.message}`);
  } finally {
    addButton.disabled = false;
    addButton.innerHTML = originalText;
  }
}

// Save All Data
async function saveData() {
  const saveButton = document.getElementById('saveButton');
  const originalText = saveButton.innerHTML;

  try {
    saveButton.disabled = true;
    saveButton.innerHTML = '<span class="spinner"></span> Saving...';

    const rows = document.querySelectorAll('tbody tr:not(.details)');
    const updates = Array.from(rows).map(row => {
      const cells = row.querySelectorAll('td');
      return {
        customer_name: cells[0]?.innerText.trim() || '',
        arr_value: parseFloat(cells[1]?.innerText.trim()) || 0,
        segment: cells[2]?.innerText.trim() || '',
        logo_importance: cells[3]?.innerText.trim() || '',
        products: cells[4]?.innerText.trim() || '',
        cap_status: cells[5]?.innerText.trim() || '',
        escalation_type: cells[6]?.innerText.trim() || '',
        open_srs: cells[7]?.innerText.trim() || '0',
        sentiment: cells[8]?.innerText.trim() || '',
        risks: cells[9]?.innerText.trim() || '',
        next_exec_call: cells[10]?.innerText.trim() || null,
        owner: cells[11]?.innerText.trim() || ''
      };
    });

    for (const update of updates) {
      const { error } = await supabase.from('critical_accounts').upsert(update, { onConflict: 'customer_name' });
      if (error) throw error;
    }

    showToast('✅ All changes saved successfully!');
    await loadAccounts();

  } catch (err) {
    console.error('❌ Error during save:', err.message);
    showToast(`❌ Save failed: ${err.message}`);
  } finally {
    saveButton.disabled = false;
    saveButton.innerHTML = originalText;
  }
}

// Dummy functions for login and toggling edit mode
function login() {
  const password = prompt('Enter password:');
  if (password === 'admin123') {
    toggleEditMode();
    showToast('✅ Editing unlocked!');
  } else {
    showToast('❌ Wrong password.');
  }
}

function toggleEditMode() {
  editMode = !editMode;
  const inputs = document.querySelectorAll('input, textarea');
  const editableCells = document.querySelectorAll('td[contenteditable]');
  const button = document.getElementById('toggleModeButton');

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

// Dummy function for loading
async function loadAccounts() {
  console.log('Reloading accounts...');
}

// Dummy clear fields
function clearFormFields() {
  document.querySelectorAll('.add-account input').forEach(input => input.value = '');
}
