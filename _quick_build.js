const { execSync } = require("child_process");
const fs = require("fs");

// Install deps
execSync("npm install", { stdio: "inherit" });

// Clean
["dist", "out", ".next"].forEach((d) => {
  if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
});

// Build with TURBOPACK unset via shell
execSync("unset TURBOPACK && npx next build", {
  stdio: "inherit",
  shell: "/bin/sh",
});

// Rename for Cloudflare
fs.renameSync("out", "dist");
console.log("SUCCESS: dist/ ready");