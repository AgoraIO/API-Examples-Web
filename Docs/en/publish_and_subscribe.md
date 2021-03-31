---
id: publish_and_subscribe
title: Publish and Subscribe
sidebar_label: Publish and Subscribe
---

## Publish audio and video tracks

After creating the local tracks and successfully joining a channel, you can call [AgoraRTCClient.publish](/api/en/interfaces/iagorartcclient.html#publish) to publish the local audio and video data to the  channel for other users to subscribe to it.

```js
const localAudioTrack = ...;
const localVideoTrack = ...;

// You can call publish multiple times to publish multiple tracks
await client.publish(localAudioTrack);
await client.publish(localVideoTrack);

// You can also publish multiple tracks at once
await client.publish([localAudioTrack, localVideoTrack]);
```

With regard to publishing, note the following:

- You can only publish one video track at a time.
- An `AgoraRTCClient` object can publish multiple audio tracks at the same time. The SDK automatically mixes the audio tracks into one audio track.
  > Exception: Safari does not support publishing multiple audio tracks on versions earlier than Safari 12.
- An `AgoraRTCClient` object can publish **only one video track** at the same time. If you want to switch the published video track, for example, from a camera video track to a scree-sharing video track, you must unpublish the published video track.
- You can call this method multiple times to publish different tracks, but you cannot publish the same track object repeatedly.
- This method is asynchronous and needs to be used with `Promise` or `async/await`.

### Error handling

During the publishing process, the SDK may throw the following errors due to either the network environment or incorrect use of the SDK:

- `INVALID_OPERATION`: An incorrect operation, indicating that `publish` is called before joining the channel successfully.
- `OPERATION_ABORTED`: The publishing is aborted, possibly because the user calls `leave` to leave the channel before the publishing succeeds.
- `INVALID_LOCAL_TRACK`: Parameter error, the `LocalTrack` object is incorrect.
- `CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS`: The SDK does not support publishing multiple video tracks at the same time.
- `NOT_SUPPORTED`: Multiple audio tracks are published, but the browser does not support audio mixing.
- `UNEXPECTED_RESPONSE`: The Agora server returns an unexpected response, and the publishing fails. Agora recommends that you keep the log and contact Agora [Technical Support](https://agora-ticket.agora.io/).
- `NO_ICE_CANDIDATE`: The local network exit cannot be found, possibly because a network firewall does not allow the connection or a browser plug-in disables WebRTC. See [FAQ](https://docs.agora.io/en/faq/console_error_web#none-ice-candidate-not-alloweda-namecandidatea) for details.

## Unpublish audio and video tracks

After publishing the local tracks, if you want to cancel the publishing, call [AgoraRTCClient.unpublish](/api/en/interfaces/iagorartcclient.html#unpublish).

```js
// Publish audio and video
await client.publish([localAudioTrack, localVideoTrack]);

// Unpublish the video, the audio is still being published
await client.unpublish(localVideoTrack);

// You can also unpublish all the published tracks at once
await client.unpublish();
// Or unpublish multiple tracks
await client.unpublish([localAudioTrack, localVideoTrack]);
```

With regard to unpublishing, note the following:

- This method can be called multiple times. You can use `publish` and `unpublish` to publish and unpublish a local track.
- This method is asynchronous and needs to be used with `Promise` or `async/await`.

## Subscribe to audio and video tracks

When a remote user publishes an audio or video track, the SDK triggers the [user-published](/api/en/interfaces/iagorartcclient.html#event_user_published) event. This event carries two parameters: the remote user object (`user`) and the media type (`mediaType`). You can now initiate a subscription by calling [AgoraRTCClient.subscribe](/api/en/interfaces/iagorartcclient.html#subscribe).

> This method is asynchronous and needs to be used with `Promise` or `async/await`.

```js
client.on("user-published", async (user, mediaType) => {
  // Initiate the subscription
  await client.subscribe(user, mediaType);

  // If the subscribed track is an audio track
  if (mediaType === "audio") {
    const audioTrack = user.audioTrack;
    // Play the audio
    audioTrack.play();
  } else {
    const videoTrack = user.videoTrack;
    // Play the video
    videoTrack.play(DOM_ELEMENT);
  }
});
```

After calling `subscribe`, you can get the corresponding [RemoteAudioTrack](/api/en/interfaces/iremoteaudiotrack.html) and [RemoteVideoTrack](/api/en/interfaces/iremotevideotrack.html)  object through `user.audioTrack` and `user.videoTrack`.

Subscription is different from publishing. Each subscription can only subscribe to one audio or video track. Even if the publisher publishes the audio track and the video track at the same time, the SDK triggers the `user-published` event twice: one `user-published(audio)`, one `user-published(video)`. According to this logic, the SDK complete two subscriptions.

### Deal with autoplay blocking

The subscription and playback of audio tracks may be subject to [Browser Audio AutoPlay Restrictions](https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide#Autoplay_and_autoplay_blocking) (autoplay block). Autoplay block means that the web browser cannot automatically play audio without explicit permission from the user.

For the Agora Web SDK NG, if `RemoteAudioTrack.play` is called to play audio before any user interaction, the autoplay block of the browser may cause the user not to hear the sound. But if the user interacts with the page, the SDK detects this and automatically resumes playing the audio.

Agora recommends that you ensure that the user has interacted with the page before calling `RemoteAudioTrack.play`. If your product design cannot guarantee this, you can use the [AgoraRTC.onAudioAutoplayFailed](/api/en/interfaces/iagorartc.html#onaudioautoplayfailed) callback to prompt the user to interact with the page when the playback fails.

### Error handling

During the subscription process, the SDK may throw the following errors:

- `INVALID_OPERATION`: An incorrect operation,  indicating that `subscribe` is called before joining the channel successfully.
- `INVALID_REMOTE_USER`: An incorrect remote user object is passed in; for example, the user is not in the channel.
- `REMOTE_USER_IS_NOT_PUBLISHED`: The passed remote user has not published the media type in the `subscribe` method.
- `UNEXPECTED_RESPONSE`: The Agora server returns an unexpected response, and the subscription fails. Agora recommends that you keep the log and contact Agora [Technical Support](https://agora-ticket.agora.io/).
- `OPERATION_ABORTED`: The subscription is aborted, possibly because the user calls `leave` to leave the channel before the subscription succeeds. 
- `NO_ICE_CANDIDATE`: The local network exit cannot be found, possibly because a network firewall does not allow the connection or a browser plug-in disables WebRTC. See [FAQ](https://docs.agora.io/en/faq/console_error_web#none-ice-candidate-not-alloweda-namecandidatea) for details.

## Unsubscribe from audio and video tracks

Call [AgoraRTCClient.unsubscribe](/api/en/interfaces/iagorartcclient.html#unsubscribe) to unsubscribe from the audio and video tracks of remote users.

```js
// Subscribe to a specific user's audio and video
await client.subscribe(user, "audio");
await client.subscribe(user, "video");

// Unsubscribe from a specific user's video
await client.unsubscribe(user, "video");
// Or unsubscribe from all the media tracks of a specific user
await client.unsubscribe(user);
```

With regard to unsubscription, note the following:

- After a successful unsubscription, the SDK releases the corresponding `RemoteTrack` object. Once released, the SDK automatically removes the video playback element and stops the audio playback.
- When a remote user unpublishes a track, the local user receives the `user-unpublished` callback. The SDK automatically releases the corresponding `RemoteTrack` object, and you do not need to call `unsubscribe`.
- This method is asynchronous and needs to be used with `Promise` or `async/await`.
