import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { Row, Input, Col, Typography, message, AutoComplete } from "antd";
import "./index.css";
const {
  Title,
  Text,
  Paragraph
} = Typography;
const globalOptions = {
  appId: [],
  token: [],
  channel: []
};
const JoinForm = forwardRef((props, ref) => {
  const {
    options = {
      appId: "",
      token: "",
      channel: "",
      uid: null
    }
  } = props;
  const [appId, setAppId] = useState(options.appId);
  const [token, setToken] = useState(options.token);
  const [channel, setChannel] = useState(options.channel);
  const [uid, setUid] = useState(options.uid);
  const [appIdOptions, setAppIdOptions] = useState(globalOptions.appId);
  const [tokenOptions, setTokenOptions] = useState(globalOptions.token);
  const [channelOptions, setChannelOptions] = useState(globalOptions.channel);
  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (appId && appIdOptions.findIndex(item => item.value == appId) == -1) {
        setAppIdOptions(pre => {
          const newData = [...pre, {
            label: appId,
            value: appId
          }];
          globalOptions.appId = newData;
          return newData;
        });
      }
      if (token && tokenOptions.findIndex(item => item.value == token) == -1) {
        setTokenOptions(pre => {
          const newData = [...pre, {
            label: token,
            value: token
          }];
          globalOptions.token = newData;
          return newData;
        });
      }
      if (channel && channelOptions.findIndex(item => item.value == channel) == -1) {
        setChannelOptions(pre => {
          const newData = [...pre, {
            label: channel,
            value: channel
          }];
          globalOptions.channel = newData;
          return newData;
        });
      }
      return {
        appId,
        token,
        channel,
        uid
      };
    },
    setValue: (options = {}) => {
      const {
        appId,
        token,
        channel,
        uid
      } = options;
      appId && setAppId(appId);
      token && setToken(token);
      channel && setChannel(channel);
      uid && setUid(uid);
    }
  }));
  return <Row gutter={{
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32
  }} ref={ref}>
    <>
      <Col span={6} md={6} xs={24}>
        <Title level={5}>APP ID</Title>
        <AutoComplete style={{
          display: "block"
        }} type="text" placeholder="Enter the appid" filterOption={(inputValue, option) => option.value.indexOf(inputValue) !== -1} onSelect={data => setAppId(data)} value={appId} options={appIdOptions} onChange={data => setAppId(data)} />
        <Text>You find your APP ID in the <a href="https://console.agora.io/projects">Agora Console</a></Text>
      </Col>
      <Col span={6} md={6} xs={24}>
        <Title level={5}>Token(optional)</Title>
        <AutoComplete style={{
          display: "block"
        }} type="text" placeholder="Enter the app token" filterOption={(inputValue, option) => option.value.indexOf(inputValue) !== -1} onSelect={data => setToken(data)} value={token} options={tokenOptions} onChange={data => setToken(data)} />
        <Text>To create a temporary token, <a href="https://console.agora.io/projects">edit your project </a>
          in Agora Console.</Text>
      </Col>
      <Col span={6} md={6} xs={24}>
        <Title level={5}>Channel Name</Title>
        <AutoComplete style={{
          display: "block"
        }} type="text" placeholder="Enter the channel name" filterOption={(inputValue, option) => option.value.indexOf(inputValue) !== -1} onSelect={data => setChannel(data)} value={channel} options={channelOptions} onChange={data => setChannel(data)} />
        <Text>You create a channel when you create a temporary token. You guessed it, in <a href="https://console.agora.io/projects">Agora Console</a></Text>
      </Col>
      <Col span={6} md={6} xs={24}>
        <Title level={5}>User ID(optional)</Title>
        <Input type="text" placeholder="Enter the user ID (number)" value={uid} onChange={e => {
          let value = e.target.value;
          if (/[^0-9]/g.test(value)) {
            message.warning("User ID must be a number");
            value = value.replace(/[^0-9]/g, '');
          }
          setUid(value == "" ? null : Number(value));
        }} />
      </Col>
    </>

  </Row>;
});
export default JoinForm;