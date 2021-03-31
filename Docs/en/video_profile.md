---
id: video_profile
title: Set the Video Profile
sidebar_label: Video Profiles
---

## Introduction

You can set the video profile according to your users’ devices, browsers, network conditions, and scenarios to improve user experience.

## Implementation

Before setting the video profile, ensure that you have implemented the basic real-time communication functions in your project. For details, see [Implement a Basic Video Call](basic_call.md).

For the Agora Web SDK NG, you can set the video profile in either of the following ways:
- Set the `encoderConfig` parameter when calling the following methods to create video tracks:
  - Call [AgoraRTC.createCameraVideoTrack](/api/en/interfaces/iagorartc.html#createcameravideotrack) to create a video track from the video captured by a camera.
  - Call [AgoraRTC.createScreenVideoTrack](/api/en/interfaces/iagorartc.html#createScreenVideoTrack) to create a video track for screen sharing.
> If you call [AgoraRTC.createCustomVideoTrack](/api/en/interfaces/iagorartc.html#createCustomVideoTrack) to create a custom video track, you can only set the sending bitrate.
- For the video track from the video captured by a camera, you can call [CameraVideoTrack.setEncoderConfiguration](/api/en/interfaces/icameravideotrack.html#setencoderconfiguration) to set the video encoder configurations dynamically. You can call this method before or after publishing the video track.

You can set `encoderConfig` in either of the following ways:
- Pass the preset video profile.
- Pass your customized video encoder configurations.

### Sample code

**Use the preset video profile when creating the track**

```js
AgoraRTC.createCameraVideoTrack({
  encoderConfig: "720p_1",
}).then(localVideoTrack => { /** ... **/ });
```

**Customize the video encoder configurations when creating the track**

```js
AgoraRTC.createCameraVideoTrack({
  encoderConfig: {
    width: 640,
    // Specify a value range and an ideal value
    height: { ideal: 480, min: 400, max: 500 },
    frameRate: 15,
    bitrateMin: 600, bitrateMax: 1000,
  },
}).then(localVideoTrack => {/** ... **/ });
```

**Dynamically change the preset video profile**

```js
localStream.setEncoderConfiguration("480p_1").then(() => { /** ... **/ })
```

**Dynamically change the customized video encoder configurations**

```js
localStream.setEncoderConfiguration({ width: 1280, height: 720 }).then(() => { /** ... **/ })
```

### API reference
- [`AgoraRTC.createCameraVideoTrack`](/api/en/interfaces/iagorartc.html#createcameravideotrack)
- [`AgoraRTC.createScreenVideoTrack`](/api/en/interfaces/iagorartc.html#createScreenVideoTrack)
- [`AgoraRTC.createCustomVideoTrack`](/api/en/interfaces/iagorartc.html#createCustomVideoTrack)
- [`CameraVideoTrack.setEncoderConfiguration`](/api/en/interfaces/icameravideotrack.html#setencoderconfiguration)

## Considerations
- Supported resolutions vary from browser to browser. See [video profile and supported browsers](/api/en/globals.html#videoencoderconfigurationpreset).
- Due to the limitations of some devices and browsers, the resolution you set may not take effect or be adjusted by the browser. In this case, charges to your Agora account will be calculated based on the actual resolution.
- Whether a resolution of 1080p or above can be supported depends on the device. If the device cannot support 1080p, then the frame rate is lower than the set value.
- The Safari browser has a fixed video frame rate of 30 fps and does not support customization.
- Dynamically changing the video profile after publishing only works on Chrome 63 or later and Safari 11 or later. On some iOS devices, when you update the video profile after publishing, black bars might appear around your video.

## Recommended video profiles

Video profiles vary from case to case. For example, in a one-to-one online class scenario, the windows of the teacher and the student are larger, requiring a higher resolution, frame rate, and bitrate; in a one-to-four online class scenario, the windows of the teacher and the students are smaller, requiring a lower resolution, frame rate, and bitrate.

Agora recommends the following profiles for different scenarios:

- One-to-one video call:
  - 320 x 240 resolution, 15 fps frame rate, and 200 Kbps bitrate.
  - 640 x 360 resolution, 15 fps frame rate, and 400 Kbps bitrate.
- One-to-many video call:
  - 160 x 120 resolution, 15 fps frame rate, and 65 Kbps bitrate.
  - 320 x 180 resolution, 15 fps frame rate, and 140 Kbps bitrate.
  - 320 x 240 resolution, 15 fps frame rate, and 200 Kbps bitrate.

The following table lists all the preset video profiles. You can refer to it when customizing your encoder configurations.

| Video Profile | Resolution (Width×Height) | Frame rate (fps） | Bitrate（Kbps） |
| -------- | --------------- | ----------- | ------------ |
| 120p | 160 × 120 | 15 | 65 |
| 120p_1 | 160 × 120 | 15 | 65 |
| 120p_3 | 120 × 120 | 15 | 50 |
| 180p | 320 × 180 | 15 | 140 |
| 180p_1 | 320 × 180 | 15 | 140 |
| 180p_3 | 180 × 180 | 15 | 100 |
| 180p_4 | 240 × 180 | 15 | 120 |
| 240p | 320 × 240 | 15 | 200 |
| 240p_1 | 320 × 240 | 15 | 200 |
| 240p_3 | 240 × 240 | 15 | 140 |
| 240p_4 | 424 × 240 | 15 | 220 |
| 360p | 640 × 360 | 15 | 400 |
| 360p_1 | 640 × 360 | 15 | 400 |
| 360p_3 | 360 × 360 | 15 | 260 |
| 360p_4 | 640 × 360 | 30 | 600 |
| 360p_6 | 360 × 360 | 30 | 400 |
| 360p_7 | 480 × 360 | 15 | 320 |
| 360p_8 | 480 × 360 | 30 | 490 |
| 360p_9 | 640 × 360 | 15 | 800 |
| 360p_10 | 640 × 360 | 24 | 800 |
| 360p_11 | 640 × 360 | 24 | 1000 |
| 480p | 640 × 480 | 15 | 500 |
| 480p_1 | 640 × 480 | 15 | 500 |
| 480p_2 | 640 × 480 | 30 | 1000 |
| 480p_3 | 480 × 480 | 15 | 400 |
| 480p_4 | 640 × 480 | 30 | 750 |
| 480p_6 | 480 × 480 | 30 | 600 |
| 480p_8 | 848 × 480 | 15 | 610 |
| 480p_9 | 848 × 480 | 30 | 930 |
| 480p_10 | 640 × 480 | 10 | 400 |
| 720p | 1280 × 720 | 15 | 1130 |
| 720p_1 | 1280 × 720 | 15 | 1130 |
| 720p_2 | 1280 × 720 | 30 | 2000 |
| 720p_3 | 1280 × 720 | 30 | 1710 |
| 720p_5 | 960 × 720 | 15 | 910 |
| 720p_6 | 960 × 720 | 30 | 1380 |
| 1080p | 1920 × 1080 | 15 | 2080 |
| 1080p_1 | 1920 × 1080 | 15 | 2080 |
| 1080p_2 | 1920 × 1080 | 30 | 3000 |
| 1080p_3 | 1920 × 1080 | 30 | 3150 |
| 1080p_5 | 1920 × 1080 | 60 | 4780 |
| 1440p | 2560 × 1440 | 30 | 4850 |
| 1440p_1 | 2560 × 1440 | 30 | 4850 |
| 1440p_2 | 2560 × 1440 | 60 | 7350 |
| 4K | 3840 × 2160 | 30 | 8910 |
| 4K_1 | 3840 × 2160 | 30 | 8910 |
| 4K_3 | 3840 × 2160 | 60 | 13500 |