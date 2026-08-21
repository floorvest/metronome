const { execSync } = require("child_process");
const fs = require("fs");

// Clean
["dist", "out", ".next"].forEach((d) => {
  if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
});

// Build without TURBOPACK
const env = Object.assign({}, process.env);
delete env.TURBOPACK;

try {
  const out = execSync("npx next build", { stdio: "pipe", env });
  fs.writeFileSync("_build_result.txt", out.toString() + "\nSUCCESS");
} catch (e) {
  fs.writeFileSync(
    "_build_result.txt",
    "FAILED (exit " + e.status + ")\n" +
    (e.stdout ? e.stdout.toString().slice(-5000) : "(no stdout)") + "\n" +
    (e.stderr ? e.stderr.toString().slice(-5000) : "(no stderr)")
  );
}