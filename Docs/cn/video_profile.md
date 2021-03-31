---
id: video_profile
title: 设置视频编码属性
sidebar_label: 设置视频编码属性
---

## 功能描述
你可以根据终端用户的设备、浏览器、网络状况和实际应用场景设置视频属性，调整视频的清晰度和流畅度，从而获得较高的用户体验。

## 实现方法
在开始前，请确保已在你的项目中实现基本的实时音视频功能。详见[实现音视频通话](basic_call.md)。

Agora Web SDK NG 提供两种方式设置视频属性：
- 在调用以下两个方法创建视频轨道时，通过修改这些方法中的 `encoderConfig` 参数设置视频编码属性：
  - [AgoraRTC.createCameraVideoTrack](/api/cn/interfaces/iagorartc.html#createcameravideotrack) 创建摄像头视频轨道。
  - [AgoraRTC.createScreenVideoTrack](/api/cn/interfaces/iagorartc.html#createScreenVideoTrack) 创建屏幕共享视频轨道。
> 调用 [AgoraRTC.createCustomVideoTrack](/api/cn/interfaces/iagorartc.html#createCustomVideoTrack) 创建自定义视频轨道时，只能设置发送码率，无法设置其他编码属性。
- 对于摄像头视频轨道，可以调用 [CameraVideoTrack.setEncoderConfiguration](/api/cn/interfaces/icameravideotrack.html#setencoderconfiguration) 动态调整视频属性。在已发布状态也可以调用。

`encoderConfig` 支持以下两种设置：
- SDK 预设的视频编码预设值。
- 自定义各种视频编码参数的对象。

### 示例代码

**创建时使用预设视频编码属性**

```js
AgoraRTC.createCameraVideoTrack({
  encoderConfig: "720p_1",
}).then(localVideoTrack => { /** ... **/ });
```

**创建时自定义视频编码属性**

```js
AgoraRTC.createCameraVideoTrack({
  encoderConfig: {
    width: 640,
    // 支持指定一个范围和参考值，具体配置参考相关 API 文档。
    height: { ideal: 480, min: 400, max: 500 },
    frameRate: 15,
    bitrateMin: 600, bitrateMax: 1000,
  },
}).then(localVideoTrack => {/** ... **/ });
```

**创建后通过预设值动态调整视频编码属性**

```js
localStream.setEncoderConfiguration("480p_1").then(() => { /** ... **/ })
```

**创建后动态调整自定义视频编码属性**

```js
localStream.setEncoderConfiguration({ width: 1280, height: 720 }).then(() => { /** ... **/ })
```

### API 参考
- [AgoraRTC.createCameraVideoTrack](/api/cn/interfaces/iagorartc.html#createcameravideotrack)
- [AgoraRTC.createScreenVideoTrack](/api/cn/interfaces/iagorartc.html#createScreenVideoTrack)
- [AgoraRTC.createCustomVideoTrack](/api/cn/interfaces/iagorartc.html#createCustomVideoTrack)
- [CameraVideoTrack.setEncoderConfiguration](/api/cn/interfaces/icameravideotrack.html#setencoderconfiguration)

## 开发注意事项
- 不同的浏览器对分辨率的支持可能不同，具体的支持情况详见[分辨率和浏览器对照表](/api/cn/globals.html#videoencoderconfigurationpreset)。
- 由于设备和浏览器的限制，部分浏览器对设置的分辨率不一定能全部适配。这种情况下浏览器会自动调整分辨率，计费也将按照实际分辨率计算。
- 视频能否达到 1080p 以上的分辨率取决于设备的性能，在性能配备较低的设备上有可能无法实现。如果采用 720p 分辨率而设备性能跟不上，则有可能出现帧率过低的情况。
- Safari 浏览器视频帧率为 30 fps，不支持自定义视频帧率。
- 动态修改视频属性仅支持 Chrome 63 及以上版本和 Safari 11 及以上版本。在部分 iOS 设备上动态修改视频属性可能会导致视频出现黑边。

## 常用分辨率、帧率和码率
通常来讲，视频属性的选择要根据产品实际情况来确定，比如，如果是 1 对 1，老师和学生的窗口比较大，要求分辨率会高一点，随之帧率和码率也要高一点；如果是1对4， 老师和学生的窗口都比较小，分辨率可以低一点，对应的码率帧率也会低一点，以减少编解码的资源消耗和缓解下行带宽压力。

一般可按以下场景推荐值进行设置。

- 2 人视频通话场景：
  - 分辨率 320 x 240、帧率 15 fps、码率 200 Kbps
  - 分辨率 640 x 360、帧率 15 fps、码率 400 Kbps
- 多人视频通话场景：
  - 分辨率 160 x 120、帧率 15 fps、码率 65 Kbps
  - 分辨率 320 x 180、帧率 15 fps、码率 140 Kbps
  - 分辨率 320 x 240、帧率 15fps、码率 200 Kbps

下表列出了 SDK 预设视频属性的各种参数。你可以参考下表进行自定义设置。

| 视频属性 | 分辨率（宽×高） | 帧率（fps） | 码率（Kbps） |
| -------- | --------------- | ----------- | ------------ |
| 120p     | 160 × 120       | 15          | 65           |
| 120p_1   | 160 × 120       | 15          | 65           |
| 120p_3   | 120 × 120       | 15          | 50           |
| 180p     | 320 × 180       | 15          | 140          |
| 180p_1   | 320 × 180       | 15          | 140          |
| 180p_3   | 180 × 180       | 15          | 100          |
| 180p_4   | 240 × 180       | 15          | 120          |
| 240p     | 320 × 240       | 15          | 200          |
| 240p_1   | 320 × 240       | 15          | 200          |
| 240p_3   | 240 × 240       | 15          | 140          |
| 240p_4   | 424 × 240       | 15          | 220          |
| 360p     | 640 × 360       | 15          | 400          |
| 360p_1   | 640 × 360       | 15          | 400          |
| 360p_3   | 360 × 360       | 15          | 260          |
| 360p_4   | 640 × 360       | 30          | 600          |
| 360p_6   | 360 × 360       | 30          | 400          |
| 360p_7   | 480 × 360       | 15          | 320          |
| 360p_8   | 480 × 360       | 30          | 490          |
| 360p_9   | 640 × 360       | 15          | 800          |
| 360p_10  | 640 × 360       | 24          | 800          |
| 360p_11  | 640 × 360       | 24          | 1000         |
| 480p     | 640 × 480       | 15          | 500          |
| 480p_1   | 640 × 480       | 15          | 500          |
| 480p_2   | 640 × 480       | 30          | 1000         |
| 480p_3   | 480 × 480       | 15          | 400          |
| 480p_4   | 640 × 480       | 30          | 750          |
| 480p_6   | 480 × 480       | 30          | 600          |
| 480p_8   | 848 × 480       | 15          | 610          |
| 480p_9   | 848 × 480       | 30          | 930          |
| 480p_10  | 640 × 480       | 10          | 400          |
| 720p     | 1280 × 720      | 15          | 1130         |
| 720p_1   | 1280 × 720      | 15          | 1130         |
| 720p_2   | 1280 × 720      | 30          | 2000         |
| 720p_3   | 1280 × 720      | 30          | 1710         |
| 720p_5   | 960 × 720       | 15          | 910          |
| 720p_6   | 960 × 720       | 30          | 1380         |
| 1080p    | 1920 × 1080     | 15          | 2080         |
| 1080p_1  | 1920 × 1080     | 15          | 2080         |
| 1080p_2  | 1920 × 1080     | 30          | 3000         |
| 1080p_3  | 1920 × 1080     | 30          | 3150         |
| 1080p_5  | 1920 × 1080     | 60          | 4780         |
| 1440p    | 2560 × 1440     | 30          | 4850         |
| 1440p_1  | 2560 × 1440     | 30          | 4850         |
| 1440p_2  | 2560 × 1440     | 60          | 7350         |
| 4K       | 3840 × 2160     | 30          | 8910         |
| 4K_1     | 3840 × 2160     | 30          | 8910         |
| 4K_3     | 3840 × 2160     | 60          | 13500        |