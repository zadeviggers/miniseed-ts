import { describe, it, expect } from "vitest";
import { startTimeFromDate, serialiseToMiniSEEDBuffer } from "../src/miniseed";
import jDataView from "z-jdataview-temp-publish";

describe("Date utilities", () => {
	it("Works with a set date", () => {
		const date = new Date("21 September 1978 21:45:30");
		const startTime = startTimeFromDate(date);
		expect(startTime.year).toEqual(1978);
		expect(startTime.dayOfYear).toEqual(264);
		expect(startTime.hour).toEqual(21);
		expect(startTime.minute).toEqual(45);
		expect(startTime.second).toEqual(30);
		expect(startTime.nanoSecond).toEqual(0);
	});
	it("Handles milliseconds correctly", () => {
		const date = new Date("21 September 1978");
		date.setMilliseconds(500);
		const startTime = startTimeFromDate(date);
		expect(startTime.nanoSecond).toEqual(500_000_000);
	});
	it("Handles day-of-year edge cases", () => {
		const date1 = new Date("29 February 2016");
		const startTime1 = startTimeFromDate(date1);
		expect(startTime1.dayOfYear).toEqual(60);

		const date2 = new Date("1 March 2016");
		const startTime2 = startTimeFromDate(date2);
		expect(startTime2.dayOfYear).toEqual(61);
	});
	it("Handles day-of-year edge cases", () => {
		const date1 = new Date("29 February 2016");
		const startTime1 = startTimeFromDate(date1);
		expect(startTime1.dayOfYear).toEqual(60);

		const date2 = new Date("1 March 2016");
		const startTime2 = startTimeFromDate(date2);
		expect(startTime2.dayOfYear).toEqual(61);
	});
});

describe("Date serialisation", () => {
	it("Sets date fields correctly", () => {
		const date = new Date("21 September 1978 21:45:30");
		const view = new jDataView(
			serialiseToMiniSEEDBuffer([1, 2, 3], {
				sourceIdentifier: "https://zade.viggers.net/example",
				startTime: startTimeFromDate(date),
			}),
			undefined,
			undefined,
			true
		);

		console.log(view.buffer);

		expect(view.getUint32(4)).toEqual(0); // nanosecond
		expect(view.getUint16(8)).toEqual(1978); // year
		expect(view.getUint16(10)).toEqual(264); // day of year
		expect(view.getUint8(12, false)).toEqual(21); // hour
		expect(view.getUint8(13, false)).toEqual(45); // minute
		expect(view.getUint8(14, false)).toEqual(30); // second
	});
});
