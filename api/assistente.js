export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const pass = req.headers['x-admin-pass'];
    if (!process.env.ADMIN_PASS) return res.status(500).json({ error: 'ADMIN_PASS não configurado' });
    if (!pass || pass !== process.env.ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });

    const { intent, input } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY ausente' });

    const sys = `Você é o Assistente da Araraguaia Produções.
Se INTENT=criar_edital: responda APENAS com JSON válido no formato
{{id?, titulo, linha, objetivo, publico, requisitos?, orcamento?, inscricoesInicio, inscricoesFim, linkEdital?, status:'Publicado'}}.

Se INTENT=criar_noticia: responda APENAS com JSON válido no formato
{{id?, titulo, subtitulo?, corpoHTML, dataISO?, capa?}} (corpo em HTML simples).

Se INTENT=criar_sobre: responda APENAS com JSON válido no formato
{{html: "<h1>Título</h1><p>...</p>"}}.`;

    const payload = {
      model: "o3-mini",
      input: [
        { role: "system", content: sys },
        { role: "user", content: `INTENT: ${intent}\nINPUT: ${input}` }
      ]
    };

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    if (!r.ok) return res.status(500).json({ error: 'OpenAI error', details: text });
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    const output = data.output_text || text;
    return res.status(200).json({ text: output });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'error' });
  }
}