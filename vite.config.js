import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
	build: {
		lib: {
			formats: ["es"],
			entry: resolve(__dirname, "src/miniseed.ts"),
			fileName: "miniseed",
			name: "miniSEED-ts",
		},
	},
});
