---
id: volume
title: Adjust the Volume
sidebar_label: Adjust the Volume
---

## Introduction

The Web SDK NG allows you to manage the sampling volume of the local audio or the playback volume of the subscribed audio as required by the actual scenario.

## Implementation

Before calling methods that adjust the volume, ensure that you have implemented the basic real-time communication function in your project. For details, see [Implement a Basic Video Call](basic_call.md).

The SDK provides the `setVolume` method for the local audio track and the remote audio track objects, to adjust the sampling volume of the local audio track and the playback volume of the remote audio tracks respectively.

### Sample code

**Adjust the playback volume**

In the following example, the `remoteUser` object represents a subscribed remote user.

```javascript
// Set the volume to half of the original volume
remoteUser.audioTrack.setVolume(50);
// Set the volume to twice of the original volume
remoteUser.audioTrack.setVolume(200);
// Set the volume to 0
remoteUser.audioTrack.setVolume(0);
```

**Adjust the sampling volume**

In the following example, the `localAudioTrack` object represents the local audio track.

```javascript
AgoraRTC.createMicrophoneAudioTrack().then(localAudioTrack => {
  // Set the volume to half of the original volume
  localAudioTrack.setVolume(50);
  // Set the volume to twice of the original volume
  localAudioTrack.setVolume(200);
  // Set the volume to 0
  localAudioTrack.setVolume(0);
});
```

### API reference
- [`LocalAudioTrack.setVolume`](/api/en/interfaces/ilocalaudiotrack.html#setvolume)
- [`RemoteAudioTrack.setVolume`](/api/en/interfaces/iremoteaudiotrack.html#setvolume)

## Considerations

On some devices, setting the audio level too high may cause audio distortion.