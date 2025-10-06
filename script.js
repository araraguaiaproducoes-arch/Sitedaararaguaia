// Year
const elAno = document.getElementById('ano'); if (elAno) elAno.textContent = new Date().getFullYear();

// Chamadas (home)
const lista = document.getElementById('lista-chamadas');
async function loadChamadas() {
  if (!lista) return;
  try {
    const res = await fetch('data/editais.json', {cache:'no-store'});
    const arr = await res.json();
    if (!arr.length) { lista.innerHTML = '<p class="muted">Nenhuma chamada no momento.</p>'; return; }
    lista.innerHTML = arr.map(e => `
      <article class="card">
        <header class="row space">
          <div>
            <h3 style="margin:0 0 4px">${e.titulo}</h3>
            <span class="badge">${e.linha || '—'}</span>
          </div>
        </header>
        <p style="margin:8px 0 0"><strong>Objetivo:</strong> ${e.objetivo || '—'}</p>
        <p class="muted small" style="margin:6px 0 0">Inscrições: ${e.inscricoesInicio || '—'} a ${e.inscricoesFim || '—'}</p>
      </article>
    `).join('');
  } catch (e) {
    lista.innerHTML = '<p class="muted">Falha ao carregar chamadas.</p>';
  }
}
loadChamadas();