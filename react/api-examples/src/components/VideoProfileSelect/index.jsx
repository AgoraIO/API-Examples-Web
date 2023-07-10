import { Dropdown, Button, Space, Typography } from "antd";
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { useMemo, useState } from "react";
const {
  Text
} = Typography;
const videoProfiles = [{
  key: "360p_7",
  label: "480×360, 15fps, 320Kbps"
}, {
  key: "360p_8",
  label: "480×360, 30fps, 490Kbps"
}, {
  key: "480p_1",
  label: "640×480, 15fps, 500Kbps"
}, {
  key: "480p_2",
  label: "640×480, 30fps, 1000Kbps"
}, {
  key: "720p_1",
  label: "1280×720, 15fps, 1130Kbps"
}, {
  key: "720p_2",
  label: "1280×720, 30fps, 2000Kbps"
}, {
  key: "1080p_1",
  label: "1920×1080, 15fps, 2080Kbps"
}, {
  key: "1080p_2",
  label: "1920×1080, 30fps, 3000Kbps"
}];
const VideoProfileSelect = ({
  onChange,
  disabled = false,
  defaultValue = '480p_1'
}) => {
  const [value, setValue] = useState(defaultValue);
  const label = useMemo(() => {
    return videoProfiles.find(item => item.key === value)?.label;
  }, [value]);
  const onClickItem = ({
    key
  }) => {
    setValue(key);
    onChange && onChange(key);
  };
  return <Space>
    <Text>Video Profiles: </Text>
    <Dropdown.Button disabled={disabled} type="primary" menu={{
      items: videoProfiles,
      selectable: true,
      onClick: onClickItem
    }} icon={<DownOutlined />} placement="bottom">
      {label}
    </Dropdown.Button>
  </Space>;
};
export default VideoProfileSelect;