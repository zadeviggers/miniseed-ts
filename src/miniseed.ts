import { jDataView } from "z-jdataview-temp-publish";
import { buf as bufToCRC } from "crc-32/crc32c";

const encodingTypes = {
	text: { code: 0, byteSize: 1 },
	Int16: { code: 1, byteSize: 2 },
	Int32: { code: 3, byteSize: 4 },
	Float32: { code: 4, byteSize: 4 },
	Float64: { code: 5, byteSize: 8 },
};

export const Flags = {
	CALIBRATION_SIGNALS_PRESENT: 0b10000000,
	TIME_TAG_IS_QUESTIONABLE: 0b01000000,
	CLOCK_LOCKED: 0b00100000,
};

type Metadata<T extends keyof typeof encodingTypes> = {
	flags?: number;
	encoding?: T;
	sampleRatePeriod?: number;
	dataPublicationVersion?: number;
	extraHeaderFields?: any;
	sourceIdentifier: string;
	startTime:
		| Date
		| {
				nanoSecond: number;
				year: number;
				dayOfYear: number;
				hour: number;
				minute: number;
				second: number;
		  };
};

const metadataDefaults = {
	flags: 0b00000000,
	encoding: "text",
	sampleRatePeriod: 0.0,
	dataPublicationVersion: 0,
	extraHeaderFields: undefined,
};

/**
 * Serialises an array of numbers to miniSEED v3 format,
 * that can then be written to a file.
 *
 * Only text, Int16, Int32, Float32, and Float64 are supported for now.
 */
export function serialiseToMiniSEEDBuffer<T extends keyof typeof encodingTypes>(
	samples: T extends "text" | undefined ? string : number[],
	_metadata: Metadata<T>
): ArrayBuffer {
	let metadata = { ...metadataDefaults, ..._metadata };

	if (metadata.startTime instanceof Date) {
		// From https://stackoverflow.com/a/8619946
		const start = new Date(metadata.startTime.getFullYear(), 0, 0);
		const diff =
			metadata.startTime.valueOf() -
			start.valueOf() +
			(start.getTimezoneOffset() -
				metadata.startTime.getTimezoneOffset()) *
				60 *
				1000;
		const oneDay = 1000 * 60 * 60 * 24;
		const dayOfYear = Math.floor(diff / oneDay);

		metadata.startTime = {
			year: metadata.startTime.getFullYear(),
			dayOfYear,
			hour: metadata.startTime.getHours(),
			minute: metadata.startTime.getMinutes(),
			second: metadata.startTime.getSeconds(),
			// Date's don't do nanoseconds :(
			// One day we may get Temporal and all will be well
			nanoSecond: 0,
		};
	}

	const encodingInfo = encodingTypes[metadata.encoding];

	let encodedText: Uint8Array;
	let dataLength;
	if (metadata.encoding === "text") {
		encodedText = new TextEncoder().encode(samples as string);
		dataLength = encodedText.length;
	} else {
		dataLength = samples.length * encodingInfo.byteSize;
	}

	const extraHeadersString = JSON.stringify(metadata.extraHeaderFields);
	const extraHeaders = new TextEncoder().encode(extraHeadersString);

	const sourceIdentifier = new TextEncoder().encode(
		metadata.sourceIdentifier
	);

	// The static-length headers take up 40 bytes
	// Plus the length of the source ID, the extra headers,
	// and the data itself.
	const view = new jDataView(
		40 + extraHeaders.length + sourceIdentifier.length + dataLength,
		undefined,
		undefined,
		// miniSEED uses little endian for just about everything
		true
	);

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-1
	view.writeString("MS");

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-2
	view.writeUint8(3);

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-3
	view.writeUint8(metadata.flags);

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-4
	view.writeUint32(metadata.startTime.nanoSecond);
	view.writeUint16(metadata.startTime.year);
	view.writeUint16(metadata.startTime.dayOfYear);
	view.writeUint8(metadata.startTime.hour);
	view.writeUint8(metadata.startTime.minute);
	view.writeUint8(metadata.startTime.second);

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-5
	view.writeUint8(encodingInfo.code);

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-6
	view.writeFloat64(metadata.sampleRatePeriod);

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-7
	view.writeUint32(samples.length);

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-8
	// CRC can't be calculated until the whole record is generated.
	// Write zeros for now
	view.writeUint32(0);

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-9
	view.writeUint8(metadata.dataPublicationVersion);

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-10
	view.writeUint8(sourceIdentifier.length);

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-11
	view.writeUint16(extraHeaders.length);

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-12
	view.writeUint32(dataLength);

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-13
	view.writeBytes(sourceIdentifier);

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-14
	view.writeBytes(extraHeaders);

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-15
	if (metadata.encoding === "text") {
		view.writeBytes(encodedText!);
	} else {
		for (const value of samples as number[]) {
			switch (metadata.encoding) {
				case "Int16":
					view.writeInt16(value);
					break;
				case "Int32":
					view.writeInt32(value);
					break;
				case "Float32":
					view.writeFloat32(value);
					break;
				case "Float64":
					view.writeFloat64(value);
					break;
			}
		}
	}

	// https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-8
	// https://datatracker.ietf.org/doc/html/rfc3309
	// Now that the whole record is generated, we can calculate the CRC and add it.
	const crc = bufToCRC(new Uint8Array(view.buffer));
	view.setUint32(28, crc);

	return view.buffer;
}

export function serialiseToMiniSEEDUint8Array(
	...parameters: Parameters<typeof serialiseToMiniSEEDBuffer>
): Uint8Array {
	return new Uint8Array(serialiseToMiniSEEDBuffer(...parameters));
}
