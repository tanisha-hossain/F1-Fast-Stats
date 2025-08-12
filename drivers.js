const grid = document.getElementById('driversGrid');

async function fetchDrivers() {
    const url = 'https://api.openf1.org/v1/drivers?meeting_key=latest';
    const res = await fetch(url);
    const rows = await res.json();

    // dedup to ensure endpoint return 1 row per session
    const byNumber = new Map();
    rows.forEach(d => {
        const current = byNumber.get(d.driver_number);
        if (!current || d.session_key > current.session_key) byNumber.set(d.driver_number, d);
    });

    const drivers = [...byNumber.values()]
    .sort((a,b) => (a.team_name||'').localeCompare(b.team_name||'') || (a.last_name||'').localeCompare(b.last_name||''));

  return drivers;
}

function gradientFromTeam(hex) {
  // mild vertical gradient using team colour
  const base = `#${(hex||'303030')}`;
  return `linear-gradient(135deg, ${base} 0%, ${base}33 70%), ${base}`;
}

function renderCards(drivers) {
  grid.innerHTML = drivers.map(d => `
    <article class="driver-card" 
             style="background:${gradientFromTeam(d.team_colour)}"
             data-driver='${JSON.stringify(d).replaceAll("'", "&apos;")}'>
      <div class="driver-meta">
        <div class="driver-sub">${d.driver_number ?? ''}</div>
        <div class="driver-name">${d.first_name ?? ''} ${d.last_name ?? ''}</div>
        <div class="driver-sub">${d.team_name ?? ''}</div>
      </div>
      ${d.headshot_url ? `<img class="driver-img" alt="${d.full_name||''}" src="${d.headshot_url}">` : ''}
    </article>
  `).join('');

  // click -> lift + open modal
  grid.querySelectorAll('.driver-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.add('lift');
      const d = JSON.parse(card.dataset.driver);
      openModal(d);
      setTimeout(() => card.classList.remove('lift'), 250);
    });
  });
}

fetchDrivers().then(renderCards).catch(err => {
  console.error(err);
  grid.innerHTML = `<p style="color:#fff">Couldn’t load drivers. Try refresh.</p>`;
});

// --- modal logic ---
const modal = document.getElementById('driverModal');
const modalBody = document.getElementById('modalContent');
const modalClose = document.getElementById('closeModal');

function openModal(d) {
  modalBody.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 2fr; gap:18px; align-items:center;">
      <div style="background:${gradientFromTeam(d.team_colour)}; border-radius:14px; padding:16px; position:relative; min-height:260px;">
        ${d.headshot_url ? `<img alt="${d.full_name||''}" src="${d.headshot_url}" style="position:absolute; bottom:0; right:0; height:100%;">` : ''}
      </div>
      <div>
        <h2 style="margin:0 0 6px">${d.full_name ?? ''}</h2>
        <p style="opacity:.9; margin:0 0 14px; font-weight:700">${d.team_name ?? ''}</p>
        <ul style="list-style:none; padding:0; margin:0; line-height:1.7">
          <li><strong>Number:</strong> ${d.driver_number ?? '—'}</li>
          <li><strong>Abbrev:</strong> ${d.name_acronym ?? '—'}</li>
          <li><strong>Nationality:</strong> ${d.country_code ?? '—'}</li>
          <!-- add more as you discover fields -->
        </ul>
      </div>
    </div>
  `;
  modal.showModal();
}
modalClose.addEventListener('click', () => modal.close());
modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });