export default async function handler(req, res) {
  const base = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  const auth = Buffer.from(`${email}:${token}`).toString('base64');

  // Pega 1 ticket com tudo expandido
  const r = await fetch(`${base}/rest/api/3/search/jql`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      jql: `project = "INT" AND status = "Aguardando Comercial" ORDER BY created ASC`,
      fields: ["*all"],
      expand: ["changelog"],
      maxResults: 1
    })
  });

  const data = await r.json();
  const issue = data.issues?.[0];
  if (!issue) return res.json({ error: 'nenhum ticket' });

  // Retorna campos disponiveis + changelog resumido
  const fields = Object.keys(issue.fields).filter(k => issue.fields[k] !== null);
  const changelog = issue.changelog?.histories?.slice(0, 5).map(h => ({
    created: h.created,
    items: h.items.map(i => ({ field: i.field, from: i.fromString, to: i.toString }))
  }));

  res.json({ fields, changelog, sample: issue.fields });
}
