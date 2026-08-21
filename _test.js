const { execSync } = require("child_process");
const fs = require("fs");
const env = { ...process.env };
delete env.TURBOPACK;

let result = "";
try {
  const out = execSync("node node_modules/next/dist/bin/next build", {
    env,
    timeout: 120000,
    stdio: "pipe",
  });
  result = out.toString();
} catch (e) {
  result = "FAILED (exit " + e.status + ")\n";
  if (e.stdout) result += "STDOUT:\n" + e.stdout.toString().slice(-5000) + "\n";
  if (e.stderr) result += "STDERR:\n" + e.stderr.toString().slice(-5000) + "\n";
}

fs.writeFileSync("_build.log", result);
process.exit(0);