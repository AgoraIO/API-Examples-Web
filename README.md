# AgoraWebSDK

*English | [简体中文](README.cn.md)*

```shell
npm install agora-rtc-sdk-ng --save
```

> If you have some problems when using the Agora Web SDK, or have any suggestions, you can post new issue in this repo and we will reply as soon as possoble.

- Support Typescript
- Using ES6 Promise
- Track-based media objects

Here is the sample code to join the channel and publish local media automatically

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
