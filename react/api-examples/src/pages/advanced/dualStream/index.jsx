import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import { Button, Space, message, Typography, App } from "antd";
import { showJoinedMessage, createMicrophoneAudioTrack, createCameraVideoTrack } from "@/utils/utils";
import { useUrlQuery, useUnMount } from "@/utils/hooks";
import JoinForm from "@/components/JoinForm";
import AgoraVideoPlayer from "@/components/VideoPlayer";
const {
  Title
} = Typography;
const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
let options = {};

// uid -> streamType
const streamTypeMap = new Map();
function DualStream() {
  const formRef = useRef();
  useUrlQuery(formRef);
  const [joined, setJoined] = useState(false);
  const [videoTrack, setVideoTrack] = useState(null);
  const [audioTrack, setAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState({});
  const videoRefs = useRef({});
  const [localUid, setLocalUid] = useState("");
  const {
    message
  } = App.useApp();
  useUnMount(() => {
    if (joined) {
      leave();
    }
  });
  const initTracks = async () => {
    const tracks = await Promise.all([createMicrophoneAudioTrack(), createCameraVideoTrack()]);
    setAudioTrack(tracks[0]);
    setVideoTrack(tracks[1]);
    return tracks;
  };

  /*
   * Add the local use to a remote channel.
   *
   * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
   * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
   */
  const subscribe = async (user, mediaType) => {
    // subscribe to a remote user
    await client.subscribe(user, mediaType);
  };

  /*
   * Add a user who has subscribed to the live channel to the local interface.
   *
   * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
   * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
   */
  const handleUserPublished = async (user, mediaType) => {
    const id = user.uid;
    await subscribe(user, mediaType);
    setRemoteUsers(prev => ({
      ...prev,
      [id]: user
    }));
  };

  /*
  * Remove the user specified from the channel in the local interface.
  *
  * @param  {string} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to remove.
  */
  const handleUserUnpublished = (user, mediaType) => {
    if (mediaType === 'video') {
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
      options = formRef.current.getValue();
      // Add event listeners to the client.
      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);
      // Customize the video profile of the low-quality stream: 160 × 120, 15 fps, 120 Kbps.
      client.setLowStreamParameter({
        width: 160,
        height: 120,
        framerate: 15,
        bitrate: 120
      });
      // Enable dual-stream mode.
      await client.enableDualStream();
      // Join a channel
      options.uid = await client.join(options.appId, options.channel, options.token || null, options.uid || null);
      setLocalUid(options.uid);
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
    videoTrack?.close();
    setVideoTrack(null);
    setRemoteUsers({});
    await client?.leave();
    setJoined(false);
    const msg = "client leaves channel success!";
    message.success(msg);
  };
  const onVideoClick = async uid => {
    uid = Number(uid);
    const ref = videoRefs.current[uid];
    try {
      let finalStreamType = 1;
      // streamType 0: high stream, 1: low stream
      if (streamTypeMap.has(uid)) {
        const streamType = streamTypeMap.get(uid);
        if (streamType === 0) {
          finalStreamType = 1;
        } else {
          finalStreamType = 0;
        }
      } else {
        finalStreamType = 1;
      }
      streamTypeMap.set(uid, finalStreamType);
      let options = finalStreamType === 0 ? {
        width: "480px",
        height: "320px"
      } : {
        width: "160px",
        height: "120px"
      };
      ref.setOptions(options);
      await client.setRemoteVideoStreamType(uid, finalStreamType);
      message.info(`${uid} change stream type to ${finalStreamType === 0 ? "High" : "Low"}`);
    } catch (e) {
      console.error(e);
      message.error(e.message);
    }
  };
  return <div className="padding-20">
    <JoinForm ref={formRef}></JoinForm>
    <Space style={{
      marginTop: "10px"
    }}>
      <Button type="primary" onClick={join} disabled={joined}>Join with Dual Stream</Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
    </Space>
    {joined ? <div className="mt-10">
      <Title level={5}>Click Remote User Video Player Change Stream Type</Title>
      <Title level={4}>Local User</Title>
      <div className="mt-10 mb-10">uid: {localUid}</div>
      <AgoraVideoPlayer videoTrack={videoTrack} audioTrack={audioTrack}></AgoraVideoPlayer>
    </div> : null}
    {Object.keys(remoteUsers).length ? <div className="mt-10">
        <Title level={4}>Remote Users</Title>
        {Object.keys(remoteUsers).map(id => <AgoraVideoPlayer ref={item => videoRefs.current[id] = item} videoTrack={remoteUsers[id]?.videoTrack} audioTrack={remoteUsers[id]?.audioTrack} text={`uid: ${id}`} key={id} onClick={() => onVideoClick(id)}></AgoraVideoPlayer>)}
      </div> : null}
  </div>;
}
export default DualStream;