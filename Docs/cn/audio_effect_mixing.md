---
id: audio_effect_mixing
title: 播放音频文件
sidebar_label: 播放音频文件
---

## 功能描述

在通话或直播过程中，除了用户自己说话的声音，有时候需要播放自定义的声音或音乐并且让频道内的其他人也听到，比如需要给游戏添加音效，或者需要播放背景音乐等。在 Agora Web SDK NG 中，如果发布了多个本地音频轨道，SDK 会自动将这些音频混音，所以我们可以通过创建并发布多个本地音频轨道来实现说话的同时播放音频文件的功能。

在开始前，请确保已在你的项目中实现基本的实时音视频功能。详见[实现音视频通话](basic_call.md)。

## 实现方法

无论是音效还是背景音乐，本质上都是一个本地或者在线的音频文件，所以我们只需要通过音频文件创建一个本地音频轨道对象，再将这个轨道和通过麦克风创建的音频轨道一起发布即可实现添加音效或者播放背景音乐等功能。

### 通过音频文件创建音频轨道

SDK 提供 `createBufferSourceAudioTrack` 方法来读取本地或者线上的音频文件并创建对应的本地音频轨道对象(`BufferSourceAudioTrack`)。

```js
// 通过在线音乐创建音频轨道
const audioFileTrack = await AgoraRTC.createBufferSourceAudioTrack({
  source: "https://web-demos-static.agora.io/agora/smlt.flac",
});
console.log("create audio file track success");
```

使用音频文件创建轨道后，如果直接调用 `audioFileTrack.play()` 或者 `client.publish([audioFileTrack])`，你会发现无论是本地还是远端都无法听到音乐声。这是因为通过音频文件创建的音频轨道在音频数据的处理流程上和麦克风音频轨道 (`MicrophoneAudioTrack`) 不同。

**MicrophoneAudioTrack**
![](assets/microphone_audio_track.png)

对于麦克风音频轨道来说，SDK 会源源不断地从目标麦克风设备中采集最新的音频数据（`AudioBuffer`）。

- 调用 `play()` 方法后音频数据会发送到本地播放组件 (`LocalPlayback`)，最终被本地用户听到。
- 调用 `publish()` 方法后音频数据会发送到 Agora 的 SD-RTN，最终被远端用户听到。

一旦麦克风音频轨道被创建，采集操作就会持续进行，直到调用 `close()` 方法才会停止，此时音频轨道也将不再可用。

**BufferSourceAudioTrack**
![](assets/buffer_source_audio_track.png)

对于音频文件来说，SDK 无法采集音频数据，只能通过读取文件达到类似的效果，也就是上图的 `processing` 过程。

采集音频数据和读取文件的区别是：

- 采集一旦开始就无法暂停，因为我们永远只能采集到最新的音频数据。
- 文件读取可以灵活地控制。暂停读取文件可以暂停播放，跳转读取的位置可以跳转播放，循环读取文件可以循环播放等等，这些控制音频文件读取的操作是 `BufferSourceAudioTrack` 提供的核心功能，详见[控制音频文件的播放](#控制音频文件的播放)。

使用音频文件创建音频轨道后，SDK 默认不读取音频文件，因此需要先调用 `BufferSourceAudioTrack.startProcessAudioBuffer()` 开始读取音频文件以及音频数据的处理流程，再分别调用 `play()`  和  `publish()`  方法，本地和远端就能听到音频文件的声音了。

### 发布多个音频轨道以实现混音

Agora Web SDK NG 支持发布多个音频轨道，将 `audioFileTrack` 和通过麦克风创建的音频轨道一起发布就可以实现混音。

```js
const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();

// 开始处理来自音频文件的音频数据
audioFileTrack.startProcessAudioBuffer();

// 将 audioFileTrack 和麦克风一起发布开始混音
await client.publish([microphoneTrack, audioFileTrack]);

// 如果想停止混音，可以停止处理音频文件的数据
audioFileTrack.stopProcessAudioBuffer();
// 或者直接将音频文件轨道取消发布
await client.unpublish([audioFileTrack]);
```

### 控制音频文件的播放

`BufferSourceAudioTrack` 提供以下方法实现播放控制相关功能：

- [`startProcessAudioBuffer`](/api/cn/interfaces/ibuffersourceaudiotrack.html#startprocessaudiobuffer): 开始读取音频文件并处理音频数据，该方法还支持设置循环播放和开始播放位置等。
- [`pauseProcessAudioBuffer`](/api/cn/interfaces/ibuffersourceaudiotrack.html#pauseprocessaudiobuffer): 暂停处理音频数据，即暂停播放音频文件。
- [`resumeProcessAudioBuffer`](/api/cn/interfaces/ibuffersourceaudiotrack.html#resumeprocessaudiobuffer): 恢复处理音频数据，即恢复播放音频文件。
- [`stopProcessAudioBuffer`](/api/cn/interfaces/ibuffersourceaudiotrack.html#stopprocessaudiobuffer): 停止处理音频数据，即停止播放音频文件。
- [`seekAudioBuffer`](/api/cn/interfaces/ibuffersourceaudiotrack.html#seekaudiobuffer): 跳转到指定位置。

开始处理音频数据后，如果调用了 `play()` 和 `publish()`，以上方法会同时影响本地和远端用户听到的声音。

```js
// 暂停处理音频数据
audioFileTrack.pauseProcessAudioBuffer();
// 恢复处理音频数据
audioFileTrack.resumeProcessAudioBuffer();
// 停止处理音频数据
audioFileTrack.stopProcessAudioBuffer();
// 以循环播放的模式开始处理音频数据
audioFileTrack.startProcessAudioBuffer({ loop: true });

// 获取当前播放进度 (秒)
audioFileTrack.getCurrentTime();
// 当前音频文件的总时长（秒）
audioFileTrack.duration;
// 跳转到 50 秒的位置
audioFileTrack.seekAudioBuffer(50);
```

在某些场景中不需要在本地听到音乐，你可以通过 `stop()` 方法关闭音频文件在本地的播放，这不会影响远端收到的音频数据。

### API 参考

- [`createBufferSourceAudioTrack`](/api/cn/interfaces/iagorartc.html#createbuffersourceaudiotrack)
- [`BufferSourceAudioTrack`](/api/cn/interfaces/ibuffersourceaudiotrack.html)
- [`publish`](/api/cn/interfaces/iagorartcclient.html#publish)

## 开发注意事项

- 你还需要配置线上音频文件的 [CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)。
- 支持的音频格式为 MP3，AAC 以及浏览器支持的其他音频格式。
- 本地文件仅支持浏览器原生的 [File 对象](https://developer.mozilla.org/zh-CN/docs/Web/API/File)。
- Safari 12 以下的版本不支持混音，所以无法发布多个音频轨道。
- 无论本地发布了几个音频轨道，SDK 都会自动混合为一个音频轨道，因此远端用户只会获取到一个 `RemoteAudioTrack`。
