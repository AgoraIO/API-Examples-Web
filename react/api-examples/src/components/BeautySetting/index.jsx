import { Switch, Typography, Space, Card, Dropdown, Slider, Row, Col } from 'antd';
import { useState, useEffect, useMemo, forwardRef } from 'react';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import "./index.css";
const {
  Title,
  Paragraph,
  Text
} = Typography;
const items = [{
  key: 0,
  label: "0"
}, {
  key: 1,
  label: "1"
}, {
  key: 2,
  label: "2"
}];
const SLIDER_WIDTH = "300px";
const BeautySetting = forwardRef((props, ref) => {
  const {
    disabled = false,
    style = {},
    onEnableChange = () => {},
    onDataChange = () => {}
  } = props;
  const [enable, setEnable] = useState(false);
  const [lighteningContrastLevel, setLighteningContrastLevel] = useState(1);
  const [lighteningLevel, setLighteningLevel] = useState(0.70);
  const [rednessLevel, setRednessLevel] = useState(0.1);
  const [smoothnessLevel, setSmoothnessLevel] = useState(0.5);
  const label = useMemo(() => enable ? "Beauty Enable" : "Beauty Disable", [enable]);
  useEffect(() => {
    onDataChange({
      lighteningContrastLevel,
      lighteningLevel,
      rednessLevel,
      smoothnessLevel
    });
  }, [lighteningContrastLevel, lighteningLevel, rednessLevel, smoothnessLevel]);
  const onSwitchChange = value => {
    setEnable(value);
    onEnableChange(value);
  };
  const onClickItem = ({
    key
  }) => {
    setLighteningContrastLevel(Number(key));
  };
  return <Card style={{
    width: 600,
    ...style
  }}>
    <Paragraph>
      <Row>
        <Space>
          <Text>{label}:</Text>
          <Switch disabled={disabled} checked={enable} onChange={onSwitchChange}></Switch>
        </Space>
      </Row>
      <Row>
        <Space>
          <Text>lighteningContrastLevel:</Text>
          <Dropdown.Button type="primary" menu={{
            items: items,
            selectable: true,
            onClick: onClickItem
          }} icon={<DownOutlined />} placement="bottom">
            {lighteningContrastLevel}
          </Dropdown.Button>
        </Space>
      </Row>
      <Row>
        <Space>
          <Text>lighteningLevel:</Text>
          <Slider style={{
            width: SLIDER_WIDTH
          }} min={0} max={1} onChange={val => setLighteningLevel(val)} step={0.01} value={lighteningLevel} />
          <Text>{lighteningLevel}</Text>
        </Space>
      </Row>
      <Row>
        <Space>
          <Text>rednessLevel:</Text>
          <Slider style={{
            width: SLIDER_WIDTH
          }} min={0} max={1} onChange={val => setRednessLevel(val)} step={0.01} value={rednessLevel} />
          <Text>{rednessLevel}</Text>
        </Space>
      </Row>
      <Row>
        <Space>
          <Text>smoothnessLevel:</Text>
          <Slider style={{
            width: SLIDER_WIDTH
          }} min={0} max={1} onChange={val => setSmoothnessLevel(val)} step={0.01} value={smoothnessLevel} />
          <Text>{smoothnessLevel}</Text>
        </Space>
      </Row>
    </Paragraph>
  </Card>;
});
export default BeautySetting;