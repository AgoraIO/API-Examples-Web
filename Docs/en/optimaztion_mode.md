---
id: optimization_mode
title: Optimization Mode
sidebar_label: OptimizationMode
---

## Introduction
Agora works hard on improving the video experience in a video call or live streaming by ensuring both the clarity and smoothness of video images. However, under poor network conditions, we usually have to choose between clarity and smoothness.

The requirement for video varies in different scenarios:
- Some scenarios allow frozen images, but these images must be clear.
- Some scenarios allow slightly blurry images in poor network conditions, but cannot tolerate any freeze.

Based on these requirements, the Agora Web SDK NG supports the following two transmission optimization strategies:
- Prioritizes clarity:
  - The SDK ensures high-quality images by automatically calculating a minimum bitrate based on the capturing resolution and frame rate. No matter how poor the network condition is, the sending bitrate will never be lower than the minimum value.
  - In most cases, the SDK does not reduce the sending resolution, but may reduce the frame rate.
- Prioritizes smoothness:
  - In poor network conditions, the SDK reduces the sending bitrate to minimize video freezes.
  - In most cases, the SDK does not reduce the frame rate, but may reduce the sending resolution.

## Implementation

When calling `createCameraVideoTrack`, `createCustomVideoTrack`, or `createScreenVideoTrack`, you can choose whether to prioritize video quality or smoothness by setting `optimizationMode` as the following:
- `"detail"`: Prioritizes video quality.
- `"motion"`: Prioritizes video smoothness.

If you leave this parameter empty, the SDK uses the default transmission optimization strategy:
- For a screen-sharing video track, the default transmission optimization strategy is to prioritizes video quality.
- For the rest two kinds of video tracks, the SDK may reduce the frame rate or the sending resolution in poor network conditions.
- During a video call, a live streaming or screen sharing, you can call `setOptimizationMode` to dynamically change the optimization mode. For example, during the screen sharing, before you change the shared content from slides to a video, you can change the optimization mode from `"detail"` to `"motion"` to ensure smoothness in poor network conditions.


### Sample code

**Prioritize video quality**
```js
const videoTrack = await AgoraRTC.createCameraVideoTrack({
  optimizationMode: "detail",
});
```

**Prioritize video smoothness**
```js
const videoTrack2 = await AgoraRTC.createCameraVideoTrack({
  optimizationMode: "motion",
});
```

**Use default transmission optimization strategy**
```js
const videoTrack2 = await AgoraRTC.createScreenVideoTrack();
```

### API reference

- [CameraVideoTrackInitConfig.optimizationMode](/api/en/interfaces/cameravideotrackinitconfig.html#optimizationmode)
- [ScreenVideoTrackInitConfig.optimizationMode](/api/en/interfaces/screenvideotrackinitconfig.html#optimizationmode)
- [CustomVideoTrackInitConfig.optimizationMode](/api/en/interfaces/screenvideotrackinitconfig.html#optimizationmode)
- [LocalVideoTrack.setOptimizationMode](/api/en/interfaces/ilocalvideotrack.html#setOptimizationMode)