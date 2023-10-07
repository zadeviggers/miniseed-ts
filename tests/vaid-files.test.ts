import { PromiseWithChild, exec as _exec } from "node:child_process";
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

async function checkData(data: Uint8Array, name: string) {
	const file = join(tempFolder, `${name}.mseed`);
	await writeFile(file, data);
	let error = false;
	let child: PromiseWithChild<{ stdout: string; stderr: string }>["child"];
	const promise = exec(`mseed3-validator ${file}`);
	child = promise.child;
	try {
		const { stderr } = await promise;
		expect(stderr).toBeFalsy();
	} catch (err) {
		error = true;
		const stdout = child.stdout?.read();
		const stderr = child.stderr?.read();
		console.error(
			name +
				": " +
				err +
				(stdout
					? "\nstdout: " + new TextDecoder().decode(stdout)
					: "") +
				(stdout ? "\nstderr: " + new TextDecoder().decode(stderr) : "")
		);
	}
	expect(error).toBe(false);
}

describe("Basic data validity", () => {
	it("Works with simple data", async () => {
		const data = [1, 2, 3, 4, 5, 6, 7, 8];
		const serialised = serialiseToMiniSEEDUint8Array(data, {
			sourceIdentifier: "https://zade.viggers.net/example",
			startTime: new Date(),
		});
		await checkData(serialised, "1-2-3");
	});
});

describe("Date validity", () => {
	it("Works with a 0 date", async () => {
		const serialised = serialiseToMiniSEEDUint8Array([], {
			sourceIdentifier: "https://zade.viggers.net/example",
			startTime: new Date(0),
		});
		await checkData(serialised, "date-0-auto");
	});
	// it("Works with a manually set 0 date", async () => {
	// 	const serialised = serialiseToMiniSEEDUint8Array([], {
	// 		sourceIdentifier: "https://zade.viggers.net/example",
	// 		startTime: {
	// 			dayOfYear: 0,
	// 			year: 0,
	// 			hour: 0,
	// 			minute: 0,
	// 			second: 0,
	// 			nanoSecond: 0,
	// 		},
	// 	});
	// 	await checkData(serialised, "date-0-manual");
	// });
	it("Works with a new date right now", async () => {
		const serialised = serialiseToMiniSEEDUint8Array([], {
			sourceIdentifier: "https://zade.viggers.net/example",
			startTime: new Date(),
		});
		await checkData(serialised, "date-utc");
	});
});
