# miniSEED-ts

miniSEED-ts is a Typescript implementation of the miniSEED binary format.

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
	Flags,
} from "miniseed";

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const metadata = {
	sourceIdentifier: "FDSN:<network>_<station>_...", // An FDSN ID: http://docs.fdsn.org/projects/source-identifiers/
	startTime: new Date(), // Or you can manually specify nanoseconds, seconds, etc
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

-   Only miniSEED version 3 is supported
-   Currently, only serialisation is supported. Deserialisation is planned
-   The various compression options offered by miniSEED aren't currently supported

### Why not Streams

I wish I could use streams for this. Unfortunately, miniSEED requires setting the body length in one of the headers. This means we can't start generating the response until we have all the data for the body.

We could try and estimate the body length though. E.g. if you want to stream the result of a huge database query as miniSEED, you could first do a `SELECT COUNT(*) ...` before the actual query, and use that, plus the encoding size to estimate the length of the body, thereby allowing you to stream the generated miniSEED data. I may look into doing something like this in the future.
