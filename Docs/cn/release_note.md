---
id: release_note
title: Release Note
sidebar_label: Release Note
---

本页提供 Agora Web SDK NG 的发版说明。

## 4.2.0 版

该版本于 2020 年 12 月 1 日发布。

### 新增特性

**设置区域访问限制**

该版本新增 `AgoraRTC.setArea` 方法用于指定服务器的访问区域。指定访问区域之后，SDK 只会连接到指定区域内的 Agora 服务器。支持的区域如下：

- 中国
- 北美
- 欧洲
- 亚洲（中国大陆除外）
- 日本
- 印度
- 全球

该功能为高级设置，适用于有访问安全限制的场景。

**视频传输优化策略**

该版本新增 `localVideoTrack.setOptimizationMode` 方法用于设置视频传输优化模式，可设为：

- `"balanced"`: 使用默认的传输优化模式。
- `"detail"`: 清晰优先。
- `"motion"`: 流畅优先。

各个传输优化模式的介绍详见 API 参考。该方法适用于在视频通话、视频直播或屏幕共享过程中需要动态调整视频传输优化模式的场景。例如在屏幕共享过程中，如想要把屏幕共享内容从演示文稿切换为视频，可以调用此方法将传输优化模式从 `"detail"` 切换为 `"motion"`，确保视频画面在网络波动时不会出现卡顿。

**远端用户网络质量**

该版本新增 `AgoraRTCClient.getRemoteNetworkQuality` 方法用于获取本地订阅的所有远端用户的上下行网络质量。

**云代理**

该版本中 `AgoraRTCClient.startProxyServer` 方法的 `mode` 参数类型由 `boolean` 改成 `number`。

### 改进

- 音频或视频轨道被 `setEnabled` 方法禁用时，依然可以调用 `setDevice` 方法切换设备。

- 调用 `AgoraRTCClient.setEncryptionConfig` 开启 SDK 内置加密功能后，当终端用户设置的密码为弱密码时，SDK 会在控制台打印警告信息，提醒用户设置强密码，即密码必须满足以下要求：
  - 包含大写字母、小写字母、数字和特殊字符。
  - 长度至少 8 位。

### 问题修复

该版本修复了以下问题：

- 本地的某一个视频轨道被禁用时，不能发布另一个视频轨道。
- 开启双流模式后，发布视频轨道过程中，调用 `setEnabled(false)` 禁用该轨道，发布会失败且无法恢复。
- 直播模式下观众尝试发布本地轨道失败后，切换成主播后也不能发布轨道。
- 开启双流模式后，网络断开时偶现的 bug 导致重连后发布失败。
- 取消发布一个本地摄像头视频轨道再发布本地屏幕共享轨道时，视频码率固定为 700 Kbps 左右，分辨率和帧率下降。
- 由于 Safari 浏览器对于 WebAudio 的支持存在缺陷，在 Safari 浏览器上可能会出现 `BufferSourceAudioTrack` 的声音失真。
- 第一次获取设备权限时不会触发媒体设备变更事件（`onMicrophoneChanged`、`onCameraChanged` 或 `onPlaybackDeviceChanged`），之后再有设备变更时才会触发设备变更事件。

### API 变更

**新增**

- `AgoraRTC.setArea`
- `localVideoTrack.setOptimizationMode`
- `AgoraRTCClient.getRemoteNetworkQuality`

**更新**

- `AgoraRTCClient.startProxyServer` 方法的 `mode` 参数类型由 `boolean` 改成 `number`

## 4.1.1 版
v4.1.1 于 2020 年 10 月 27 日发布。该版本修复了以下问题：

- 提升了 `event_network_quality` 回调的准确性。
- Safari 上 SDK 无法找到视频采集设备时， `createCameraVideoTrack` 的调用无法结束。
- 调用 `unsubscribe` 取消订阅某远端用户的一路未发布的轨道后，后续对该用户的订阅和取消订阅操作都失效。
- 降低双流模式时频繁调用 `setEnabled` 方法启用和禁用视频轨道的消耗。
- Safari 14 上调用 `client.getLocalVideoStats` 方法的偶现报错。

## 4.1.0 版

v4.1.0 于 2020 年 9 月 4 日发布。

### 新增特性

**客户端截图**

v4.1.0 新增 `getCurrentFrameData` 方法，用于获取当前渲染的视频帧数据。

**音频播放设备管理**

v4.1.0 新增了以下方法和回调，用于音频播放设备的管理：
- `setPlaybackDevice`: 用于设置音频播放设备，比如扬声器。该方法仅支持 Chrome 浏览器。
- `getPlaybackDevices`: 用于获取可用的音频播放设备。
- `onPlaybackDeviceChanged`: 用于提示有音频播放设备被添加或移除。

### 改进

- 全面支持基于 Chromium 内核的 Windows Edge 浏览器（80 及以上版本）。
- 提升了 `network-quality` 事件的准确性。
- 新增支持在 macOS 平台上共享 Chrome 标签页时分享标签页的音频。

### 问题修复

- Safari 上 `checkVideoTrackIsActive` 不准确。
- 开启双流模式后断线重连可能失败。
- 离开频道后调用 `setEnabled` 可能失败。
- CDN 推流转码和非转码不能同时使用。
- 断开连接后自动重新订阅可能失败，报错 `UNEXPECTED_RESPONSE: ERR_SUBSCRIBE_REQUEST_INVALID`。
- 在同一个标签页中相同 UID 加入不同频道会失败。
- 频繁加入离开频道可能导致的频道连接状态错误。

### API 变更

**新增**
- `AgoraRTC.getPlaybackDevices`
- `AgoraRTC.onPlaybackDeviceChanged`
- `Client.getLocalAudioStats`
- `Client.getRemoteAudioStats`
- `Client.getLocalVideoStats`
- `Client.getRemoteVideoStats`
- `LocalVideoTrack.getCurrentFrameData`
- `RemoteVideoTrack.getCurrentFrameData`
- `LocalAudioTrack.setPlaybackDevice`
- `RemoteAudioTrack.setPlaybackDevice`

**废弃**
- 废弃了  `LocalTrack.getStats` 和 `RemoteTrack.getStats`，请使用 `Client.getLocalAudioStats` 等方法来获取本地和远端的媒体质量信息。

## 4.0.1 版

v4.0.1 于 2020 年 7 月 18 日发布，修复了以下问题：
- 修复 Chrome 70 下发布失败的问题。
- 修复某些情况下离开频道发布操作没有被中止的问题。

## 4.0.0 版

v4.0.0 于 2020 年 7 月 15 日发布。

### 升级必看

v4.0.0 删除了 `setMute` 方法，新增 `setEnabled` 方法来实现启用或禁用本地轨道。这样做的好处在于：

- 彻底移除 Mute 这一概念，避免混淆 Mute 状态和发布状态。
  - 在 v4.0.0 之前的版本中，Mute 状态发生改变后 SDK 会触发 `Client.on("user-mute-updated")` 回调。
  - 在 v4.0.0 版本中，`setEnabled` 不会引入额外的远端回调事件。如果该本地轨道已发布，`setEnabled(false)` 后远端会触发 `Client.on("user-unpublished")` 回调，`setEnabled(true)` 后远端会触发 `Client.on("user-published")` 回调。
- `setMute(true)` 后，SDK 依然会发送黑帧和静音帧。对于视频轨道来说，Mute 后摄像头的指示灯并不会关闭，因而影响用户体验。而通过 `setEnabled(false)` 禁用本地视频轨道后，SDK 会立刻关闭摄像头并停止采集视频。

> 请注意，由于 `setEnabled` 涉及设备采集，所以是一个**异步方法**，通过 Promise 返回异步操作的结果。

### 新增特性

**视频编码策略**

v4.0.0 在 `CameraVideoTrackInitConfig`、`ScreenVideoTrackInitConfig` 和 `CustomVideoTrackInitConfig` 类中新增 `optimizationMode` 字段，支持在调用 `createCameraVideoTrack`、`createCustomVideoTrack` 和 `createScreenVideoTrack` 方法创建视频轨道时选择视频画面是清晰优先还是流畅优先：

- 清晰优先：
  - SDK 会自动根据你的采集分辨率和帧率设定一个最小码率。即使遭遇网络波动，发送码率也不会低于这个值，从而确保清晰的视频画面。
  - 大部分情况下，视频编码器不会降低发送分辨率，但是可能会降低帧率。
- 流畅优先：
  - SDK 不会启用最小码率策略。遭遇网络波动时，发送端会降低码率来确保接收端的视频画面不会出现中断和卡顿。
  - 大部分情况下，视频编码器不会降低帧率，但是可能会降低发送分辨率。

> 通过 `createScreenVideoTrack` 创建的视频轨道默认设置为清晰优先。

### 改进

- 重新设计 `AgoraRTC.createScreenVideoTrack` 的 `withAudio` 参数，除了 `enable` 和 `disable` 外，还可设为 `auto`，根据浏览器是否支持决定是否分享音频，以满足更多屏幕共享音频的使用场景。
- 不允许 `mediaType` 参数携带 `"all"`，只能为 `"video"` 或 `"audio"`，以避免代码的重复。这一改动涉及以下 API：
  - `Client.subscribe` 方法中的 `mediaType` 参数不能设为 `"all"`，只能设为 `"audio"` 或 `"video"`。
  - `Client.on("user-published")` 和 `Client.on("user-unpublished")` 回调的 `mediaType` 参数不再报告 `"all"`，只会报告 `"audio"` 或 `"video"`。

### 问题修复

v4.0.0 修复了以下问题：

- 调用 `unpublish` 后远端会触发 `Client.on("user-left")` 回调。
- 在 `"rtc"` 模式下进行屏幕共享发生周期性模糊。
- 频繁发布和取消发布时偶现的发布失败。
- `Client.on("network-quality")` 回调不准。

### API 变更

**新增**

- 新增 `Client.localTracks`，用于保存已发布的本地轨道对象列表。
- 新增 `LocalTrack.setEnabled`，用于启用或禁用本地轨道。
- `CameraVideoTrackInitConfig`、`ScreenVideoTrackInitConfig` 和 `CustomVideoTrackInitConfig` 类中新增 `optimizationMode` 字段，用于在创建视频轨道时设置视频画面是清晰优先还是流畅优先。

**更新**

- `AgoraRTC.createScreenVideoTrack` 的 `withAudio` 参数新增支持设为 `auto`。
- `Client.subscribe` 的 `mediaType` 参数不能设为 `"all"`。
- `Client.on("user-published")` 和 `Client.on("user-unpublished")` 回调的 `mediaType` 参数不再报告 `"all"`。

**废弃**

- 废弃了 `LocalAudioTrackStats.muteState` 属性。
- 废弃了 `LocalVideoTrackStats.muteState` 属性。
- 废弃了 `RemoteAudioTrackStats.muteState` 属性。
- 废弃了 `RemoteVideoTrackStats.muteState` 属性。

**删除**

- 删除了 `Client.on("user-mute-updated")` 回调。
- 删除了 `LocalTrack.setMute` 方法。
- 删除了 `AgoraRTCRemoteUser.audioMuted` 属性。
- 删除了 `AgoraRTCRemoteUser.videoMuted` 属性。
- 删除了 `LocalTrack.getUserId` 方法。