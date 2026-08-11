const fs = require('fs');
const path = require('path');

/**
 * Prevents Vercel multi-service runner from failing with:
 * "ENOENT: no such file or directory, open '/vercel/output/services/backend/config.json'"
 * when Vercel is configured in Services Mode.
 */
const possiblePaths = [
  '/vercel/output/services/backend',
  path.resolve(__dirname, '../../.vercel/output/services/backend'),
  path.resolve(__dirname, '../.vercel/output/services/backend'),
  path.resolve(__dirname, '../../vercel/output/services/backend'),
  path.resolve(__dirname, '../vercel/output/services/backend')
];

possiblePaths.forEach((dir) => {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'config.json'),
      JSON.stringify({}, null, 2)
    );
    console.log(`[Vercel Services Fix] Ensured dummy backend config at: ${dir}/config.json`);
  } catch (err) {
    // ignore if path cannot be created
  }
});
