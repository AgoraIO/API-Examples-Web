import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Space, message, Typography, App } from "antd";
import { showJoinedMessage, createMicrophoneAudioTrack, createCameraVideoTrack } from "@/utils/utils";
import { useUrlQuery, useUnMount } from "@/utils/hooks";
import JoinForm from "@/components/JoinForm";
import AgoraVideoPlayer from "@/components/VideoPlayer";
import cityPic from "assets/pic/city.jpg";
import spacePic from "assets/pic/space.jpg";
import VirtualBackgroundExtension from "agora-extension-virtual-background";
import VideoCompositingExtension from "agora-extension-video-compositor";
const {
  Title
} = Typography;
const extension = new VideoCompositingExtension();
const vbExtension = new VirtualBackgroundExtension();
AgoraRTC.registerExtensions([extension, vbExtension]);
let processor = null;
let vbProcessor = null;
let sourceVideoTrack1 = null;
let sourceVideoTrack2 = null;
let screenShareTrack = null;
const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
function VideoCompositor() {
  const formRef = useRef();
  useUrlQuery(formRef);
  const [joined, setJoined] = useState(false);
  const [videoTrack, setVideoTrack] = useState(null);
  const [audioTrack, setAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [localUid, setLocalUid] = useState("");
  const {
    message
  } = App.useApp();
  useUnMount(() => {
    if (joined) {
      leave();
      destory();
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
      processor = extension.createProcessor();
      // Create screen share track as background
      screenShareTrack = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: {
          frameRate: 15
        }
      });
      const screenShareEndpoint = processor.createInputEndpoint({
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
        fit: 'cover'
      });
      screenShareTrack.pipe(screenShareEndpoint).pipe(screenShareTrack.processorDestination);

      // Add 2 images
      processor.addImage(cityPic, {
        x: 960,
        y: 0,
        width: 320,
        height: 180,
        fit: 'cover'
      });
      processor.addImage(spacePic, {
        x: 0,
        y: 540,
        width: 320,
        height: 180,
        fit: 'cover'
      });

      // Create source track 1
      sourceVideoTrack1 = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: '720p_1'
      });

      // Create source track 2, it can be an track from camera or from a video file
      //    The code to use video file:
      //    const width = 1280, height = 720;
      //    const videoElement = await createVideoElement(width, height, './assets/loop-video.mp4');
      //    const mediaStream = videoElement.captureStream();
      //    const msTrack = mediaStream.getVideoTracks()[0];
      //    sourceVideoTrack2 = AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: msTrack });
      sourceVideoTrack2 = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: '480p_1'
      });

      // 3. Add source tracks to compositor
      const endpoint1 = processor.createInputEndpoint({
        x: 0,
        y: 0,
        width: 320,
        height: 180,
        fit: 'cover'
      });
      const endpoint2 = processor.createInputEndpoint({
        x: 960,
        y: 540,
        width: 320,
        height: 180,
        fit: 'cover'
      });
      sourceVideoTrack1.pipe(endpoint1).pipe(sourceVideoTrack1.processorDestination);
      vbProcessor = vbExtension.createProcessor();
      await vbProcessor.init("/assets/virtualBackgroundExtension/wasms");
      vbProcessor.enable();
      vbProcessor.setOptions({
        type: 'none'
      });
      sourceVideoTrack2.pipe(vbProcessor).pipe(endpoint2).pipe(sourceVideoTrack2.processorDestination);

      // 4. Set background and size, create custom video track with canvas
      processor.setOutputOptions(1280, 720, 15);
      await processor.start();
      const canvas = document.createElement('canvas');
      canvas.getContext('2d');
      const videoTrack = AgoraRTC.createCustomVideoTrack({
        mediaStreamTrack: canvas.captureStream().getVideoTracks()[0]
      });
      videoTrack.pipe(processor).pipe(videoTrack.processorDestination);
      const audioTrack = await createMicrophoneAudioTrack();
      setVideoTrack(videoTrack);
      setAudioTrack(audioTrack);
      let tracks = [audioTrack, videoTrack];

      // Join a channel
      options.uid = await client.join(options.appId, options.channel, options.token || null, options.uid || null);
      setLocalUid(options.uid);
      await client.publish(tracks);
      showJoinedMessage(message, options);
      setJoined(true);
    } catch (error) {
      message.error(error.message);
      console.error(error);
    }
  };
  const leave = async () => {
    // leave the channel
    await client.leave();
    audioTrack?.close();
    setAudioTrack(null);
    videoTrack?.close();
    setVideoTrack(null);
    setRemoteUsers({});
    sourceVideoTrack1?.unpipe();
    sourceVideoTrack1?.close();
    sourceVideoTrack1 = null;
    sourceVideoTrack2?.unpipe();
    sourceVideoTrack2?.close();
    sourceVideoTrack2 = null;
    screenShareTrack?.unpipe();
    screenShareTrack.close();
    screenShareTrack = null;
    setJoined(false);
    const msg = "client leaves channel success!";
    message.success(msg);
  };
  const destory = () => {
    processor?.unpipe();
    vbProcessor?.unpipe();
    processor = null;
    vbProcessor = null;
  };
  return <div className="padding-20">
    <JoinForm ref={formRef}></JoinForm>
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
    {Object.keys(remoteUsers).length ? <div className="mt-10">
        <Title level={4}>Remote Users</Title>
        {Object.keys(remoteUsers).map(id => <AgoraVideoPlayer videoTrack={remoteUsers[id]?.videoTrack} audioTrack={remoteUsers[id]?.audioTrack} text={`uid: ${id}`} key={id}></AgoraVideoPlayer>)}
      </div> : null}
  </div>;
}
export default VideoCompositor;