import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			formats: ["es"],
			entry: "src/miniseed.ts",
			fileName: "miniseed",
		},
	},
});
