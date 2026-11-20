# Agora AI Denoiser

This package provides AI denoiser feature for Agora Web SDK.

## Requirements

- Agora Web SDK (v4.15.1 or later)

## Highlights

- Smaller JavaScript file
- Better performance
- Friendly APIs

## Usage

Install packages `agora-rtc-sdk-ng` and `agora-extension-ai-denoiser`, then import these packages in your code.

```typescript
import AgoraRTC from "agora-rtc-sdk-ng";
import { AIDenoiserExtension } from "agora-extension-ai-denoiser";
import type { IAIDenoiserProcessor } from "agora-extension-ai-denoiser";
```

Create an extension instance and register it.

```typescript
const extension = new AIDenoiserExtension({
  assetsPath: "./external",
  fetchOptions: { cache: "no-cache" },
});
AgoraRTC.registerExtensions([extension]);

if (!extension.checkCompatibility()) {
  throw new Error("Browser unsupported");
}
```

Once join, let `track` be an `ILocalAudioTrack`, create a processor and pipe it to `track`.

```typescript
processor.on("overload", () => {
  console.warning("processor may overload");
});
processor.on("pipeerror", (error: Error) => {
  console.error(`failed to pipe processor: ${error}`);
  processor.unpipe();
  track.unpipe();
  track.pipe(track.processorDestination);
});

const processor = extension.createProcessor();
track.pipe(processor).pipe(track.processorDestination);
```

Enable or disable the processor.

```typescript
const enable = async () => {
  const enabled = processor.enabled;
  if (!enabled) {
    await processor.enable();
  }
};
const disable = async () => {
  const enabled = processor.enabled;
  if (enabled) {
    await processor.disable();
  }
};
```

If there is an audio issue, please dump the audio data.

```
processor.on("dump", (blob: Blob, name: string) => {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
});
processor.on("dumpend", () => {
  console.log("dumpend");
});
```

Unpipe and destroy the processor when it is not longer in use.

```typescript
const destroy = async () => {
  processor.unpipe();
  track.unpipe();
  track.pipe(track.processorDestination);
  await processor.destroy();
}
```

Refer to [Agora Docs](https://docs.agora.io/) for further details.

---

&copy; Copyright Agora, Inc.
