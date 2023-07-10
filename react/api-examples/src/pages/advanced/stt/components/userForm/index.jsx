import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { Row, Input, Col, Typography, message } from "antd";
import "./index.css";
const {
  Title,
  Text,
  Paragraph
} = Typography;
const DEFAULT_SPEAKING_LANGUAGE = "en-US";
const DEFAULT_TRANSLATE_LANGUAGE = "zh-CN";
const UserForm = forwardRef((props, ref) => {
  const [pullerUid, setPullerUid] = useState("111111");
  const [pullerToken, setPullerToken] = useState("");
  const [pusherUid, setPusherUid] = useState("222222");
  const [pusherToken, setpusherToken] = useState("");
  const [speakingLanguage, setSpeakingLanguage] = useState(DEFAULT_SPEAKING_LANGUAGE);
  const [translateLanguage, setTranslateLanguage] = useState(DEFAULT_TRANSLATE_LANGUAGE);
  useImperativeHandle(ref, () => ({
    getValue: () => ({
      pullerUid,
      pullerToken,
      pusherUid,
      pusherToken,
      speakingLanguage,
      translateLanguage
    }),
    setValue: options => {}
  }));
  const onPusherUidChange = e => {
    let value = e.target.value;
    if (/[^0-9]/g.test(value)) {
      message.warning("User ID must be a number");
      value = value.replace(/[^0-9]/g, '');
    }
    setPusherUid(value == "" ? null : Number(value));
  };
  const onPullerUidChange = e => {
    let value = e.target.value;
    if (/[^0-9]/g.test(value)) {
      message.warning("User ID must be a number");
      value = value.replace(/[^0-9]/g, '');
    }
    setPullerUid(value == "" ? null : Number(value));
  };
  return <Row gutter={[16, 16]} ref={ref}>
    <Col span={6}>
      <Title level={5}>PullerUid</Title>
      <Input type="text" placeholder="enter the int uid" value={pullerUid} onChange={onPullerUidChange} />
      <Text>User ID for the bot to pull the audio from channel</Text>
    </Col>
    <Col span={6}>
      <Title level={5}>Token(optional)</Title>
      <Input type="text" placeholder="token of the puller" value={pullerToken} onChange={e => setPullerToken(e.target.value)} />
    </Col>
    <Col span={6}>
      <Title level={5}>PusherUid</Title>
      <Input type="text" placeholder="enter the int uid" value={pusherUid} onChange={onPusherUidChange} />
      <Text>User ID for the bot to push the text to channel</Text>
    </Col>
    <Col span={6}>
      <Title level={5}>Token(optional)</Title>
      <Input type="text" placeholder="token of the puller" value={pullerToken} onChange={e => setPullerToken(e.target.value)} />
    </Col>
    <Col span={6}>
      <Title level={5}>Speaking Language</Title>
      <Input type="text" placeholder="language code" value={speakingLanguage} onChange={e => setSpeakingLanguage(e.target.value)} />
      <Text>the language code, such as en-US, zh-CN</Text>
    </Col>
    <Col span={6}>
      <Title level={5}>Translation Language</Title>
      <Input type="text" placeholder="language code" value={translateLanguage} onChange={e => setTranslateLanguage(e.target.value)} />
      <Text>the language code, such as en-US, zh-CN</Text>
    </Col>
  </Row>;
});
export default UserForm;