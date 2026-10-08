// Edge function: clears the session cookie and sends the user back to the login page.
export const config = { runtime: 'edge' };

export default async function handler() {
  const cookie = 'cb_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
  return new Response(null, {
    status: 302,
    headers: { 'set-cookie': cookie, location: '/login.html' },
  });
}
