import AgoraRTC from "agora-rtc-sdk-ng";
import { SuperClarityExtension, SuperClarityEvents } from "agora-extension-super-clarity";
import { useEffect, useRef, useState, useMemo } from "react";
import { Button, Space, Typography, App, Switch } from "antd";
import { showJoinedMessage, genPublicPath } from "@/utils/utils";
import { useUrlQuery, useUnMount } from "@/utils/hooks";
import JoinForm from "@/components/JoinForm";
import AgoraVideoPlayer from "@/components/VideoPlayer";
import AdvancedSetting from "@/components/AdvancedSetting";
const {
  Title,
  Text,
  Paragraph
} = Typography;
let client = null;
let codec = 'vp8';
let videoProfile = "720p_1";
const extension = new SuperClarityExtension();
AgoraRTC.registerExtensions([extension]);
const processorMap = new Map();
function SuperClarity() {
  const formRef = useRef();
  useUrlQuery(formRef);
  const [joined, setJoined] = useState(false);
  const [videoTrack, setVideoTrack] = useState(null);
  const [audioTrack, setAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [localUid, setLocalUid] = useState("");
  const [superClarifyOpen, setSuperClarifyOpen] = useState(true);
  const {
    message
  } = App.useApp();
  useUnMount(() => {
    if (joined) {
      leave();
    }
  });
  const initTracks = async () => {
    if (audioTrack && videoTrack) {
      return [audioTrack, videoTrack];
    }
    const tracks = await Promise.all([AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCameraVideoTrack({
      encoderConfig: videoProfile
    })]);
    setAudioTrack(tracks[0]);
    setVideoTrack(tracks[1]);
    return tracks;
  };
  const onOpenChange = async val => {
    if (val) {
      await initTracks();
    }
  };
  const onProfileChange = async val => {
    videoProfile = val;
    await videoTrack.setEncoderConfiguration(videoProfile);
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
    if (mediaType === 'video') {
      await toggleSuperClarifyOne(user);
    }
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
      client = AgoraRTC.createClient({
        mode: "live",
        codec: codec,
        role: "host"
      });
      // Add event listeners to the client.
      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);
      // Join a channel
      options.uid = await client.join(options.appId, options.channel, options.token || null, options.uid || null);
      setLocalUid(options.uid);
      let tracks = await initTracks();
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
  const toggleSuperClarifyAll = async val => {
    setSuperClarifyOpen(val);
    const uids = Object.keys(remoteUsers);
    for (let uid of uids) {
      const user = remoteUsers[uid];
      let processor = processorMap.get(uid);
      if (!processor) {
        processor = extension.createProcessor();
        processorMap.set(uid, processor);
        user.videoTrack.pipe(processor).pipe(user.videoTrack.processorDestination);
      }
      if (val) {
        await processor.enable();
      } else {
        await processor.disable();
      }
    }
  };
  async function toggleSuperClarifyOne(user) {
    const uid = user.uid.toString();
    let processor = processorMap.get(uid);
    if (!processor) {
      processor = extension.createProcessor();
      processorMap.set(uid, processor);
      user.videoTrack.pipe(processor).pipe(user.videoTrack.processorDestination);
    }
    if (superClarifyOpen) {
      await processor.enable();
    } else {
      await processor.disable();
    }
  }
  return <div className="padding-20">
    <JoinForm ref={formRef}></JoinForm>
    <Space style={{
      marginTop: "10px"
    }}>
      <Button type="primary" onClick={join} disabled={joined}>Join</Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
    </Space>
    <div style={{
      marginTop: "10px"
    }}>
      <div>
        <Text>If you want to experience super clarity, join the channel as a remote user</Text>
      </div>
      <Space style={{
        marginTop: "10px"
      }}>
        <Switch checked={superClarifyOpen} onChange={toggleSuperClarifyAll}></Switch>
        <span>Super Clarify</span>
      </Space>
      <div style={{
        marginTop: "10px"
      }}>
        <AdvancedSetting className="responsive-ml" audioTrack={audioTrack} videoTrack={videoTrack} defaultProfile={videoProfile} onOpenChange={onOpenChange} onProfileChange={onProfileChange} disable={["MicrophoneSelect", "CodecSelect"]}></AdvancedSetting>
      </div>
    </div>
    {joined ? <div className="mt-10">
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
export default SuperClarity;