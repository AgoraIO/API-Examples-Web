import AgoraRTC from "agora-rtc-sdk-ng"
import { useEffect, useRef, useState } from "react"
import { Button, Space, message, Typography, Dropdown } from "antd"
import { DownOutlined, } from '@ant-design/icons';
import { showJoinedMessage } from "@/utils/utils"
import { useUrlQuery } from "@/utils/hooks"
import JoinMutiForm from "@/components/JoinMutiForm"
import AgoraVideoPlayer from "@/components/VideoPlayer"


const { Title } = Typography;

const client1 = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
const client2 = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});



function JoinMultipleChannel() {
  const formRef = useRef()
  const query = useUrlQuery()
  const [joined, setJoined] = useState(false)
  const [videoTrack, setVideoTrack] = useState(null)
  const [audioTrack, setAudioTrack] = useState(null)
  const [remoteUsers, setRemoteUsers] = useState({})


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
    await client1.subscribe(user, mediaType)
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
      await Promise.all([join1(), join2()])
      setJoined(true)
    } catch (error) {
      message.error(error.message)
      console.error(error)
    }
  }

  const join1 = async () => {
    const options = formRef.current.getValue()
    // Add event listeners to the client1.
    client1.on("user-published", handleUserPublished)
    client1.on("user-unpublished", handleUserUnpublished);
    // Join a channel
    options.uid = await client1.join(options.appId, options.channel, options.token || null, options.uid || null)
    const tracks = await initTracks()
    await client1.publish(tracks)
    message.success("client1 join channel1 success!")
  }

  const join2 = async () => {
    const options = formRef.current.getValue()
    client2.join(options.appid, options.channel2, options.token2 || null, options.uid2 || null);
    message.success("client2 join channel2 success!")
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
    await client1.leave()
    await client2.leave()
    setJoined(false)
    console.log("client1 leaves channel success")
  }



  return <div className="padding-20">
    <JoinMutiForm ref={formRef}></JoinMutiForm>
    <Space style={{ marginTop: "10px" }}>
      <Button type="primary" onClick={join} disabled={joined}>Join</Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
    </Space>
    {joined ? <div className="mt-10">
      <Title level={4}>Local User</Title>
      <AgoraVideoPlayer videoTrack={videoTrack} audioTrack={audioTrack}></AgoraVideoPlayer>
    </div> : null}
    {Object.keys(remoteUsers).length ?
      <div className="mt-10">
        <Title level={4}>Remote Users</Title>
        {Object.keys(remoteUsers).map(id => <AgoraVideoPlayer videoTrack={remoteUsers[id]?.videoTrack} audioTrack={remoteUsers[id]?.audioTrack} text={id} key={id}></AgoraVideoPlayer>)}
      </div> : null}
  </div>

}

export default JoinMultipleChannel
