---
id: custom_audio
title: 自定义音频采集
sidebar_label: 自定义音频采集
---

## 功能介绍

实时音视频传输过程中，Agora SDK 通常会启动默认的音频模块进行采集。在以下场景中，你可能会发现默认的音频模块无法满足开发需求：

- app 中已有自己的音频模块
- 希望使用非麦克风采集的音频源，比如裸 PCM 数据
- 需要使用自定义的音频前处理库（变声等）

本文介绍如何使用 Agora Web SDK NG 在项目中实现自定义的音频采集。

## 实现方法

在开始前，请确保已在你的项目中实现基本的实时音视频功能。详见[实现音视频通话](basic_call.md)。

SDK 提供 [`createCustomAudioTrack`](/api/cn/interfaces/iagorartc.html#createcustomaudiotrack) 方法，支持通过传入一个 [`MediaStreamTrack`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) 对象来创建本地音频轨道，你可以通过这个方法实现自定义音频采集。

例如，你可以调用 `getUserMedia` 方法获取 `MediaStreamTrack` 对象，再将该对象传入 `createCustomAudioTrack` 创建可以在 SDK 中使用的本地音频轨道对象。

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

> MediaStreamTrack 对象是指浏览器原生支持的 MediaStreamTrack 对象，具体用法和浏览器支持状况请参考 [MediaStreamTrack API 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaStreamTrack)。

同样，你也可以利用强大的 [Web Audio API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API) 来获取 MediaStreamTrack，实现定制化的音频处理。

### API 参考

- [`createCustomAudioTrack`](/api/cn/interfaces/iagorartc.html#createcustomaudiotrack)
- [`LocalAudioTrack`](/api/cn/interfaces/ilocalaudiotrack.html)
