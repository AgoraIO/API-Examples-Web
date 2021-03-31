---
id: audio_profile
title: Set the Audio Profile
sidebar_label: Audio Profiles
---

## Introduction

High-fidelity audio is essential for professional audio scenarios such as podcasts and singing competitions. Podcasts, for example, require stereo and high-fidelity audio. High-fidelity audio refers to an audio profile with a sample rate of 48 kHz and a bitrate of 192 Kbps.

## Implementation

Before setting the audio profile, ensure that you have implemented the basic real-time communication function in your project. For details, see [Implement a Basic Video Call](basic_call.md).

The Agora Web SDK NG provides the following methods to create audio tracks:
- `createMicrophoneAudioTrack`
- `createBufferSourceAudioTrack`
- `createCustomAudioTrack`

To adjust the audio profile, set the `encoderConfig` property in these methods.

You can set `encoderConfig` in either of the following ways:

- Pass the preset audio encoder configurations.
- Pass your customized audio encoder configurations.

### Sample code

**Use preset audio encoder configurations**

```javascript
AgoraRTC.createMicrophoneAudioTrack({
  encoderConfig: "high_quality_stereo",
}).then(/**...**/);
```

**Customize audio encoder configurations**

```javascript
AgoraRTC.createMicrophoneAudioTrack({
  encoderConfig: {
    sampleRate: 48000,
    stereo: true,
    bitrate: 128,
  },
}).then(/**...**/);
```

### API reference

- [`createMicrophoneAudioTrack`](/api/en/interfaces/iagorartc.html#createmicrophoneaudiotrack)
- [`createBufferSourceAudioTrack`](/api/en/interfaces/iagorartc.html#createbuffersourceaudiotrack)
- [`createCustomAudioTrack`](/api/en/interfaces/iagorartc.html#createcustomaudiotrack)

## Considerations

Set the audio profile before calling `AgoraRTCClient.publish`. After publishing an audio track, you can no longer modify its audio profile.