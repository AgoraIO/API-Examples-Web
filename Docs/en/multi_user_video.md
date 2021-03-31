---
id: multi_user_video
title: Video for 7+ Users
sidebar_label: Video for 7+ Users
---

## Introduction
Too many hosts in a live broadcast at the same time may cause network latency and packet loss. However, if you apply 1-N Mode (subscribing to one high-quality video stream and multiple low-quality video streams) when subscribing to the remote streams, then a maximum of 17 hosts can be in an live broadcast at the same time without any network latency.

This guide shows how to use the Agora Web SDK NG to implement a live broadcast for more than seven hosts.

## Implementation

Before proceeding, ensure that you have implemented the basic real-time communication functions in your project. For details, see [Implement a Basic Video Call](basic_call.md).

See the following steps to implement an live broadcast for more than seven hosts:
1. Before publishing streams, call `AgoraRTCClient.enableDualStream` for the hosts in the channel to enable [dual-stream mode](https://docs.agora.io/en/Agora%20Platform/terms?platform=All%20Platforms#dual-stream).
> After the method call succeeds, the SDK automatically sets the encoder configurations of the low-quality stream according to the encoder configurations of the high-quality stream. See the [Correlation Table](#correlation-table).

2. Call `AgoraRTCClient.setRemoteVideoStreamType` for the hosts to set one of the video streams that they subscribed as the high-quality stream and set the rest of the video streams they subscribed as the low-quality streams.

> Agora does not recommend using video profiles that exceed either a resolution of 640 x 480 or a frame rate of 15 fps.
> |Resolution|Frame rate|Bitrate|
> |----|----|----|
> |640x480|15 fps|500 Kbps|
> |640x360|15 fps|400 Kbps|
> |640x360|30 fps|600 Kbps|

3. (Optional) Call `AgoraRTCClient.setLowStreamParameter` to customize the encoder configurations of the low-quality stream at the application level.
> - The aspect ratio (width x height) of the low-quality stream should be identical to that of the high-quality stream.
> - Different web browsers have different restrictions on the video profile, and the parameters that you set may fail to take effect. The Firefox browser has a fixed frame rate of 30 fps, therefore the frame rate settings do not work on the Firefox browser.

4. [Publish a local stream](basic_call.md#create-and-publish-the-local-tracks) and [subscribe to a remote user](basic_call.md#subscribe-to-a-remote-user).

### Sample code

The `client` object is the following sample code is created by calling `AgoraRTC.createClient`.

```js
// Customize the video profile of the low-quality stream: 120 × 120, 15 fps, 120 Kbps.
client.setLowStreamParameter({
  width: 120,
  height: 120,
  framerate: 15,
  bitrate: 120,
});

// Enable dual-stream mode.
client.enableDualStream().then(() => {
  console.log("enable dual stream success");
}).catch(err => {
  console.log(err);
});

// Set the stream type of the video streams that the client has subscribed to.
client.setRemoteVideoStreamType(uid, streamType)
```

### API reference
- [`AgoraRTCClient.enableDualStream`](/api/en/interfaces/iagorartcclient.html#enabledualstream)
- [`AgoraRTCClient.setRemoteVideoStreamType`](/api/en/interfaces/iagorartcclient.html#setremotevideostreamtype)
- [`AgoraRTCClient.setLowStreamParameter`](/api/en/interfaces/iagorartcclient.html#setlowstreamparameter)

## Considerations
Agora recommends using a layout with one big window and multiple small windows:
- The big window is for the high-quality video stream.
- The small windows is for the low-quality video streams.

## Correlation table

> Since web browsers use an internal algorithm to adjust the stream, the actual low-quality stream may differ from that shown in the table.

| **Profile of high-quality stream** | **Profile of low-quality stream** |
| ------------ | ---------------- |
| 720P_5       | 120P_1           |
| 720P_6       | 120P_1           |
| 480P         | 120P_1           |
| 480P_1       | 120P_1           |
| 480P_2       | 120P_1           |
| 480P_4       | 120P_1           |
| 480P_10      | 120P_1           |
| 360P_7       | 120P_1           |
| 360P_8       | 120P_1           |
| 240P         | 120P_1           |
| 240P_1       | 120P_1           |
| 180P_4       | 120P_1           |
| 120P_3       | 120P_1           |
| 120P         | 120P_1           |
| 120P_1       | 120P_1           |
| 480P_3       | 120P_3           |
| 480P_6       | 120P_3           |
| 360P_3       | 120P_3           |
| 360P_6       | 120P_3           |
| 240P_3       | 120P_3           |
| 180P_3       | 120P_3           |
| 480P_8       | 120P_4           |
| 480P_9       | 120P_4           |
| 240P_4       | 120P_4           |
| 720P         | 90P_1            |
| 720P_1       | 90P_1            |
| 720P_2       | 90P_1            |
| 720P_3       | 90P_1            |
| 360P         | 90P_1            |
| 360P_1       | 90P_1            |
| 360P_4       | 90P_1            |
| 360P_9       | 90P_1            |
| 360P_10      | 90P_1            |
| 360P_11      | 90P_1            |
| 180P         | 90P_1            |
| 180P_1       | 90P_1            |

Video Profile Definition

| **Profile** | **Resolution** | **Frame Rate** |
| -------- | -------------- | ------------ |
| 90P_1    | 160x90         | 15           |
| 120P     | 160x120        | 15           |
| 120P_1   | 160x120        | 15           |
| 120P_3   | 120x120        | 15           |
| 120P_4   | 212x120        | 15           |
| 180P     | 320x180        | 15           |
| 180P_1   | 320X180        | 15           |
| 180P_3   | 180x180        | 15           |
| 180P_4   | 424x240        | 15           |
| 240P     | 320x240        | 15           |
| 240P_1   | 320X240        | 15           |
| 240P_3   | 240x240        | 15           |
| 240P_4   | 424x240        | 15           |
| 360P     | 640x360        | 15           |
| 360P_1   | 640X360        | 15           |
| 360P_3   | 360x360        | 15           |
| 360P_4   | 640x360        | 30           |
| 360P_6   | 360x360        | 30           |
| 360P_7   | 480x360        | 15           |
| 360P_8   | 480x360        | 30           |
| 360P_9   | 640x360        | 15           |
| 360P_10  | 640x360        | 24           |
| 360P_11  | 640x360        | 24           |
| 480P     | 640x480        | 15           |
| 480P_1   | 640x480        | 15           |
| 480P_2   | 648x480        | 30           |
| 480P_3   | 480x480        | 15           |
| 480P_4   | 640x480        | 30           |
| 480P_6   | 480x480        | 30           |
| 480P_8   | 848x480        | 15           |
| 480P_9   | 848x480        | 30           |
| 480P_10  | 640x480        | 10           |
| 720P     | 1280x720       | 15           |
| 720P_1   | 1280x720       | 15           |
| 720P_2   | 1280x720       | 15           |
| 720P_3   | 1280x720       | 30           |
| 720P_5   | 960x720        | 15           |
| 720P_6   | 960x720        | 30           |