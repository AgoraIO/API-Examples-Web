import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import { Button, Space, message, Typography, App } from "antd";
import { showJoinedMessage, getColor } from "@/utils/utils";
import { useUrlQuery } from "@/utils/hooks";
import JoinForm from "@/components/JoinForm";
import AgoraVideoPlayer from "@/components/VideoPlayer";
const {
  Title
} = Typography;
let client = AgoraRTC.createClient({
  mode: "rtc",
  codec: 'vp8'
});
function SelfCapturing() {
  const formRef = useRef();
  useUrlQuery(formRef);
  const canvasRef = useRef();
  const [joined, setJoined] = useState(false);
  const [canvasVideoTrack, setCanvasVideoTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [localUid, setLocalUid] = useState("");
  const {
    message
  } = App.useApp();
  const initializeCanvasCustomVideoTrack = () => {
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.height = 320;
    canvasRef.current.width = 480;
    const intervalId = setInterval(() => {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.fillStyle = '#dddddd';
      ctx.fillRect(10, 10, 130, 130);
      var path = new Path2D();
      path.arc(75, 75, 50, 0, Math.PI * 2, true);
      path.moveTo(110, 75);
      path.arc(75, 75, 35, 0, Math.PI, false);
      path.moveTo(65, 65);
      path.arc(60, 65, 5, 0, Math.PI * 2, true);
      path.moveTo(95, 65);
      path.arc(90, 65, 5, 0, Math.PI * 2, true);
      ctx.strokeStyle = getColor();
      ctx.stroke(path);
    }, 500);
    return intervalId;
  };
  useEffect(() => {
    const intervalId = initializeCanvasCustomVideoTrack();
    return () => {
      joined && client.leave();
      clearInterval(intervalId);
    };
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
  const getCanvasCustomVideoTrack = () => {
    const stream = canvasRef.current.captureStream(30);
    const [videoTrack] = stream.getVideoTracks();
    return AgoraRTC.createCustomVideoTrack({
      mediaStreamTrack: videoTrack
    });
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
      const track = getCanvasCustomVideoTrack();
      setCanvasVideoTrack(track);
      await client.publish(track);
      showJoinedMessage(message, options);
      setJoined(true);
    } catch (error) {
      message.error(error.message);
      console.error(error);
    }
  };
  const leave = async () => {
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
      <Button type="primary" onClick={join} disabled={joined}>Join</Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
    </Space>
    <div>
      <canvas ref={canvasRef} style={{
        width: "480px",
        height: "320px"
      }}>Your Browser doesn't support this Feature</canvas>
    </div>
    {joined ? <div className="mt-10">
      <Title level={4}>Local User</Title>
      <div className="mt-10 mb-10">uid: {localUid}</div>
      <AgoraVideoPlayer videoTrack={canvasVideoTrack}></AgoraVideoPlayer>
    </div> : null}
    {Object.keys(remoteUsers).length ? <div className="mt-10">
        <Title level={4}>Remote Users</Title>
        {Object.keys(remoteUsers).map(id => <AgoraVideoPlayer videoTrack={remoteUsers[id]?.videoTrack} audioTrack={remoteUsers[id]?.audioTrack} text={`uid: ${id}`} key={id}></AgoraVideoPlayer>)}
      </div> : null}
  </div>;
}
export default SelfCapturing;