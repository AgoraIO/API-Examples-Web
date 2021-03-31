---
id: create_local_track
title: 创建本地轨道
sidebar_label: 创建本地轨道
---

## 简介

本文详细介绍如何使用 Agora Web SDK NG 创建本地的音视频轨道对象。在介绍具体的 API 之前，你需要了解本地轨道对象的一些设计细节。

Agora Web SDK NG 使用了面向对象的设计模式，使用 [LocalTrack](/api/cn/interfaces/ilocaltrack.html) 这一个基础的抽象类来描述所有的本地轨道对象，它定义了本地轨道对象的公共方法和行为，所有的本地轨道对象都继承于 `LocalTrack`。

`publish` 方法只要求发布的对象是 `LocalTrack` ，所以无论通过什么方式创建的本地轨道对象，都满足 `publish` 方法的参数要求。

基于 `LocalTrack`，SDK 定义了 [LocalAudioTrack](/api/cn/interfaces/ilocalaudiotrack.html) 和 [LocalVideoTrack](/api/cn/interfaces/ilocalvideotrack.html)，分别代表本地音频轨道对象和本地视频轨道对象。这两个类分别针对音视频不同的特性增加了不同的方法，比如 `LocalAudioTrack` 增加了获取和控制音量的方法、`LocalVideoTrack` 增加了设置美颜功能的方法。

最后，根据不同的应用场景和创建方式， SDK 基于 `LocalAudioTrack` 和 `LocalVideoTrack` 提供了更上层的本地轨道类。比如继承自 `LocalVideoTrack` 的 `CameraVideoTrack`，这个类表明这个本地视频轨道是来自于摄像头采集的视频，所以这个类增加了控制摄像头、调整分辨率等方法。

下图展示了这几个类之间的关系：

![LocalTrack interface diagram](assets/local-track-interface-diagram.png)

## 创建轨道

SDK 支持通过以下方式创建本地轨道对象。

### 使用麦克风和摄像头

最常用的方法是直接通过麦克风或者摄像头采集的音视频来创建本地轨道对象，SDK 提供了三种方法：

- [createCameraVideoTrack](/api/cn/interfaces/iagorartc.html#createcameravideotrack)：使用摄像头采集的视频来创建本地视频轨道，返回一个 [CameraVideoTrack](/api/cn/interfaces/icameravideotrack.html) 对象。
- [createMicrophoneAudioTrack](/api/cn/interfaces/iagorartc.html#createmicrophoneaudiotrack)：使用麦克风采集的音频来创建本地音频轨道，返回一个 [MicrophoneAudioTrack](/api/cn/interfaces/imicrophoneaudiotrack.html) 对象。
- [createMicrophoneAndCameraTracks](/api/cn/interfaces/iagorartc.html#createmicrophoneandcameratracks)：同时使用麦克风和摄像头采集的音视频创建本地轨道，返回一个包含 [CameraVideoTrack](/api/cn/interfaces/icameravideotrack.html) 和 [MicrophoneAudioTrack](/api/cn/interfaces/imicrophoneaudiotrack.html) 的列表。

> 如果使用 `createMicrophoneAndCameraTracks` 创建本地轨道，因为音频和视频采集是一次完成的，所以只要摄像头和麦克风其中一个无法完成采集就会导致整个采集的失败，SDK 会抛出错误，详见[错误处理](#error)。如果分别调用 `createCameraVideoTrack` 和 `createMicrophoneAudioTrack` ，其中一个采集失败不会影响另外一个。请根据你的实际需求选用合适的方法。

```js
// 采集摄像头
const cameraTrack = await AgoraRTC.createCameraVideoTrack();

// 采集麦克风
const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();

// 同时采集摄像头和麦克风
const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
```

调用以上方法时你可以传入一个配置参数来控制采集的行为，详细的参数定义可以参考 [CameraVideoTrackInitConfig](/api/cn/interfaces/cameravideotrackinitconfig.html) 或者 [MicrophoneAudioTrackInitConfig](/api/cn/interfaces/microphoneaudiotrackinitconfig.html)。

> 以上方法均为异步方法，使用时需要配合 `Promise` 或 `async/await`。

### 使用屏幕画面

SDK 提供 [createScreenVideoTrack](/api/cn/interfaces/iagorartc.html#createscreenvideotrack) 方法来创建屏幕共享轨道，这个方法会返回 `LocalVideoTrack` 对象。由于 `LocalVideoTrack` 只实现了视频轨道对象的基础方法，因此通过屏幕创建的轨道无法像摄像头轨道那样控制分辨率或切换设备。

```js
const screenTrack = await AgoraRTC.createScreenVideoTrack();
```

> 该方法为异步方法，使用时需要配合 `Promise` 或 `async/await`。

如果你需要在 Electron 或较老版本的 Chrome 上使用屏幕共享，或者希望在共享屏幕的同时分享音频，可以参考[屏幕共享](screensharing.md)。

### 使用本地或在线的音频文件

SDK 提供 [createBufferSourceAudioTrack](/api/cn/interfaces/iagorartc.html#createbuffersourceaudiotrack) 方法来通过本地或者在线的音频文件创建本地音频轨道对象。通过该方法创建的对象类型为 `BufferSourceAudioTrack`，该对象继承自 `LocalAudioTrack`，在其基础上增加了控制音频文件播放行为的方法，比如暂停播放、跳转播放、循环播放等。

你可以使用这个方法实现混音或者播放音效的功能，详见[播放音效/混音](audio_effect_mixing.md)。

> 该方法为异步方法，使用时需要配合 `Promise` 或 `async/await`。

```js
const audioFileTrack = await AgoraRTC.createBufferSourceAudioTrack({
  source: "https://web-demos-static.agora.io/agora/smlt.flac",
});

// 在播放之前先调用该方法读取音频文件
audioFileTrack.startProcessAudioBuffer();

audioFileTrack.play();
```

### 使用自定义方式

如果你熟悉 WebRTC 或者 [MediaStreamTrack](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) 相关的 API，你可以通过自己实现采集来完成 `MediaStreamTrack` 的创建，然后通过 [createCustomAudioTrack](/api/cn/interfaces/iagorartc.html#createcustomaudiotrack) 或者 [createCustomVideoTrack](/api/cn/interfaces/iagorartc.html#createcustomvideotrack) 方法将 `MediaStreamTrack` 对象转换成 SDK 内部的 `LocalAudioTrack` 或者 `LocalVideoTrack` 对象。

```js
// 通过自己实现采集获取 `MediaStreamTrack` 对象
const customMediaStreamTrack = getMediaStreamTrackFromXXX(/* .. */);

// 创建自定义的视频轨道
const customTrack = AgoraRTC.createCustomVideoTrack({
  mediaStreamTrack: customMediaStreamTrack,
});
```

## 启用/禁用本地轨道

创建好本地的轨道对象后，如果想要暂时关闭麦克风/摄像头，你可以禁用该轨道。SDK 提供 [LocalTrack.setEnabled](/api/cn/interfaces/ilocaltrack.html#setenabled) 方法来启用或者禁用本地轨道对象。

> 该方法为异步方法，使用时需要配合 `Promise` 或 `async/await`。

调用 `setEnabled(true)` 禁用本地轨道后，该轨道会停止本地播放。如果该轨道已经发布，发布也会停止，此时远端会收到 `user-unpublished` 回调；调用 `setEnabled(true)` 后，SDK 会自动重新发布轨道。

根据本地轨道类型的不同，调用 `setEnabled` 后会有一些不同的行为：

- 通过设备采集创建的本地轨道（`CameraVideoTrack`/`MicrophoneAudioTrack`）：当调用 `setEnabled(false)` 后，会停止采集并释放其占用的设备。如果摄像头或麦克风有指示灯，此时指示灯会熄灭。当调用 `setEnabled(true)` 后，会自动恢复采集。
- 通过其他方式创建的本地轨道：当调用 `setEnabled(false)` 后，会默认编码黑屏帧（视频轨道）或者静音包（音频轨道）。当调用 `setEnabled(true)` 后，会自动恢复正常编码。

```js
const videoTrack = await AgoraRTC.createCameraVideoTrack();

// 暂时关闭摄像头采集
await videoTrack.setEnabled(false);

// ...

// 恢复摄像头采集
await videoTrack.setEnabled(true);
```

## <a name="error"></a>错误处理

在创建本地音视频对象的过程中，由于不同设备和浏览器之间的差异，SDK 可能在调用上述方法时抛出异常。以下是调用创建轨道的方法时可能会遇到的错误：

- `NOT_SUPPORTED`: 使用的功能在当前浏览器上不支持。
- `MEDIA_OPTION_INVALID`: 指定的采集参数无法被满足，一般是因为设备不支持指定的分辨率或帧率。
- `DEVICE_NOT_FOUND`: 找不到指定的采集设备。
- `PERMISSION_DENIED`: 用户拒绝授予访问摄像头/麦克风的权限，或者屏幕共享选择共享源时，用户没有选择共享源，并关闭了选择窗口。
- `CONSTRAINT_NOT_SATISFIED`: 浏览器不支持指定的采集选项。
- `SHARE_AUDIO_NOT_ALLOWED`: 屏幕共享分享音频时用户没有勾选**分享音频**。
