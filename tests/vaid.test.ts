import { exec as _exec } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { serialiseToMiniSEEDUint8Array } from "../src/miniseed";

const exec = promisify(_exec);

const tempFolder = join(__dirname, "../test-temp/");

beforeAll(async () => {
	await mkdir(tempFolder);
});

afterAll(async () => {
	await rm(tempFolder, { recursive: true });
});

describe("Generated data validity", () => {
	it("mseed3-validator", async () => {
		const data = [1, 2, 3, 4, 5, 6, 7, 8];
		const serialised = serialiseToMiniSEEDUint8Array(data, {
			startTime: new Date(),
			sourceIdentifier: "https://zade.viggers.net/example",
		});

		const file = join(tempFolder, "obspy-1.mseed");
		await writeFile(file, serialised);

		try {
			const { stderr, stdout } = await exec(`mseed3-validator ${file}`);
			expect(stderr).toBeFalsy();
		} catch (err) {
			throw err;
		}
	});
});
