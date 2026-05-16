export default async function handler(req, res) {
  const { JIRA_BASE_URL: base, JIRA_EMAIL: email, JIRA_API_TOKEN: token } = process.env;
  if (!base || !email || !token) return res.status(503).json({ issues: [], error: 'Jira nao configurado' });
  try {
    const creds = Buffer.from(`${email}:${token}`).toString('base64');
    const r = await fetch(`${base}/rest/api/3/search/jql`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${creds}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jql: 'project = "INT" AND status = "Aguardando Comercial" AND created <= "-5d" ORDER BY created ASC',
        maxResults: 50,
        fields: ['summary', 'assignee', 'reporter', 'updated', 'created', 'comment']
      })
    });
    const data = await r.json();
    console.log('[jira] status:', r.status, '| total:', data.total, '| issues:', data.issues?.length);
    if (!r.ok) return res.status(500).json({ issues: [], error: JSON.stringify(data.errorMessages) });
    res.setHeader('Cache-Control', 'max-age=300');
    res.status(200).json(data);
  } catch(e) {
    console.error('[jira]', e.message);
    res.status(500).json({ issues: [], error: e.message });
  }
}
