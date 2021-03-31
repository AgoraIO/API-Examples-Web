---
id: media_relay
title: Co-host across Channels
sidebar_label: Co-host across Channels
---

## Introduction

Co-hosting across channels is the process where the Agora Web SDK NG relays the media tracks of a host from a live-broadcast channel (source channel) to a maximum of four live-broadcast channels (destination channels). It has the following benefits:

- All hosts in the channels can see and hear each other.
- The audiences in the channels can see and hear all hosts.

Co-hosting across channels applies to scenarios such as an online singing contest, where hosts of different channels interact with each other.

## Implementation

> To enable media stream relay, contact sales-us@agora.io.

Before proceeding, ensure that you have implemented the basic real-time communication functions in your project. For details, see [Implement a Basic Video Call](basic_call.md).

The Agora Web SDK NG provides the following methods for co-hosting across channels:

- `startChannelMediaRelay`
- `updateChannelMediaRelay`
- `stopChannelMediaRelay`

> API call sequence requirements:
> - Call `startChannelMediaRelay after `AgoraRTCClient.publish` succeeds.
> - Call `updateChannelMediaRelay` after `startChannelMediaRelay` succeeds.

During a channel media relay, the SDK reports the states and error codes of the relay with the [`AgoraRTCClient.on("channel-media-relay-state")`](/api/en/interfaces/iagorartcclient.html#event_channel_media_relay_state) callback, and the events of the relay with the [`AgoraRTCClient.on("channel-media-relay-event")`](/api/cn/interfaces/iagorartcclient.html#event_channel_media_relay_event) callback.

> Notes:
> - Any host in a live-broadcast channel can call `startChannelMediaRelay` to enable the media stream relay. The SDK relays the media stream of the host who calls the method.
> - After a relay starts, users in the destination channels receive the `AgoraRTCClient.on("user-published")` callback.
> - If the host of a destination channel drops offline or leaves the channel during the media relay, the host of the source channel receives the `AgoraRTCClient.on("user-left")` callback.

### Sample code
The `client` object in the following sample code is created by calling `AgoraRTC.createClient`.

**Configure the media stream relay**

```js
const channelMediaConfig = new AgoraRTC.ChannelMediaRelayConfiguration();
// Set the source channel information.
channelMediaConfig.setSrcChannelInfo({
 channelName: "srcChannel",
 uid: 0,
 token: "yourSrcToken",
})
// Set the destination channel information. You can set a maximum of four destination channels.
channelMediaConfig.addDestChannelInfo({
 channelName: "destChannel1",
 uid: 123,
 token: "yourDestToken",
})
```

**Start the media stream relay**

```js
client.startChannelMediaRelay(channelMediaConfig).then(() => {
  console.log(`startChannelMediaRelay success`);
}).catch(e => {
  console.log(`startChannelMediaRelay failed`, e);
})
```

**Update the media stream relay configurations**

```js
// Remove a destination channel.
channelMediaConfig.removeDestChannelInfo("destChannel1")
// Update the configurations of the media stream relay.
client.updateChannelMediaRelay(channelMediaConfig).then(() => {
  console.log("updateChannelMediaRelay success");
}).catch(e => {
  console.log("updateChannelMediaRelay failed", e);
})
```

**Stop the media stream relay**
```js
client.stopChannelMediaRelay().then(() => {
  console.log("stop media relay success");
}).catch(e => {
  console.log("stop media relay failed", e);
})
```

### API reference
- [`startChannelMediaRelay`](/api/en/interfaces/iagorartcclient.html#startchannelmediarelay)
- [`updateChannelMediaRelay`](/api/en/interfaces/iagorartcclient.html#updatechannelmediarelay)
- [`stopChannelMediaRelay`](/api/en/interfaces/iagorartcclient.html#stopchannelmediarelay)

## Considerations

- The Agora Web SDK NG supports relaying media streams to a maximum of four destination channels. To add or delete a destination channel, call `updateChannelMediaRelay`.
- This feature supports integer user IDs only.
- When setting the source channel information (`setSrcChannelInfo`), ensure that the setting of `uid` is different from the UID of the current host and any other user in the source channel. Agora recommends setting this `uid` as `0`.
- To call `startChannelMediaRelay` again after it succeeds, you must call `stopChannelMediaRelay` to quit the current relay.