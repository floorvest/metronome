const { execSync } = require("child_process");
const fs = require("fs");

["dist", "out", ".next"].forEach((d) => {
  if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
});

const env = { ...process.env };
delete env.TURBOPACK;

let result = "";
try {
  result = execSync("node node_modules/.bin/next build", {
    stdio: "pipe",
    env,
    maxBuffer: 10 * 1024 * 1024,
  }).toString();
  result += "\nBUILD OK";
  if (fs.existsSync("out")) fs.renameSync("out", "dist");
} catch (e) {
  result =
    "FAILED (exit " + e.status + ")\n" +
    (e.stdout ? e.stdout.toString().slice(-5000) : "(no stdout)") +
    "\n" +
    (e.stderr ? e.stderr.toString().slice(-5000) : "(no stderr)");
}

fs.writeFileSync("_b.txt", result);
process.exit(0);