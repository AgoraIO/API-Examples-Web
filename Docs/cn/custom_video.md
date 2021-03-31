---
id: custom_video
title: 自定义视频采集
sidebar_label: 自定义视频采集
---

## 功能介绍

实时音视频传输过程中，Agora Web SDK NG 通常会启动默认的音视频模块进行采集。在以下场景中，你可能会发现默认的音视频模块无法满足开发需求：
- app 中已有自己的音频或视频模块。
- 希望使用非摄像头采集的视频源，比如 Canvas 数据。
- 需要使用自定义的视频前处理库。

本文介绍如何使用 Agora Web SDK NG 在项目中实现自定义的视频采集。

## 实现方法

在开始前，请确保已在你的项目中实现基本的实时音视频功能。详见[实现音视频通话](basic_call.md)。

SDK 提供 [createCustomVideoTrack](/api/cn/interfaces/iagorartc.html#createcustomvideotrack)，支持通过传入一个 [MediaStreamTrack](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) 对象来创建本地视频轨道。

你可以通过获取 `MediaStreamTrack` 对象来实现自定义视频采集或者前处理。例如，你可以自己调用 `getUserMedia` 方法来获取 `MediaStreamTrack`，再通过 `createCustomVideoTrack` 来创建可以在 SDK 中使用的本地视频对象。

```js
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then((mediaStream) => {
    const videoMediaStreamTrack = mediaStream.getVideoTracks()[0];
    // Create a custom video track
    return AgoraRTC.createCustomVideoTrack({
      mediaStreamTrack: videoMediaStreamTrack,
    });
  })
  .then((localVideoTrack) => {
    // ...
  });
```

> `MediaStreamTrack` 对象是指浏览器原生支持的 `MediaStreamTrack` 对象，具体用法和浏览器支持状况请参考 [MediaStreamTrack API 说明](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaStreamTrack)。你也可以利用 [HTMLMediaElement.captureStream](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/captureStream) 或 [HTMLCanvasElement.captureStream](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream) 来获取 `MediaStreamTrack` 对象。

### API 参考
- [createCustomVideoTrack](/api/cn/interfaces/iagorartc.html#createcustomvideotrack)
- [LocalVideoTrack](/api/cn/interfaces/ilocalvideotrack.html)