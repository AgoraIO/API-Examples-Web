import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Space, message, App } from "antd";
import { showJoinedMessage, createMicrophoneAudioTrack } from "@/utils/utils";
import { useUrlQuery, useUnMount } from "@/utils/hooks";
import JoinForm from "@/components/JoinForm";
/*
 *  These procedures use Agora Voice Call SDK for Web to enable local and remote
 *  users to join and leave a Voice Call channel managed by Agora Platform.
 */
var client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
function BasicVoiceCall() {
  const formRef = useRef();
  useUrlQuery(formRef);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [joined, setJoined] = useState(false);
  const [audioTrack, setAudioTrack] = useState(null);
  const {
    message
  } = App.useApp();
  const initTracks = async () => {
    const track = await createMicrophoneAudioTrack();
    setAudioTrack(track);
    return [track];
  };
  useUnMount(() => {
    if (joined) {
      leave();
    }
  });

  /*
   * Add the local use to a remote channel.
   *
   * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
   * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
   */
  const subscribe = async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    if (mediaType === 'audio') {
      user.audioTrack.play();
    }
  };

  /*
   * Add a user who has subscribed to the live channel to the local interface.
   *
   * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
   * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
   */
  const handleUserPublished = (user, mediaType) => {
    const id = user.uid;
    setRemoteUsers(pre => ({
      ...pre,
      [id]: user
    }));
    subscribe(user, mediaType);
  };

  /*
  * Remove the user specified from the channel in the local interface.
  *
  * @param  {string} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to remove.
  */
  const handleUserUnpublished = (user, mediaType) => {
    if (mediaType === 'audio') {
      const id = user.uid;
      setRemoteUsers(pre => {
        delete pre[id];
        return {
          ...pre
        };
      });
    }
  };
  const join = async () => {
    try {
      const options = formRef.current.getValue();
      // Add event listeners to the client.
      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);
      // Join a channel 
      options.uid = await client.join(options.appId, options.channel, options.token || null, options.uid || null);
      const tracks = await initTracks();
      await client.publish(tracks);
      showJoinedMessage(message, options);
      setJoined(true);
    } catch (error) {
      message.error(error.message);
      console.error(error);
    }
  };
  const leave = async () => {
    audioTrack?.close();
    setAudioTrack(null);
    setRemoteUsers({});
    await client?.leave();
    setJoined(false);
    const msg = "client leaves channel success!";
    message.success(msg);
  };
  return <div className="padding-20">
    <JoinForm ref={formRef}></JoinForm>
    <Space>
      <Button type="primary" onClick={join} disabled={joined}>Join</Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
    </Space>
  </div>;
}
export default BasicVoiceCall;