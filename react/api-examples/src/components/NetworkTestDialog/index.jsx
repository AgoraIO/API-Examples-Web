import AgoraRTC from "agora-rtc-sdk-ng";
import { Button, Modal, Typography, message } from 'antd';
import { useRef, forwardRef, useImperativeHandle } from "react";
import { useState, useEffect } from 'react';
const {
  Text,
  Title,
  Paragraph
} = Typography;
const uplinkClient = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
const downlinkClient = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
let upClientUid = '';

// just use before join channel
const NetworkTestDialog = forwardRef((props, ref) => {
  const {
    title = 'Network Test',
    options = {}
  } = props;
  const [open, setOpen] = useState(false);
  const [uplinkNetworkQuality, setUplinkNetworkQuality] = useState(0);
  const [downlinkNetworkQuality, setDownlinkNetworkQuality] = useState(0);
  const [localAudioStats, setLocalAudioStats] = useState("");
  const [localVideoStats, setLocalVideoStats] = useState("");
  const [remoteAudioStats, setRemoteAudioStats] = useState("");
  const [remoteVideoStats, setRemoteVideoStats] = useState("");
  useEffect(() => {
    if (open) {
      doNetworkTest();
    }
    return () => {
      uplinkClient.leave();
      downlinkClient.leave();
    };
  }, [open]);
  useEffect(() => {
    uplinkClient.on("network-quality", handleUplinkNetworkQuality);
    downlinkClient.on("network-quality", handleDownlinkNetworkQuality);
    downlinkClient.on("user-published", handleUserPublished);
    return () => {
      uplinkClient.off("network-quality", handleUplinkNetworkQuality);
      downlinkClient.off("network-quality", handleDownlinkNetworkQuality);
      downlinkClient.off("user-published", handleUserPublished);
    };
  }, []);
  const handleUplinkNetworkQuality = quality => {
    setUplinkNetworkQuality(quality.uplinkNetworkQuality);
    setLocalAudioStats(JSON.stringify(uplinkClient.getLocalAudioStats()));
    setLocalVideoStats(JSON.stringify(uplinkClient.getLocalVideoStats()));
  };
  const handleDownlinkNetworkQuality = quality => {
    setDownlinkNetworkQuality(quality.downlinkNetworkQuality);
    setRemoteAudioStats(JSON.stringify(downlinkClient.getRemoteAudioStats()[upClientUid]));
    setRemoteVideoStats(JSON.stringify(downlinkClient.getRemoteVideoStats()[upClientUid]));
  };
  const handleUserPublished = async (user, mediaType) => {
    await downlinkClient.subscribe(user, mediaType);
  };
  const doNetworkTest = async () => {
    if (!options.appId) {
      const msg = "appId is required";
      message.error(msg);
      console.error(msg);
      hide();
      return;
    }
    if (!options.channel) {
      const msg = "channel is required";
      message.error(msg);
      console.error(msg);
      hide();
      return;
    }
    const tracks = await Promise.all([AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCameraVideoTrack()]);
    upClientUid = await uplinkClient.join(options.appId, options.channel, options.token || null, null);
    await downlinkClient.join(options.appId, options.channel, options.token || null, null);
    downlinkClient.on("user-published", async (user, mediaType) => {
      await downlinkClient.subscribe(user, mediaType);
    });
    await uplinkClient.publish(tracks);
  };
  const show = () => {
    setOpen(true);
  };
  const hide = () => {
    setOpen(false);
  };
  useImperativeHandle(ref, () => ({
    show: show,
    hide: hide
  }));
  return <Modal title={title} open={open} footer={null} onCancel={() => setOpen(false)}>
    <Title level={5}>Uplink</Title>
    <div>Network Quality: {uplinkNetworkQuality}</div>
    <Title level={5} style={{
      marginTop: "0.5em"
    }}>Local Audio Stats</Title>
    <div>{localAudioStats}</div>
    <Title level={5} style={{
      marginTop: "0.5em"
    }}>Local Video Stats</Title>
    <div>{localVideoStats}</div>
    <Title level={5} style={{
      marginTop: "0.5em"
    }}>Downlink</Title>
    <div>Network Quality: {downlinkNetworkQuality}</div>
    <Title level={5} style={{
      marginTop: "0.5em"
    }}>Remote Audio Stats</Title>
    <div>{remoteAudioStats}</div>
    <Title level={5} style={{
      marginTop: "0.5em"
    }}>Remote Video Stats</Title>
    <div>{remoteVideoStats}</div>
  </Modal>;
});
export default NetworkTestDialog;