export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const base = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const { issueKey, text } = req.body || {};
  if (!issueKey || !text) return res.status(400).json({ error: 'issueKey e text obrigatorios' });
  try {
    const r = await fetch(`${base}/rest/api/3/issue/${issueKey}/comment`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ body: { type: "doc", version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: `[Hub de Vendas]\n${text}` }] }] } })
    });
    if (!r.ok) { const t = await r.text(); return res.status(r.status).json({ error: t }); }
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
}
