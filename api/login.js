// Edge function: checks the submitted username/password against the environment
// variables AUTH_USER / AUTH_PASS. On success it sets an HttpOnly session cookie.
// The password is compared here, on the server — it is never exposed to the browser.

export const config = { runtime: 'edge' };

async function sessionToken(user, pass) {
  const data = new TextEncoder().encode(user + ':' + pass);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  const USER = process.env.AUTH_USER || 'jen';
  const PASS = process.env.AUTH_PASS || 'changeme123';

  let body = {};
  try { body = await request.json(); } catch (e) { body = {}; }
  const u = String(body.username || '').trim();
  const p = String(body.password || '');

  if (u === USER && p === PASS) {
    const token = await sessionToken(USER, PASS);
    const maxAge = 60 * 60 * 24 * 30; // 30 days
    const cookie = `cb_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'set-cookie': cookie },
    });
  }

  // Small delay to slow down guessing.
  await new Promise((r) => setTimeout(r, 500));
  return new Response(JSON.stringify({ ok: false, error: 'Incorrect username or password.' }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  });
}
