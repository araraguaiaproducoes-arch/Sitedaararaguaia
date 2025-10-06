export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const pass = req.headers['x-admin-pass'];
    if (!process.env.ADMIN_PASS) return res.status(500).json({ error: 'ADMIN_PASS não configurado' });
    if (!pass || pass !== process.env.ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    if (!token || !owner || !repo) return res.status(500).json({ error: 'GITHUB_* não configurado' });

    const { path, content, message } = req.body || {};
    if (!path || !content) return res.status(400).json({ error: 'path e content são obrigatórios' });

    const api = "https://api.github.com";
    async function getSha() {
      const r = await fetch(`${api}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`, {
        headers: { Authorization: `Bearer ${token}`, "User-Agent": "araraguaia-bot" }
      });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error('Erro ao obter SHA: '+await r.text());
      const j = await r.json(); return j.sha;
    }
    const sha = await getSha();

    const body = {
      message: message || `Atualiza ${path}`,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch,
      sha: sha || undefined
    };

    const put = await fetch(`${api}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, "User-Agent": "araraguaia-bot", "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const out = await put.json();
    if (!put.ok) return res.status(500).json({ error: 'Falha no commit', details: out });
    return res.status(200).json({ ok: true, content: out.content?.path, commit: out.commit?.sha });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'error' });
  }
}