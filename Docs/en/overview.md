---
id: overview
title: Agora Web SDK NG Overview
sidebar_label: Overview
---
> The Agora Web SDK NG is in the beta stage. If you have any problem, you can submit an [issue](https://github.com/AgoraIO-Community/AgoraWebSDK-NG).

## Introduction

The Agora Web SDK NG is the next-generation SDK of the current [Agora Web SDK](https://docs.agora.io/cn/Video/start_call_web?platform=Web), enabling audio and video real-time communications based on Agora SD-RTN™ and implementing scenarios such as voice-only calls, video call, voice-only interactive broadcast, and video interactive broadcast. The Agora Web SDK NG makes full-scale refactoring to the internal architecture of the Agora Web SDK and improves usability of APIs.

Here are several tips for you to use the Agora Web SDK NG:
- If you know nothing about the Agora Web SDK, the Agora Web SDK NG is a good starting point for you to develop the real-time communication function.
- If you have read something about the Agora Web SDK，please note that the Agora Web SDK NG is considerably different from the Agora Web SDK. One of the most prominent differences is that the Agora Web SDK NG replaces the `Stream` object with the `LocalTrack` and `RemoteTrack` objects for controlling media streams.
- If you have integrated the Agora Web SDK in your app, see the [Migration Guide](./migration_guide) to migrate from the Agora Web SDK to the Agora Web SDK NG.

## Compatibility

The Agora Web SDK NG is compatible with major mainstream browsers. See the following table for details.

|Platform|Chrome 58 or later|Firefox 56 or later|Safari 11 or later|Opera 45 or later|QQ Browser|360 Secure Browser|WeChat Built-in Browser|
|---|---|---|---|---|---|---|---|
|Android 4.1 or later|	✔|	✘|	N/A|	✘|	✘|	✘|	✘|
|iOS 11 or later|	✘|	✘|	✔|	✘|	✘|	✘|	✘|
|macOS 10 or later|	✔|	✔|	✔|	✔|	✔|	✘|	✘|
|Windows 7 or later|	✔|	✔|	N/A|	✔|	✔|	✔|	✘|