import AgoraRTC from "agora-rtc-sdk-ng"
import { useEffect, useRef, useState } from "react"
import { Button, Space, message, Typography, Dropdown, Input } from "antd"
import { DownOutlined, } from '@ant-design/icons';
import { showJoinedMessage } from "@/utils/utils"
import { useUrlQuery } from "@/utils/hooks"
import JoinForm from "@/components/JoinForm"
import AgoraVideoPlayer from "@/components/VideoPlayer"


const { Title, Paragraph } = Typography;

const client = AgoraRTC.createClient({
  mode: "live",
  codec: "vp8"
});

let role = 'host'
let options = {}

function PushStreamToCDN() {
  const formRef = useRef()
  const query = useUrlQuery()
  const [joined, setJoined] = useState(false)
  const [videoTrack, setVideoTrack] = useState(null)
  const [audioTrack, setAudioTrack] = useState(null)
  const [remoteUsers, setRemoteUsers] = useState({})
  const [cdnUrl, setCdnUrl] = useState('')
  const [liveStreamingStarted, setLiveStreamingStarted] = useState(false)

  const initTracks = async () => {
    const tracks = await Promise.all([
      AgoraRTC.createMicrophoneAudioTrack(),
      AgoraRTC.createCameraVideoTrack()
    ])
    setAudioTrack(tracks[0])
    setVideoTrack(tracks[1])
    return tracks
  }

  useEffect(() => {
    return () => {
      joined && leave()
    }
  }, [joined])


  useEffect(() => {
    if (query.appId && query.channel) {
      formRef.current.setValue(query)
      setTimeout(() => {
        join()
      }, 1)
    }
  }, [query])


  /*
   * Add the local use to a remote channel.
   *
   * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
   * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
   */
  const subscribe = async (user, mediaType) => {
    await client.subscribe(user, mediaType)
  }

  /*
   * Add a user who has subscribed to the live channel to the local interface.
   *
   * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
   * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
   */
  const handleUserPublished = async (user, mediaType) => {
    const id = user.uid
    await subscribe(user, mediaType)
    setRemoteUsers((prev) => ({
      ...prev,
      [id]: user
    }))
  }

  /*
 * Remove the user specified from the channel in the local interface.
 *
 * @param  {string} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to remove.
 */
  const handleUserUnpublished = (user, mediaType) => {
    if (mediaType === 'video') {
      const id = user.uid
      setRemoteUsers(pre => {
        delete pre[id]
        return { ...pre }
      })
    }
  }

  const join = async () => {
    try {
      options = formRef.current.getValue()
      // Add event listeners to the client.
      client.on("user-published", handleUserPublished)
      client.on("user-unpublished", handleUserUnpublished);
      client.setClientRole(role);
      // Join a channel
      options.uid = await client.join(options.appId, options.channel, options.token || null, options.uid || null)
      const tracks = await initTracks()
      await client.publish(tracks)
      showJoinedMessage(options)
      setJoined(true)
    } catch (error) {
      message.error(error.message)
      console.error(error)
    }
  }



  const hostJoin = () => {
    role = 'host'
    join()
  }


  const leave = async () => {
    if (audioTrack) {
      audioTrack.close()
    }
    if (videoTrack) {
      videoTrack.close()
    }
    setRemoteUsers({})
    // leave the channel
    await client.leave()
    setJoined(false)
    console.log("client leaves channel success")
  }

  const liveTranscoding = async () => {
    // Set the order of local and remote hosts according to your preferences
    const transcodingUsers = [options.uid, ...Object.keys(remoteUsers)].map((uid, index) => {
      // Set the size according to your idea
      const width = 600;
      const height = 700;
      return {
        // Set the location coordinates according to your ideas
        x: 30 * (index % 2) + index * width + 10,
        y: 10,
        width,
        height,
        zOrder: 0,
        alpha: 1.0,
        // The uid below should be consistent with the uid entered in AgoraRTCClient.join
        // uid must be an integer number
        uid: Number(uid)
      };
    });

    //  configuration of pushing stream to cdn
    const liveTranscodingConfig = {
      width: 1280,
      height: 720,
      videoBitrate: 400,
      videoFrameRate: 15,
      audioSampleRate: 32000,
      audioBitrate: 48,
      audioChannels: 1,
      videoGop: 30,
      videoCodecProfile: 100,
      userCount: 2,
      // userConfigExtraInfo: {},
      backgroundColor: 0x0000EE,
      watermark: {
        url: "https://agoraio-community.github.io/AgoraWebSDK-NG/img/logo.png",
        x: 20,
        y: 20,
        width: 200,
        height: 200
      },
      backgroundImage: {
        url: "https://agoraio-community.github.io/AgoraWebSDK-NG/img/sd_rtn.jpg",
        x: 100,
        y: 100,
        width: 1080,
        height: 520
      },
      transcodingUsers
    };

    try {
      // To monitor errors in the middle of the push, please refer to the API documentation for the list of error codes
      client.on("live-streaming-error", async (url, err) => {
        console.error("url", url, "live streaming error!", err.code);
        message.error(`live streaming error! ${err.code}`)
      });
      // set live streaming transcode configuration,
      await client.setLiveTranscoding(liveTranscodingConfig);
      // then start live streaming.
      await client.startLiveStreaming(options.liveStreamingUrl, true);
    } catch (error) {
      console.error('live streaming error:', error.message);
      message.error(`live streaming error! ${error.message}`)
    }

  }

  const startLiveStreaming = async () => {
    if (!cdnUrl) {
      message.error('Please enter live streaming url')
      return
    }
    await liveTranscoding()
    setLiveStreamingStarted(true)
  }

  const stopLiveStreaming = async () => {
    await client.stopLiveStreaming(cdnUrl)
    console.log("stop live streaming success");
    setLiveStreamingStarted(false)
  }

  return <div className="padding-20">
    <JoinForm ref={formRef}></JoinForm>
    <Space style={{ marginTop: "10px" }}>
      <Button type="primary" onClick={hostJoin} disabled={joined}>Join as host</Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
    </Space>
    <Paragraph style={{ marginTop: "10px" }}>
      <Space>
        <span>liveStreaming URL:</span>
        <Input style={{ width: "500px" }} type="url" placeholder="enter live streaming url" value={cdnUrl} onChange={e => setCdnUrl(e.target.value)}></Input>
      </Space>
    </Paragraph>
    <Paragraph style={{ marginTop: "10px" }}>
      <Space>
        <Button type="primary" onClick={startLiveStreaming} disabled={!joined || liveStreamingStarted}>start live streaming</Button>
        <Button type="primary" onClick={stopLiveStreaming} disabled={!joined || !liveStreamingStarted}>stop live streaming</Button>
      </Space>
    </Paragraph>
    {joined ? <div className="mt-10">
      <Title level={4}>Local User</Title>
      <AgoraVideoPlayer videoTrack={videoTrack} audioTrack={audioTrack}></AgoraVideoPlayer>
    </div> : null}
    {Object.keys(remoteUsers).length ?
      <div className="mt-10">
        <Title level={4}>Remote Users</Title>
        {Object.keys(remoteUsers).map(id => <AgoraVideoPlayer videoTrack={remoteUsers[id]?.videoTrack} audioTrack={remoteUsers[id]?.audioTrack}  text={id} key={id}></AgoraVideoPlayer>)}
      </div> : null}
  </div>
}




export default PushStreamToCDN
