---
id: publish_and_subscribe
title: 发布和订阅
sidebar_label: 发布和订阅
---

## 发布音视频

完成本地轨道的创建并且成功加入频道后，就可以调用 [AgoraRTCClient.publish](/api/cn/interfaces/iagorartcclient.html#publish) 将本地的音视频数据发布到当前频道，以供频道中的其他用户订阅。

```js
const localAudioTrack = ...;
const localVideoTrack = ...;

// 你可以多次调用 publish 发布多个轨道
await client.publish(localAudioTrack);
await client.publish(localVideoTrack);

// 也可以一次性将需要发布的轨道一起发布
await client.publish([localAudioTrack, localVideoTrack]);
```

关于发布，注意事项如下：

- 一个 `AgoraRTCClient` 对象可以同时发布多个音频轨道，SDK 会自动混音，将多个音频轨道合并为一个音频轨道。
  > Safari 12 之前的版本不支持混音，无法使用此特性。
- 一个 `AgoraRTCClient` 对象同一时间**只能发布一个视频轨道**。如果你想要更换视频轨道，例如已经发布了一个摄像头视频轨道，想要切换为屏幕共享视频轨道，你必须先取消发布。
- 可以多次调用该方法来发布不同的轨道，但是不能重复发布同一个轨道对象。
- 该方法为异步方法，使用时需要配合 `Promise` 或 `async/await`。

### 错误处理

在发布过程中，可能因为网络环境或者 SDK 使用不当抛出以下错误：

- `INVALID_OPERATION`: 非法操作，说明在加入频道成功之前就调用了 `publish` 方法。
- `OPERATION_ABORTED`: 发布被中止，可能是因为在发布成功之前就主动调用 `leave` 离开了频道。
- `INVALID_LOCAL_TRACK`: 参数错误，传入了非法的 `LocalTrack` 对象。
- `CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS`: 不允许同时发布多个视频轨道。
- `NOT_SUPPORTED`: 发布了多个音频轨道，但是浏览器不支持混音。
- `UNEXPECTED_RESPONSE`: 收到了 Agora 服务器异常的返回，发布轨道失败。建议保留日志，联系 Agora [技术支持](https://agora-ticket.agora.io/)。
- `NO_ICE_CANDIDATE`: 找不到本地网络出口，可能是网络防火墙或者启用了禁止 WebRTC 的浏览器插件。详见 [FAQ](https://docs.agora.io/cn/faq/console_error_web#none-ice-candidate-not-alloweda-namecandidatea)。

## 取消发布音视频

成功发布本地轨道后，如果想取消发布，可以调用 [AgoraRTCClient.unpublish](/api/cn/interfaces/iagorartcclient.html#unpublish)。

```js
// 发布音视频
await client.publish([localAudioTrack, localVideoTrack]);

// 取消发布视频，此时音频还在正常发布
await client.unpublish(localVideoTrack);

// 也可以一次将所有正在发布的轨道全部取消发布
await client.unpublish();
// 或者批量取消发布
await client.unpublish([localAudioTrack, localVideoTrack]);
```

关于取消发布，注意事项如下：

- 该方法可以多次调用。你可以使用 `publish` 和 `unpublish` 实现发布和取消发布某个本地轨道。
- 该方法为异步方法，使用时需要配合 `Promise` 或 `async/await`。

## 订阅音视频

当远端用户成功发布音视频轨道之后，SDK 会触发 [user-published](/api/cn/interfaces/iagorartcclient.html#event_user_published) 事件。这个事件携带两个参数：远端用户对象（`user`）和远端发布的媒体类型（`mediaType`）。此时，你可以调用 [AgoraRTCClient.subscribe](/api/cn/interfaces/iagorartcclient.html#subscribe) 发起订阅。

> 该方法为异步方法，使用时需要配合 `Promise` 或者 `async/await`。

```js
client.on("user-published", async (user, mediaType) => {
  // 发起订阅
  await client.subscribe(user, mediaType);

  // 如果订阅的是音频轨道
  if (mediaType === "audio") {
    const audioTrack = user.audioTrack;
    // 自动播放音频
    audioTrack.play();
  } else {
    const videoTrack = user.videoTrack;
    // 自动播放视频
    videoTrack.play(DOM_ELEMENT);
  }
});
```

当订阅方法调用完成之后，你可以通过 `user.audioTrack` 和 `user.videoTrack` 获取相应的 [RemoteAudioTrack](/api/cn/interfaces/iremoteaudiotrack.html) 和 [RemoteVideoTrack](/api/cn/interfaces/iremotevideotrack.html) 对象。

订阅和发布不同，每次订阅只能订阅一个音频或视频轨道。即使发布端同时发布了音频轨道和视频轨道，SDK 也会触发两次 `user-published` 事件：一次 `user-published(audio)`，一次 `user-published(video)`。按照上面的代码逻辑，会完成两次订阅。

### 处理 Autoplay 问题

当我们订阅并播放音频轨道时，可能会受到[浏览器音频自动播放限制](https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide#Autoplay_and_autoplay_blocking)(以下简称 Autoplay 限制)。Autoplay 限制是指，如果用户在页面上没有发生任何交互动作（如点击、触摸等），这个网页就不能自动播放音频。

对于 Agora Web SDK NG 来说，如果在发生交互之前调用了 `RemoteAudioTrack.play` 播放音频，浏览器的 Autoplay 限制可能导致用户听不到声音。但是只要用户在任何时候和页面发生了交互，SDK 会检测到这个行为然后尝试自动恢复播放音频。

我们推荐你在调用 `RemoteAudioTrack.play` 之前就确保用户已经和页面发生交互。如果产品设计无法保证这一点，你可以使用 [AgoraRTC.onAudioAutoplayFailed](/api/cn/interfaces/iagorartc.html#onaudioautoplayfailed) 回调，在播放失败时提示用户和页面发生交互。

### 错误处理

在订阅过程中，因为网络环境等因素 SDK 可能抛出如下错误：

- `INVALID_OPERATION`: 非法操作，可能在加入频道成功之前就调用了 `subscribe`。
- `INVALID_REMOTE_USER`: 传入了非法的远端用户对象，例如该用户不在频道内。
- `REMOTE_USER_IS_NOT_PUBLISHED`：传入的远端用户没有发布 `subscribe` 方法中传入的媒体类型。
- `UNEXPECTED_RESPONSE`: 收到了 Agora 服务器异常的返回，订阅失败。建议保留日志，联系 Agora [技术支持](https://agora-ticket.agora.io/)。
- `OPERATION_ABORTED`: 操作中止，可能在订阅成功之前就调用 `leave` 离开了频道。
- `NO_ICE_CANDIDATE`: 找不到本地网络出口，可能是网络防火墙或者启用了禁止 WebRTC 的浏览器插件。详见 [FAQ](https://docs.agora.io/cn/faq/console_error_web#none-ice-candidate-not-alloweda-namecandidatea)。

## 取消订阅音视频

你可以通过 [AgoraRTCClient.unsubscribe](/api/cn/interfaces/iagorartcclient.html#unsubscribe) 取消订阅远端的音视频。

```js
// 订阅目标用户的音视频
await client.subscribe(user, "audio");
await client.subscribe(user, "video");

// 取消订阅视频
await client.unsubscribe(user, "video");
// 也可以取消订阅当前用户的所有媒体类型
await client.unsubscribe(user);
```

关于取消订阅，注意事项如下：

- 取消订阅成功后，SDK 会释放相应的 `RemoteTrack` 对象。一旦远端轨道对象被释放，SDK 会自动移除视频的播放元素，音频播放也会停止。
- 如果远端用户主动取消发布，本地会收到 `user-unpublished` 回调，收到该回调时 SDK 会自动释放相应的 `RemoteTrack` 对象，你无需再调用 `unsubscribe`。
- 该方法为异步方法，使用时需要配合 `Promise` 或 `async/await`。
