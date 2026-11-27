// bundles check_captions.ts for node (esbuild) and runs it
import { build } from "esbuild";
import { execFileSync } from "child_process";
const out = "node_modules/.cache/ouaw01-check.cjs";
await build({ entryPoints: ["episodes/ouaw-01-monday/check_captions.ts"], bundle: true, platform: "node", format: "cjs", outfile: out, logLevel: "error", jsx: "automatic", loader: { ".tsx": "tsx" }, external: ["@remotion/*", "remotion", "@react-three/*", "react", "react-dom"] });
execFileSync("node", [out], { stdio: "inherit" });
