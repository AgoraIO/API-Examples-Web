import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { Row, Input, Col, Typography, message } from "antd"
import "./index.css"

const { Title, Text, Paragraph } = Typography;

const JoinForm = forwardRef((props, ref) => {
  const { options = {
    appId: "",
    token: "",
    channel: "",
    uid: null
  } } = props

  const [appId, setAppId] = useState(options.appId)
  const [token, setToken] = useState(options.token)
  const [channel, setChannel] = useState(options.channel)
  const [uid, setUid] = useState(options.uid)


  useImperativeHandle(ref, () => ({
    getValue: () => ({
      appId,
      token,
      channel,
      uid
    }),
    setValue: (options) => {
      setAppId(options.appId)
      setToken(options.token)
      setChannel(options.channel)
      setUid(options.uid)
    }
  }))

  return <Row gutter={[16, 16]} ref={ref}>
    <Col span={6} >
      <Title level={5}>APP ID</Title>
      <Input type="text" placeholder="Enter the appid" value={appId} onChange={(e) => setAppId(e.target.value)} />
      <Text>You find your APP ID in the <a href="https://console.agora.io/projects">Agora Console</a></Text>
    </Col>
    <Col span={6} >
      <Title level={5}>Token(optional)</Title>
      <Input type="text" placeholder="Enter the app token" value={token} onChange={(e) => setToken(e.target.value)} />
      <Text>To create a temporary token, <a href="https://console.agora.io/projects">edit your project </a>
        in Agora Console.</Text>
    </Col>
    <Col span={6} >
      <Title level={5}>Channel Name</Title>
      <Input type="text" placeholder="Enter the channel name" value={channel} onChange={(e) => setChannel(e.target.value)} />
      <Text>You create a channel when you create a temporary token. You guessed it, in <a
        href="https://console.agora.io/projects">Agora Console</a></Text>
    </Col>
    <Col span={6} >
      <Title level={5}>User ID(optional)</Title>
      <Input type="text" placeholder="Enter the user ID (number)" value={uid} onChange={(e) => {
        let value = e.target.value
        if (/[^0-9]/g.test(value)) {
          message.warning("User ID must be a number")
          value = value.replace(/[^0-9]/g, '')
        }
        setUid(value == "" ? null : Number(value))
      }} />
    </Col>
  </Row>
})

export default JoinForm
