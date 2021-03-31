---
id: inject_stream
title: 输入在线媒体流
sidebar_label: 输入在线媒体流
---

## 功能描述
输入在线媒体流功能可以将音视频流作为一个发送端输入正在进行的直播房间。通过将正在播放的音视频输入到直播频道中，主播和观众可以一起收听/观看该媒体流并实时互动。

### 适用场景

- 赛事直播中，主播直接拉比赛的音视频流，实现主播和观众边看比赛边点评的功能。
- 同一直播间内，主播与观众一同欣赏电影、音乐、演出，并实时交流讨论。
- 无人机或网络摄像头直接采集视频，该视频作为在线媒体流输入直播频道中。

### 工作原理

![](assets/inject-online-media-stream.png)

直播频道中的主播通过 Video Inject 服务器将在线媒体流拉到 Agora SD-RTN™ 中，输入到直播频道内。

- 频道内的连麦主播、普通观众都可以听到和看到该媒体流。
- 如果主播开启了 CDN 旁路推流，该媒体流也会被推送到 CDN 上， CDN 观众就可以听到和看到这路媒体流。

> - 频道内同一时间只允许输入一个在线媒体流。
> - 支持的编码格式：音频 AAC，视频 H.264。
> - 纯音频流也可作为在线媒体流输入直播频道。
> - 只有主播可以输入或删除在线媒体流，连麦主播、观众和 CDN 观众都不可以。

## 实现方法

在开始前，请确保已在你的项目中实现基本的实时音视频功能。详见[实现音视频通话](basic_call.md)。

> 请确保已开通旁路推流的功能，详见[前提条件](cdn_streaming.md#前提条件)。

参考如下步骤，在你的项目中实现输入在线媒体流功能：

1. 频道内主播调用 `AgoraRTCClient.addInjectStreamUrl` 方法向直播频道内输入指定在线媒体流。你也可以修改 `config` 的参数设置媒体流输入的分辨率、码率和帧率等参数，详见 [InjectStreamConfig](/api/cn/interfaces/injectstreamconfig.html)。

> - 频道内同一时间只允许输入一路在线媒体流。
> - 输入媒体流成功后，该媒体流会在直播频道内自动播放，频道内所有用户都会收到 `AgoraRTCClient.on("user-joined")` 和 `AgoraRTCClient.on("user-published")` 回调。

2. 频道内主播调用 `AgoraRTCClient.removeInjectStreamUrl` 方法从直播频道内删除指定的已输入在线媒体流。

> - 删除媒体流成功后，频道内所有用户都会收到 `AgoraRTCClient.on("user-unpublished")` 和 `AgoraRTCClient.on("user-left")` 回调。
> - 主播退出频道后，无需再调用 `removeInjectStreamUrl` 接口。

### 示例代码
以下示例代码中的 `client` 是指通过 `AgoraRTC.createClient` 创建的本地客户端对象。

```js
const injectStreamConfig = {
  width: 0,
  height: 0,
  videoGop: 30,
  videoFramerate: 15,
  videoBitrate: 400,
  audioSampleRate: 44100,
  audioChannels: 1,
};

// 开始输入在线媒体流。
client.addInjectStreamUrl("<YOUR URL>", injectStreamConfig).then(() => {
  console.log("add inject stream url success");
}).catch(e => {
  console.log("add inject stream failed", e);
});

client.removeInjectStreamUrl().then(() => {
  console.log("remove inject stream url success");
}).catch(e => {
  console.log("remove inject stream failed", e);
});
```

### API 参考
- [AgoraRTCClient.addInjectStreamUrl](/api/cn/interfaces/iagorartcclient.html#addinjectstreamurl)
- [AgoraRTCClient.removeInjectStreamUrl](/api/cn/interfaces/iagorartcclient.html#removeinjectstreamurl)

## 开发注意事项
主播在直播过程中启用输入在线媒体流时，观众需要订阅主播才能观看外部视频。

