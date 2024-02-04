# Web VAD

## Install Web VAD plugin with Agora web SDK.

```ts
import AgoraRTC from "agora-rtc-sdk-ng";
import { VADExtension } from "agora-extension-vad";
// Create VADExtension instance, assetsPath is the path of wasm files.
const extension = new VADExtension({ assetsPath: "./wasm" });

// Check compatibility
if (!extension.checkCompatibility()) {
  return console.warn("vad plugin is not support!");
}

// listen the loaderror callback to handle loading module failed.
extension.onloaderror = (error) => {
  // if loading vad is failed, do something here.
  console.error(error);
};

// Register VAD plugin into AgoraRTC.
AgoraRTC.registerExtensions([extension]);
```

## Create Web VAD processor node

```ts
const processor = extension.createProcessor();

// If you want to enable the processor by default.
// await processor.enable();

// If you want to disable the processor by default.
// await processor.disable();

// Optional, listen the processor`s overload event to catch overload message
processor.on("overload", async () => {
  console.log("overload!!!");
  // disable or ignore
  // await processor.disable();
});
```

## Pipe audio track to processor node

```ts
const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

audioTrack.pipe(processor).pipe(audioTrack.processorDestination);

await processor.enable();
```

## Enable or Disable Web VAD

```ts
async function enable() {
  if (processor) {
    await processor.enable();
  }
}

async function disable() {
  if (processor) {
    await processor.disable();
  }
}
```

## Pipe or UnPipe Web VAD processor

```ts
async function handlePipeError(error: Error) {
  console.error(error);
  await unPipe();
}

async function handleOverload() {
  console.warn("processor may overload");
}

function handleResult(result) {
  console.info("vad result: ", result);
}

async function pipe() {
  try {
    if (processor) {
      processor.on("pipeerror", handlePipeError);
      processor.on("overload", handleOverload);
      processor.on("result", handleResult);

      audioTrack &&
        audioTrack.pipe(processor).pipe(audioTrack.processorDestination);
    }
  } catch (error) {
    console.error(error);
  }
}

async function unPipe() {
  try {
    if (processor) {
      processor.off("pipeerror", handlePipeError);
      processor.off("overload", handleOverload);
      processor.off("result", handleResult);

      processor.unpipe();

      audioTrack && audioTrack.unpipe();
      audioTrack && audioTrack.pipe(audioTrack.processorDestination);
    }
  } catch (error) {
    console.error(error);
  }
}
```

## Handler VAD Result

```ts
function handleResult(result) {
  console.info("voiceProb: ", result.voiceProb);
}
```

The `voiceProb` is a float number ranging from 0 to 1 and represents the current probability of someone is talking.
