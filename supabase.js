// ========================
// Save Data
// ========================
async function saveData() {
  const saveButton = document.getElementById('saveButton');
  try {
    saveButton.disabled = true;
    saveButton.textContent = "💾 Saving...";

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
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "💾 Save All Data";
  }
}

// ========================
// Add New Account
// ========================
async function addAccount() {
  const addButton = document.querySelector('.add-button');
  try {
    addButton.disabled = true;
    addButton.textContent = "➕ Adding...";

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
  } finally {
    addButton.disabled = false;
    addButton.textContent = "➕ Add Account";
  }
}
