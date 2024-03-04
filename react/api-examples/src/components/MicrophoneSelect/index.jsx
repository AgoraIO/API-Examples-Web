import AgoraRTC from "agora-rtc-sdk-ng";
import { Dropdown, Button, Space, Typography } from "antd";
import { DownOutlined } from '@ant-design/icons';
import { useState, useRef, useEffect } from "react";
const {
  Text
} = Typography;
const MicrophoneSelect = ({
  audioTrack,
  style = {}
}) => {
  const [items, setItems] = useState([]);
  const [audioTrackLabel, setAudioTrackLabel] = useState('');
  useEffect(() => {
    if (audioTrack) {
      const label = audioTrack?.getTrackLabel();
      setAudioTrackLabel(label);
      AgoraRTC.getMicrophones().then(mics => {
        setItems(mics.map(item => ({
          label: item.label,
          key: item.deviceId
        })));
      });
    }
  }, [audioTrack]);
  useEffect(() => {
    AgoraRTC.onMicrophoneChanged = async changedDevice => {
      const mics = await AgoraRTC.getMicrophones();
      setItems(mics.map(item => ({
        label: item.label,
        key: item.deviceId
      })));
      // When plugging in a device, switch to a device that is newly plugged in.
      if (changedDevice.state === "ACTIVE") {
        await audioTrack.setDevice(changedDevice.device.deviceId);
        setAudioTrackLabel(audioTrack?.getTrackLabel());
        // Switch to an existing device when the current device is unplugged.
      } else if (changedDevice.device.label === audioTrackLabel) {
        if (mics[0]) {
          await audioTrack.setDevice(mics[0].deviceId);
          setAudioTrackLabel(audioTrack?.getTrackLabel());
        }
      }
    };
  }, [audioTrackLabel]);
  const onClickItem = async ({
    key
  }) => {
    if (audioTrack) {
      await audioTrack.setDevice(key);
      setAudioTrackLabel(audioTrack?.getTrackLabel());
    }
  };
  return <div style={style}>
    <Space>
      <Text>Microphone: </Text>
      <Dropdown menu={{
        items,
        selectable: true,
        onClick: onClickItem
      }} placement="bottom">
        <Space style={{
          cursor: "pointer"
        }}>
          <Text>{audioTrackLabel}</Text>
          <DownOutlined />
        </Space>
      </Dropdown>
    </Space>
  </div>;
};
export default MicrophoneSelect;