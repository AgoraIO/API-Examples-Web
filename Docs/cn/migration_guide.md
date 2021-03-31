---
id: migration_guide
title: 从 Agora Web SDK 迁移到 Agora Web SDK NG
sidebar_label: 迁移指南
---

本文的目标读者是已经使用过 [Agora Web SDK](https://docs.agora.io/cn/Video/start_call_web?platform=Web) 的开发者。如果你想要把你的应用从 Agora Web SDK 迁移到 Agora Web SDK NG，希望这篇文档对你能有所帮助。

本文包含以下内容：
- [改动简介](#改动简介)：列出 Agora Web SDK NG 在行为和方法上与原先的 Agora Web SDK 相比存在哪些区别。
- [迁移实例](#迁移实例)：以一个多人会议应用为例，从创建 `Client` 开始详细对比 Agora Web SDK NG 和原先的 Agora Web SDK 在用法上的不同。
- [Agora Web SDK NG API 改动表](#agora-web-sdk-ng-api-改动表)：提供完整的 API 改动列表，以便你进行后续的迁移工作。

我们建议你先阅读本文的[改动简介](#改动简介)和[迁移实例](#迁移实例)，初步了解 Agora Web SDK 和 Agora Web SDK NG 在设计上的差异。在实际迁移过程中，如遇到问题，你可以：
- 参考 [Agora Web SDK NG API 改动表](#agora-web-sdk-ng-api-改动表)。
- 在迁移某一个具体功能（如屏幕共享、推流到 CDN）时，阅读 Agora Web SDK NG 文档站上提供的[进阶功能](screensharing.md)。
- 阅读 Agora Web SDK NG 的 [API 文档](https://agoraio-community.github.io/AgoraWebSDK-NG/api/cn/)，使用 API 文档右上角的搜索功能，搜索 API 名称查看该 API 在 Agora Web SDK NG 中的具体函数签名。

![](assets/doc_search.png)

> Agora Web SDK NG 是一个**不向下兼容**的版本，这意味着迁移的过程可能不会那么顺利。由于我们移除了所有回调转而使用 `Promise`，70% 以上的 API 都需要手动修改。此外你还需注意一些架构及逻辑层面的改动。因此，与其说是迁移，不如说是从头重新集成 Agora Web SDK NG。

## 改动简介

### 异步方法均返回 Promise
对于加入和离开频道、发布和订阅、获取媒体设备、开启和关闭转码推流等异步方法，在 Agora Web SDK 中，通过回调函数（比如加入房间）、事件通知（比如发布/订阅）等方式来通知用户异步操作的结果；在 Agora Web SDK NG 中，统一使用 Promise。

### 基于音视频轨道的媒体控制
在 Agora Web SDK NG 中，我们移除了 [Stream](https://docs.agora.io/cn/Video/API%20Reference/web/interfaces/agorartc.stream.html) 对象，取而代之的是 `Track` 轨道对象。一个音视频流是由多个音视频轨道构成的。你不直接创建、发布或订阅一个流，而是通过创建、发布或订阅一个或多个轨道来实现媒体管理。这样实现的好处是音视频的逻辑互不干扰、各自独立，同时新方法也比 Agora Web SDK 的 `Stream.addTrack` 和 `Stream.removeTrack` 更方便易用。

> Agora Web SDK NG 允许同时发布多个音频轨道，SDK 会自动混音，但是视频轨道只允许同时发布一个。

除了把 `Stream` 拆分成 `Track`，在 Agora Web SDK NG 中还区分 `RemoteTrack` 和 `LocalTrack`，有些方法和对象只在本地有，有些只在远端有。

这一改动影响多个 API 的使用，包括创建本地媒体对象、发布和订阅音视频，详见下文迁移实例详解中的[通过本地摄像头和麦克风采集音频和视频](#通过本地摄像头和麦克风采集音频和视频)和[发布本地的音视频](#发布本地的音视频)。

### 改进频道内事件通知机制

#### 更改事件名

在 Agora Web SDK NG 中，我们统一了事件名。举例来说，原来的 Token 过期事件 `onTokenPrivilegeWillExpire` 更名为 `token-privilege-will-expire`。我们还调整了一些事件名以便它可以更好地被理解，比如 `peer-online` 和 `peer-offline` 更名为 `user-joined` 和 `user-left`，`stream-added` 和 `stream-removed` 更名为 `user-published` 和 `user-unpublished`。详见下文 [Agora Web SDK NG API 改动表](#agora-web-sdk-ng-api-改动表)。

#### 调整事件回调携带参数的格式

Agora Web SDK 的事件回调如果需要携带多个参数，会把这些参数统一包在一个对象中，但是 Agora Web SDK NG 会直接携带多个参数到回调函数中。

以 "connection-state-change" 事件为例：
```js
// 使用 Agora Web SDK
client.on("connection-state-change", e => {
  console.log("current", e.curState, "prev", e.prevState);
});
```

```js
// 使用 Agora Web SDK NG
client.on("connection-state-change", (curState, prevState) => {
  console.log("current", curState, "prev", prevState);
});
```

#### 改进频道内事件通知机制

Agora Web SDK NG 改进了频道内事件通知机制，确保客户端**不会收到重复的**频道内状态通知事件。

假设**本地用户 A** 和**远端用户 B、C、D** 同时加入了一个频道，B、C、D 均发布了流。如果本地用户 A 发生了网络波动，和频道暂时失去了连接，SDK 会自动帮 A 重连，**在重连过程中 B 离开了频道，C 取消了发流**。这整个过程中，触发了哪些频道事件？

首先在 A 首次加入频道时，两个版本的 SDK 事件行为都是一致的，A 会收到：
- 用户 B、C、D 加入频道的事件。
- 用户 B、C、D 发流的事件。

当 A 由于网络问题和频道暂时失去了连接，然后重连：
- 如果 A 使用的是 Agora Web SDK，当 SDK 和频道失去连接时，无论是否可以重连， SDK 都会认为 A 已经离开频道并清空频道内的所有状态。所以 A 重连回频道和 A 第一次加入频道时没有区别，会收到：
  - 用户 C、D 加入频道的事件。
  - 用户 D 发流的事件。
> 在 Agora Web SDK 中，你会因为偶然发生的断线重连而收到重复的事件，这可能会导致你在上层事件处理时引发一些预期之外的问题。你需要监听连接状态变化，在断线重连时重置一些应用层的状态，以避免第二次收到这些事件时引发问题。
- 如果 A 使用的是 Agora Web SDK NG，当 SDK 和频道失去连接时，SDK 会认为 A 此时还在频道中，不会清空频道内的状态（用户主动调用 `leave` 离开频道除外）。所以当 A 重连回频道时，SDK 只会向 A 发送那些在重连过程中丢失的事件，包括：
  - 用户 B 退出频道的事件。
  - 用户 C 取消发流的事件。
> 在 Agora Web SDK NG 中，即使你没有像使用 Agora Web SDK 时那样在断线重连时做一些特殊的逻辑，SDK 也能够确保你的上层应用可以正常工作，不会收到重复的事件。

简单来说，Agora Web SDK NG 中的事件通知机制**更符合人类直觉**，你不需要像使用 Agora Web SDK 时那样做一些额外的工作。

## 迁移实例详解

本节以一个多人通话应用为例，比对 Agora Web SDK NG 和 Agora Web SDK 在使用上的差别。

### 加入频道
首先，创建一个 `Client` 对象，然后加入目标频道：

```js
// 使用 Agora Web SDK
const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
client.init("APPID", () => {
  client.join("Token", "Channel", null, (uid) => {
    console.log("join success", uid);
  }, (e) => {
    console.log("join failed", e);
  });
});
```

```js
// 使用 Agora Web SDK NG
const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

try {
  const uid = await client.join("APPID", "Token", "Channel", null);
  console.log("join success");
} catch (e) {
  console.log("join failed", e);
}
```
> 我们假设代码运行在一个 `async` 函数下，以下 Agora Web SDK NG 相关示例代码为了叙述方便都会直接使用 `await`。

改动点：
- 在 Agora Web SDK NG 中，异步操作 `join` 返回 `Promise`，配合 `async/await` 使用。
- Agora Web SDK NG 移除了 `client.init`, 在 `client.join` 时传入 `APPID`，这意味你可以使用一个 Client 对象先后加入不同 App ID 的频道。

### 通过本地摄像头和麦克风采集音频和视频
通过本地麦克风采集的音频创建音频轨道对象，通过本地摄像头采集的视频创建视频轨道对象。示例代码中，默认播放本地视频，不播放本地音频。

```js
// 使用 Agora Web SDK
const localStream = AgoraRTC.createStream({ audio: true, video: true });
localStream.init(() => {
  console.log("init stream success");
  localStream.play("DOM_ELEMENT_ID", { muted: true });
}, (e) => {
  console.log("init local stream failed", e);
});
```

```js
// 使用 Agora Web SDK NG
const localAudio = await AgoraRTC.createMicrophoneAudioTrack();
const localVideo = await AgoraRTC.createCameraVideoTrack();
console.log("create local audio/video track success");

localVideo.play("DOM_ELEMENT_ID");
```

改动点：
- Agora Web SDK NG 移除了 `Stream` 对象。采集麦克风和采集摄像头现在是两个独立的方法，分别返回音频轨道对象和视频轨道对象。
- Agora Web SDK NG 中的音视频对象没有 `init` 方法，因为在创建音视频对象时 SDK 会初始化摄像头和麦克风，并通过 Promise 返回异步操作的结果。
- 由于在 Agora Web SDK NG 中音视频对象分开控制，`play` 方法中移除了 `muted` 参数。如不想播放音频，不调用音频轨道中的 `play` 即可。

### 发布本地的音视频
音视频采集完成后，将这些音视频发布到频道中。

```js
// 使用 Agora Web SDK
client.publish(localStream, err => {
  console.log("publish failed", err);
});
client.on("stream-published",  () => {
  console.log("publish success");
});
```

```js
// 使用 Agora Web SDK NG
try {
  // 如果使用通信场景，则不需要这一行。
  await client.setClientRole("host");
  await client.publish([localAudio, localVideo]);
  console.log("publish success");
} catch (e) {
  console.log("publish failed", e);
}
```

改动点：
- 如果你的频道场景为[直播场景](/api/cn/interfaces/clientconfig.html#mode)，在 Agora Web SDK 中发布时 SDK 会自动将你的用户角色设为 `host`，但是在 Agora Web SDK NG 中，你需要手动将用户角色设为 `host`。
- 在 Agora Web SDK NG 中，异步操作 `join` 返回 `Promise`。
- 在 Agora Web SDK NG 中，调用 `publish` 时传入的参数是 `LocalTrack` 列表而非 `Stream`。可以重复调用 `publish` 来增加需要发布的轨道，或者重复调用 `unpublish` 来取消发布轨道。

### 订阅远端音视频并播放
如果频道里的远端用户发布了音视频轨道，你需要订阅这个用户并播放音视频轨道。在加入频道之前，你需要监听远端用户发布的相关事件，然后在收到事件回调时发起订阅。

```js
// 使用 Agora Web SDK
client.on("stream-added", e => {
  client.subscribe(e.stream, { audio: true, video: true }, err => {
    console.log("subscribe failed", err);
  });
});

client.on("stream-subscribed", e => {
  console.log("subscribe success");
  e.stream.play("DOM_ELEMENT_ID");
});
```

```js
// 使用 Agora Web SDK NG
client.on("user-published", async (remoteUser, mediaType) => {
  await client.subscribe(remoteUser, mediaType);
  if (mediaType === "video") {
    console.log("subscribe video success");
    remoteUser.videoTrack.play("DOM_ELEMENT_ID");
  }
  if (mediaType === "audio") {
    console.log("subscribe audio success");
    remoteUser.audioTrack.play();
  }
});
```

改动点：
- Agora Web SDK NG 移除了 `stream-added`、`stream-removed` 和 `stream-updated`，取而代之的是 `user-published` 和 `user-unpublished`。
> 注意 `user-published` 回调中的第二个参数 `mediaType`，该参数有两个可能的值：`"video"` 和 `"audio"`。如果远端用户同时发布了音视频，那么就会触发两次 `user-published`，其中 `mediaType` 分别为 `"audio"` 和 `"video"`。

- Agora Web SDK NG 中，`subscribe` 是异步操作，会返回 Promise。传入的参数为 `remoteUser`，也就是远端用户对象，详见 [AgoraRTCRemoteUser](/api/cn/interfaces/iagorartcremoteuser.html)。
- 远端音视频轨道对象会在订阅操作成功后保存在 `remoteUser` 下，直接调用 play 即可播放。

## Agora Web SDK NG API 改动表

### AgoraRTC
- `getScreenSources` 更名为 [getElectronScreenSources](/api/cn/interfaces/iagorartc.html#getelectronscreensources)，并且移除了回调参数，现在会返回一个 Promise。
- [getDevices](/api/cn/interfaces/iagorartc.html#getdevices) 现在会返回一个 Promise，同时新增 [getCameras](/api/cn/interfaces/iagorartc.html#getcameras) 和 [getMicrophones](/api/cn/interfaces/iagorartc.html#getmicrophones)。
- 移除 `Logger` 对象，增加 [disableLogUpload](/api/cn/interfaces/iagorartc.html#disablelogupload) / [enableLogUpload](/api/cn/interfaces/iagorartc.html#enablelogupload) / [setLogLevel](/api/cn/interfaces/iagorartc.html#setloglevel) 用于控制日志上报和打印行为。
- 移除 `createStream`，新增以下方法创建音视频对象：
 - [createMicrophoneAudioTrack](/api/cn/interfaces/iagorartc.html#createmicrophoneaudiotrack): 创建麦克风轨道
 - [createCameraVideoTrack](/api/cn/interfaces/iagorartc.html#createcameravideotrack): 创建摄像头轨道
 - [createScreenVideoTrack](/api/cn/interfaces/iagorartc.html#createscreenvideotrack): 创建屏幕共享轨道
 - [createBufferSourceAudioTrack](/api/cn/interfaces/iagorartc.html#createbuffersourceaudiotrack): 创建音频文件轨道（用于混音）
 - [createCustomAudioTrack](/api/cn/interfaces/iagorartc.html#createcustomaudiotrack) 和 [createCustomVideoTrack](/api/cn/interfaces/iagorartc.html#createcustomvideotrack): 创建自定义音视频轨道（用于自采集）

### Client
- 移除 `Client.init`
- 移除 `Client.getConnectionState`，新增 [Client.connectionState](/api/cn/interfaces/iagorartcclient.html#connectionstate) 字段表示当前和服务器的连接状态
- [ConnectionState](/api/cn/globals.html#connectionstate) 中新增状态 `RECONNECTING` 表示当前正在重连，原来的 `CONNECTING` 仅表示首次正在建立连接
- 新增 [Client.uid](/api/cn/interfaces/iagorartcclient.html#uid) 来表示当前本地用户的用户 ID
- 新增 [Client.remoteUsers](/api/cn/interfaces/iagorartcclient.html#remoteusers) 来表示当前远端用户的用户列表
- [Client.addInjectStreamUrl](/api/cn/interfaces/iagorartcclient.html#addinjectstreamurl) 现在会返回一个 Promise 来标志输入媒体流成功/失败，移除 `Client.on("streamInjectStatus")`
- 移除 [Client.removeInjectStream](/api/cn/interfaces/iagorartcclient.html#addinjectstreamurl) 的 `url` 参数
- 移除 [Client.enableDualStream](/api/cn/interfaces/iagorartcclient.html#enabledualstream) 和 [Client.disableDualStream](/api/cn/interfaces/iagorartcclient.html#disabledualstream) 的回调参数，现在会返回 Promise
- 移除 `Client.getCameras`, `Client.getDevices`, `Client.getRecordingDevices`, 现在这些方法被移动到 `AgoraRTC` 下
- 移除 `Client.getPlayoutDevices`
- 移除 `Client.getLocalAudioStats`、`Client.getLocalVideoStats`、`Client.getRemoteAudioStats`、`Client.getRemoteVideoStats`，现在音视频媒体统计数据统一通过 [LocalAudioTrack.getStats](/api/cn/interfaces/ilocalaudiotrack.html#getstats) 、[LocalVideoTrack.getStats](/api/cn/interfaces/ilocalvideotrack.html#getstats) 、[RemoteAudioTrack.getStats](/api/cn/interfaces/iremoteaudiotrack.html#getstats) 、[RemoteVideoTrack.getStats](/api/cn/interfaces/iremotevideotrack.html#getstats) 这些方法来获取，同时字段都做了改变，具体参阅 API 文档
- 移除 `Client.getSystemStats`
- 移除 `Client.getSessionStats` / `Client.getTransportStats`，现在使用一个方法统一获取这些状态 [Client.getRTCStats](/api/cn/interfaces/iagorartcclient.html#getrtcstats)
- [Client.join](/api/cn/interfaces/iagorartcclient.html#join) 现在会返回一个 Promise，移除回调参数，增加 `appid` 参数
- [Client.leave](/api/cn/interfaces/iagorartcclient.html#leave) 现在会返回一个 Promise，移除回调参数
- 增加 [Client.once](/api/cn/interfaces/iagorartcclient.html#once) 只监听目标事件一次
- 增加 [Client.removeAllListeners](/api/cn/interfaces/iagorartcclient.html#removealllisteners) 用于删除所有事件监听
- [Client.publish](/api/cn/interfaces/iagorartcclient.html#publish) 现在需要传入 [LocalTrack](/api/cn/interfaces/ilocaltrack.html) 的列表，现在会返回一个 Promise，同时移除 `Client.on("stream-published")` 回调
- [Client.unpublish](/api/cn/interfaces/iagorartcclient.html#publish) 现在会返回一个 Promise
- [Client.subscribe](/api/cn/interfaces/iagorartcclient.html#subscribe) 现在使用 [AgoraRTCRemoteUser](/api/cn/interfaces/iagorartcremoteuser.html) 作为参数，返回一个 Promise，移除 `Client.on("stream-subscribed")`
- [Client.unsubscribe](/api/cn/interfaces/iagorartcclient.html#unsubscribe) 现在使用 [AgoraRTCRemoteUser](/api/cn/interfaces/iagorartcremoteuser.html) 作为参数，返回一个 Promise
- [Client.renewToken](/api/cn/interfaces/iagorartcclient.html#renewtoken) 现在会返回一个 Promise
- [Client.setClientRole](/api/cn/interfaces/iagorartcclient.html#setclientrole) 移除回调参数，现在会返回一个 Promise。**现在设置角色为 audience 后不会自动 unpublish，调用 publish 时也不会自动把角色设置成 host**
- 移除 `Client.setEncryptionMode` 和 `Client.setEncryptionSecret`，现在通过一个方法 [Client.setEncryptionConfig](/api/cn/interfaces/iagorartcclient.html#setencryptionconfig) 来配置
- [Client.setLiveTranscoding](/api/cn/interfaces/iagorartcclient.html#setlivetranscoding) / [Client.startLiveStreaming](/api/cn/interfaces/iagorartcclient.html#startlivestreaming) / [Client.stopLiveStreaming](/api/cn/interfaces/iagorartcclient.html#stoplivestreaming) 现在都会返回 Promise，同时移除 `Client.on("liveTranscodingUpdated")` / `Client.on("liveStreamingStarted")` / `Client.on("liveStreamingFailed")` / `Client.on("liveStreamingStopped")` 事件
- [Client.startChannelMediaRelay](/api/cn/interfaces/iagorartcclient.html#startchannelmediarelay) 现在会返回一个 Promise
  - [ChannelMediaRelayConfiguration](/api/cn/interfaces/ichannelmediarelayconfiguration.html) 移除 `setDestChannelInfo`, 改为 [addDestChannelInfo](/api/cn/interfaces/ichannelmediarelayconfiguration.html#adddestchannelinfo) 并去除冗余参数，具体参考 API 文档
  - [ChannelMediaRelayConfiguration](/api/cn/interfaces/ichannelmediarelayconfiguration.html) 去除了 [setSrcChannelInfo](/api/cn/interfaces/ichannelmediarelayconfiguration.html#setsrcchannelinfo) 的冗余参数
- [Client.stopChannelMediaRelay](/api/cn/interfaces/iagorartcclient.html#stopchannelmediarelay) 现在会返回一个 Promise
- [Client.updateChannelMediaRelay](/api/cn/interfaces/iagorartcclient.html#updatechannelmediarelay) 移除回调参数，现在会返回一个 Promise
- 移除 `Client.on("first-video-frame-decode")` 和 `Client.on("first-audio-frame-decode")`，现在这两个事件通过 [RemoteTrack.on("first-frame-decode")](/api/cn/interfaces/iremotetrack.html#event_first_frame_decoded) 触发
- 移除 `Client.on("mute-audio")`、`Client.on("mute-video")`、`Client.on("unmute-audio")`、`Client.on("unmute-video")`，现在统一使用事件 [Client.on("user-mute-updated")](/api/cn/interfaces/iagorartcclient.html#event_user_mute_updated) 来通知
- 移除 `Client.on("active-speaker")` 事件，相同的功能由 [Client.on("volume-indicator")](/api/cn/interfaces/iagorartcclient.html#event_volume_indicator) 提供
- `Client.on("onTokenPrivilegeWillExpire")` 和 `Client.on("onTokenPrivilegeDidExpire")` 更名为 [Client.on("token-privilege-will-expire")](/api/cn/interfaces/iagorartcclient.html#event_token_privilege_will_expire) 和 [Client.on("token-privilege-did-expire")](/api/cn/interfaces/iagorartcclient.html#event_token_privilege_did_expire)
- 移除 `Client.on("network-type-changed")` 事件， SDK 无法保证其可靠性
- 移除 `Client.on("connected")` / `Client.on("reconnect")` 事件，连接状态事件统一从 [Client.on("connection-state-change")](/api/cn/interfaces/iagorartcclient.html#event_connection_state_change) 获取
- [Client.on("stream-fallback")](/api/cn/interfaces/iagorartcclient.html#event_stream_fallback) 参数修改，增加 `isFallbackOrRecover` 参数，详见 API 文档

> 移除 `Stream.setAudioOutput` 方法。我们不建议用户在页面里设置音频输出设备，建议使用系统默认的输出设备。