const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Next.js 15.x: explicitly unset TURBOPACK to force webpack build
const env = { ...process.env };
delete env.TURBOPACK;
delete env.NEXT_TURBOPACK;
delete env.__NEXT_TURBOPACK;

try {
  execSync("npx next build", { stdio: "inherit", env });
} catch (e) {
  process.exit(1);
}

// Cloudflare Pages expects the output in "dist", but Next.js exports to "out".
// Remove any existing dist directory, then rename out -> dist.
const distDir = path.join(__dirname, "dist");
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.renameSync(path.join(__dirname, "out"), distDir);