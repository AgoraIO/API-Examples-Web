import { Space, Typography, Radio } from "antd";
import { useState } from "react";
const {
  Title,
  Paragraph,
  Text
} = Typography;
const CodecSelect = ({
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
      <Radio value={"vp9"}>vp9</Radio>
      <Radio value={"h264"}>h264</Radio>
    </Radio.Group>
  </Space>;
};
export default CodecSelect;