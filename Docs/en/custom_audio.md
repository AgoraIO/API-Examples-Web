---
id: custom_audio
title: Custom Audio Source
sidebar_label: Custom Audio Source
---

## Introduction

The Agora Web SDK NG uses the default audio module for sampling and rendering in real-time communications.

However, the default module may not meet your requirements, such as in the following situations:

- Your app already has an audio module.
- You want to use a non-microphone source.
- You need to process the sampled audio with a pre-processing library for functions such as voice changer.

This article describes how to use the Agora Web SDK NG to customize audio source.

## Implementation

Before you start, ensure that you have implemented real-time communication in your project. See [Implement a Basic Video Call](/docs/en/basic_call).

The SDK provides the [`createCustomAudioTrack`](/api/en/interfaces/iagorartc.html#createcustomaudiotrack) method to support creating an audio track from a [`MediaStreamTrack`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) object. You can use this method to customize audio source.

For example, call `getUserMedia` to get a `MediaStreamTrack` object, and then pass this object to `createCustomAudioTrack` to create a customized audio track.

```js
navigator.mediaDevices.getUserMedia({ video: false, audio: true })
  .then((mediaStream) => {
    const audioMediaStreamTrack = mediaStream.getAudioTracks()[0];
    // create custom audio track
    return AgoraRTC.createCustomAudioTrack({
      mediaStreamTrack: audioMediaStreamTrack,
    });
  })
  .then((localAudioTrack) => {
    // ...
  });
```

> `MediaStreamTrack` refers to the `MediaStreamTrack` object supported by the browser. See [MediaStreamTrack API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) for details.

Alternatively, use the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) to get the `MediaStreamTrack` object for customization.

### API reference

- [`createCustomAudioTrack`](/api/en/interfaces/iagorartc.html#createcustomaudiotrack)
- [`LocalAudioTrack`](/api/en/interfaces/ilocalaudiotrack.html)
