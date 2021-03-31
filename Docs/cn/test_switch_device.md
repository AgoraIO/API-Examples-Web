---
id: test_switch_device
title: 音视频设备测试/切换
sidebar_label: 音视频设备测试/切换
---

## 功能描述

为保证通话或直播质量，我们建议在进入频道前进行音视频设备测试，检测麦克风、摄像头等音视频设备能否正常工作。该功能对于有高质量要求的场景，如在线教育等，尤为适用。

## 实现方法

在开始前，请确保已在你的项目中实现基本的实时音视频功能，详见 [实现音视频通话](basic_call.md)。

### 测试音视频采集设备

参考以下步骤测试麦克风和摄像头：

1. 调用 `AgoraRTC.getDevices` 获取可用设备及设备 ID。
2. 在调用 `AgoraRTC.createCameraVideoTrack` 和 `AgoraRTC.createMicrophoneAudioTrack` 创建本地音视频轨道对象时，传入 `cameraId` 和 `microphoneId` 指定想测试的设备。
3. 创建好本地音视频轨道对象后，调用 `CameraVideoTrack.play` 播放本地视频轨道：
   - 如果是测试麦克风，调用 `MicrophoneAudioTrack.getVolumeLevel` 获取音量，音量大于 0 说明麦克风正常。
   - 如果是测试摄像头，播放视频轨道后可以看到画面说明摄像头正常。

```js
// 获取所有音视频设备。
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

> 我们建议你将音量变化和摄像头画面绘制在 UI 上，以便用户自行判断设备是否正常工作。

### 测试音频播放设备

Agora Web SDK NG 不提供 API 用于音频播放设备的测试。你可以通过以下方法测试音频播放设备：
- 使用 HTML5 的 `<audio>` 元素在页面上创建一个音频播放器，让用户播放在线音频文件并确认是否有声音。
- 采集完麦克风后，调用 `MicrophoneAudioTrack.play` 来播放麦克风声音，让用户主观确认是否可以听到麦克风声音。

### 音视频设备切换

在创建本地音视频轨道时，可以通过指定 `cameraId` 和 `microphoneId` 来指定音视频设备。此外，Agora Web SDK NG 还支持通过 `CameraVideoTrack.setDevice` 和 `MicrophoneAudioTrack.setDevice` 在创建轨道之后动态切换采集的音视频设备。

示例代码中的 `videoTrack` 是指通过 `AgoraRTC.createCameraVideoTrack` 创建的本地视频轨道对象。

```js
// 切换摄像头。
videoTrack.setDevice("<NEW_DEVICE_ID>").then(() => {
  console.log("set device success");
}).catch(e => {
  console.log("set device error", e);
});
```

> 支持在发布后调用，在部分移动设备上该方法可能不生效。

### 音视频采集设备热插拔

SDK提供了 `AgoraRTC.onMicrophoneChanged` 和 `AgoraRTC.onCameraChanged` 方法来监听并获取音视频设备的插拔状态。如果想要在新设备插入的时候强制使用新设备，你需要监听 `AgoraRTC.onMicrophoneChanged` 或 `AgoraRTC.onCameraChanged`，并在对应的回调函数里调用 `MicrophoneAudioTrack.setDevice` 或 `CameraVideoTrack.setDevice` 来切换音视频采集设备。 

> 如果终端用户使用了虚拟设备或故障设备并进行设备拔插操作时，热拔插的逻辑可能会导致无画面或者无声。

```js
AgoraRTC.onMicrophoneChanged = async (changedDevice) => {
  // 插入设备时，切换到新插入的设备
  if (changedDevice.state === "ACTIVE") {
    microphoneTrack.setDevice(changedDevice.device.deviceId);
  // 拔出设备为当前设备时，切换到一个已有的设备
  } else if (changedDevice.device.label === microphoneTrack.getTrackLabel()) {
    const oldMicrophones = await AgoraRTC.getMicrophones();
    oldMicrophones[0] && microphoneTrack.setDevice(oldMicrophones[0].deviceId);
  }
}
```


### API 参考
- [getDevices](/api/cn/interfaces/iagorartc.html#getdevices)
- [getCameras](/api/cn/interfaces/iagorartc.html#getcameras)
- [getMicrophones](/api/cn/interfaces/iagorartc.html#getmicrophones)
- [createMicrophoneAudioTrack](/api/cn/interfaces/iagorartc.html#createmicrophoneaudiotrackm)
- [createCameraVideoTrack](/api/cn/interfaces/iagorartc.html#createcameravideotrack)
- [CameraVideoTrack](/api/cn/interfaces/icameravideotrack.html)
- [MicrophoneAudioTrack](/api/cn/interfaces/imicrophoneaudiotrack.html)
- [onMicrophoneChanged](/api/cn/interfaces/iagorartc.html#onmicrophonechanged)
- [onCameraChanged](/api/cn/interfaces/iagorartc.html#oncamerachanged)

## 开发注意事项

设备 ID 是随机生成的，部分情况下同一个设备的 ID 可能会改变，因此我们建议每次测试设备时都先调用 `AgoraRTC.getDevices` 获取设备 ID。