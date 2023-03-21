import AgoraRTC from "agora-rtc-sdk-ng"
import { useEffect, useRef, useState } from "react"
import { Button, Space, message, Typography } from "antd"
import { showJoinedMessage } from "@/utils/utils"
import { useUrlQuery } from "@/utils/hooks"
import JoinForm from "@/components/JoinForm"
import AgoraVideoPlayer from "@/components/VideoPlayer"
import FileInput from "@/components/FileInput"

import heroicAdventureMp3 from "./assets/HeroicAdventure.mp3"
import audioMp3 from "./assets/audio.mp3"

const { Title, Paragraph } = Typography;

const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});


const DEFAULT_AUDIO_EFFECT_OPTIONS = {
  source: audioMp3
}


function AudioMixingAndAudioEffect() {
  const formRef = useRef()
  const query = useUrlQuery()
  const [joined, setJoined] = useState(false)
  const [videoTrack, setVideoTrack] = useState(null)
  const [audioTrack, setAudioTrack] = useState(null)
  const [audioMixingTrack, setAudioMixingTrack] = useState(null)
  const [audioEffectTrack, setAudioEffectTrack] = useState(null)
  const [remoteUsers, setRemoteUsers] = useState({})
  const [audioMixing, setAudioMixing] = useState({
    state: "IDLE",
    // "IDLE" | "LOADING | "PLAYING" | "PAUSE"
    duration: 0
  })
  const [file, setFile] = useState(null)




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

  const onFileChange = (files) => {
    if (files?.length) {
      setFile(files[0])
    }
  }

  const startAudioMixing = async (file) => {
    if (audioMixing.state === "PLAYING" || audioMixing.state === "LOADING") return;
    const options = {};
    if (file) {
      options.source = file;
    } else {
      options.source = heroicAdventureMp3
    }
    try {
      setAudioMixing((pre) => ({ ...pre, state: "LOADING" }))
      if (audioMixingTrack) {
        await client.unpublish(audioMixingTrack);
      }
      // start audio mixing with local file or the preset file
      const track = await AgoraRTC.createBufferSourceAudioTrack(options);
      setAudioMixingTrack(track)
      track.play();
      track.startProcessAudioBuffer({
        loop: true
      });
      setAudioMixing((pre) => ({ ...pre, duration: audioMixingTrack.duration }))
    } catch (e) {
      console.error(e);
      message.error(e.message)
      setAudioMixing((pre) => ({ ...pre, state: "IDLE" }))
    }
  }

  const stopAudioMixing = () => {
    if (audioMixing.state === "IDLE" || audioMixing.state === "LOADING") return;
    setAudioMixing((pre) => ({ ...pre, state: "IDLE" }))
    audioMixingTrack.stopProcessAudioBuffer()
    audioMixingTrack.stop();
  }

  // use buffer source audio track to play effect.
  const playAudioEffect = (cycle, options) => {
    // if the published track will not be used, you had better unpublish it
    // if (audioEffectTrack) {
    //   await client.unpublish(audioEffectTrack);
    // }
    // const track = await AgoraRTC.createBufferSourceAudioTrack(options);
    // setAudioEffectTrack(track)
    // await client.publish(track);
    track.play();
    track.startProcessAudioBuffer({
      cycle
    });
  }

  const startLocalAudioMixing = () => {
    if (!file) {
      message.warn("please choose a audio file!");
      return;
    }
    startAudioMixing(file);
  }

  return <div className="padding-20">
    <JoinForm ref={formRef}></JoinForm>
    <Space style={{ marginTop: "10px" }}>
      <Button type="primary" onClick={join} disabled={joined}>Join</Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
    </Space>
    <div style={{ marginTop: "10px" }}>
      <Space>
        <FileInput onChange={onFileChange}></FileInput>
        <Button type="primary" onClick={startLocalAudioMixing} disabled={!joined || !file}>Start Local Audio Mixing</Button>
      </Space>
    </div>
    <div style={{ marginTop: "10px" }}>
      <Space>
        <Button type="primary" onClick={startAudioMixing} disabled={!joined}>Start Preset Audio Mixing</Button>
        <Button type="primary" onClick={stopAudioMixing} disabled={!joined}>Stop Audio Mixing</Button>
        <Button type="primary" onClick={() => playAudioEffect(1, DEFAULT_AUDIO_EFFECT_OPTIONS)} disabled={!joined}>Play Audio Effect</Button>
      </Space>
    </div>
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

export default AudioMixingAndAudioEffect
