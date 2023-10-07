import { Dropdown, Button } from "antd";
import MicrophoneSelect from "../MicrophoneSelect";
import CameraSelect from "../CameraSelect";
import VideoProfileSelect from "../VideoProfileSelect";
import CodecSelect from "../CodecSelect";
import { useState } from "react";
const AdvancedSettings = ({
  audioTrack,
  videoTrack,
  onCodecChange,
  onProfileChange,
  defaultProfile,
  defaultCodec,
  onOpenChange,
  disable = [],
  className = ""
}) => {
  const [open, setOpen] = useState(false);
  const items = [{
    label: <MicrophoneSelect audioTrack={audioTrack}></MicrophoneSelect>,
    key: "MicrophoneSelect"
  }, {
    label: <CameraSelect videoTrack={videoTrack}></CameraSelect>,
    key: "CameraSelect"
  }, {
    label: <CodecSelect onCodecChange={onCodecChange} defaultValue={defaultCodec}></CodecSelect>,
    key: "CodecSelect"
  }, {
    label: <VideoProfileSelect onChange={onProfileChange} defaultValue={defaultProfile}></VideoProfileSelect>,
    key: "VideoProfileSelect"
  }];
  if (disable.length) {
    items.forEach((item, index) => {
      if (disable.includes(item.key)) {
        items.splice(index, 1);
      }
    });
  }
  const handleMenuClick = () => {
    setOpen(true);
  };
  const handleOpenChange = val => {
    setOpen(val);
    onOpenChange && onOpenChange(val);
  };
  return <Dropdown menu={{
    items,
    onClick: handleMenuClick,
    selectable: false
  }} onOpenChange={handleOpenChange} open={open} placement="bottom" className={className}>
    <Button type="primary" style={{
      width: "350px"
    }}>ADVANCED SETTINGS</Button>
  </Dropdown>;
};
export default AdvancedSettings;