import { Dropdown, Button, Space, Typography, Radio } from "antd";
import { useState, useRef, useEffect } from "react";
import MicrophoneSelect from "../MicrophoneSelect";
import CameraSelect from "../CameraSelect";
import VideoProfileSelect from "../VideoProfileSelect";
const {
  Text
} = Typography;
const Codec = ({
  onCodecChange,
  defaultValue = 'vp8'
}) => {
  const [value, setValue] = useState(defaultValue);
  const onChange = e => {
    setValue(e.target.value);
    onCodecChange && onCodecChange(e.target.value);
  };
  return <Space>
    <Text>Codec: </Text>
    <Radio.Group onChange={onChange} value={value}>
      <Radio value={"vp8"}>vp8</Radio>
      <Radio value={"h264"}>h264</Radio>
    </Radio.Group>
  </Space>;
};
const AdvancedSettings = ({
  audioTrack,
  videoTrack,
  onCodecChange,
  onProfileChange,
  className = ""
}) => {
  const items = [{
    label: <MicrophoneSelect audioTrack={audioTrack}></MicrophoneSelect>,
    key: "0"
  }, {
    label: <CameraSelect videoTrack={videoTrack}></CameraSelect>,
    key: "1"
  }, {
    label: <Codec onCodecChange={onCodecChange}></Codec>,
    key: "2"
  }, {
    label: <VideoProfileSelect onChange={onProfileChange}></VideoProfileSelect>,
    key: "3"
  }];
  return <Dropdown menu={{
    items,
    selectable: false
  }} placement="bottom" className={className}>
    <Button type="primary" style={{
      width: "350px"
    }}>ADVANCED SETTINGS</Button>
  </Dropdown>;
};
export default AdvancedSettings;