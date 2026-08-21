const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Build Next.js without Turbopack (the environment has TURBOPACK=1 set by default)
const env = { ...process.env };
delete env.TURBOPACK;

execSync("npx next build", { stdio: "inherit", env });

// Cloudflare Pages expects "dist", Next.js exports to "out"
const distDir = path.join(__dirname, "dist");
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.renameSync(path.join(__dirname, "out"), distDir);