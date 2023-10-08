# miniSEED-ts

miniSEED-ts is a Typescript implementation of the miniSEED V3 binary format.

You can [read more about miniSEED here](https://docs.fdsn.org/projects/miniseed3/en/latest/index.html).

miniSEED-ts is powered by [jDataView](https://github.com/jDataView/jDataView).

## Installation

```sh
npm i miniseed
```

Typescript definitions are included.

## Usage

```ts
import {
	serialiseToMiniSEEDBuffer,
	serialiseToMiniSEEDUint8Array,
	startTimeFromDate,
	Flags,
} from "miniseed";

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const metadata = {
	sourceIdentifier: "FDSN:<network>_<station>_...", // An FDSN ID: http://docs.fdsn.org/projects/source-identifiers/
	// You can manually specify nanoseconds, seconds, etc
	startTime: {
		year: 1978,
		dayOfYear: 264,
		hour: 21,
		minute: 0,
		second: 0, // This needs to be an integer
		// There's no milliseconds field - they're included in nanoSecond
		nanoSecond: 0,
	},
	// Or use a helper function to convert from a Date object
	startTime: startTimeFromDate(new Date()),
	encoding: "Int32", // Or text, Int16, Float32, Float64

	// All other metadata fields are optional, but supported.
	// See the full list here https://docs.fdsn.org/projects/miniseed3/en/latest/definition.html#field-3

	// Flags can be binary OR'd together
	flags:
		Flags.CALIBRATION_SIGNALS_PRESENT |
		Flags.TIME_TAG_IS_QUESTIONABLE |
		Flags.CLOCK_LOCKED,
	sampleRatePeriod: 1.234,
	dataPublicationVersion: 1,
    extraHeaderFields: {
        // This gets turned into JSON
        "FDSN": {
            // This key is reserved
            // See more about this key here: https://docs.fdsn.org/projects/miniseed3/en/latest/fdsn-reserved.html#fdsn-reserved-headers
        }
        // Everything else is free game
        "beans": {
            // But you should still namespace your custom fields
            amount: 20000
        }
    }
};

console.log(serialiseToMiniSEEDUint8Array(data, metadata)); // Uint8Array
console.log(serialiseToMiniSEEDBuffer(data, metadata)); // ArrayBuffer
```

## Notes

-   Only miniSEED version 3 is supported. Use [mseedconvert](https://github.com/EarthScope/mseedconvert) to convert between V2 and V3.
-   Currently, only serialisation is supported. Deserialisation is planned
-   The various compression options offered by miniSEED aren't currently supported

### Why not Streams

I wish I could use streams for this. Unfortunately, miniSEED requires a CRC hash of the whole record to be set in the headers. This means we can't start generating the response until we have all the data for the body.

## Contributing

Contributions are welcome, especially fixes for things I might have done wrong.

Please write tests for anything you add.

[mseed3-utils](https://github.com/EarthScope/mseed3-utils) are very helpful for debugging and validating files.
