import typescript from "rollup-plugin-typescript2";
import config from "../rollup-config-build";
import pkg from "./package.json";
const { join } = require("path");
const staticDir = join(__dirname, "../");
const cgx = "@cryptographix";

export default config(pkg, {});
