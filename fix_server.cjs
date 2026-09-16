const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Remove top-level vite import
code = code.replace(/import \{ createServer as createViteServer \} from 'vite';\n/, '');

// Replace createViteServer call with dynamic import
code = code.replace(
  /const vite = await createViteServer\(\{/g,
  "const { createServer: createViteServer } = await import('vite');\n    const vite = await createViteServer({"
);

fs.writeFileSync('server.ts', code);
