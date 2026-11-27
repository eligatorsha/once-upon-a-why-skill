import { Config } from "@remotion/cli/config";

// Vertical video defaults for this studio.
Config.setVideoImageFormat("jpeg");
Config.setConcurrency(null); // auto
Config.setCodec("h264");
// Output is written under out/ (see package.json "render" script).
Config.setOverwriteOutput(true);
