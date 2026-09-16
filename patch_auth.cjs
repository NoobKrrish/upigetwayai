const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace activeTokens definition
code = code.replace(
  /const activeTokens = new Map<string, string>\(\);\n/,
  `const SECRET = process.env.SESSION_SECRET || 'fallback-secret-for-demo';

function generateToken(username: string) {
  const payload = Buffer.from(JSON.stringify({ username, exp: Date.now() + 86400000 })).toString('base64');
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return \`\${payload}.\${signature}\`;
}

function verifyToken(token: string) {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    if (expected !== signature) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (data.exp < Date.now()) return null;
    return data.username;
  } catch (e) {
    return null;
  }
}
`
);

// Replace requireAuth logic
code = code.replace(
  /  const token = authHeader\.split\(' '\)\[1\];\n  if \(\!activeTokens\.has\(token\)\) \{\n    return res\.status\(401\)\.json\(\{ success: false, error: 'Unauthorized: Invalid token' \}\);\n  \}\n  next\(\);\n\}/,
  `  const token = authHeader.split(' ')[1];
  const username = verifyToken(token);
  if (!username) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
  }
  (req as any).user = { username };
  next();
}`
);

// Replace login token generation
code = code.replace(
  /    const token = crypto\.randomBytes\(16\)\.toString\('hex'\);\n    activeTokens\.set\(token, username\);\n    return res\.json\(\{ success: true, token \}\);/,
  `    const token = generateToken(username);
    return res.json({ success: true, token });`
);

// Replace currentUsername lookup in change-credentials
code = code.replace(
  /  const currentUsername = activeTokens\.get\(token\);\n/,
  `  const currentUsername = verifyToken(token);\n`
);

// Update change-credentials user lookup to allow updating the 'admin' if they changed username
// (Wait, `users` map is still in-memory, so if they change credentials on Vercel, it won't persist!)

fs.writeFileSync('server.ts', code);
