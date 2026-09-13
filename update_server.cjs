const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /\/\/ ─── Server Startup & Vite Integration ──────────────────────────────────────/g,
  "// ─── Server Startup & Vite Integration ──────────────────────────────────────\nexport default app;\n"
);
code = code.replace(
  /async function startServer\(\) \{\n  await seedInitialOrders\(\);\n/g,
  "async function startServer() {\n  await seedInitialOrders();\n\n  // Skip static serving and binding port if running as Vercel serverless function\n  if (process.env.VERCEL) {\n    return;\n  }\n"
);
code = code.replace(
  /startServer\(\)\.catch\(\(err\) => \{\n  console\.error\('Failed to start server:', err\);\n  process\.exit\(1\);\n\}\);/g,
  "startServer().catch((err) => {\n  console.error('Failed to start server:', err);\n  if (!process.env.VERCEL) process.exit(1);\n});"
);
fs.writeFileSync('server.ts', code);
