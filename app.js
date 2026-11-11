// DYCK Awards 2026 - Main Application Logic
const ADMIN_PASSWORD = "dyck2026"; // Cambia esta contraseña

let state = {
  categories: JSON.parse(localStorage.getItem("dyck_categories") || "[]"),
  nominees: JSON.parse(localStorage.getItem("dyck_nominees") || "[]"),
  votes: JSON.parse(localStorage.getItem("dyck_votes") || "[]"),
  currentVoter: null,
  isAdmin: false,
  currentView: "home"
};

function saveState() {
  localStorage.setItem("dyck_categories", JSON.stringify(state.categories));
  localStorage.setItem("dyck_nominees", JSON.stringify(state.nominees));
  localStorage.setItem("dyck_votes", JSON.stringify(state.votes));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function render() {
  const main = document.getElementById("main-content");
  const adminBtn = document.getElementById("admin-btn");
  adminBtn.textContent = state.isAdmin ? "Salir Admin" : "Admin";

  if (state.isAdmin) {
    renderAdmin(main);
  } else if (state.currentVoter) {
    renderVoting(main);
  } else {
    renderHome(main);
  }
}

function renderHome(container) {
  container.innerHTML = `
    <div class="trophy-hero">
      <img src="trophy.jpg" alt="Trofeo DYCK">
    </div>
    <div class="card">
      <h2>Bienvenido a los DYCK Awards 2026</h2>
      <p style="color: var(--text-muted); margin-bottom: 1rem; line-height: 1.5;">
        La gala más prestigiosa del año. Vota a tus favoritos y decide quién se lleva el trofeo de oro.
      </p>
      <input type="text" id="voter-name" placeholder="Tu nombre completo" maxlength="50">
      <button onclick="startVoting()">Empezar a Votar</button>
    </div>
    ${state.categories.length === 0 ? `
      <div class="card" style="text-align: center; opacity: 0.7;">
        <p>El administrador aún no ha configurado las categorías.</p>
      </div>
    ` : ""}
  `;
}

function startVoting() {
  const name = document.getElementById("voter-name").value.trim();
  if (!name) {
    alert("Por favor, introduce tu nombre.");
    return;
  }
  // Check if already voted
  if (state.votes.some(v => v.voterName.toLowerCase() === name.toLowerCase())) {
    if (!confirm("Ya has votado anteriormente. ¿Quieres votar de nuevo? (Esto sobrescribirá tu voto anterior)")) {
      return;
    }
    state.votes = state.votes.filter(v => v.voterName.toLowerCase() !== name.toLowerCase());
  }
  state.currentVoter = name;
  state.currentView = "voting";
  render();
}

function renderVoting(container) {
  if (state.categories.length === 0) {
    container.innerHTML = `<div class="card"><p>No hay categorías configuradas todavía.</p></div>`;
    return;
  }

  let html = `<div class="voter-name-display">Votando como: <strong>${state.currentVoter}</strong></div>`;

  state.categories.forEach((cat, index) => {
    const nominees = state.nominees.filter(n => n.categoryId === cat.id);
    if (nominees.length === 0) return;

    html += `
      <div class="card" data-category="${cat.id}">
        <h2>${cat.name}</h2>
        ${cat.description ? `<p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${cat.description}</p>` : ""}
        <div class="nominee-grid">
    `;

    nominees.forEach(nom => {
      html += `
        <div class="nominee-card" data-nominee="${nom.id}" data-category="${cat.id}" onclick="cycleRank('${cat.id}', '${nom.id}')">
          <img src="${nom.photoUrl || 'https://via.placeholder.com/200x200/1a1a2e/D4AF37?text=?'}" alt="${nom.name}" onerror="this.src='https://via.placeholder.com/200x200/1a1a2e/D4AF37?text=?'">
          <div class="name">${nom.name}</div>
          <div class="points-badge" style="display:none;"></div>
          <div class="rank-buttons">
            <button class="rank-btn" data-points="5" onclick="event.stopPropagation(); selectRank('${cat.id}', '${nom.id}', 5)">1º (5)</button>
            <button class="rank-btn" data-points="3" onclick="event.stopPropagation(); selectRank('${cat.id}', '${nom.id}', 3)">2º (3)</button>
            <button class="rank-btn" data-points="1" onclick="event.stopPropagation(); selectRank('${cat.id}', '${nom.id}', 1)">3º (1)</button>
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
  });

  html += `
    <button onclick="submitVotes()" style="margin-top: 1rem; font-size: 1.1rem;">Enviar Mis Votos</button>
    <button class="secondary" onclick="cancelVoting()" style="margin-top: 0.5rem;">Cancelar</button>
  `;

  container.innerHTML = html;
}

const currentSelections = {}; // { categoryId: { 5: nomineeId, 3: nomineeId, 1: nomineeId } }

function cycleRank(categoryId, nomineeId) {
  if (!currentSelections[categoryId]) currentSelections[categoryId] = {};
  const sel = currentSelections[categoryId];

  // Find current points for this nominee
  let current = null;
  if (sel[5] === nomineeId) current = 5;
  else if (sel[3] === nomineeId) current = 3;
  else if (sel[1] === nomineeId) current = 1;

  // Cycle: none → 5 → 3 → 1 → none
  let next = null;
  if (current === null) next = 5;
  else if (current === 5) next = 3;
  else if (current === 3) next = 1;
  else next = null;

  // Remove from previous slot
  Object.keys(sel).forEach(p => {
    if (sel[p] === nomineeId) delete sel[p];
  });

  if (next !== null) {
    // Remove anyone else who had this points
    if (sel[next]) delete sel[next];
    sel[next] = nomineeId;
  }

  updateRankingUI(categoryId);
}

function selectRank(categoryId, nomineeId, points) {
  if (!currentSelections[categoryId]) currentSelections[categoryId] = {};

  // Remove this nominee from other ranks in this category
  Object.keys(currentSelections[categoryId]).forEach(p => {
    if (currentSelections[categoryId][p] === nomineeId) {
      delete currentSelections[categoryId][p];
    }
  });

  // Clear previous person who had these points
  if (currentSelections[categoryId][points] && currentSelections[categoryId][points] !== nomineeId) {
    delete currentSelections[categoryId][points];
  }

  currentSelections[categoryId][points] = nomineeId;

  updateRankingUI(categoryId);
}

function updateRankingUI(categoryId) {
  const sel = currentSelections[categoryId] || {};
  
  document.querySelectorAll(`.nominee-card[data-category="${categoryId}"]`).forEach(card => {
    const nomId = card.dataset.nominee;
    card.classList.remove("selected-5", "selected-3", "selected-1");
    
    const badge = card.querySelector(".points-badge");
    let points = null;
    if (sel[5] === nomId) { card.classList.add("selected-5"); points = 5; }
    if (sel[3] === nomId) { card.classList.add("selected-3"); points = 3; }
    if (sel[1] === nomId) { card.classList.add("selected-1"); points = 1; }

    if (badge) {
      if (points) {
        badge.style.display = "block";
        badge.textContent = points;
      } else {
        badge.style.display = "none";
      }
    }

    // Update buttons inside this card
    card.querySelectorAll(".rank-btn").forEach(btn => {
      const pts = parseInt(btn.dataset.points);
      btn.classList.remove("active-5", "active-3", "active-1");
      if (sel[pts] === nomId) {
        btn.classList.add(`active-${pts}`);
      }
    });
  });
}

function submitVotes() {
  const voteData = {
    id: generateId(),
    voterName: state.currentVoter,
    timestamp: new Date().toISOString(),
    rankings: []
  };

  let hasVotes = false;
  state.categories.forEach(cat => {
    const sel = currentSelections[cat.id] || {};
    if (sel[5] || sel[3] || sel[1]) {
      hasVotes = true;
      if (sel[5]) voteData.rankings.push({ categoryId: cat.id, nomineeId: sel[5], points: 5 });
      if (sel[3]) voteData.rankings.push({ categoryId: cat.id, nomineeId: sel[3], points: 3 });
      if (sel[1]) voteData.rankings.push({ categoryId: cat.id, nomineeId: sel[1], points: 1 });
    }
  });

  if (!hasVotes) {
    alert("Debes seleccionar al menos un nominado.");
    return;
  }

  // Remove previous vote from same person
  state.votes = state.votes.filter(v => v.voterName.toLowerCase() !== state.currentVoter.toLowerCase());
  state.votes.push(voteData);
  saveState();

  alert("¡Gracias por votar! Tus votos han sido registrados.");
  state.currentVoter = null;
  Object.keys(currentSelections).forEach(k => delete currentSelections[k]);
  render();
}

function cancelVoting() {
  state.currentVoter = null;
  Object.keys(currentSelections).forEach(k => delete currentSelections[k]);
  render();
}

function renderAdmin(container) {
  container.innerHTML = `
    <div class="card">
      <h2>Panel de Administración</h2>
      <p style="color: var(--text-muted); margin-bottom: 1rem;">Gestiona categorías, nominados y revisa los votos.</p>
    </div>

    <div class="section-title">Categorías</div>
    <div id="categories-list"></div>
    <div class="card">
      <input type="text" id="new-cat-name" placeholder="Nombre de la categoría">
      <textarea id="new-cat-desc" placeholder="Descripción (opcional)" rows="2"></textarea>
      <button onclick="addCategory()">Añadir Categoría</button>
    </div>

    <div class="section-title">Nominados</div>
    <div id="nominees-list"></div>
    <div class="card">
      <select id="nominee-category">
        <option value="">Selecciona categoría</option>
        ${state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("")}
      </select>
      <input type="text" id="nominee-name" placeholder="Nombre del nominado">
      <input type="url" id="nominee-photo" placeholder="URL de la foto (Imgur, etc.)">
      <button onclick="addNominee()">Añadir Nominado</button>
    </div>

    <div class="section-title">Resultados</div>
    <div id="results-container"></div>

    <div class="section-title">Votos Individuales</div>
    <div id="individual-votes"></div>

    <button class="danger" onclick="resetAll()" style="margin-top: 2rem;">Reiniciar Todo (¡Cuidado!)</button>
  `;

  renderAdminLists();
}

function renderAdminLists() {
  // Categories
  const catList = document.getElementById("categories-list");
  if (catList) {
    catList.innerHTML = state.categories.map(cat => `
      <div class="card" style="padding: 1rem;">
        <strong>${cat.name}</strong>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${cat.description || ""}</p>
        <button class="danger" style="margin-top: 0.5rem; padding: 0.5rem;" onclick="deleteCategory('${cat.id}')">Eliminar</button>
      </div>
    `).join("") || "<p style='text-align:center; opacity:0.6;'>No hay categorías</p>";
  }

  // Nominees
  const nomList = document.getElementById("nominees-list");
  if (nomList) {
    nomList.innerHTML = state.nominees.map(nom => {
      const cat = state.categories.find(c => c.id === nom.categoryId);
      return `
        <div class="card" style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem;">
          <img src="${nom.photoUrl || 'https://via.placeholder.com/60'}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;" onerror="this.src='https://via.placeholder.com/60'">
          <div style="flex:1;">
            <strong>${nom.name}</strong><br>
            <small style="color: var(--text-muted);">${cat ? cat.name : "Sin categoría"}</small>
          </div>
          <button class="danger" style="padding: 0.4rem 0.6rem; width: auto;" onclick="deleteNominee('${nom.id}')">×</button>
        </div>
      `;
    }).join("") || "<p style='text-align:center; opacity:0.6;'>No hay nominados</p>";
  }

  // Results
  renderResults();
  renderIndividualVotes();
}

function addCategory() {
  const name = document.getElementById("new-cat-name").value.trim();
  const desc = document.getElementById("new-cat-desc").value.trim();
  if (!name) return alert("Escribe un nombre");
  state.categories.push({ id: generateId(), name, description: desc });
  saveState();
  render();
}

function deleteCategory(id) {
  if (!confirm("¿Eliminar categoría y sus nominados?")) return;
  state.categories = state.categories.filter(c => c.id !== id);
  state.nominees = state.nominees.filter(n => n.categoryId !== id);
  saveState();
  render();
}

function addNominee() {
  const categoryId = document.getElementById("nominee-category").value;
  const name = document.getElementById("nominee-name").value.trim();
  const photoUrl = document.getElementById("nominee-photo").value.trim();
  if (!categoryId || !name) return alert("Categoría y nombre son obligatorios");
  if (state.nominees.length >= 15) return alert("Máximo 15 nominados en total");
  state.nominees.push({ id: generateId(), name, photoUrl, categoryId });
  saveState();
  render();
}

function deleteNominee(id) {
  state.nominees = state.nominees.filter(n => n.id !== id);
  saveState();
  render();
}

function renderResults() {
  const container = document.getElementById("results-container");
  if (!container) return;

  // Calculate points per nominee
  const points = {};
  state.nominees.forEach(n => points[n.id] = 0);
  state.votes.forEach(vote => {
    vote.rankings.forEach(r => {
      if (points[r.nomineeId] !== undefined) {
        points[r.nomineeId] += r.points;
      }
    });
  });

  const sorted = state.nominees
    .map(n => ({ ...n, totalPoints: points[n.id] || 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  container.innerHTML = sorted.map((n, i) => `
    <div class="results-item">
      <span style="font-size:1.2rem; color: var(--gold); width: 30px;">${i+1}</span>
      <img src="${n.photoUrl || 'https://via.placeholder.com/50'}" onerror="this.src='https://via.placeholder.com/50'">
      <div class="info">
        <strong>${n.name}</strong><br>
        <small style="color: var(--text-muted);">${state.categories.find(c => c.id === n.categoryId)?.name || ""}</small>
      </div>
      <div class="points">${n.totalPoints}</div>
    </div>
  `).join("") || "<p style='text-align:center; opacity:0.6;'>Aún no hay votos</p>";
}

function renderIndividualVotes() {
  const container = document.getElementById("individual-votes");
  if (!container) return;

  container.innerHTML = state.votes.map(vote => {
    const details = vote.rankings.map(r => {
      const nom = state.nominees.find(n => n.id === r.nomineeId);
      const cat = state.categories.find(c => c.id === r.categoryId);
      return `<div style="font-size:0.85rem; margin-left:1rem;">• ${nom?.name || "?"} (${r.points} pts) en ${cat?.name || ""}</div>`;
    }).join("");
    return `
      <div class="card" style="padding: 0.75rem; margin-bottom: 0.5rem;">
        <strong>${vote.voterName}</strong>
        <small style="color: var(--text-muted);"> · ${new Date(vote.timestamp).toLocaleString("es")}</small>
        ${details}
      </div>
    `;
  }).join("") || "<p style='text-align:center; opacity:0.6;'>No hay votos todavía</p>";
}

function resetAll() {
  if (!confirm("¿Estás seguro? Esto borrará TODAS las categorías, nominados y votos.")) return;
  state.categories = [];
  state.nominees = [];
  state.votes = [];
  saveState();
  render();
}

// Admin login
document.getElementById("admin-btn").addEventListener("click", () => {
  if (state.isAdmin) {
    state.isAdmin = false;
    render();
    return;
  }
  const pass = prompt("Contraseña de administrador:");
  if (pass === ADMIN_PASSWORD) {
    state.isAdmin = true;
    state.currentVoter = null;
    render();
  } else if (pass !== null) {
    alert("Contraseña incorrecta");
  }
});

// Initial render
render();