import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState, useMemo } from "react";
import { Button, Space, Typography, App } from "antd";
import { showJoinedMessage, genPublicPath } from "@/utils/utils";
import { useUrlQuery, useUnMount } from "@/utils/hooks";
import JoinForm from "@/components/JoinForm";
import AgoraVideoPlayer from "@/components/VideoPlayer";
import { AIDenoiserExtension } from "agora-extension-ai-denoiser";
const {
  Title,
  Text,
  Paragraph
} = Typography;
const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
let extension = null;
let processor = null;
function AiDenoiser() {
  const formRef = useRef();
  useUrlQuery(formRef);
  const [joined, setJoined] = useState(false);
  const [videoTrack, setVideoTrack] = useState(null);
  const [audioTrack, setAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [aiDenosierOpen, setAiDenosierOpen] = useState(false);
  const [aiDenosierEnable, setAiDenosierEnable] = useState(false);
  const [localUid, setLocalUid] = useState("");
  const {
    message
  } = App.useApp();
  useEffect(() => {
    initTracks();
  }, []);
  useUnMount(() => {
    if (joined) {
      leave();
    }
  });
  const initTracks = async () => {
    const tracks = await Promise.all([AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCameraVideoTrack()]);
    setAudioTrack(tracks[0]);
    setVideoTrack(tracks[1]);
    return tracks;
  };
  const label = useMemo(() => aiDenosierEnable ? "Disable AIDenoiser" : "Enable AIDenoiser", [aiDenosierEnable]);

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
  const openAiDenosier = async () => {
    if (aiDenosierOpen) {
      return;
    }
    extension = new AIDenoiserExtension({
      assetsPath: genPublicPath("/external/agora-extension-ai-denoiser")
    });
    AgoraRTC.registerExtensions([extension]);
    extension.onloaderror = e => {
      console.error(e);
      message.error(e.message);
      processor = null;
    };
    processor = extension.createProcessor();
    processor.onoverload = async () => {
      const msg = "overload!!!";
      console.log(msg);
      message.warning(msg);
      await processor.disable();
    };
    audioTrack.pipe(processor).pipe(audioTrack.processorDestination);
    setAiDenosierOpen(true);
  };
  const switchAiDenoiser = async () => {
    try {
      if (aiDenosierEnable) {
        await processor.disable();
        message.success("disable AIDenoiser");
      } else {
        await processor.enable();
        message.success("enable AIDenoiser");
      }
      setAiDenosierEnable(!aiDenosierEnable);
    } catch (e) {
      console.error(e);
      message.error(e.message);
    }
  };
  const dumpAudio = () => {
    processor.ondump = (blob, name) => {
      const objectURL = URL.createObjectURL(blob);
      const tag = document.createElement("a");
      tag.download = name + ".wav";
      tag.href = objectURL;
      tag.click();
    };
    processor.ondumpend = () => {
      const msg = "dump end!!";
      message.success(msg);
      console.log(msg);
    };
    processor.dump();
  };
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
      <Paragraph>If you want to experience noise reduction, join the channel as a remote user</Paragraph>
      <Space>
        <Button type="primary" disabled={aiDenosierOpen} onClick={openAiDenosier}>Open AI Denoiser for LocalAudioTrack</Button>
        <Button type="primary" disabled={!aiDenosierOpen} onClick={switchAiDenoiser}>{label}</Button>
        <Button type="primary" disabled={!aiDenosierOpen || !aiDenosierEnable} onClick={dumpAudio}>Dump Audio</Button>
      </Space>
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
export default AiDenoiser;