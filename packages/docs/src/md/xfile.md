# XFile

The `XFile` class provides a unified interface for file system operations with automatic MIME type detection. It wraps the underlying platform file implementation (Bun's BunFile) with a consistent API for checking existence, reading text content, and streaming file data.

<section class="table-of-contents">

##### Contents

1. [Usage](#usage)
2. [Constructor Parameters](#constructor-parameters)
3. [Properties and getters](#properties)
4. [Methods](#methods)

</section>

## Usage

### Basic file operations

```ts
import { X } from "@ozanarslan/corpus";

const file = new X.File("assets/document.txt");

// Check existence
if (await file.exists()) {
	const content = await file.text();
	console.log(content);
}
```

### Streaming files

```ts
const video = new X.File("assets/video.mp4");

// Stream for responses
return X.Res.streamFile(video);
```

### MIME type detection

```ts
const css = new X.File("styles/main.css");
console.log(css.mimeType); // "text/css"

const unknown = new X.File("data.xyz", "json");
console.log(unknown.mimeType); // "application/json" (from fallback)
```

## Constructor Parameters

### path

`string`

The file system path to the file.

### fallbackExtension (optional)

`string`

Extension to use for MIME type detection when the path has no extension.

## Properties and getters

| Property   | Type     | Description                                                                                    |
| ---------- | -------- | ---------------------------------------------------------------------------------------------- |
| path       | `string` | The path from constructor.                                                                     |
| name       | `string` | The name of the file without the extension.                                                    |
| extension  | `string` | The file extension (e.g., "html", "md"), excluding the leading dot.                            |
| fullname   | `string` | The full name of the file, including the extension.                                            |
| mimeType   | `string` | The standard MIME type associated with the file's extension.                                   |
| parentDirs | `string` | Gets the parent directory names as an array, ordered from the immediate parent up to the root. |

## Methods

### exists

`exists(): Promise<boolean>`

Checks if the file exists on the file system.

```ts
const file = new X.File("assets/data.json");
const ok = await file.exists(); // boolean
```

### text

`text(): Promise<string>`

Reads the entire file contents as a UTF-8 string.

```ts
const file = new X.File("assets/template.html");
const html = await file.text();
```

### stream

`stream(): ReadableStream`

Returns a readable stream for the file. Useful for large files that shouldn't be loaded into memory.

```ts
const file = new X.File("assets/video.mp4");
const stream = file.stream();
// Use with Res or pipe elsewhere
```
