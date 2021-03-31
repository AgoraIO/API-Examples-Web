# AgoraWebSDK NG

*[English](README.md) | 简体中文*

```shell
npm install agora-rtc-sdk-ng --save
```

> 如果您在接入 Agora Web SDK 时遇到问题，或者有任何建议，都可以在本仓库的 Issues 区发帖讨论，我们会尽快处理大家的反馈

## 简介

详细的介绍和文档请访问上面提到的文档站链接，这里我们简单介绍一下 Agora Web SDK 的特性

- 支持 Typescript
- 使用 Promise
- 基于 Track 的音视频管理

下面是加入会议并自动发布的代码示例

```js
import AgoraRTC from "agora-rtc-sdk"

const client = AgoraRTC.createClient()

async function startCall() {
  await client.join("APPID", "CHANNEL", "TOKEN");
  const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  const videoTrack = await AgoraRTC.createCameraVideoTrack();

  await client.publish([audioTrack, videoTrack]);
}

startCall().then(/** ... **/).catch(console.error);
```
