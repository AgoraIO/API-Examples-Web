---
id: stream_fallback
title: Video Stream Fallback
sidebar_label: Video Stream Fallback
---

## Introduction

Unstable network affects the audio and video quality in a video call or a live broadcast. To ensure smooth communication under poor network conditions, Agora supports video stream fallback. When the network condition deteriorates, the SDK automatically switches from the high-quality video stream to the low-quality video stream, or disables the video to ensure the audio quality under extremely poor network conditions.

## Implementation

Before proceeding, ensure that you have implemented the basic real-time communication functions in your project. For details, see [Implement a Basic Video Call](basic_call.md).

Follow these steps to enable video stream fallback:
1. Before publishing the local stream, call `AgoraRTCClient.enableDualStream` for all the senders in the channel to enable [dual-stream mode](https://docs.agora.io/en/Agora%20Platform/terms?platform=All%20Platforms#dual-stream).
2. Call `AgoraRTCClient.setStreamFallbackOption` to set the stream fallback option for all the receivers in the channel:
  - Set `fallbackType` as `1`: Automatically subscribe to the low-quality video stream under poor network conditions.
  - Set `fallbackType` as `2`: Subscribe to the low-quality video stream when the network conditions worsen, and subscribe to audio only when the conditions become too poor to support video transmission.

Alternatively, after enabling dual-stream mode, you can call `AgoraRTCClient.setRemoteVideoStreamType` and set `streamType` as `1` for the senders to only subscribe to the low-quality stream under any conditions.

You can monitor the switch between the audio-and-video stream and the audio-only stream by the `AgoraRTCClient.on("stream-fallback")` callback; monitor the switch between the low-quality video stream and high-quality video stream by the `AgoraRTCClient.on("stream-type-changed")` callback.

### Sample code
In the following sample code, the `client` object is created by calling `AgoraRTC.createClient`, and the `remoteStream` object is obtained in the `stream-added` event.

```js
// Enable dual-stream mode
client.enableDualStream().then(() => {
  console.log("Enable dual stream success!")
}).catch(err => {
  console,log(err)
});

// Configuration for the receivers. Subscribe to the low-quality video stream when the network conditions worsen, and subscribe to audio only when the conditions become too poor to support video transmission.
client.setStreamFallbackOption(remoteStream, 2)

// Configuration for the receivers. Subscribe to the low-quality stream under any conditions.
client.setRemoteVideoStreamType(remoteStream, 1);
```

### API reference
- [`AgoraRTCClient.enableDualStreamMode`](/api/en/interfaces/iagorartcclient.html#enabledualstream)
- [`AgoraRTCClient.setStreamFallbackOption`](/api/en/interfaces/iagorartcclient.html#setstreamfallbackoption)
- [`AgoraRTCClient.setRemoteVideoStreamType`](/api/en/interfaces/iagorartcclient.html#setremotevideostreamtype)


## Considerations
- `enableDualStream` does not apply to the following scenarios:
  - The video tracks created by calling `createCustomVideoTrack`.
  - Audio-only mode.
  - Safari browser on iOS.
  - Screen-sharing.

- When you call `setRemoteVideoStreamType`, dual streams may not be fully compatible with the following web browsers:
  - Safari on macOS: A high-quality stream and a low-quality stream share the same frame rate and resolution.
  - Safari on iOS: Safari 11 does not support switching between the low-quality stream and high-quality stream.
  - Firefox: A low-quality stream has a fixed frame rate of 30 fps.