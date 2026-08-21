const { execSync } = require("child_process");
const fs = require("fs");
const env = { ...process.env };
delete env.TURBOPACK;

try {
  const out = execSync("node node_modules/.bin/next build", {
    stdio: "pipe",
    env,
    timeout: 120000,
  });
  fs.writeFileSync("_build_output.txt", "SUCCESS\n" + out.toString());
} catch (e) {
  let log = "FAILED (exit " + e.status + ")\n";
  if (e.stdout) log += "STDOUT:\n" + e.stdout.toString() + "\n";
  if (e.stderr) log += "STDERR:\n" + e.stderr.toString() + "\n";
  fs.writeFileSync("_build_output.txt", log);
}