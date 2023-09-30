# miniSEED-ts

miniSEED-ts is a Typescript implementation of miniSEED.

## Installation

```sh
npm i miniseed
```

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