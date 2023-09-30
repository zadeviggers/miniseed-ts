import { describe, it, expect } from "vitest";
import { Flags } from "../src/miniseed";

describe("Flags", () => {
	it("Can be OR'd", () => {
		expect(
			Flags.TIME_TAG_IS_QUESTIONABLE | Flags.CALIBRATION_SIGNALS_PRESENT
		).toEqual(0b11000000);
		expect(Flags.CLOCK_LOCKED | Flags.CALIBRATION_SIGNALS_PRESENT).toEqual(
			0b10100000
		);
		expect(
			Flags.CLOCK_LOCKED |
				Flags.CALIBRATION_SIGNALS_PRESENT |
				Flags.TIME_TAG_IS_QUESTIONABLE
		).toEqual(0b11100000);
	});
});
