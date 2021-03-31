---
id: join_and_leave
title: Join and Leave
sidebar_label: Join and Leave
---

Agora Web SDK NG uses the [AgoraRTCClient](/api/en/interfaces/iagorartcclient.html) object to manage the behavior of a local user in the target channel. Create an `AgoraRTCClient` object before joining the target channel.

## Create an AgoraRTCClient object

Call [AgoraRTC.createClient](/api/en/interfaces/iagorartc.html#createclient) to create an `AgoraRTCClient` object. Specify the video codec type (`codec`) and the channel profile (`mode`) when creating `AgoraRTCClient`.

```js
const client = AgoraRTC.createClient({
  codec: "vp8",
  mode: "rtc",
});
```

### Choose the video codec type

Agora Web SDK NG supports two video codec types: `"vp8"` (VP8) and `"h264"` (H.264). The `codec` setting only affects the video encoding type of the published video. For the subscriber, as long as it supports decoding the video codec type, the subscription can be completed successfully. For example, the desktop version of Chrome 58 or later supports both VP8 and H.264, while while Safari versions before 12.1 do not support VP8; if two hosts in a channel publish VP8 and H.264 videos, respectively, the audience using desktop Chrome 58 can decode the videos of both hosts, but the audience using Safari versions before 12.1 can only decode the H.264 video.

Different browsers and devices support the two codec types differently. The following table lists the codec support of different browsers:

|Browser|VP8|H.264|
|---|---|---|
|Desktop Chrome 58+|✔|✔|
|Firefox 56+|✔|✔*|
|Safari 12.1+|✔|✔|
|Safari < 12.1|✘|✔|
|Android Chrome 58+|✔|?*|

> - For Firefox, the H.264 support relies on the **OpenH264 Video Codec provided by Cisco Systems, Inc.** plug-in. After Firefox is successfully installed, the plug-in is automatically downloaded in the background and enabled by default. However, before this download is complete, or if this plug-in is missing for some reason, Firefox cannot support H.264.
> - For Chrome, the H.264 support on Android devices relies on the device. Because Chrome uses the hardware codec for H.264 on Android devices, even if Chrome supports H.264, H.264 is actually not available if the chip of the Android device does not support the hardware codec for H.264.

### Set the channel profile

The channel profile is a configuration that Agora uses to apply optimized algorithms for different real-time scenarios. Agora Web SDK NG supports two channel profiles: `"rtc"` (communication profile) and `"live"` (live streaming profile).

**Communication profile**

The communication profile applies to scenarios where all users in the channel often need to communicate with each other, but the total number of users is not too large, such as team meetings and online chats.

**Live streaming profile**

The live streaming profile applies to scenarios where the channel has few publishers but many subscribers. In this profile, the SDK defines two user roles: the audience and the host. The host can both send and receive audio and video, but the audience can only receive. You can set the [role](/api/en/interfaces/clientconfig.html#role) parameter of `createClient` to specify the user role, and call [setClientRole](/api/en/interfaces/iagorartcclient.html#setclientrole) to dynamically change the user role.

## Join a channel

After creating the `AgoraRTCClient` object, call [AgoraRTCClient.join](/api/en/interfaces/iagorartcclient.html#join) to join a channel.

> Refer to the API documentation for detailed descriptions of the `join` method. This method is asynchronous and needs to be used with `Promise` or `async/await`.

Note the setting of the fourth parameter `uid` of the `join` method. If no value is assigned, Agora automatically assigns a unique number ID for the local user. You can also specify a number user ID.

> If the specified user ID is already taken by a user in the channel, that user is kicked out of the channel immediately by the Agora server, and the new user successfully joins the channel using this ID. The SDK triggers the `connection-state-change` callback when a user is kicked out of the channel due to `uid` conflicts. See [Connection states in the channel](#connection) for details.

```js
// Automatically assign a number user ID.
const uid = await client.join("APPID", "CHANNEL", "TOKEN");

// Specify a number user ID.
await client.join("APPID", "CHANNEL", "TOKEN", 393939);
```

## Leave the channel

Call [AgoraRTCClient.leave](/api/en/interfaces/iagorartcclient.html#leave) to leave the channel. You can call this method at any time, including when the user is joining a channel or reconnecting. After calling `leave`, the SDK immediately destroys objects related to the current channel, including subscribed remote user objects, remote track objects, and objects that save connection states. To join the channel again, call `join` after you call `leave`.

```js
await client.leave();
```

> `leave` is an asynchronous method and needs to be used with `Promise` or `async/await`.

## <a name="connection"></a>Connection states in the channel

When a user joins the target channel, network fluctuations may cause disconnections. The SDK then automatically tries to reconnect to the Agora server and join the channel again.

You can get the connection state by [AgoraRTCClient.connectionState](/api/en/interfaces/iagorartcclient.html#connectionstate) or [AgoraRTCClient.on("connection-state-change")](/api/en/interfaces/iagorartcclient.html#event_connection_state_change).

All connection states are as follows:

- `"DISCONNECTED"`: Disconnected. In this state, the SDK does not automatically reconnect. This state indicates that the user is in any of the following stages:
  - The user has not joined the channel by calling `join`.
  - The user has left the channel by calling `leave`.
  - The user has been kicked out of the channel by the Agora server or the connection has failed.
- `"CONNECTING"`: Connecting. This state indicates that the user is calling `join`.
- `"CONNECTED"`: Connected. This state indicates that the user has joined the channel and can publish or subscribe to media tracks in the channel.
- `"RECONNECTING"`: Disconnected and reconnecting. If the connection between the SDK and the server is interrupted due to network disconnection or switching, the SDK automatically reconnects and enters this state.
- `"DISCONNECTING"`: Disconnecting. This state indicates that the user is calling `leave`.

## Error handling

When joining a channel, the SDK may throw the following errors due to improper use of the SDK or network abnormalities:

- `INVALID_PARAMS`: The parameters are incorrect, for example, an invalid token is provided.
- `INVALID_OPERATION`: An incorrect operation. This error is usually caused by joining a channel repeatedly. Ensure that you call `leave` before joining a channel again.
- `OPERATION_ABORTED`: The joining is aborted, which means that `leave` is called before the method call of `join` succeeds.
- `UNEXPECTED_RESPONSE`: The Agora server returns an unexpected response, usually because the App ID or token authentication fails. For example, you have enabled the App Certificate but do not pass a token in `join`.
- `UID_CONFLICT`: Multiple `AgoraRTCClient` objects use the same user ID.
