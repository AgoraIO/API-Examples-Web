import { useState, useRef, useImperativeHandle, forwardRef, useEffect, useCallback } from 'react';
import { Modal, Progress, Button } from "antd";
import MicrophoneSelect from "../MicrophoneSelect";
import CameraSelect from "../CameraSelect";
import AgoraVideoPlayer from '../VideoPlayer';
import { useTranslation } from "react-i18next";
const MediaDeviceTest = forwardRef((props, ref) => {
  const {
    videoTrack,
    audioTrack
  } = props;
  const {
    t
  } = useTranslation();
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState(0);
  useEffect(() => {
    let intervalId = null;
    if (audioTrack && open) {
      intervalId = setInterval(() => {
        const val = audioTrack.getVolumeLevel() * 100;
        setVolume(val);
      }, 300);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [audioTrack, open]);
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
  return <Modal title="Media Device Test" open={open} onOk={hide} onCancel={hide} okText={t('okText')} cancelText={t('cancelText')}>
    <Button>
      <MicrophoneSelect audioTrack={audioTrack}></MicrophoneSelect>
    </Button>
    <Progress percent={volume} status="active" showInfo={false} style={{
      marginTop: "10px",
      marginBottom: "10px"
    }} />
    <Button>
      <CameraSelect videoTrack={videoTrack}></CameraSelect>
    </Button>
    <AgoraVideoPlayer style={{
      marginTop: "10px"
    }} audioTrack={audioTrack} videoTrack={videoTrack} width={"240px"} height={"180px"}></AgoraVideoPlayer>
  </Modal>;
});
export default MediaDeviceTest;