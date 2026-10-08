// Vercel Edge Middleware — runs on Vercel's edge network BEFORE any file is served.
// It gates every page behind a valid session cookie. The quiz content (index.html)
// is never sent to the browser unless the visitor is logged in.
//
// Credentials are read from environment variables you set in the Vercel dashboard:
//   AUTH_USER  and  AUTH_PASS
// They are NEVER shipped to the browser, so no one can read them from the page source.

export const config = {
  // Protect everything EXCEPT the login page, the auth API routes, and Vercel internals.
  matcher: ['/((?!api/|login\\.html|favicon\\.ico|robots\\.txt|_vercel/).*)'],
};

async function sessionToken(user, pass) {
  const data = new TextEncoder().encode(user + ':' + pass);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(header, name) {
  const raw = header || '';
  for (const part of raw.split(/; */)) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i) === name) return part.slice(i + 1);
  }
  return null;
}

export default async function middleware(request) {
  const USER = process.env.AUTH_USER || 'jen';
  const PASS = process.env.AUTH_PASS || 'changeme123';
  const expected = await sessionToken(USER, PASS);
  const got = readCookie(request.headers.get('cookie'), 'cb_session');

  if (got && got === expected) {
    return; // valid session -> serve the requested file
  }
  // Not logged in -> send them to the login page.
  return Response.redirect(new URL('/login.html', request.url), 302);
}
