import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Space, message, Typography, Dropdown, App } from "antd";
import { DownOutlined } from '@ant-design/icons';
import { showJoinedMessage, createMicrophoneAudioTrack, createCameraVideoTrack } from "@/utils/utils";
import { useUrlQuery, useUnMount } from "@/utils/hooks";
import JoinForm from "@/components/JoinForm";
import AgoraVideoPlayer from "@/components/VideoPlayer";
import sampleMp4 from "./assets/sample.mp4";
const {
  Title,
  Text
} = Typography;
const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
const items = [{
  key: "mp4",
  label: "sample.mp4"
}, {
  key: "camera",
  label: "Camera"
}];
const VideoSourceSelect = ({
  disabled = false,
  onChange = () => {}
}) => {
  const [value, setValue] = useState(items[0].key);
  const label = useMemo(() => {
    return items.find(item => item.key === value)?.label;
  }, [value]);
  const onClickItem = ({
    key
  }) => {
    setValue(key);
    onChange && onChange(key);
  };
  return <Space>
    <Text>Video Stream: </Text>
    <Dropdown.Button disabled={disabled} type="primary" menu={{
      items: items,
      selectable: true,
      onClick: onClickItem
    }} icon={<DownOutlined />} placement="bottom">
      {label}
    </Dropdown.Button>
  </Space>;
};
function CustomVideoSource() {
  const formRef = useRef();
  const mp4Ref = useRef();
  useUrlQuery(formRef);
  const [joined, setJoined] = useState(false);
  const [videoTrack, setVideoTrack] = useState(null);
  const [audioTrack, setAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [localUid, setLocalUid] = useState("");
  const videoSource = useRef("mp4");
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
      let tracks = [];
      // Join a channel
      if (videoSource.current == "mp4") {
        // https://developers.google.com/web/updates/2016/10/capture-stream - captureStream() 
        // can only be called after the video element is able to play video;
        mp4Ref.current.play();
        var videoStream = navigator.userAgent.indexOf("Firefox") > -1 ? mp4Ref.current.mozCaptureStream() : mp4Ref.current.captureStream();
        options.uid = await client.join(options.appId, options.channel, options.token || null, options.uid || null);
        // Create tracks to the customized video source.
        tracks = await Promise.all([AgoraRTC.createCustomAudioTrack({
          mediaStreamTrack: videoStream.getAudioTracks()[0]
        }), AgoraRTC.createCustomVideoTrack({
          mediaStreamTrack: videoStream.getVideoTracks()[0]
        })]);
        setAudioTrack(tracks[0]);
        setVideoTrack(tracks[1]);
        await client.publish(tracks);
      } else {
        options.uid = await client.join(options.appId, options.channel, options.token || null, options.uid || null);
        setLocalUid(options.uid);
        tracks = await initTracks();
        await client.publish(tracks);
      }
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
  const onVideoSourceChange = async val => {
    if (videoSource.current == val) {
      return;
    }
    videoSource.current = val;
    await leave();
    await join();
  };
  return <div className="padding-20">
    <JoinForm ref={formRef}></JoinForm>
    <Space style={{
      marginTop: "10px"
    }}>
      <Button type="primary" onClick={join} disabled={joined}>Join</Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
      <VideoSourceSelect disabled={!joined} onChange={onVideoSourceChange}></VideoSourceSelect>
    </Space>
    {/* mp4 source */}
    {videoSource.current == 'mp4' ? <div className="mt-10">
      <Title level={4}>Local User Mp4</Title>
      <video src={sampleMp4} width="480" height="320" ref={mp4Ref}></video>
    </div> : null}
    {/* camera source */}
    {joined && videoSource.current == 'camera' ? <div className="mt-10">
      <Title level={4}>Local User</Title>
      <div className="mt-10 mb-10">uid: {localUid}</div>
      <AgoraVideoPlayer videoTrack={videoTrack} audioTrack={audioTrack}></AgoraVideoPlayer>
    </div> : null}
    {Object.keys(remoteUsers).length ? <div className="mt-10">
        <Title level={4}>Remote Users</Title>
        {Object.keys(remoteUsers).map(id => <AgoraVideoPlayer videoTrack={remoteUsers[id]?.videoTrack} audioTrack={remoteUsers[id]?.audioTrack} text={`uid: ${id}`} key={id}></AgoraVideoPlayer>)}
      </div> : null}
  </div>;
}
export default CustomVideoSource;