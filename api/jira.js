export default async function handler(req, res) {
  const { JIRA_BASE_URL: base, JIRA_EMAIL: email, JIRA_API_TOKEN: token } = process.env;
  if (!base || !email || !token) return res.status(503).json({ issues: [], error: 'Jira nao configurado' });
  try {
    const creds = Buffer.from(`${email}:${token}`).toString('base64');
    const jql   = encodeURIComponent('project = INT AND status = "Aguardando Comercial" AND updated <= "-5d" ORDER BY updated ASC');
    const r = await fetch(`${base}/rest/api/3/search?jql=${jql}&fields=summary,assignee,updated,comment&maxResults=50`, {
      headers: { 'Authorization': `Basic ${creds}`, 'Accept': 'application/json' }
    });
    if (!r.ok) { console.error('[jira]', r.status, await r.text()); return res.status(500).json({ issues: [], error: 'Jira API error' }); }
    const data = await r.json();
    res.setHeader('Cache-Control', 'max-age=300');
    res.status(200).json(data);
  } catch(e) {
    console.error('[jira]', e.message);
    res.status(500).json({ issues: [], error: e.message });
  }
}
