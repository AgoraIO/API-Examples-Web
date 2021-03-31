---
id: call_quality
title: 通话中质量监测
sidebar_label: 通话中质量监测
---

## 功能描述
Agora Web SDK NG 支持获取以下统计数据来检测通话质量：
- 当前会话的统计数据
- 本地轨道的统计数据
- 远端轨道的统计数据
- 本地用户的上下行网络质量相关的统计数据
- 频道内的异常事件

## 实现方法

在开始前，请确保已在你的项目中实现基本的实时音视频功能。详见[实现音视频通话](basic_call.md)。

### 获取本地用户的上下行网络质量相关的统计数据
本地用户加入频道后，SDK 通过 `AgoraRTCClient.on` 中的 [`network-quality`](/api/cn/interfaces/iagorartcclient.html#event_network_quality) 回调向 app 报告本地用户的上下行网络质量。该回调每 2 秒触发，返回的参数包括：
- `downlinkNetworkQuality`：下行网络质量打分。
- `uplinkNetworkQuality`：上行网络质量打分。

质量打分对照表如下：

| 分数   | 说明                                                         |
| -------- | :----------------------------------------------------------- |
| 0        | 网络质量未知。                                        |
| 1        | 网络质量极好。                                      |
| 2        | 用户主观感觉和极好差不多，但码率可能略低于极好。 |
| 3        | 用户主观感受有瑕疵但不影响沟通。                       |
| 4        | 勉强能沟通但不顺畅。                                    |
| 5        | 网络质量非常差，基本不能沟通。                         |
| 6        | 完全无法沟通。                         |

以下示例代码中的 `client` 是指通过 `AgoraRTC.createClient` 创建的本地客户端对象。

``` javascript
client.on("network-quality", (stats) => {
    console.log("downlinkNetworkQuality", stats.downlinkNetworkQuality);
    console.log("uplinkNetworkQuality", stats.uplinkNetworkQuality);
});
```

> 我们推荐您使用此 API 来展示本地用户的网络状态

### 获取当前会话的统计数据
调用 [AgoraRTCClient.getRTCStats](/api/cn/interfaces/iagorartcclient.html#getrtcstats) 方法获取与当前会话相关的统计数据。数据说明详见 [AgoraRTCStats](/api/cn/interfaces/agorartcstats.html)。

以下示例代码中的 `client` 是指通过 `AgoraRTC.createClient` 创建的本地客户端对象。
```js
const stats = client.getRTCStats();
```

### 获取本地音视频轨道的统计数据
调用 [LocalAudioTrack.getStats](/api/cn/interfaces/ilocalaudiotrack.html#getstats) 和 [LocalVideoTrack.getStats](/api/cn/interfaces/ilocalvideotrack.html#getstats) 方法获取本地发布的音频轨道和视频轨道的统计数据，数据说明详见 [LocalAudioTrackStats](/api/cn/interfaces/localaudiotrackstats.html) 和 [LocalVideoTrackStats](/api/cn/interfaces/localvideotrackstats.html)。

```js
const audioTrackStats = localAudioTrack.getStats();
const videoTrackStats = localVideoTrack.getStats();
```

### 获取远端音视频轨道的统计数据
调用 [RemoteAudioTrack.getStats](/api/cn/interfaces/iremoteaudiotrack.html#getstats) 和 [RemoteVideoTrack.getStats](/api/cn/interfaces/iremotevideotrack.html#getstats) 方法获取订阅的远端音频轨道和视频轨道的统计数据，数据说明详见 [RemoteAudioTrackStats](/api/cn/interfaces/remoteaudiotrackstats.html) 和 [RemoteVideoTrackStats](/api/cn/interfaces/remotevideotrackstats.html)。

```js
const audioTrackStats = remoteAudioTrack.getStats();
const videoTrackStats = remoteVideoTrack.getStats();
```

### 关注频道内的异常事件
Agora Web SDK NG 通过 `AgoraRTCClient.on` 中的 [`exception`](/api/cn/interfaces/iagorartcclient.html#event_exception) 回调通知 App 频道内的异常事件。异常事件不是错误，但是往往会引起通话质量问题。发生异常事件后，如果恢复正常，也会收到该回调。该回调返回：
- `code`：事件码。
- `msg`：提示消息。
- `uid`：发生异常或恢复的用户 UID。

以下示例代码中的 `client` 是指通过 `AgoraRTC.createClient` 创建的本地客户端对象。
``` javascript
client.on("exception", function(evt) {
  console.log(evt.code, evt.msg, evt.uid);
})
```

每个异常事件都有对应的恢复事件，详见下表：

![](assets/exception-event.png)

## 开发注意事项

上述所有方法必须在成功加入频道之后调用。