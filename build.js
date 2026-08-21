const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// The environment has TURBOPACK=1 set, which forces Turbopack even on versions
// that don't support it for builds. We must explicitly remove it.
const env = { ...process.env };
delete env.TURBOPACK;

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