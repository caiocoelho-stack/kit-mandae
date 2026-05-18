export default async function handler(req, res) {
  const base = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const headers = { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json', 'Accept': 'application/json' };

  // 1. Lista todos os campos configurados no Jira
  const fieldsResp = await fetch(`${base}/rest/api/3/field`, { headers });
  const allFields = await fieldsResp.json();
  const customFields = allFields.filter(f => f.custom).map(f => ({ id: f.id, name: f.name }));

  // 2. Pega 1 ticket com changelog
  const searchResp = await fetch(`${base}/rest/api/3/search/jql`, {
    method: 'POST', headers,
    body: JSON.stringify({
      jql: `project = "INT" AND status = "Aguardando Comercial" AND created <= "-20d" ORDER BY created ASC`,
      fields: ["summary", "status", "assignee", "reporter", "created", "comment"],
      expand: ["changelog"],
      maxResults: 1
    })
  });
  const searchData = await searchResp.json();
  const issue = searchData.issues?.[0];
  const changelog = issue?.changelog?.histories?.slice(0, 10).map(h => ({
    created: h.created,
    items: h.items.filter(i => i.field === 'status').map(i => ({ from: i.fromString, to: i.toString }))
  })).filter(h => h.items.length > 0);

  res.json({ customFields, changelog, issueKey: issue?.key });
}
