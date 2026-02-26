import { defineConfig } from "tsup";
import * as esbuild from "esbuild";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "components/index": "src/components/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
  splitting: false,
  outDir: "dist",
  esbuildOptions(options) {
    options.jsx = "automatic";
    options.jsxImportSource = "preact";
  },
  esbuildPlugins: [
    {
      name: "text-loader",
      setup(build) {
        build.onLoad({ filter: /\.scss$/ }, async (args) => {
          const sass = await import("sass");
          const result = sass.compile(args.path);
          return { contents: result.css, loader: "text" };
        });

        build.onLoad({ filter: /\.inline\.ts$/ }, async (args) => {
          const result = await esbuild.build({
            entryPoints: [args.path],
            bundle: true,
            write: false,
            format: "iife",
            target: "es2022",
            minify: false,
            platform: "browser",
          });
          const code = result.outputFiles?.[0]?.text ?? "";
          return {
            contents: `export default ${JSON.stringify(code)};`,
            loader: "ts",
          };
        });
      },
    },
  ],
});
