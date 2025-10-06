// Helpers
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mvgwqzno';

function setupForm(formId, okId, errId) {
  const form = document.getElementById(formId);
  const ok = document.getElementById(okId);
  const err = document.getElementById(errId);
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    ok.hidden = true; err.hidden = true;

    const fd = new FormData(form);
    // PDF only
    const file = fd.get('arquivo');
    if (!file || !file.name || !file.name.toLowerCase().endsWith('.pdf')) {
      err.hidden = false;
      err.textContent = 'Envie apenas PDF.';
      return;
    }
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } });
      if (res.ok) { form.reset(); ok.hidden = false; ok.textContent = 'Inscrição enviada com sucesso'; }
      else { err.hidden = false; err.textContent = 'Falha ao enviar. Tente novamente.'; }
    } catch {
      err.hidden = false; err.textContent = 'Falha ao enviar. Tente novamente.';
    }
  });
}

async function loadChamadas() {
  const lista = document.getElementById('lista-chamadas');
  const busca = document.getElementById('busca');
  try {
    const res = await fetch('data/editais.json', {cache:'no-store'});
    const arr = await res.json();
    window.__EDITAIS__ = arr;
    renderChamadas(arr, lista, busca);
    busca.addEventListener('input', () => renderChamadas(arr, lista, busca));
  } catch (e) {
    lista.innerHTML = '<p class="muted">Nenhuma chamada no momento.</p>';
  }
}

function isAberto(e) {
  if (e.status !== 'Publicado') return false;
  if (!e.inscricoesInicio || !e.inscricoesFim) return true;
  const now = new Date();
  const ini = new Date(e.inscricoesInicio + 'T00:00:00');
  const fim = new Date(e.inscricoesFim + 'T23:59:59');
  return now >= ini && now <= fim;
}

function renderChamadas(arr, lista, busca) {
  const term = (busca.value || '').toLowerCase().trim();
  const list = arr
    .filter(e => e.status === 'Publicado')
    .filter(e => !term || (e.titulo + ' ' + e.linha + ' ' + e.objetivo).toLowerCase().includes(term));

  if (!list.length) {
    lista.innerHTML = '<p class="muted">Nenhuma chamada encontrada.</p>';
    return;
  }

  lista.innerHTML = list.map(e => `
    <article class="card">
      <header class="row space">
        <div>
          <h3 style="margin:0 0 4px">${e.titulo}</h3>
          <span class="badge">${e.linha || '—'}</span>
        </div>
        ${isAberto(e) ? '<span class="badge" style="background:#0f2; color:#001">Inscrições abertas</span>' : ''}
      </header>
      <p style="margin:8px 0 0"><strong>Objetivo:</strong> ${e.objetivo || '—'}</p>
      <p style="margin:4px 0 0"><strong>Público:</strong> ${e.publico || '—'}</p>
      <p class="muted small" style="margin:6px 0 0">Inscrições: ${e.inscricoesInicio || '—'} a ${e.inscricoesFim || '—'}</p>
      ${isAberto(e) && e.linkEdital ? `<p style="margin:10px 0 0"><a class="btn primary" href="${e.linkEdital}">Inscreva-se</a></p>` : ''}
    </article>
  `).join('');
}

setupForm('form-edital-cultural', 'msgCultural', 'errCultural');
setupForm('inscricaoForm', 'msg', 'err');
loadChamadas();
