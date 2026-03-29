# XFile

The `XFile` class provides a unified interface for file system operations with automatic MIME type detection. It wraps the underlying platform file implementation (Bun's BunFile) with a consistent API for checking existence, reading text content, and streaming file data.

<section class="table-of-contents">

##### Contents

1. [Usage](#usage)
2. [Constructor Parameters](#constructor-parameters)
3. [Properties](#properties)
4. [Methods](#methods)

</section>

## Usage

<section>

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
return X.CResponse.streamFile(video.path);
```

### MIME type detection

```ts
const css = new X.File("styles/main.css");
console.log(css.mimeType); // "text/css"

const unknown = new X.File("data.xyz", "json");
console.log(unknown.mimeType); // "application/json" (from fallback)
```

</section>

## Constructor Parameters

<section>

### path

`string`

The file system path to the file.

</section>

<section>

### fallbackExtension (optional)

`string`

Extension to use for MIME type detection when the path has no extension.

</section>

## Properties

<section>

| Property  | Type     | Description                             |
| --------- | -------- | --------------------------------------- |
| path      | `string` | The file path (from constructor)        |
| name      | `string` | The file name (last segment of path)    |
| extension | `string` | The file extension, or fallback if none |
| mimeType  | `string` | Detected MIME type based on extension   |

</section>

## Methods

<section>

### exists

`exists(): Promise<boolean>`

Checks if the file exists on the file system.

```ts
const file = new X.File("assets/data.json");
const ok = await file.exists(); // boolean
```

</section>

<section>

### text

`text(): Promise<string>`

Reads the entire file contents as a UTF-8 string.

```ts
const file = new X.File("assets/template.html");
const html = await file.text();
```

</section>

<section>

### stream

`stream(): ReadableStream`

Returns a readable stream for the file. Useful for large files that shouldn't be loaded into memory.

```ts
const file = new X.File("assets/video.mp4");
const stream = file.stream();
// Use with CResponse or pipe elsewhere
```

</section>
