### Install AI denoiser extension with Agora web SDK.
```javascript
import {AIDenoiserExtension} from "agora-extension-ai-denoiser";
// Create AIDenoiserExtension instance, please make sure this instance is a singleton, assetsPath is the path of wasm and wasmjs.
const denoiser = new AIDenoiserExtension({assetsPath:'./external'});

// Register AI denoiser extension into AgoraRTC.
AgoraRTC.registerExtensions([denoiser]);

// listen the loaderror callback to handle loading module failed.
denoiser.onloaderror = (e) => {
  // if loading denoiser is failed, disable the function of denoiser. For example, set your button disbled.
  openDenoiserButton.enabled = false;
  console.log(e);
}
```

### Create a processor by denioser extension.

```javascript
const processor = denoiser.createProcessor();

// Optional, listen the processor`s overlaod callback to catch overload message
processor.onoverload = async () => {
  console.log("overload!!!");
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


### Dump audio (download files which are 30s audio file before the method called and two audio files 30s after the method called)
```javascript
processor.ondump = (blob, name) => {
  const objectURL = URL.createObjectURL(blob);
  const tag = document.createElement("a");
  tag.download = name + ".wav";
  tag.href = objectURL;
  tag.click();
}

processor.ondumpend = () => {
  console.log("dump ended!!");
}

processor.dump();
```