---
id: join_and_leave
title: 加入/离开频道
sidebar_label: 加入/离开频道
---
Agora Web SDK NG 使用 [AgoraRTCClient](/api/cn/interfaces/iagorartcclient.html) 对象来管理一个本地用户在目标频道内的行为。在加入目标频道之前，你需要先创建一个 `AgoraRTCClient` 对象。

## 创建 AgoraRTCClient 对象

调用 [AgoraRTC.createClient](/api/cn/interfaces/iagorartc.html#createclient) 即可创建 `AgoraRTCClient` 对象。在创建 `AgoraRTCClient` 时，你需要指定使用的编码格式（`codec`）以及频道场景（`mode`）。

```js
const client = AgoraRTC.createClient({
  codec: "vp8",
  mode: "rtc",
});
```

### 选择视频编码格式

`codec` 设置支持 `"vp8"`（VP8）和 `"h264"`（H.264）两种视频编码格式。该设置只会影响发布端的视频编码格式，对于订阅端来说只要其支持该格式的解码，都能正常完成订阅。

举例来说，桌面端 Chrome 58 及以上版本既支持 VP8 也支持 H.264，而 Safari 12.1 以下版本不支持 VP8 编解码；如果频道中有两个主播分别发布了 VP8 和 H.264 的视频流，使用桌面端 Chrome 58 的观众可以解码这两个主播的视频，使用 Safari 12.1 以下版本浏览器的观众只能解码 H.264 的视频流。

不同浏览器和不同设备对这两种编解码格式支持都不同。下表列出不同浏览器所支持的编解码格式作为参考：

|浏览器|VP8|H.264|
|---|---|---|
|桌面端 Chrome 58+|✔|✔|
|Firefox 56+|✔|✔*|
|Safari 12.1+|✔|✔|
|Safari < 12.1|✘|✔|
|Android Chrome 58+|✔|?*|

> - Firefox 对 H.264 的支持依赖 **OpenH264 Video Codec provided by Cisco Systems, Inc.** 插件。Firefox 安装成功后会自动在后台下载该插件并默认启用，但是如果通话时插件没有下载完成，Firefox 就无法支持 H.264。
> - Android 设备上 Chrome 58 及以后版本对 H.264 的支持取决于设备。因为 Chrome 在 Android 设备上对 H.264 强制使用硬件编解码，即使 Chrome 支持 H.264，如果 Android 设备的芯片不支持 H.264 的硬件编解码，H.264 实际上也是不可用的。

### 选择频道场景

频道场景（`mode`）是 Agora 为了对不同的实时音视频场景进行针对性算法优化而提供的一种设置选项。SDK 支持两种频道场景：`"rtc"（`通信场景） 和 `"live"（`直播场景）。

**通信场景**

`"rtc"（`通信场景）适用于频道内所有用户需要相互交流且用户总数不太多的场景，如多人会议和在线聊天。

**直播场景**

`"live"（`直播场景）适用于发布端很少但是订阅端很多的场景，这种场景下 SDK 定义了两种用户角色：观众（默认）和主播。主播能够发送和接收音视频，观众不能发送、只能接收音视频。你可以通过设置 `createClient` 的 [role](/api/cn/interfaces/clientconfig.html#role) 参数来指定用户角色，也可以调用 [setClientRole](/api/cn/interfaces/iagorartcclient.html#setclientrole) 来动态修改用户角色。

## 加入频道

创建 `AgoraRTCClient` 对象后，就可以调用 [AgoraRTCClient.join](/api/cn/interfaces/iagorartcclient.html#join) 加入频道。

> 该方法为异步方法，使用时需要配合 `Promise` 或 `async/await`。

注意 `join` 方法的第四个参数 `uid` 的设置。不传入任何值时，Agora 会为这个加入的本地用户自动分配一个数字类型的用户 ID 作为其唯一的身份标识。你也可以通过该参数自行指定一个数字类型的用户 ID。

> 如果你指定的用户 ID 频道内已经有其他用户在使用，那么正在使用这个 ID 的用户会立刻被 Agora 服务器踢出频道，新用户会使用此用户 ID 成功加入。用户因为用户 ID 冲突被踢出频道时会触发 `connection-state-change` 回调，详见[频道内的连接状态](#connection)。

```js
// 自动分配数字 UID
const uid = await client.join("APPID", "CHANNEL", "TOKEN");

// 指定数字 UID
await client.join("APPID", "CHANNEL", "TOKEN", 393939);
```

## 离开频道

调用 [AgoraRTCClient.leave](/api/cn/interfaces/iagorartcclient.html#leave) 可以离开当前频道。该方法可以在任何时候调用，包括正在加入频道时或者正在重连时。

> `leave` 为异步方法，使用时需要配合 `Promise` 或 `async/await`。

调用 `leave` 后，SDK 会立刻销毁与当前频道相关的对象，包括订阅的远端用户对象、远端轨道对象、记录连接状态的对象等。如果需要再次加入频道，在调用 `leave` 后再调用 `join` 即可。

```js
await client.leave();
```

## <a name="connection"></a>频道内的连接状态

加入目标频道后，网络波动可能会导致 SDK 和 Agora 服务的连接断开，此时 SDK 会自动重连以重新加入频道。

你可以通过 [AgoraRTCClient.connectionState](/api/cn/interfaces/iagorartcclient.html#connectionstate) 或者 [AgoraRTCClient.on("connection-state-change")](/api/cn/interfaces/iagorartcclient.html#event_connection_state_change) 获取当前的连接状态。

下面列出所有的连接状态：

- `"DISCONNECTED"`: 连接断开。处于这个状态时，SDK 不会自动重连。该状态表示用户处于以下任一阶段：
  - 尚未通过 `join` 加入频道。
  - 已经通过 `leave` 离开频道。
  - 被 Agora 服务器踢出频道或者连接失败等异常情况。
- `"CONNECTING"`: 正在连接。调用 `join` 时为此状态。
- `"CONNECTED"`: 已连接。该状态表示用户已经加入频道，可以在频道内发布或订阅媒体轨道。
- `"RECONNECTING"`: 连接断开，正在尝试重连。因网络断开或切换导致 SDK 与服务器的连接中断，SDK 会自动重连，进入此状态。
- `"DISCONNECTING"`: 正在断开连接。调用 `leave` 时为此状态。

## 错误处理

在加入频道的过程中，因为 SDK 使用不当或者网络异常等原因，可能会抛出以下错误：

- `INVALID_PARAMS`: 提供的参数错误，比如提供了格式非法的 Token。
- `INVALID_OPERATION`: 非法操作。该错误通常是重复加入频道引起的，请确保重复加入时先调用 `leave`。
- `OPERATION_ABORTED`: 加入被中止，表示在 `join` 方法成功之前就调用了 `leave` 方法。
- `UNEXPECTED_RESPONSE`: Agora 服务器返回了非预期的响应，通常是因为 App ID 或 Token 鉴权失败，例如开启了 App 证书却未传入 Token。
- `UID_CONFLICT`: 创建了多个 `AgoraRTCClient` 对象，且重复使用了同一个用户 ID。
