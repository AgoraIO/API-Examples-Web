import { useState } from "react";
import { Tabs, Radio, Button, Input } from "antd";
import { HexColorPicker } from "react-colorful";
const DEFAULT_VALUE = {
  blur: "1",
  color: "#aabbcc",
  image: ""
};
const DEFAULT_ACTIVE_KEY = '1';
const BlurSelect = ({
  onChange = () => {}
}) => {
  const [level, setLevel] = useState('1');
  const onLevelChange = e => {
    const val = e.target.value;
    setLevel(val);
    onChange(val);
  };
  return <Radio.Group value={level} onChange={onLevelChange}>
    <Radio.Button value="1">Level 1</Radio.Button>
    <Radio.Button value="2">Level 2</Radio.Button>
    <Radio.Button value="3">Level 3</Radio.Button>
  </Radio.Group>;
};
const ColorSelect = ({
  onChange = () => {}
}) => {
  const [color, setColor] = useState(DEFAULT_VALUE['color']);
  const onColorChange = color => {
    onChange(color);
    setColor(color);
  };
  return <HexColorPicker color={color} onChange={onColorChange} />;
};
const ImageSelect = ({
  onChange = () => {}
}) => {
  const [value, setValue] = useState("");
  const onValChange = e => {
    const val = e.target.value;
    setValue(val);
    onChange(val);
  };
  return <Input placeholder="please input image url" onChange={onValChange} value={value} />;
};
const VirtualBackgroundSelect = ({
  onConfirm = () => {}
}) => {
  const [activeKey, setActiveKey] = useState(DEFAULT_ACTIVE_KEY);
  const [value, setValue] = useState('');
  const items = [{
    key: '1',
    label: `Blur`,
    type: "blur",
    children: <BlurSelect onChange={val => setValue(val)}></BlurSelect>
  }, {
    key: '2',
    label: `Color`,
    type: "color",
    children: <ColorSelect onChange={val => setValue(val)}></ColorSelect>
  }, {
    key: '3',
    label: `Image`,
    type: "image",
    children: <ImageSelect onChange={val => setValue(val)}></ImageSelect>
  }];
  const onChange = key => {
    setActiveKey(key);
    setValue("");
  };
  const changeEffect = () => {
    const cur = items.find(item => item.key == activeKey);
    onConfirm({
      type: cur.type,
      value: value ? value : DEFAULT_VALUE[cur.type]
    });
  };
  return <>
    <Tabs defaultActiveKey={DEFAULT_ACTIVE_KEY} activeKey={activeKey} items={items} onChange={onChange} />
    <div style={{
      marginTop: "20px"
    }}>
      <Button type="primary" onClick={changeEffect}>Change Effect</Button>
    </div>
  </>;
};
export default VirtualBackgroundSelect;