const { execSync } = require("child_process");

// Unset TURBOPACK so next build uses webpack, not turbopack
const env = { ...process.env };
delete env.TURBOPACK;

try {
  execSync("npx next build", { stdio: "inherit", env });
} catch (e) {
  process.exit(1);
}