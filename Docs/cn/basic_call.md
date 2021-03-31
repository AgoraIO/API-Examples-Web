---
id: basic_call
title: 实现基本音视频通话
sidebar_label: 实现基本通话
---

本文介绍如何使用 Agora Web SDK NG 实现基本音视频通话。

> 由于浏览器的安全策略对除 127.0.0.1 以外的 HTTP 地址作了限制，Agora Web SDK NG 仅支持 HTTPS 协议或者 http://localhost（http://127.0.0.1）。请勿使用 HTTP 协议在 http://localhost（http://127.0.0.1） 之外访问你的项目。

## 常用对象
在使用 Agora Web SDK NG 时，你会经常用到以下三种对象：

- [AgoraRTCClient](/api/en/interfaces/iagorartcclient.html) 对象，代表一个本地客户端。`AgoraRTCClient` 类的方法提供了音视频通话的主要功能，例如加入频道、发布音视频轨道等。
- [LocalTrack](/api/en/interfaces/ilocalaudiotrack.html) 对象和 [RemoteTrack](/api/en/interfaces/iremotetrack.html) 对象，代表本地和远端的音视频轨道对象，用于控制播放、暂停等音视频相关的操作。

> 音视频流由音视频轨道构成。在 Agora Web SDK NG 中，我们通过操作音视频轨道对象来控制音视频流的行为。

## 基本流程
一次简单的音视频通话的步骤一般如下：
1. 根据项目的 App ID 创建一个本地客户端 `AgoraRTCClient` 对象。
2. 通过 `AgoraRTCClient.join` 加入到一个指定的频道中。
3. 通过麦克风采集的音频创建一个 `MicrophoneAudioTrack` 对象（本地音频轨道对象）；通过摄像头采集的视频创建一个 `CameraVideoTrack` 对象（本地视频轨道对象）。
4. 通过 `AgoraRTCClient.publish` 将创建的本地音视频轨道对象发布到频道中。

当有其他用户加入频道并且也发布音视频轨道时：
1. SDK 会触发 `client.on("user-published")` 事件，在这个事件回调函数的参数中你可以拿到远端用户对象 `AgoraRTCRemoteUser`，表示这个用户刚刚发布了音视频轨道。
2. 通过 `AgoraRTCClient.subscribe` 订阅获取到的 `AgoraRTCRemoteUser`。
3. 订阅完成后，访问 `AgoraRTCRemoteUser.audioTrack` 和 `AgoraRTCRemoteUser.videoTrack` 即可获取到 `RemoteAudioTrack`（远端音频轨道对象）和 `RemoteVideoTrack`（远端视频轨道对象）。

为方便起见，我们预定义了两个变量和一个函数，下面的所有示例代码都包裹在这个函数中。此步骤不是必须的，你可以根据你的项目有其他的实现。

```js
const rtc = {
  // 用来放置本地客户端。
  client: null,
  // 用来放置本地音视频频轨道对象。
  localAudioTrack: null,
  localVideoTrack: null,
};

const options = {
  // 替换成你自己项目的 App ID。
  appId: "<YOUR APP ID>",
  // 传入目标频道名。
  channel: "demo_channel_name",
  // 如果你的项目开启了 App 证书进行 Token 鉴权，这里填写生成的 Token 值。
  token: null,
};

async function startBasicCall() {
  /**
   * 接下来的代码写在这里。
   */
}

startBasicCall();
```

### 1.创建本地客户端

```js
rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
```

调用 `createClient` 方法创建本地客户端对象。需注意 `mode` 和 `codec` 这两个参数的设置：
- `mode` 用于设置[频道场景](https://docs.agora.io/cn/Agora%20Platform/terms?platform=All%20Platforms#channel-profile)。Agora Web SDK NG 会根据使用场景的不同实行不同的优化策略。
  - 一对一或多人通话中，建议设为 `"rtc"`，使用通信场景。
  - 互动直播中，建议设为 `"live"`，使用直播场景。
- `codec` 用于设置浏览器使用的编解码格式。如果你需要使用 Safari 12.1 及之前版本，将该参数设为 `"h264"`；其他情况我们推荐使用 `"vp8"`。

### 2.加入目标频道

```js
const uid = await rtc.client.join(options.appId, options.channel, options.token, null);
```

调用 `join` 加入目标频道。该方法返回一个 `Promise`，当返回 `resolve` 时表示加入频道成功，返回 `reject` 时表示加入频道出现错误。我们可以利用 `async/await` 极大地简化我们的代码。

调用 `join` 方法时你需要注意以下参数：
- `appid`: 你的 App ID。详见[前提条件](setup.md#前提条件)。
- `channel`: 频道名，长度在 64 字节以内的字符串。在我们的示例项目中，`channel` 的值设为 `demo_channel_name`。
- `token`: （可选）如果你的 Agora 项目开启了 App 证书，你需要在该参数中传入一个 Token，详见[使用 Token](https://docs.agora.io/cn/Agora%20Platform/token#Token)。
  - 在测试环境，我们推荐使用控制台生成临时 Token，详见[获取临时 Token](https://docs.agora.io/cn/Agora%20Platform/token?platform=All%20Platforms#get-a-temporary-token)。
  - 在生产环境，我们推荐你在自己的服务端生成 Token，详见[生成 Token](https://docs.agora.io/cn/Interactive%20Broadcast/token_server_cpp)。
> 在我们的示例项目中，为了叙述方便，没有开启 App 证书，所以不需要校验 Token，`token` 的值为 `null`。如果你启用了 App 证书，请确保上面传入的 `channel` 值和生成 Token 时传入的 `channel` 值保持一致。
- `uid`：用户 ID，频道内每个用户的 UID 必须是唯一的。你可以填 `null`，Agora 会自动分配一个 UID 并在 `join` 的结果中返回。

更多的 API 介绍和注意事项请参考 [AgoraRTCClient.join](/api/cn/interfaces/iagorartcclient.html#join) 接口中的参数描述。

### 3.创建并发布本地音视频轨道

```js
// 通过麦克风采集的音频创建本地音频轨道对象。
rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
// 通过摄像头采集的视频创建本地视频轨道对象。
rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
// 将这些音视频轨道对象发布到频道中。
await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);

console.log("publish success!");
```

我们先调用 `createMicrophoneAudioTrack` 通过麦克风采集的音频创建本地音频轨道对象，调用 `createCameraVideoTrack` 通过摄像头采集的视频创建本地视频轨道对象；然后调用 `publish` 方法，将这些本地音视频轨道对象当作参数即可将音视频发布到频道中。

> - 以上方法都会返回 `Promise`，`resolve` 时代表成功，`reject` 时代表失败。我们使用 `async/await` 来让代码逻辑更清晰。
> - 由于加入频道和创建本地音视频轨道没有依赖关系，你可以利用 `Promise.all` 同时执行这些异步操作。

详细的参数设置（如采集设备和编码参数）请参考相关 API 文档：
- [createMicrophoneAudioTrack](/api/cn/interfaces/iagorartc.html#createmicrophoneaudiotrack)
- [createCameraVideoTrack](/api/cn/interfaces/iagorartc.html#createcameravideotrack)
- [publish](/api/cn/interfaces/iagorartcclient.html#publish)

### 4.订阅远端用户
当远端用户发布音视频轨道时，SDK 会触发 `client.on("user-published")` 事件。我们需要通过 `client.on` 监听该事件并在回调中订阅新加入的远端用户。

> 我们建议**在创建客户端对象之后立即监听事件**，以避免错过任何事件。放在这里介绍是因为叙述顺序。

在 `createClient` 后下一行插入以下代码，监听 `client.on("user-published")` 事件，当有远端用户发布时开始订阅，并在订阅后自动播放远端音视频轨道对象。

```js
rtc.client.on("user-published", async (user, mediaType) => {
  // 开始订阅远端用户。
  await rtc.client.subscribe(user, mediaType);
  console.log("subscribe success");

  // 表示本次订阅的是视频。
  if (mediaType === "video") {
    // 订阅完成后，从 `user` 中获取远端视频轨道对象。
    const remoteVideoTrack = user.videoTrack;
    // 动态插入一个 DIV 节点作为播放远端视频轨道的容器。
    const playerContainer = document.createElement("div");
    // 给这个 DIV 节点指定一个 ID，这里指定的是远端用户的 UID。
    playerContainer.id = user.uid.toString();
    playerContainer.style.width = "640px";
    playerContainer.style.height = "480px";
    document.body.append(playerContainer);

    // 订阅完成，播放远端音视频。
    // 传入 DIV 节点，让 SDK 在这个节点下创建相应的播放器播放远端视频。
    remoteVideoTrack.play(playerContainer);

    // 也可以只传入该 DIV 节点的 ID。
    // remoteVideoTrack.play(playerContainer.id);
  }

  // 表示本次订阅的是音频。
  if (mediaType === "audio") {
    // 订阅完成后，从 `user` 中获取远端音频轨道对象。
    const remoteAudioTrack = user.audioTrack;
    // 播放音频因为不会有画面，不需要提供 DOM 元素的信息。
    remoteAudioTrack.play();
  }
});
```

你需要注意 `user-published` 事件的第二个参数 `mediaType`, 代表远端用户当前发布的媒体类型：
- `audio`: 远端用户发布了音频轨道。
- `video`: 远端用户发布了视频轨道。

当远端用户取消发布或离开频道时，SDK 会触发 `client.on("user-unpublished")` 事件。此时我们需要销毁刚刚动态创建的 DIV 节点。

在刚刚监听 `client.on("user-published")` 事件的代码下一行插入以下代码，监听 `client.on("user-unpublished")` 事件。

```js
rtc.client.on("user-unpublished", (user, mediaType) => {
  if (mediaType === "video") {
    // 获取刚刚动态创建的 DIV 节点。
    const playerContainer = document.getElementById(user.uid.toString());
    // 销毁这个节点。
    playerContainer.remove();
  }
});
```

### 5.离开频道
通过以下步骤离开频道：
1. 销毁创建的本地音视频轨道，解除网页对摄像头和麦克风的访问。
2. 手动销毁之前动态创建的 DIV 节点。
3. 调用 `leave` 离开频道。

```js
async function leaveCall() {
  // 销毁本地音视频轨道。
  rtc.localAudioTrack.close();
  rtc.localVideoTrack.close();

  // 遍历远端用户。
  rtc.client.remoteUsers.forEach(user => {
    // 销毁动态创建的 DIV 节点。
    const playerContainer = document.getElementById(user.uid);
    playerContainer && playerContainer.remove();
  });

  // 离开频道。
  await rtc.client.leave();
}
```

> 在不同的产品设计中，离开频道可以既不销毁本地流，也不销毁动态创建的 DIV 节点。这些操作不是必须的，根据您自己的情况调整代码。

## Demo 体验

我们提供了一个简单的演示页面，完成了上述的步骤。你可以访问这个[地址](/demo/basicVideoCall/index.html)在线体验。
