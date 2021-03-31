---
id: media_relay
title: 跨直播间连麦
sidebar_label: 跨直播间连麦
---

## 功能描述

跨直播间连麦，指 SDK 将源频道内主播的媒体流同时转发进多个目标频道，实现主播跨频道与其他主播进行实时互动的场景。其中：

- 频道中的所有主播可以看见彼此，并听到彼此的声音。
- 频道中的观众可以看到所有主播，并听到主播的声音。

该功能因其实时性和互动性，尤其适用于连麦 PK、在线合唱等直播场景，在增加直播趣味的同时，有效吸粉。

## 实现方法

> 跨频道连麦功能需要联系 <a href="mailto:sales@agora.io">sales@agora.io</a> 开通。

在开始前，请确保已在你的项目中实现基本的实时音视频功能。详见[实现音视频通话](basic_call.md)。

Agora Web SDK NG 提供如下跨频道媒体流转发接口，支持将源频道中的媒体流转发至最多 4 个目标频道，实现跨直播间连麦功能：

- `startChannelMediaRelay`
- `updateChannelMediaRelay`
- `stopChannelMediaRelay`

> API 调用顺序要求：
> - `startChannelMediaRelay` 方法必须在调用 `AgoraRTCClient.publish` 发布之后调用。
> - `updateChannelMediaRelay` 方法必须在 `startChannelMediaRelay` 后调用。

在跨频道媒体流转发过程中，SDK 会通过 [`AgoraRTCClient.on("channel-media-relay-state")`](/api/cn/interfaces/iagorartcclient.html#event_channel_media_relay_state) 回调报告媒体流转发的状态码 `state` 和错误码 `code`， 通过 [`AgoraRTCClient.on("channel-media-relay-event")`](/api/cn/interfaces/iagorartcclient.html#event_channel_media_relay_event) 回调报告媒体流转发的事件码。

> 注意：
> - 一个频道内可以有多个主播转发媒体流。哪个主播调用 `startChannelMediaRelay` 方法，SDK 就转发哪个主播的流。
> - 调用 `startChannelMediaRelay` 或 `updateChannelMediaRelay` 成功跨频道连麦后，目标频道的用户会收到 `AgoraRTCClient.on("user-published")` 回调。
> - 跨频道连麦中，如果目标频道的主播掉线或离开频道，源频道的主播会收到 `AgoraRTCClient.on("user-left")` 回调。

### 示例代码
以下示例代码中的 `client` 是指通过 `AgoraRTC.createClient` 创建的本地客户端对象。

**配置跨频道媒体流转发**

```js
const channelMediaConfig = new AgoraRTC.ChannelMediaRelayConfiguration();
// 设置源频道信息
channelMediaConfig.setSrcChannelInfo({
 channelName: "srcChannel",
 uid: 0,
 token: "yourSrcToken",
})
// 设置目标频道信息，可多次调用，最多设置 4 个目标频道。
channelMediaConfig.addDestChannelInfo({
 channelName: "destChannel1",
 uid: 123,
 token: "yourDestToken",
})
```

**开始跨频道媒体流转发**

```js
client.startChannelMediaRelay(channelMediaConfig).then(() => {
  console.log(`startChannelMediaRelay success`);
}).catch(e => {
  console.log(`startChannelMediaRelay failed`, e);
})
```

**更新媒体流转发频道**

```js
// 删除一个目标频道。
channelMediaConfig.removeDestChannelInfo("destChannel1")
// 更新跨频道媒体流转发设置。
client.updateChannelMediaRelay(channelMediaConfig).then(() => {
  console.log("updateChannelMediaRelay success");
}).catch(e => {
  console.log("updateChannelMediaRelay failed", e);
})
```

**停止跨频道媒体流转发**
```js
client.stopChannelMediaRelay().then(() => {
  console.log("stop media relay success");
}).catch(e => {
  console.log("stop media relay failed", e);
})
```

### API 参考
- [startChannelMediaRelay](/api/cn/interfaces/iagorartcclient.html#startchannelmediarelay)
- [updateChannelMediaRelay](/api/cn/interfaces/iagorartcclient.html#updatechannelmediarelay)
- [stopChannelMediaRelay](/api/cn/interfaces/iagorartcclient.html#stopchannelmediarelay)

## 开发注意事项
- 该功能最多支持将媒体流转发至 4 个目标频道。转发过程中，如果想添加或删除目标频道，可以调用 `updateChannelMediaRelay` 方法。
- 该功能不支持 String 型用户名。
- 在设置源频道信息（`setSrcChannelInfo`）时，请确保 `uid` 设置与当前主播的 UID 不同。我们建议将这里的 `uid` 设置为 `0`，由服务器随机分配。
- 在成功调用 `startChannelMediaRelay` 方法后，如果想再次调用该方法，必须先调用 `stopChannelMediaRelay` 方法退出当前的转发状态。