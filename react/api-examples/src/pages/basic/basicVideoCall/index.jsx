import AgoraRTC from "agora-rtc-sdk-ng"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Button, Space, message, Typography } from "antd"
import { showJoinedMessage } from "@/utils/utils"
import { useUrlQuery } from "@/utils/hooks"
import JoinForm from "@/components/JoinForm"
import AdvancedSetting from "@/components/AdvancedSetting"
import AgoraVideoPlayer from "@/components/VideoPlayer"


const { Title } = Typography;

let client = null
let codec = 'vp8'


function BasicVideoCall() {
  const formRef = useRef()
  const query = useUrlQuery()
  const [joined, setJoined] = useState(false)
  const [videoTrack, setVideoTrack] = useState(null)
  const [audioTrack, setAudioTrack] = useState(null)
  const [remoteUsers, setRemoteUsers] = useState({})


  useEffect(() => {
    initTracks()
  }, [])


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


  const initTracks = async () => {
    const tracks = await Promise.all([
      AgoraRTC.createMicrophoneAudioTrack(),
      AgoraRTC.createCameraVideoTrack()
    ])
    setAudioTrack(tracks[0])
    setVideoTrack(tracks[1])
    return tracks
  }


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
      const options = formRef.current.getValue()
      if (!client) {
        client = AgoraRTC.createClient({
          mode: "rtc",
          codec: codec
        });
      }
      // Add event listeners to the client.
      client.on("user-published", handleUserPublished)
      client.on("user-unpublished", handleUserUnpublished);
      let tracks = [audioTrack, videoTrack]
      if (!audioTrack && !videoTrack) {
        tracks = await initTracks()
      }
      // Join a channel
      options.uid = await client.join(options.appId, options.channel, options.token || null, options.uid || null)
      await client.publish(tracks)
      showJoinedMessage(options)
      setJoined(true)
    } catch (error) {
      message.error(error.message)
      console.error(error)
    }
  }

  const leave = async () => {
    if (audioTrack) {
      audioTrack.close()
      setAudioTrack(null)
    }
    if (videoTrack) {
      videoTrack.close()
      setVideoTrack(null)
    }
    setRemoteUsers({})
    await client.leave()
    // leave the channel
    setJoined(false)
    console.log("client leaves channel success")
  }

  const onCodecChange = (val) => {
    codec = val
  }


  const onProfileChange = async (val) => {
    await videoTrack.setEncoderConfiguration(val)
  }

  return <div className="padding-20">
    <JoinForm ref={formRef}></JoinForm>
    <Space style={{ marginTop: "10px" }}>
      <Button type="primary" onClick={join} disabled={joined}>Join</Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
      <AdvancedSetting audioTrack={audioTrack}
        videoTrack={videoTrack}
        onCodecChange={onCodecChange}
        onProfileChange={onProfileChange}></AdvancedSetting>
    </Space>
    {joined ? <div className="mt-10">
      <Title level={4}>Local User</Title>
      <AgoraVideoPlayer videoTrack={videoTrack} audioTrack={audioTrack}></AgoraVideoPlayer>
    </div> : null}
    {Object.keys(remoteUsers).length ?
      <div className="mt-10">
        <Title level={4}>Remote Users</Title>
        {Object.keys(remoteUsers).map(id => <AgoraVideoPlayer
          videoTrack={remoteUsers[id]?.videoTrack}
          audioTrack={remoteUsers[id]?.audioTrack}
          text={id}
          key={id}></AgoraVideoPlayer>)}
      </div> : null}
  </div>
}




export default BasicVideoCall
