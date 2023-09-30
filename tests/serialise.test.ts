import { describe, it, expect } from "vitest";
import {
	serialiseToMiniSEEDBuffer,
	serialiseToMiniSEEDUint8Array,
} from "../src/miniseed";
import jDataView from "z-jdataview-temp-publish";

describe("Size", () => {
	it("Works with no data", () => {
		const serialised = serialiseToMiniSEEDUint8Array([], {
			sourceIdentifier: "",
			startTime: new Date(),
		});
		expect(serialised.length).toEqual(40);
	});
	it("Works with complex identifiers", () => {
		const serialised = serialiseToMiniSEEDUint8Array([], {
			sourceIdentifier: "🔥🦊",
			startTime: new Date(),
		});
		expect(serialised.length).toEqual(48);
	});
	it("Works with complex extra headers", () => {
		const serialised = serialiseToMiniSEEDUint8Array([], {
			sourceIdentifier: "",
			extraHeaderFields: {
				// Courtesy of Adobe https://opensource.adobe.com/Spry/samples/data_region/JSONDataSetSample.html#ExampleX4
				items: {
					item: [
						{
							id: "0001",
							type: "donut",
							name: "Cake",
							ppu: 0.55,
							batters: {
								batter: [
									{ id: "1001", type: "Regular" },
									{ id: "1002", type: "Chocolate" },
									{ id: "1003", type: "Blueberry" },
									{ id: "1004", type: "Devil's Food" },
								],
							},
							topping: [
								{ id: "5001", type: "None" },
								{ id: "5002", type: "Glazed" },
								{ id: "5005", type: "Sugar" },
								{ id: "5007", type: "Powdered Sugar" },
								{
									id: "5006",
									type: "Chocolate with Sprinkles",
								},
								{ id: "5003", type: "Chocolate" },
								{ id: "5004", type: "Maple" },
							],
						},
					],
				},
			},
			startTime: new Date(),
		});
		expect(serialised.length).toEqual(517);
	});
});

describe("Serialisation", () => {
	it("Works with basic text", () => {
		const serialised = serialiseToMiniSEEDBuffer("beans", {
			sourceIdentifier: "",
			startTime: new Date(),
			encoding: "text",
		}).slice(40);

		expect(new jDataView(serialised).getString(5)).toEqual("beans");
	});

	it("Works with basic numbers", () => {
		const serialised = serialiseToMiniSEEDBuffer([1, 2, 3, 4, 5], {
			sourceIdentifier: "",
			startTime: new Date(),
			encoding: "Int32",
		}).slice(40);

		console.log(serialised);

		const data = new Int32Array(serialised);

		expect(data[0]).toEqual(1);
		expect(data[1]).toEqual(2);
		expect(data[3]).toEqual(4);
		expect(data[3]).toEqual(4);
		expect(data[4]).toEqual(5);
	});
});
