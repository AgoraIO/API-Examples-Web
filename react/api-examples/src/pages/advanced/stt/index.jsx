import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import { Button, Space, message, Typography, Row, Col, Input, App } from "antd";
import { showJoinedMessage, createMicrophoneAudioTrack, createCameraVideoTrack } from "@/utils/utils";
import { useUrlQuery, useUnMount } from "@/utils/hooks";
import JoinForm from "@/components/JoinForm";
import UserForm from "./components/userForm";
import { apiStartTranscription, apiStopTranscription } from "./utils";
import protoRoot from "./proto";
import "./index.css";
const {
  Title,
  Paragraph,
  Text
} = Typography;
let role = 'host';
const DEFAULT_UID = 123456;
const client = AgoraRTC.createClient({
  mode: "live",
  codec: "vp8"
});
function Stt() {
  const formRef = useRef();
  const userFormRef = useRef();
  useUrlQuery(userFormRef);
  const [joined, setJoined] = useState(false);
  const [audioTrack, setAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [key, setKey] = useState("");
  const [secret, setSecret] = useState("");
  const [started, setStarted] = useState(false);
  const [transcribeItems, setTranscribeItems] = useState([]);
  const [translateItems, setTranslateItems] = useState([]);
  const {
    message
  } = App.useApp();
  useEffect(() => {
    const data = formRef.current.getValue();
    if (!data?.uid) {
      formRef.current.setValue({
        uid: DEFAULT_UID
      });
    }
  }, []);
  useUnMount(() => {
    if (joined) {
      leave();
    }
  });
  const initTracks = async () => {
    const tracks = await Promise.all([createMicrophoneAudioTrack()]);
    setAudioTrack(tracks[0]);
    return tracks;
  };

  /*
   * Add the local use to a remote channel.
   *
   * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
   * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
   */
  const subscribe = async (user, mediaType) => {
    await client.subscribe(user, mediaType);
  };
  const handleStreammessage = (msgUid, data) => {
    dealStreammessage(data);
  };
  function dealStreammessage(data) {
    // use protobuf decode data
    const msg = protoRoot.lookup("Text").decode(data) || {};
    console.log("dealStreammessage", msg);
    const {
      words,
      data_type,
      trans = [],
      duration_ms,
      uid
    } = msg;
    let isFinal = false;
    let text = "";
    if (data_type == "transcribe") {
      if (words.length) {
        words.forEach(item => {
          if (item.isFinal) {
            isFinal = true;
          }
          text += item?.text;
        });
        updateTranscribeItem(uid, text, isFinal);
      }
    } else if (data_type == "translate") {
      if (trans.length) {
        trans.forEach(item => {
          item?.texts.forEach(v => text += v);
          isFinal = item?.isFinal;
          updateTranslateItem(uid, text, isFinal);
        });
      }
    }
  }
  const updateTranslateItem = (uid, text, isFinal) => {
    setTranslateItems(pres => {
      const last = pres[pres.length - 1];
      if (last?.isFinal) {
        return [...pres, {
          uid,
          text,
          isFinal
        }];
      } else {
        pres.splice(pres.length - 1, 1);
        return [...pres, {
          uid,
          text,
          isFinal
        }];
      }
    });
  };
  const updateTranscribeItem = (uid, text, isFinal) => {
    setTranscribeItems(pres => {
      const last = pres[pres.length - 1];
      if (last?.isFinal) {
        return [...pres, {
          uid,
          text,
          isFinal
        }];
      } else {
        pres.splice(pres.length - 1, 1);
        return [...pres, {
          uid,
          text,
          isFinal
        }];
      }
    });
  };
  const join = async () => {
    try {
      client.setClientRole(role);
      client.on("stream-message", handleStreammessage);
      const options = formRef.current.getValue();
      // Join a channel
      options.uid = await client.join(options.appId, options.channel, options.token || null, options.uid || null);
      const tracks = await initTracks();
      await client.publish(tracks);
      showJoinedMessage(message, options);
      setJoined(true);
    } catch (error) {
      message.error(error.message);
      console.error(error);
    }
  };
  const leave = async () => {
    audioTrack?.close();
    setAudioTrack(null);
    setRemoteUsers({});
    await client?.leave();
    setJoined(false);
    const msg = "client leaves channel success!";
    message.success(msg);
  };
  const hostJoin = () => {
    role = 'host';
    join();
  };
  const audienceJoin = () => {
    role = 'audience';
    join();
  };
  const startTranscription = async () => {
    const options = formRef.current.getValue();
    const data = userFormRef.current.getValue();
    const {
      pullerUid,
      pusherUid
    } = data;
    if (!pullerUid) {
      message.error("Please input puller uid");
      return;
    }
    if (!pusherUid) {
      message.error("Please input pusher uid");
      return;
    }
    if (!key) {
      message.error("Please input key");
      return;
    }
    if (!secret) {
      message.error("Please input secret");
      return;
    }
    try {
      await apiStartTranscription(options, data, key, secret);
      message.success("Start transcription success!");
      setStarted(true);
    } catch (err) {
      message.error(err.message);
      setStarted(false);
    }
  };
  const stopTranscription = async () => {
    try {
      const options = formRef.current.getValue();
      await apiStopTranscription(options);
      setStarted(false);
      message.success("Stop transcription success!");
    } catch (err) {
      message.error(err.message);
      setStarted(true);
    }
  };
  return <div className="padding-20">
    <JoinForm ref={formRef}></JoinForm>
    <Space style={{
      marginTop: "10px"
    }}>
      <Button type="primary" onClick={hostJoin} disabled={joined}>Join as host</Button>
      <Button type="primary" onClick={audienceJoin} disabled={joined}>Join as audience</Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
    </Space>
    <Space style={{
      marginTop: "20px",
      display: "block"
    }}>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Title level={5}>key</Title>
          <Input type="text" placeholder="enter the key" value={key} onChange={e => setKey(e.target.value)} />
          <Text>The restful API security
            You find your key and secret in the <a href="https://console.agora.io/projects">Agora Console</a></Text>
        </Col>
        <Col span={12}>
          <Title level={5}>secret</Title>
          <Input type="text" placeholder="enter the secret" value={secret} onChange={e => setSecret(e.target.value)} />
        </Col>
      </Row>
    </Space>
    <Space style={{
      marginTop: "20px",
      display: "block"
    }}>
      <UserForm ref={userFormRef}></UserForm>
    </Space>
    <Space style={{
      marginTop: "20px"
    }}>
      <Button type="primary" onClick={startTranscription} disabled={!joined || started}>Start Channel Transcription</Button>
      <Button type="primary" onClick={stopTranscription} disabled={!joined || !started}>Stop task</Button>
    </Space>
    <Title level={4} style={{
      marginTop: "10px"
    }}>After start the transcription, Please say something, you wil see the text here</Title>
    <section className="trans-wrapper">
      <div className="content">
        {transcribeItems.map((item, index) => <div key={index} className="item">{item.uid}: {item.text}</div>)}
      </div>
      <div className="content">
        {translateItems.map((item, index) => <div key={index} className="item">{item.uid}: {item.text}</div>)}
      </div>
    </section>


  </div>;
}
export default Stt;