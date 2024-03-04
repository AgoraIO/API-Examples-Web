import AgoraRTC from "agora-rtc-sdk-ng";
import { Dropdown, Space, Typography } from "antd";
import { DownOutlined } from '@ant-design/icons';
import { useState, useRef, useEffect, useCallback } from "react";
const {
  Text
} = Typography;
const CameraSelect = ({
  videoTrack,
  style = {}
}) => {
  const [items, setItems] = useState([]);
  const [videoTrackLabel, setVideoTrackLabel] = useState("");
  useEffect(() => {
    if (videoTrack) {
      const label = videoTrack?.getTrackLabel();
      setVideoTrackLabel(label);
      AgoraRTC.getCameras().then(cams => {
        setItems(cams.map(item => ({
          label: item.label,
          key: item.deviceId
        })));
      });
    }
  }, [videoTrack]);
  useEffect(() => {
    AgoraRTC.onCameraChanged = async changedDevice => {
      const cameras = await AgoraRTC.getCameras();
      setItems(cameras.map(item => ({
        label: item.label,
        key: item.deviceId
      })));
      // When plugging in a device, switch to a device that is newly plugged in.
      if (changedDevice.state === "ACTIVE") {
        await videoTrack.setDevice(changedDevice.device.deviceId);
        setVideoTrackLabel(videoTrack?.getTrackLabel());
        // Switch to an existing device when the current device is unplugged.
      } else if (changedDevice.device.label === videoTrackLabel) {
        if (cameras[0]) {
          await videoTrack.setDevice(cameras[0].deviceId);
          setVideoTrackLabel(videoTrack?.getTrackLabel());
        }
      }
    };
  }, [videoTrackLabel]);
  const onClickItem = async ({
    key
  }) => {
    if (videoTrack) {
      await videoTrack.setDevice(key);
      setVideoTrackLabel(videoTrack?.getTrackLabel());
    }
  };
  return <div style={style}>
    <Space>
      <Text>Camera: </Text>
      <Dropdown menu={{
        items,
        selectable: true,
        onClick: onClickItem
      }} placement="bottom">
        <Space style={{
          cursor: "pointer"
        }}>
          <Text>{videoTrackLabel}</Text>
          <DownOutlined />
        </Space>
      </Dropdown>
    </Space>
  </div>;
};
export default CameraSelect;