const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Unset TURBOPACK to force webpack (Next.js 15 uses Turbopack for builds when env var is set)
const env = { ...process.env };
delete env.TURBOPACK;

try {
  execSync("npx next build", { stdio: "inherit", env });
} catch (e) {
  process.exit(1);
}

// Cloudflare Pages expects "dist", Next.js exports to "out"
const distDir = path.join(__dirname, "dist");
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

const outDir = path.join(__dirname, "out");
if (fs.existsSync(outDir)) {
  fs.renameSync(outDir, distDir);
}