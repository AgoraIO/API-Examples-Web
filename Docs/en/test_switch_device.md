---
id: test_switch_device
title: Test/Switch a Media Device
sidebar_label: Test/Switch a Media Device
---

## Introduction

Agora recommends that users check if their camera or an audio device (a headset, microphone, or speaker) works before joining a channel to ensure high-quality real-time communication.

## Implementation

Before proceeding, ensure that you have implemented the basic real-time communication functions in your project. For details, see [Implement a Basic Video Call](basic_call.md).

### Test the media input devices

Follow these steps to test the microphone and camera:

1. Call `AgoraRTC.getDevices` to get available devices.
2. When calling `AgoraRTC.createCameraVideoTrack` to create a local video track, set `cameraId` to test the camera. When calling `AgoraRTC.createMicrophoneAudioTrack` to create a local audio track, set `microphoneId` to test the microphone.
3. When calling `CameraVideoTrack.play` to play the local video track.
  - To test the microphone, call `MicrophoneAudioTrack.getVolumeLevel` to get the current volume. A greater-than-zero volume means that the microphone is working.
  - To test the camera, any viewable video means that the camera is working.

```js
// Get all audio and video devices.
AgoraRTC.getDevices()
  .then(devices => {
    const audioDevices = devices.filter(function(device){
        return device.kind === "audioinput";
    });
    const videoDevices = devices.filter(function(device){
        return device.kind === "videoinput";
    });

    var selectedMicrophoneId = audioDevices[0].deviceId;
    var selectedCameraId = videoDevices[0].deviceId;
    return Promise.all([
      AgoraRTC.createCameraVideoTrack({ cameraId: selectedCameraId }),
      AgoraRTC.createMicrophoneVideoTrack({ microphoneId: selectedMicrophoneId }),
    ]);
  })
  .then([videoTrack, audioTrack] => {
    videoTrack.play("<ELEMENT_ID_IN_DOM>");
    setInterval(() => {
      const level = audioTrack.getVolumeLevel();
      console.log("local stream audio level", level);
    }, 1000);
  });
```

> Agora recommends that you draw the UI for displaying the volume change and video, enabling users to check directly whether the devices are working.

### Test the audio playback device

Due to browser security limitations, the Agora Web SDK NG does not provide any API method for testing the audio playback device. You can test the audio playback device in either of the following ways:

- Use the HTML5 `<audio>` element to create an audio player on the web page for users to play an online audio file and confirm whether they can hear the sound.
- After creating a microphone audio track, call `MicrophoneAudioTrack.play` to play the audio and check whether they can hear the audio.

### Switch the media devices

When calling `AgoraRTC.createCameraVideoTrack` to create a local video track and calling `AgoraRTC.createMicrophoneAudioTrack` to create a local audio track, you can set `cameraId` and `microphoneId` to specify the devices. After creating the audio and video tracks, you can call `CameraVideoTrack.setDevice` and `MicrophoneAudioTrack.setDevice` to dynamically switch the media devices.

The `videoTrack` object in the following sample code is created by calling `AgoraRTC.createCameraVideoTrack`.

```js
// Switch the camera.
videoTrack.setDevice("<NEW_DEVICE_ID>").then(() => {
  console.log("set device success");
}).catch(e => {
  console.log("set device error", e);
});
```

> You can call `setDevice` before or after publishing the video track. However, this method may not take effect on some mobile devices.

### API Reference
- [`getDevices`](/api/en/interfaces/iagorartc.html#getdevices)
- [`getCameras`](/api/en/interfaces/iagorartc.html#getcameras)
- [`getMicrophones`](/api/en/interfaces/iagorartc.html#getmicrophones)
- [`createMicrophoneAudioTrack`](/api/en/interfaces/iagorartc.html#createmicrophoneaudiotrackm)
- [`createCameraVideoTrack`](/api/en/interfaces/iagorartc.html#createcameravideotrack)
- [`CameraVideoTrack`](/api/en/interfaces/icameravideotrack.html)
- [`MicrophoneAudioTrack`](/api/en/interfaces/imicrophoneaudiotrack.html)

## Considerations
The device ID is generated randomly and might change for the same device, so Agora recommends you call `getDevices` before testing the devices.