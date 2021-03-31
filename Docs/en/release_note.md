---
id: release_note
title: Release Note
sidebar_label: Release Note
---

This page provides the release notes for the Agora Web SDK NG.

## v4.2.0

v4.2.0 was released on December 1, 2020.

### New features

**Regional connection**

This release adds the `AgoraRTC.setArea` method for specifying the region for connection. After specifying the region, the SDK connects to the Agora servers within that region. The following regions are supported:

- China
- North America
- Europe
- Asia, excluding Mainland China
- Japan
- India
- Global

This advanced feature applies to scenarios that have regional restrictions.

**Video transmission optimization strategy**

This release adds the `localVideoTrack.setOptimizationMode` method for setting the video transmission optimization mode:

- `"balanced"`: Uses the default transmission optimization strategy.
- `"detail"`: Prioritizes clarity.
- `"motion"`: Prioritizes smoothness.

See the API reference for the introduction to each transmission optimization mode. This method applies to scenarios where you need to dynamically adjust the optimization mode during a video call, live streaming, or screen sharing. For example, during the screen sharing, before you change the shared content from slides to a video, you can change the optimization mode from `"detail"` to `"motion"` to ensure smoothness in poor network conditions.

**Network quality of remote users**

This release adds the `AgoraRTCClient.getRemoteNetworkQuality` method for getting the uplink and downlink network quality of all the remote users to whom the local user subscribes.

**Cloud proxy**

This release changes the `mode` parameter of the `AgoraRTCClient.startProxyServer` method from `boolean` to `number`.

### Improvements

- After disabling an audio or video tracks by calling `setEnabled`, you can still call `setDevice` to switch devices.
- After you call `AgoraRTCClient.setEncryptionConfig` to enable the built-in encryption, when the user uses a weak secret, the SDK outputs a warning message to the Web Console and prompts the user to use a strong secret. A strong secret must contain at least eight characters and be a combination of uppercase and lowercase letters, numbers, and special characters.

### Fixed issues

- When you disabled a local video track, you could not publish another video track.
- After enabling dual-stream mode, if you called `setEnabled(false)` to disable a video track during the process of publishing, the publishing failed and could not be recovered.
- After an audience member tried to publish a local track in live mode but failed, the audience member could not publish this track even after switching the role to host.
- After dual-stream mode was enabled, a bug during the disconnection would occasionally cause publishing to fail after reconnection.
- After unpublishing a local camera video track and then publishing a screen-sharing track, the video bitrate was fixed at around 700 Kbps, and the resolution and frame rate dropped.
- Due to Safari's limited support for WebAudio, the audio of `BufferSourceAudioTrack` could be distorted.
- When the SDK gained device permission for the first time, it did not trigger the media device change events (`onMicrophoneChanged`, `onCameraChanged`, or `onPlaybackDeviceChanged`). The SDK only triggered these events for a subsequent device change.

### API changes

**Added**

- `AgoraRTC.setArea`
- `localVideoTrack.setOptimizationMode`
- `AgoraRTCClient.getRemoteNetworkQuality`

**Changed**

- Changed the type of the `mode` parameter in `AgoraRTCClient.startProxyServer` from `boolean` to `number`

## v4.1.1
v4.1.1 was released on October 27, 2020. This release fixed the following issues:

- Improved the accuracy of the `event_network_quality` event.
- The method call of `createCameraVideoTrack` did not stop on Safari when the SDK cannot find a video capture device.
- After calling `unsubscribe` to unsubscribing from an unpublished track of a remote user, the subsequent subscribing and unsubscribing operations failed to take effect.
- Reduced the performance degradation due to frequent method calls of `setEnabled` to enable and disable a video track in dual-stream mode.
- Occasional errors when `client.getLocalVideoStats` was called on Safari.

## v4.1.0

v4.1.0 was released on September 4, 2020.

### New features

**Screenshot capture**

v4.1.0 adds the `getCurrentFrameData` method which gets the data of the video frame being rendered.

**Audio playback device management**

v4.1.0 adds the following APIs to manage audio playback devices:

- `setPlaybackDevice`: Sets the audio playback device, for example, the speaker. This method supports Chrome only.
- `getPlaybackDevices`: Retrieves the audio playback devices available.
- `onPlaybackDeviceChanged`: Occurs when an audio playback device is added or removed.

### Improvements

- Fully supports Chromium-based versions of Microsoft Edge (versions 80 and later).
- Improves the accuracy of the `network-quality` event.
- Supports sharing audio when sharing Chrome tabs on macOS.

### Fixed issues

- Information retrieved by `checkVideoTrackIsActive` on Safari is inaccurate.
- Occasional failure of reconnection after enabling dual-stream mode.
- Occasional failure to call `setEnabled` after leaving the channel.
- Failure to push streams to CDN with transcoding and without transcoding at the same time.
- Occasional failure to automatically re-subscribe to the remote streams after disconnection, indicated by the `UNEXPECTED_RESPONSE: ERR_SUBSCRIBE_REQUEST_INVALID` error.
- Failure to join different channels with the same UID in one browser tab.
- Occasional misreport on connection states due to frequent channel join and leave.

### API changes

**Added**

- `LocalVideoTrack.getCurrentFrameData`
- `RemoteVideoTrack.getCurrentFrameData`
- `AgoraRTC.getPlaybackDevices`
- `LocalAudioTrack.setPlaybackDevice`
- `RemoteAudioTrack.setPlaybackDevice`
- `AgoraRTC.onPlaybackDeviceChanged`
- `Client.getLocalAudioStats`
- `Client.getRemoteAudioStats`
- `Client.getLocalVideoStats`
- `Client.getRemoteVideoStats`

**Deprecated**

- The `LocalTrack.getStats` and `RemoteTrack.getStats` methods. Use the `Client.getLocalAudioStats`, `Client.getRemoteAudioStats`, `Client.getLocalVideoStats` and `Client.getRemoteVideoStats` methods instead.

## v4.0.1

v4.0.1 was released on July 18, 2020. This release fixed the following issues:
- Failure to publish local tracks on Chrome 70.
- Publish operation may not be aborted when leaving the channel.

## v4.0.0

v4.0.0 was released on July 15, 2020.

### Compatibility changes

v4.0.0 deletes the `LocalTrack.setMute` method and adds the `LocalTrack.setEnabled` method for enabling or disabling a local track. The advantages of this change are as follows:

- Eliminates the concept of "mute" to avoid confusion between mute states and publishing states.
  - In versions earlier than v4.0.0, the SDK triggers the `Client.on("user-mute-updated")` callback when the remote user calls `setMute` to change the mute state.
  - As of v4.0.0, the SDK triggers the existing `Client.on("user-unpublished")` or `Client.on("user-published")` callbacks when the remote user calls `setEnabled` to enable or disable a track.
- After you call `setMute(true)`, the SDK sends black video frames or silenced audio frames. If you mute a local video track, the camera light stays on, which might adversely impact the user experience. In contrast, if you disable a local video track by calling `setEnabled(false)`, the SDK immediately turns off the camera and stops capturing video.

> The `setEnabled` method changes media input behaviors, so it is an asynchronous operation and returns the result through the `Promise` object.

### New features

**Video encoding strategy**

v4.0.0 adds the `optimizationMode` property in the `CameraVideoTrackInitConfig`, `ScreenVideoTrackInitConfig`, and `CustomVideoTrackInitConfig` interfaces. When creating a video track by calling `createCameraVideoTrack`, `createCustomVideoTrack`, or `createScreenVideoTrack`, you can choose whether to prioritize video quality or smoothness by setting optimizationMode as the following:

- `"detail"`: Prioritizes video quality.
  - The SDK ensures high-quality images by automatically calculating a minimum bitrate based on the capturing resolution and frame rate. No matter how poor the network condition is, the sending bitrate will never be lower than the minimum value.
  - In most cases, the SDK does not reduce the sending resolution, but may reduce the frame rate.
-  `"motion"`: Prioritizes video smoothness.
  - In poor network conditions, the SDK reduces the sending bitrate to minimize video freezes.
  - In most cases, the SDK does not reduce the frame rate, but may reduce the sending resolution.

> The  `optimizationMode` property of the video track created by calling createScreenVideoTrack is set as `"detail"` by default.

### Improvements

- Redesigns the `withAudio` parameter in `AgoraRTC.createScreenVideoTrack`. In addition to `enable` and `disable`, you can also set `withAudio` as `auto`. In this setting, the SDK shares the audio, dependent on whether the browser supports this function. 
- Does not allow setting the `withAudio` parameter as `"all"` any more to avoid code repetition. As of v4.0.0, you can only set `withAudio` as `"audio"` or `"video"`. This change involves the following APIs:
  - The `Client.subscribe` method.
  - The `Client.on("user-published")` and `Client.on("user-unpublished")` callbacks.

### Fixed issues

v4.0.0 fixed the following issues:

- After the local user called `unpublish`, the SDK triggerred the `Client.on("user-left")` callback on the remote side.
- Periodic video blur when sharing the screen in `"rtc"` mode.
- Occasional publishing failure when calling `publish` and `unpublish` frequently.
- The `Client.on("network-quality")` callback was inaccurate.

### API changes

**Added**

- The `Client.localTracks` interface
- The `LocalTrack.setEnabled` method
- The `optimizationMode` property in `CameraVideoTrackInitConfig, ``ScreenVideoTrackInitConfig`, and `CustomVideoTrackInitConfig` interfaces

**Updated**

- Adds the value of `auto` to the withAudio parameter in `AgoraRTC.createScreenVideoTrack`.
- Removes the value of `"all"` from the mediaType parameter in `Client.subscribe`.
- The `mediaType` parameter in the `Client.on("user-published")` and `Client.on("user-unpublished")` callbacks does report `"all"`

**Deprecated**

- The `LocalAudioTrackStats.muteState` property
- The `LocalVideoTrackStats.muteState` property
- The `RemoteAudioTrackStats.muteState` property
- The `RemoteVideoTrackStats.muteState` property

**Deleted**

- The `Client.on("user-mute-updated")` callback
- The `LocalTrack.setMute` method
- The `AgoraRTCRemoteUser.audioMuted` property
- The `AgoraRTCRemoteUser.videoMuted` property
- The `LocalTrack.getUserId` method