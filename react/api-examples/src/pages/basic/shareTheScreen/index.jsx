import AgoraRTC from "agora-rtc-sdk-ng"
import { useEffect, useRef, useState } from "react"
import { Button, Space, message, Typography } from "antd"
import { showJoinedMessage } from "@/utils/utils"
import { useUrlQuery } from "@/utils/hooks"
import JoinForm from "@/components/JoinForm"
import AgoraVideoPlayer from "@/components/VideoPlayer"


const { Title } = Typography;

let client = AgoraRTC.createClient({
  mode: "rtc",
  codec: 'vp8'
});


function ShareTheScreen() {
  const formRef = useRef()
  const query = useUrlQuery()
  const [joined, setJoined] = useState(false)
  const [screenVideoTrack, setScreenVideoTrack] = useState(null)
  const [screenAudioTrack, setScreenAudioTrack] = useState(null)
  const [audioTrack, setAudioTrack] = useState(null)
  const [remoteUsers, setRemoteUsers] = useState({})

  const initTracks = async () => {
    const tempAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
    setAudioTrack(tempAudioTrack)
    const tracks = await AgoraRTC.createScreenVideoTrack({
      encoderConfig: "720p"
    }, "auto")
    if (tracks instanceof Array) {
      setScreenVideoTrack(tracks[0])
      setScreenAudioTrack(tracks[1])
      tracks[0].on('track-ended', handleTrackEnded)
      return [tempAudioTrack, ...tracks]
    } else {
      setScreenVideoTrack(tracks)
      tracks.on('track-ended', handleTrackEnded)
      return [tempAudioTrack, tracks]
    }
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

  //bind "track-ended" event, and when screensharing is stopped, there is an alert to notify the end user.
  const handleTrackEnded = (e) => {
    if (screenVideoTrack) {
      screenVideoTrack.close()
      setScreenVideoTrack(null)
    }
    if (screenAudioTrack) {
      screenAudioTrack.close()
      setScreenAudioTrack(null)
    }
    if (audioTrack) {
      audioTrack.close()
      setAudioTrack(null)
    }
  }

  const join = async () => {
    try {
      const tracks = await initTracks()
      const options = formRef.current.getValue()
      // Add event listeners to the client.
      client.on("user-published", handleUserPublished)
      client.on("user-unpublished", handleUserUnpublished);
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
    }
    if (screenVideoTrack) {
      screenVideoTrack.close()
    }
    if (screenAudioTrack) {
      screenAudioTrack.close()
    }
    setRemoteUsers({})
    // leave the channel
    await client.leave()
    setJoined(false)
    console.log("client leaves channel success")
  }



  return <div className="padding-20">
    <JoinForm ref={formRef}></JoinForm>
    <Space style={{ marginTop: "10px" }}>
      <Button type="primary" onClick={join} disabled={joined}>Join with screen video track</Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
    </Space>
    {joined ? <div className="mt-10">
      <Title level={4}>Local User</Title>
      <AgoraVideoPlayer videoTrack={screenVideoTrack} audioTrack={screenAudioTrack || audioTrack}></AgoraVideoPlayer>
    </div> : null}
    {Object.keys(remoteUsers).length ?
      <div className="mt-10">
        <Title level={4}>Remote Users</Title>
        {Object.keys(remoteUsers).map(id => <AgoraVideoPlayer videoTrack={remoteUsers[id]?.videoTrack} audioTrack={remoteUsers[id]?.audioTrack} text={id} key={id}></AgoraVideoPlayer>)}
      </div> : null}
  </div>
}



export default ShareTheScreen
