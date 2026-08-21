const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Step 1: Install dependencies
console.log("=== Installing dependencies ===");
execSync("npm install", { stdio: "inherit" });

const nextVersion = require("next/package.json").version;
console.log("Next.js version:", nextVersion);

// Step 2: Clean previous build artifacts
console.log("=== Cleaning ===");
["dist", "out", ".next"].forEach((dir) => {
  const full = path.join(__dirname, dir);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true, force: true });
    console.log("Removed:", dir);
  }
});

// Step 3: Build Next.js — use direct node invocation, unset TURBOPACK
console.log("=== Building ===");
const env = { ...process.env };
delete env.TURBOPACK;

execSync(
  `"${process.execPath}" "${path.join(__dirname, "node_modules", ".bin", "next")}" build`,
  { stdio: "inherit", env }
);

// Step 4: Rename out/ to dist/ for Cloudflare Pages
console.log("=== Renaming out/ -> dist/ ===");
fs.renameSync(path.join(__dirname, "out"), path.join(__dirname, "dist"));
console.log("Build complete — output in dist/");