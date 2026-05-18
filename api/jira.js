export default async function handler(req, res) {
  const base = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  if (!base || !email || !token) return res.status(500).json({ error: 'Jira env vars missing' });
  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  try {
    const r = await fetch(`${base}/rest/api/3/search/jql`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        jql: `project = "INT" AND status = "Aguardando Comercial" AND created <= "-20d" ORDER BY created ASC`,
        fields: [
          "summary", "assignee", "reporter", "updated", "created", "comment", "status",
          "customfield_13646", "customfield_13670", "customfield_13672",
          "customfield_13693", "customfield_13698", "customfield_10222", "customfield_10223"
        ],
        expand: "changelog",
        maxResults: 50
      })
    });
    if (!r.ok) { const t = await r.text(); return res.status(r.status).json({ error: t }); }
    const data = await r.json();
    res.json({ issues: data.issues || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
