const { spawn } = require("child_process");
const fs = require("fs");

// Clean
["dist", "out", ".next"].forEach((d) => {
  if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
});

// Build without TURBOPACK
const env = Object.assign({}, process.env);
delete env.TURBOPACK;

const child = spawn(
  "node",
  ["node_modules/.bin/next", "build"],
  { stdio: "inherit", env }
);

child.on("close", (code) => {
  if (code === 0 && fs.existsSync("out")) {
    fs.renameSync("out", "dist");
  }
  process.exit(code || 0);
});