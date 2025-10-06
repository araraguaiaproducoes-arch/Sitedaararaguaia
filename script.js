// util
const anoEl = document.getElementById('ano'); if (anoEl) anoEl.textContent = new Date().getFullYear();

// Chamadas
const lista = document.getElementById('lista-chamadas');
const busca = document.getElementById('busca');
async function loadChamadas() {
  if (!lista) return;
  try {
    const res = await fetch('data/editais.json', {cache:'no-store'});
    const arr = await res.json();
    window.__EDITAIS__ = arr;
    renderChamadas(arr);
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
function renderChamadas(arr) {
  if (!lista) return;
  const term = (busca?.value || '').toLowerCase().trim();
  const list = arr.filter(e => e.status === 'Publicado')
    .filter(e => !term || (e.titulo + ' ' + e.linha + ' ' + e.objetivo).toLowerCase().includes(term));
  if (!list.length) { lista.innerHTML = '<p class="muted">Nenhuma chamada encontrada.</p>'; return; }
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
busca?.addEventListener('input', () => renderChamadas(window.__EDITAIS__ || []));

// Notícias
async function loadNoticias(limit=null) {
  try {
    const res = await fetch('data/noticias.json', {cache:'no-store'});
    let arr = await res.json();
    arr.sort((a,b)=> (b.dataISO||'').localeCompare(a.dataISO||''));
    if (limit) arr = arr.slice(0, limit);
    return arr;
  } catch { return []; }
}
async function renderNoticiasHome() {
  const box = document.getElementById('lista-noticias');
  if (!box) return;
  const arr = await loadNoticias(3);
  if (!arr.length) { box.innerHTML = '<p class="muted">Nenhuma notícia.</p>'; return; }
  box.innerHTML = arr.map(n => `
    <article class="card news-card">
      <h3>${n.titulo}</h3>
      ${n.subtitulo? `<p class="muted small">${n.subtitulo}</p>` : ''}
      <p class="muted small">${(n.dataISO||'').slice(0,10)}</p>
      ${n.capa? `<img src="${n.capa}" alt="" style="width:100%;border-radius:10px;border:1px solid var(--border)">` : ''}
      <div style="margin-top:8px">${n.corpoHTML||''}</div>
    </article>
  `).join('');
}
async function renderNoticiasPage() {
  const box = document.getElementById('noticias-lista');
  if (!box) return;
  const arr = await loadNoticias();
  if (!arr.length) { box.innerHTML = '<p class="muted">Nenhuma notícia.</p>'; return; }
  box.innerHTML = arr.map(n => `
    <article class="card news-card">
      <h3>${n.titulo}</h3>
      ${n.subtitulo? `<p class="muted small">${n.subtitulo}</p>` : ''}
      <p class="muted small">${(n.dataISO||'').slice(0,10)}</p>
      ${n.capa? `<img src="${n.capa}" alt="" style="width:100%;border-radius:10px;border:1px solid var(--border)">` : ''}
      <div style="margin-top:8px">${n.corpoHTML||''}</div>
    </article>
  `).join('');
}

// Forms (Formspree + LGPD)
function setupForm(idForm, idOk, idErr) {
  const form = document.getElementById(idForm);
  const ok = document.getElementById(idOk);
  const err = document.getElementById(idErr);
  if (!form) return;
  const endpoint = 'https://formspree.io/f/mvgwqzno';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    ok.hidden = true; err.hidden = true;
    const fd = new FormData(form);
    const file = fd.get('arquivo');
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) { err.hidden = false; err.textContent = 'Envie apenas PDF.'; return; }
    if (!fd.get('lgpd')) { err.hidden = false; err.textContent = 'É necessário aceitar a Política de Privacidade.'; return; }
    try {
      const r = await fetch(endpoint, { method: 'POST', body: fd, headers: {'Accept':'application/json'} });
      if (r.ok) { form.reset(); ok.hidden = false; ok.textContent = 'Inscrição enviada com sucesso'; }
      else { err.hidden = false; err.textContent = 'Falha ao enviar. Tente novamente.'; }
    } catch { err.hidden = false; err.textContent = 'Falha ao enviar. Tente novamente.'; }
  });
}
setupForm('form-edital-cultural', 'msgCultural', 'errCultural');
setupForm('inscricaoForm', 'msg', 'err');

// init
loadChamadas();
renderNoticiasHome();
renderNoticiasPage();
