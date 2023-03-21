import AgoraRTC from "agora-rtc-sdk-ng"
import { useEffect, useRef, useState } from "react"
import { Button, Space, message, Typography, Dropdown } from "antd"
import { showJoinedMessage, loadImage } from "@/utils/utils"
import { useUrlQuery } from "@/utils/hooks"
import JoinForm from "@/components/JoinForm"
import VirtualBackgroundEffect from "@/components/VirtualBackgroundEffect"
import AgoraVideoPlayer from "@/components/VideoPlayer"
import "assets/virtualBackgroundExtension/agora-extension-virtual-background"

const { Title } = Typography;

const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
let denoiser = null;
let processor = null;

function VirtualBackground() {
  const formRef = useRef()
  const query = useUrlQuery()
  const [joined, setJoined] = useState(false)
  const [videoTrack, setVideoTrack] = useState(null)
  const [audioTrack, setAudioTrack] = useState(null)
  const [remoteUsers, setRemoteUsers] = useState({})
  const [virtualBackgroundOpen, setVirtualBackgroundOpen] = useState(false)
  const [virtualBackgroundEnable, setVirtualBackgroundEnable] = useState(false)

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
      const options = formRef.current.getValue()
      // Add event listeners to the client.
      client.on("user-published", handleUserPublished)
      client.on("user-unpublished", handleUserUnpublished);
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

  const openVirtualBackground = async () => {
    setVirtualBackgroundOpen(true)
    denoiser = new VirtualBackgroundExtension();
    AgoraRTC.registerExtensions([denoiser]);
    processor = denoiser.createProcessor();
    processor.eventBus.on("PERFORMANCE_WARNING", () => {
      const msg = "Performance warning!!!!!!!!!!!!!!!!!";
      console.warn(msg);
      message.warn(msg)
    });
    await processor.init("/assets/virtualBackgroundExtension/wasms");
    pipeProcessor(videoTrack, processor);
  }

  const pipeProcessor = (track, processor) => {
    track.pipe(processor).pipe(track.processorDestination);
  }


  const enableVirtualBackground = async () => {
    setVirtualBackgroundEnable(true)
    await processor.enable();
  }

  const disableVirtualBackground = async () => {
    setVirtualBackgroundEnable(false)
    await processor.disable();
  }

  const onConfirm = async (data) => {
    let option = {};
    switch (data.type) {
      case "blur":
        option = {
          type: data.type,
          blurDegree: Number(data.value)
        }
        break
      case "color":
        option = {
          type: data.type,
          color: data.value
        }
        break
      case "image":
        const source = await loadImage(data.value)
        option = {
          type: data.type,
          source: source
        }
        break
    }
    processor.setOptions(option);
    message.success(`Set virtual background success! ${JSON.stringify(option)}`)
  }

  return <div className="padding-20">
    <JoinForm ref={formRef}></JoinForm>
    <Space style={{ marginTop: "10px" }}>
      <Button type="primary" onClick={join} disabled={joined}>Join</Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
    </Space>
    <div style={{ marginTop: "10px" }}>
      <Space>
        <Button type="primary" disabled={!joined || virtualBackgroundOpen} onClick={openVirtualBackground}>Open AI Denoiser for LocalAudioTrack</Button>
        <Button type="primary" disabled={!virtualBackgroundOpen} onClick={enableVirtualBackground}>Enable VirtualBackground</Button>
        <Button type="primary" disabled={!virtualBackgroundOpen || !virtualBackgroundEnable} onClick={disableVirtualBackground}>Disable VirtualBackground</Button>
      </Space>
    </div>
    {virtualBackgroundEnable ? <div style={{ marginTop: "10px", marginBottom: "10px" }} >
      <VirtualBackgroundEffect onConfirm={onConfirm}></VirtualBackgroundEffect>
    </div> : null}
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

export default VirtualBackground
