import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import { Button, Space, Typography, Dropdown, App } from "antd";
import { DownOutlined } from '@ant-design/icons';
import { showJoinedMessage, createMicrophoneAudioTrack, createCameraVideoTrack } from "@/utils/utils";
import { useUrlQuery, useUnMount } from "@/utils/hooks";
import JoinForm from "@/components/JoinForm";
import AgoraVideoPlayer from "@/components/VideoPlayer";
const {
  Title,
  Text
} = Typography;
const client = AgoraRTC.createClient({
  mode: "live",
  codec: "vp8"
});
const DEFAULT_LATENCY = '1';
const latencyItems = [{
  label: 'Interactive Live Streaming Standard',
  key: "1"
}, {
  label: 'Interactive Live Streaming Premium',
  key: "2"
}];
let audienceLatency = DEFAULT_LATENCY;
let role = 'host';
function SelfRendering() {
  const formRef = useRef();
  useUrlQuery(formRef);
  const mirrorPlayerRef = useRef();
  const [joined, setJoined] = useState(false);
  const [msTrack, setMsTrack] = useState(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const [audioTrack, setAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState({});
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
  useEffect(() => {
    if (joined && role == 'host') {
      //get browser-native object MediaStreamTrack from WebRTC SDK
      const msTrack = videoTrack.getMediaStreamTrack();
      // generate browser-native object MediaStream with above video track
      const ms = new MediaStream([msTrack]);
      mirrorPlayerRef.current.srcObject = ms;
      mirrorPlayerRef.current.play();
    }
  }, [joined]);

  /*
   * Add the local use to a remote channel.
   *
   * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
   * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
   */
  const subscribe = async (user, mediaType) => {
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
      const options = formRef.current.getValue();
      // Add event listeners to the client.
      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);
      if (role === 'audience') {
        client.setClientRole(role, {
          level: Number(audienceLatency)
        });
      } else {
        client.setClientRole(role);
      }
      // Join a channel
      options.uid = await client.join(options.appId, options.channel, options.token || null, options.uid || null);
      setLocalUid(options.uid);
      const tracks = await initTracks();
      if (role == 'host') {
        await client.publish(tracks);
      }
      showJoinedMessage(message, options);
      setJoined(true);
    } catch (error) {
      message.error(error.message);
      console.error(error);
    }
  };
  const hostJoin = () => {
    role = "host";
    join();
  };
  const audienceJoin = ({
    key = DEFAULT_LATENCY
  }) => {
    role = 'audience';
    audienceLatency = key;
    join();
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
  return <div className="padding-20">
    <JoinForm ref={formRef}></JoinForm>
    <Space style={{
      marginTop: "10px"
    }}>
      <Button type="primary" onClick={hostJoin} disabled={joined}>Join as host</Button>
      <Dropdown.Button type="primary" disabled={joined} icon={<DownOutlined />} onClick={audienceJoin} menu={{
        items: latencyItems,
        selectable: true,
        onClick: audienceJoin
      }} placement="bottom">
        Join as audience
      </Dropdown.Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
    </Space>
    {joined ? <div className="mt-10">
      <Title level={4}>Local User</Title>
      <div className="mt-10 mb-10">uid: {localUid}</div>
      <AgoraVideoPlayer videoTrack={videoTrack} audioTrack={audioTrack}></AgoraVideoPlayer>
      <div style={{
        marginTop: "10px",
        display: "inline-block",
        border: "2px dashed red"
      }}>
        <video ref={mirrorPlayerRef} playsInline="" muted="" style={{
          width: "480px",
          height: "320px",
          transform: "rotateY(180deg)",
          objectFit: "cover"
        }}>
        </video>
      </div>
    </div> : null}
    {Object.keys(remoteUsers).length ? <div className="mt-10">
          <Title level={4}>Remote Users</Title>
          {Object.keys(remoteUsers).map(id => <AgoraVideoPlayer videoTrack={remoteUsers[id]?.videoTrack} audioTrack={remoteUsers[id]?.audioTrack} text={`uid: ${id}`} key={id}></AgoraVideoPlayer>)}
        </div> : null}
  </div>;
}
export default SelfRendering;