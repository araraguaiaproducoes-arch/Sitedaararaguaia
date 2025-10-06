const params = new URLSearchParams(location.search);
const adminMode = params.get('admin') === '1';
const openBtn = document.getElementById('openChat');
const chat = document.getElementById('chat-admin');
const closeBtn = document.getElementById('closeChat');
const intentEl = document.getElementById('chatIntent');
const promptEl = document.getElementById('chatPrompt');
const outEl = document.getElementById('chatOut');
const btnCriar = document.getElementById('btnCriar');
const btnPerg = document.getElementById('btnPerguntar');
const preview = document.getElementById('previewArea');
const pubArea = document.getElementById('publishArea');
const pubPath = document.getElementById('pubPath');
const pubMsg = document.getElementById('pubMsg');
const btnPublish = document.getElementById('btnPublish');
const downloadA = document.getElementById('downloadFile');
let ADMIN_PASS = null;

if (adminMode) openBtn.hidden = false;

openBtn?.addEventListener('click', async () => {
  if (!ADMIN_PASS) {
    ADMIN_PASS = sessionStorage.getItem('ADMIN_PASS') || prompt('Senha de administrador:');
    if (!ADMIN_PASS) return;
    sessionStorage.setItem('ADMIN_PASS', ADMIN_PASS);
  }
  chat.hidden = false;
  try {
    const h = await fetch('/api/health').then(r=>r.json());
    if (h.GITHUB_TOKEN === 'present') pubArea.style.display = 'flex';
  } catch {}
});
closeBtn?.addEventListener('click', () => chat.hidden = true);

async function callAssistant(intent, input) {
  outEl.textContent = 'Processando...';
  preview.innerHTML = ''; downloadA.style.display = 'none';
  if (!ADMIN_PASS) {
    ADMIN_PASS = sessionStorage.getItem('ADMIN_PASS') || prompt('Senha de administrador:');
    if (!ADMIN_PASS) return;
    sessionStorage.setItem('ADMIN_PASS', ADMIN_PASS);
  }
  try {
    const r = await fetch('/api/assistente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pass': ADMIN_PASS },
      body: JSON.stringify({ intent, input })
    });
    if (r.status === 401) { sessionStorage.removeItem('ADMIN_PASS'); ADMIN_PASS = null; outEl.textContent='Senha incorreta.'; return; }
    const data = await r.json();
    const text = data.text || '';
    outEl.textContent = text;

    let start = text.indexOf('{');
    if (start < 0) return;
    let parsed; try { parsed = JSON.parse(text.slice(start)); } catch { return; }

    if (intent === 'criar_edital') handleEdital(parsed);
    if (intent === 'criar_noticia') handleNoticia(parsed);
    if (intent === 'criar_sobre') handleSobre(parsed);
  } catch (e) {
    outEl.textContent = 'Erro: '+(e?.message||e);
  }
}

btnCriar?.addEventListener('click', () => {
  const intent = intentEl.value;
  const input = promptEl.value.trim();
  if (!input) return;
  callAssistant(intent, input);
});
btnPerg?.addEventListener('click', () => {
  const input = promptEl.value.trim();
  if (!input) return;
  callAssistant('responder_duvida', input);
});

function downloadBlob(filename, content) {
  const blob = new Blob([content], {type:'application/octet-stream'});
  const url = URL.createObjectURL(blob);
  downloadA.href = url; downloadA.download = filename; downloadA.style.display = 'inline-block';
}

async function handleEdital(newEd) {
  if (!window.__EDITAIS__) window.__EDITAIS__ = [];
  if (!newEd.id) newEd.id = (newEd.titulo||'edital').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40);
  const idx = window.__EDITAIS__.findIndex(e => e.id === newEd.id);
  if (idx >= 0) window.__EDITAIS__[idx] = {...window.__EDITAIS__[idx], ...newEd}; else window.__EDITAIS__.push(newEd);
  preview.innerHTML = `<div class="card"><h3>Pré-visualização do Edital</h3><pre class="pre">${JSON.stringify(newEd,null,2)}</pre></div>`;
  downloadBlob('editais.json', JSON.stringify(window.__EDITAIS__, null, 2));
  pubPath.value = 'data/editais.json';
  pubMsg.value = `Atualizar edital: ${newEd.titulo||newEd.id}`;
}

async function handleNoticia(n) {
  if (!window.__NEWS__) { try { window.__NEWS__ = await (await fetch('data/noticias.json')).json(); } catch { window.__NEWS__ = []; } }
  if (!n.id) n.id = (n.titulo||'noticia').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40);
  if (!n.dataISO) n.dataISO = new Date().toISOString().slice(0,10);
  const idx = window.__NEWS__.findIndex(x=>x.id===n.id);
  if (idx>=0) window.__NEWS__[idx] = {...window.__NEWS__[idx], ...n}; else window.__NEWS__.push(n);
  preview.innerHTML = `<div class="card"><h3>Pré-visualização da Notícia</h3><div class="pre">${n.corpoHTML||''}</div></div>`;
  downloadBlob('noticias.json', JSON.stringify(window.__NEWS__, null, 2));
  pubPath.value = 'data/noticias.json';
  pubMsg.value = `Publicar notícia: ${n.titulo||n.id}`;
}

async function handleSobre(s) {
  let html = s.html || (typeof s === 'string' ? s : JSON.stringify(s));
  preview.innerHTML = `<div class="card"><h3>Pré-visualização da Página Sobre</h3><div class="pre">${html.replace(/</g,'&lt;')}</div></div>`;
  // Wrap into a complete HTML file (head+footer) or keep raw. We'll keep raw for replace on sobre.html
  downloadBlob('sobre.html', html);
  pubPath.value = 'sobre.html';
  pubMsg.value = 'Atualizar página Sobre';
}

btnPublish?.addEventListener('click', async () => {
  if (!ADMIN_PASS) { alert('Abra o chat novamente para informar a senha.'); return; }
  const path = pubPath.value.trim(); const message = pubMsg.value.trim();
  if (!path) return alert('Informe o caminho do arquivo.');
  const url = downloadA.href; if (!url) return alert('Gere um arquivo primeiro.');
  const resp = await fetch(url); const content = await resp.text();
  try {
    const r = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-admin-pass': ADMIN_PASS },
      body: JSON.stringify({ path, content, message })
    });
    const j = await r.json();
    if (!r.ok) { alert('Falha ao publicar: '+ (j?.error||r.status)); return; }
    alert('Publicado no GitHub!');
  } catch (e) { alert('Erro: '+(e?.message||e)); }
});

(async () => { if (!adminMode) return; openBtn.hidden = false; })();
