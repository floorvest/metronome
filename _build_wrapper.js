// Wrapper to run next build without TURBOPACK env var
const { spawn } = require("child_process");
const env = { ...process.env };
delete env.TURBOPACK;

const child = spawn("node", ["node_modules/.bin/next", "build"], {
  stdio: "inherit",
  env,
});

child.on("exit", (code) => {
  process.exit(code || 0);
});