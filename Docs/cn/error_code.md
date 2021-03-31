---
id: error_code
title: 错误码细节
sidebar_label: 错误码细节
---

Agora Web SDK NG 可能以下列方式抛出错误码：
- 对于异步方法，SDK 返回 Promise 来通知异步操作的结果，Promise 被 reject 时 SDK 会抛出相应的错误码。
- 同步方法调用失败时，SDK 直接抛出错误码。
- SDK 内部运行过程中，也可能抛出一些网络相关的错误码。

你可参考本文了解这些错误码的详细含义及处理方法。

## 通用错误码
|错误码|描述|处理方法|
|---|---|---|
|`UNEXPECTED_ERROR`|无法处理的、非预期的错误，通常这个错误会有具体的错误提示。|无|
|`UNEXPECTED_RESPONSE`|服务端返回了非预期的响应。|无|
|`INVALID_PARAMS`|非法参数。|根据具体提示确认操作，并根据文档传入正确的参数。|
|`NOT_SUPPORTED`|浏览器不支持。|参考[浏览器支持情况](https://agoraio-community.github.io/AgoraWebSDK-NG/docs/zh-CN/overview)。|
|`INVALID_OPERATION`|非法操作，通常是因为在当前状态不能进行该操作。|确认操作的先后顺序，比如发布前请确认已经加入频道。|
|`OPERATION_ABORTED`|操作中止，通常是因为网络质量差或连接断开导致与 Agora 服务器通信失败。|通过 [network-quality](/api/cn/interfaces/iagorartcclient.html#event_network_quality) 回调确认本地网络状况，并重试该操作。|
|`WEB_SECURITY_RESTRICT`|浏览器安全策略限制。|请确保 Web 页面运行在[安全环境](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)中。|

## 请求相关错误码

### 网络连接

|错误码|描述|处理方法|
|---|---|---|
|`NETWORK_TIMEOUT`|请求超时，通常是因为网络质量差或连接断开导致与 Agora 服务器通信失败。|通过 [network-quality](/api/cn/interfaces/iagorartcclient.html#event_network_quality) 回调确认本地网络状况，并重试该操作。|
|`NETWORK_RESPONSE_ERROR`|响应错误，一般是状态码非法。|确认操作的参数是否正确，并根据文档传入正确的参数。|
|`NETWORK_ERROR`|无法定位的网络错误。|无|

### SDK 内部请求

|错误码|描述|处理方法|
|---|---|---|
|`WS_ABORT`|请求 Agora 服务器过程中 WebSocket 断开。|监听 [connection-state-change](/api/cn/interfaces/iagorartcclient.html#event_connection_state_change) 事件，待连接状态变为 **CONNECTED** 后重试。|
|`WS_DISCONNECT`|请求 Agora 服务器前，WebSocket 就已经断开。|监听 [connection-state-change](/api/cn/interfaces/iagorartcclient.html#event_connection_state_change) 事件，待连接状态变为 **CONNECTED** 后重试。|
|`WS_ERR`|WebSocket 连接发生错误。|检查当前浏览器对 WebSocket 的支持情况。|

## 设备管理相关错误码

|错误码|描述|处理方法|
|---|---|---|
|`ENUMERATE_DEVICES_FAILED`|枚举本地设备失败，一般是由于浏览器限制。|无|
|`DEVICE_NOT_FOUND`|无法找到指定设备。|传入正确的设备 ID。|

## Track 相关错误码

|错误码|描述|处理方法|
|---|---|---|
|`TRACK_IS_DISABLED`|轨道被禁用，通常因为轨道设置了 [Track.setEnabled(false)](/api/cn/interfaces/ilocaltrack.html#setenabled)。|对该轨道调用 [Track.setEnabled(true)](/api/cn/interfaces/ilocaltrack.html#setenabled) 后再进行操作。|
|`SHARE_AUDIO_NOT_ALLOWED`|屏幕共享音频时终端用户没有点击**分享音频**。|要求终端用户在弹出的屏幕共享窗口中勾选**分享音频**。|
|`CHROME_PLUGIN_NO_RESPONSE`|Chrome 屏幕共享插件无响应。|确认 [Chrome 屏幕共享插件](https://docs.agora.io/cn/Interactive%20Broadcast/chrome_screensharing_plugin)的状态或重新安装屏幕共享插件。|
|`CHROME_PLUGIN_NOT_INSTALL`|Chrome 屏幕共享插件没有安装。|安装[Chrome 屏幕共享插件](https://docs.agora.io/cn/Interactive%20Broadcast/chrome_screensharing_plugin)。|
|`MEDIA_OPTION_INVALID`|不支持的媒体采集的参数。|修改媒体采集参数或使用 SDK 预设的配置。|
|`CONSTRAINT_NOT_SATISFIED`|不支持的媒体采集的参数。|修改媒体采集参数或使用 SDK 预设的配置。|
|`PERMISSION_DENIED`|获取媒体设备权限被拒绝。|在弹出的获取设备权限窗口中选择**允许**。|
|`FETCH_AUDIO_FILE_FAILED`|下载在线音频文件失败。|填入正确的在线音频地址，并确保可以正常访问。|
|`READ_LOCAL_AUDIO_FILE_ERROR`|读取本地音频文件失败。|填入正确的本地音频文件路径。|
|`DECODE_AUDIO_FILE_FAILED`|音频文件解码失败，可能是因为音频文件的编码格式是浏览器 WebAudio 不支持的编码格式。|检查浏览器 WebAudio 是否支持音频文件的编码格式。|

## Client 相关错误码

### 加入频道

|错误码|描述|处理方法|
|---|---|---|
|`UID_CONFLICT`| 同一个频道内 UID 重复。 |使用不同的 UID 进入频道。|
|`INVALID_UINT_UID_FROM_STRING_UID`|String UID 分配服务返回了非法的 int UID。|使用不同的 UID 进入频道。|
|`CAN_NOT_GET_PROXY_SERVER`|无法获取云代理服务地址。|无|
|`CAN_NOT_GET_GATEWAY_SERVER`|无法获取 Agora 服务器地址。|无|

### 发布/取消发布

|错误码|描述|处理方法|
|---|---|---|
|`INVALID_LOCAL_TRACK`|传入了非法的 LocalTrack。|检查传入的 Track，并传入正确的 LocalTrack。|
|`CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS`|一个 Client 发布多个视频轨道。|一个 Client 同一时间只能发布一个视频轨道，如果想发布多个视频轨道请创建多个 Client。|

### 订阅/取消订阅

|错误码|描述|处理方法|
|---|---|---|
|`INVALID_REMOTE_USER`|非法的远端用户，可能是远端用户不在频道内或还未发布任何媒体轨道。|收到 [user-published](/api/cn/interfaces/iagorartcclient.html#event_user_published) 事件后再进行订阅操作。|
|`REMOTE_USER_IS_NOT_PUBLISHED`|远端用户已发布了音频或视频轨道，但不是与你的订阅操作所指定的类型不符。|请确保订阅操作传入的轨道类型需要与 [user-published](/api/cn/interfaces/iagorartcclient.html#event_user_published) 事件给出的类型一致，或者在订阅前通过 [AgoraRTCRemoteUser.hasVideo](/api/cn/interfaces/iagorartcremoteuser.html#hasvideo) 和 [AgoraRTCRemoteUser.hasAudio](/api/cn/interfaces/iagorartcremoteuser.html#hasaudio) 确认远端用户是否发布了该类型的轨道。|

## 推流到 CDN

|错误码|描述|处理方法|
|---|---|---|
|`LIVE_STREAMING_TASK_CONFLICT`|推流任务已经存在。|先调用[Client.stopLiveStreaming](/api/cn/interfaces/iagorartcclient.html#stoplivestreaming) 停止该推流任务再重新进行推流操作。|
|`LIVE_STREAMING_INVALID_ARGUMENT`|推流参数错误。|参考 [Client.startLiveStreaming](/api/en/interfaces/iagorartcclient.html#startlivestreaming) 的 API 文档检查推流操作的参数。|
|`LIVE_STREAMING_INTERNAL_SERVER_ERROR`|推流服务器内部错误。|重新进行推流操作，如果仍然失败，刷新页面重试。|
|`LIVE_STREAMING_PUBLISH_STREAM_NOT_AUTHORIZED`|推流 URL 被占用。|检查填入的 URL 是否被占用。|
|`LIVE_STREAMING_CDN_ERROR`|推流的目标 CDN 出现错误导致推流失败。|确认目标 CDN 的健康状况。|
|`LIVE_STREAMING_INVALID_RAW_STREAM`|推流超时。|确认目标流是否存在。|

## 跨频道连麦

|错误码|描述|
|---|---|
|`CROSS_CHANNEL_WAIT_STATUS_ERROR`|等待 ["channel-media-relay-state"](/api/cn/interfaces/iagorartcclient.html#event_channel_media_relay_state) 回调出错。|
|`CROSS_CHANNEL_FAILED_JOIN_SRC`|发起跨频道转发媒体流请求失败。|
|`CROSS_CHANNEL_FAILED_JOIN_DEST`|接受跨频道转发媒体流请求失败。|
|`CROSS_CHANNEL_FAILED_PACKET_SENT_TO_DEST`|服务器接收跨频道转发媒体流失败。|
|`CROSS_CHANNEL_SERVER_ERROR_RESPONSE`|服务器响应出错。|