### Install AI denoiser extension with Agora web SDK.

```javascript
import {AIDenoiserExtension} from "agora-extension-ai-denoiser";
// Create AIDenoiserExtension instance, assetsPath is the path of wasm files.
const extension = new AIDenoiserExtension({assetsPath:'./external'});

// Register AI denoiser extension into AgoraRTC.
AgoraRTC.registerExtensions([extension]);

// listen the loaderror callback to handle loading module failed.
extension.onloaderror = (e) => {
  // if loading denoiser is failed, disable the function of denoiser. For example, set your button disbled.
  openDenoiserButton.enabled = false;
  console.log(e);
}
```

### Create a processor by denioser extension.

```javascript
const processor = extension.createProcessor();

// If you want to enable the processor by default.
await processor.enable();

// If you want to disable the processor by default.
// await processor.disable();

// Optional, listen the processor`s overlaod callback to catch overload message
processor.onoverload = async (elapsedTimeInMs) => {
  console.log("overload!!!", elapsedTimeInMs);
  // fallback or disable
  // await processor.setMode("STATIONARY_NS");
  await processor.disable();
}
```

### Connect the processor to microphone audio track to process the audio pipeline.

```javascript
const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

audioTrack.pipe(processor).pipe(audioTrack.processorDestination);

await processor.enable();
```

### Control the denoiser function enabled or disabled.

```javascript
() => {
  if (processor.enabled) {
    await processor.disable();
  } else {
    await processor.enable();
  }
}
```

### Change the denoiser mode and level.

```javascript
await processor.setMode("NSNG"); // recommended
await processor.setMode("STATIONARY_NS");

await processor.setLevel("LEVEL26"); // recommended
await processor.setLevel("LEVEL40");
```

### Dump audio (download files which are 30s audio file before the method called and two audio files 30s after the method called)
```javascript
processor.ondump = (blob, name) => {
  const objectURL = URL.createObjectURL(blob);
  const tag = document.createElement("a");
  tag.download = name;
  tag.href = objectURL;
  tag.click();
  setTimeout(() => {
    URL.revokeObjectURL(objectURL);
  }, 0);
}

processor.ondumpend = () => {
  console.log("dump ended!!");
}

processor.dump();
```
