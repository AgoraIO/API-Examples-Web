import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import { Button, Space, message, Typography, App } from "antd";
import { showJoinedMessage, createMicrophoneAudioTrack, createCameraVideoTrack } from "@/utils/utils";
import { useUrlQuery, useUnMount } from "@/utils/hooks";
import JoinMutiForm from "@/components/JoinMutiForm";
import AgoraVideoPlayer from "@/components/VideoPlayer";
const {
  Title
} = Typography;
const client1 = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
const client2 = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
function JoinMultipleChannel() {
  const formRef = useRef();
  useUrlQuery(formRef);
  const [joined, setJoined] = useState(false);
  const [videoTrack, setVideoTrack] = useState(null);
  const [audioTrack, setAudioTrack] = useState(null);
  const [remoteUsers1, setRemoteUsers1] = useState({});
  const [remoteUsers2, setRemoteUsers2] = useState({});
  const [channel1, setChannel1] = useState("");
  const [channel2, setChannel2] = useState("");
  const [localUid, setLocalUid] = useState("");
  const {
    message
  } = App.useApp();
  const initTracks = async () => {
    const tracks = await Promise.all([createMicrophoneAudioTrack(), createCameraVideoTrack()]);
    setAudioTrack(tracks[0]);
    setVideoTrack(tracks[1]);
    return tracks;
  };
  useUnMount(() => {
    if (joined) {
      leave();
    }
  });

  /*
   * Add a user who has subscribed to the live channel to the local interface.
   *
   * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
   * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
   */
  const handleUserPublished1 = async (user, mediaType) => {
    const id = user.uid;
    await client1.subscribe(user, mediaType);
    setRemoteUsers1(prev => ({
      ...prev,
      [id]: user
    }));
  };

  /*
  * Remove the user specified from the channel in the local interface.
  *
  * @param  {string} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to remove.
  */
  const handleUserUnpublished1 = (user, mediaType) => {
    if (mediaType === 'video') {
      const id = user.uid;
      setRemoteUsers1(pre => {
        delete pre[id];
        return {
          ...pre
        };
      });
    }
  };
  const handleUserPublished2 = async (user, mediaType) => {
    const id = user.uid;
    await client2.subscribe(user, mediaType);
    setRemoteUsers2(prev => ({
      ...prev,
      [id]: user
    }));
  };
  const handleUserUnpublished2 = (user, mediaType) => {
    if (mediaType === 'video') {
      const id = user.uid;
      setRemoteUsers2(pre => {
        delete pre[id];
        return {
          ...pre
        };
      });
    }
  };
  const join = async () => {
    try {
      await Promise.all([join1(), join2()]);
      const tracks = await initTracks();
      await client1.publish(tracks);
      await client2.publish(tracks);
      setJoined(true);
    } catch (error) {
      message.error(error.message);
      console.error(error);
    }
  };
  const join1 = async () => {
    const options = formRef.current.getValue();
    // Add event listeners to the client1.
    client1.on("user-published", handleUserPublished1);
    client1.on("user-unpublished", handleUserUnpublished1);
    // Join a channel
    options.uid = await client1.join(options.appId, options.channel, options.token || null, options.uid || null);
    setChannel1(options.channel);
    setLocalUid(options.uid);
    message.success("client1 join channel1 success!");
  };
  const join2 = async () => {
    const options = formRef.current.getValue();
    setChannel2(options.channel2);
    // Add event listeners to the client1.
    client2.on("user-published", handleUserPublished2);
    client2.on("user-unpublished", handleUserUnpublished2);
    await client2.join(options.appId, options.channel2, options.token2 || null, options.uid2 || null);
    message.success("client2 join channel2 success!");
  };
  const leave = async () => {
    audioTrack?.close();
    setAudioTrack(null);
    videoTrack?.close();
    setVideoTrack(null);
    setRemoteUsers1({});
    setRemoteUsers2({});
    await client1?.leave();
    await client2?.leave();
    setJoined(false);
    console.log("client1 leaves channel success");
  };
  return <div className="padding-20">
    <JoinMutiForm ref={formRef}></JoinMutiForm>
    <Space style={{
      marginTop: "10px"
    }}>
      <Button type="primary" onClick={join} disabled={joined}>Join</Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
    </Space>
    {joined ? <div className="mt-10">
      <Title level={4}>Local User</Title>
      <div className="mt-10 mb-10">uid: {localUid}</div>
      <AgoraVideoPlayer videoTrack={videoTrack} audioTrack={audioTrack}></AgoraVideoPlayer>
    </div> : null}
    {Object.keys(remoteUsers1).length ? <div className="mt-10">
        <Title level={3}>channel: {channel1}</Title>
        <Title level={4}>Remote Users</Title>
        {Object.keys(remoteUsers1).map(id => <AgoraVideoPlayer videoTrack={remoteUsers1[id]?.videoTrack} audioTrack={remoteUsers1[id]?.audioTrack} text={`uid: ${id}`} key={id}></AgoraVideoPlayer>)}
      </div> : null}
    {Object.keys(remoteUsers2).length ? <div className="mt-10">
        <Title level={3}>channel: {channel2}</Title>
        <Title level={4}>Remote Users</Title>
        {Object.keys(remoteUsers2).map(id => <AgoraVideoPlayer videoTrack={remoteUsers2[id]?.videoTrack} audioTrack={remoteUsers2[id]?.audioTrack} text={`uid: ${id}`} key={id}></AgoraVideoPlayer>)}
      </div> : null}
  </div>;
}
export default JoinMultipleChannel;