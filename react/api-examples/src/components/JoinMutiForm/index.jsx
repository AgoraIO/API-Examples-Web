import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { Row, Input, Col, Typography, message } from "antd";
import "./index.css";
const {
  Title,
  Text,
  Paragraph
} = Typography;
const JoinMutiForm = forwardRef((props, ref) => {
  const {
    options = {
      appId: "",
      token: "",
      channel: "",
      uid: null,
      token2: "",
      channel2: "",
      uid2: null
    }
  } = props;
  const [appId, setAppId] = useState(options.appId);
  const [token, setToken] = useState(options.token);
  const [channel, setChannel] = useState(options.channel);
  const [uid, setUid] = useState(options.uid);
  const [token2, setToken2] = useState(options.token2);
  const [channel2, setChannel2] = useState(options.channel2);
  const [uid2, setUid2] = useState(options.uid2);
  useImperativeHandle(ref, () => ({
    getValue: () => ({
      appId,
      token,
      channel,
      uid,
      token2,
      channel2,
      uid2
    }),
    setValue: options => {
      setAppId(options.appId);
      setToken(options.token);
      setChannel(options.channel);
      setUid(options.uid);
      setToken2(options.token2);
      setChannel2(options.channel2);
      setUid2(options.uid2);
    }
  }));
  return <><>
    <Row gutter={{
        xs: 8,
        sm: 16,
        md: 24,
        lg: 32
      }} ref={ref}>
      <Col span={6}>
        <Title level={5}>APP ID</Title>
        <Input type="text" placeholder="Enter the appid" value={appId} onChange={e => setAppId(e.target.value)} />
        <Text>You find your APP ID in the <a href="https://console.agora.io/projects">Agora Console</a></Text>
      </Col>
      <Col span={6}>
        <Title level={5}>Token1(optional)</Title>
        <Input type="text" placeholder="Enter the app token" value={token} onChange={e => setToken(e.target.value)} />
        <Text>To create a temporary token, <a href="https://console.agora.io/projects">edit your project </a>
          in Agora Console.</Text>
      </Col>
      <Col span={6}>
        <Title level={5}>Channel1 Name</Title>
        <Input type="text" placeholder="Enter the channel name" value={channel} onChange={e => setChannel(e.target.value)} />
        <Text>You create a channel when you create a temporary token. You guessed it, in <a href="https://console.agora.io/projects">Agora Console</a></Text>
      </Col>
      <Col span={6}>
        <Title level={5}>User1 ID(optional)</Title>
        <Input type="text" placeholder="Enter the user ID (number)" value={uid} onChange={e => {
            let value = e.target.value;
            if (/[^0-9]/g.test(value)) {
              message.warning("User ID must be a number");
              value = value.replace(/[^0-9]/g, '');
            }
            setUid(value == "" ? null : Number(value));
          }} />
      </Col>
    </Row>
    {/* 2nd row */}
    <Row gutter={{
        xs: 8,
        sm: 16,
        md: 24,
        lg: 32
      }}>
      <Col span={6}>
      </Col>
      <Col span={6}>
        <Title level={5}>Token2(optional)</Title>
        <Input type="text" placeholder="Enter the app token" value={token2} onChange={e => setToken2(e.target.value)} />
        <Text>To create a temporary token, <a href="https://console.agora.io/projects">edit your project </a>
          in Agora Console.</Text>
      </Col>
      <Col span={6}>
        <Title level={5}>Channel2 Name</Title>
        <Input type="text" placeholder="Enter the channel name" value={channel2} onChange={e => setChannel2(e.target.value)} />
        <Text>You create a channel when you create a temporary token. You guessed it, in <a href="https://console.agora.io/projects">Agora Console</a></Text>
      </Col>
      <Col span={6}>
        <Title level={5}>User2 ID(optional)</Title>
        <Input type="text" placeholder="Enter the user ID (number)" value={uid2} onChange={e => {
            let value = e.target.value;
            if (/[^0-9]/g.test(value)) {
              message.warning("User ID must be a number");
              value = value.replace(/[^0-9]/g, '');
            }
            setUid2(value == "" ? null : Number(value));
          }} />
      </Col>
    </Row>
  </>
  </>;
});
export default JoinMutiForm;