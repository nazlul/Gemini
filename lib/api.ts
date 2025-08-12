export async function apiPost(path: string, body: any) {
  const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
export async function apiGet(path: string) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
