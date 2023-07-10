import { Dropdown, Button, Space, Typography } from "antd";
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { useMemo, useState } from "react";
const {
  Text
} = Typography;
const items = [{
  key: "GLOBAL",
  label: "GLOBAL"
}, {
  key: "ASIA",
  label: "Asia, excluding Mainland China"
}, {
  key: "CHINA",
  label: "CHINA"
}, {
  key: "EUROPE",
  label: "EUROPE"
}, {
  key: "INDIA",
  label: "INDIA"
}, {
  key: "JAPAN",
  label: "JAPAN"
}, {
  key: "NORTH_AMERICA",
  label: "NORTH_AMERICA"
}];
const DEFAULT_VALUE = "GLOBAL";
const AreaSelect = ({
  onChange,
  disabled = false,
  defaultValue = DEFAULT_VALUE
}) => {
  const [value, setValue] = useState(defaultValue);
  const label = useMemo(() => {
    return items.find(item => item.key === value)?.label;
  }, [value]);
  const onClickItem = ({
    key
  }) => {
    setValue(key);
    onChange && onChange(key);
  };
  return <Space>
    <Text>Network Geofencing: </Text>
    <Dropdown.Button disabled={disabled} type="primary" menu={{
      items: items,
      selectable: true,
      onClick: onClickItem
    }} icon={<DownOutlined />} placement="bottom">
      {label}
    </Dropdown.Button>
  </Space>;
};
export default AreaSelect;