import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import { Button, Space, message, Typography, App } from "antd";
import JoinForm from "@/components/JoinForm";
import { useUrlQuery, useUnMount } from "@/utils/hooks";
import { genPublicPath } from "@/utils/utils";
import SpatialAudioSetting from "@/components/SpatialAudioSetting";
import resources3Mp3 from "assets/mp3/3.mp3";
import resources2Mp3 from "assets/mp3/2.mp3";
import { SpatialAudioExtension } from 'agora-extension-spatial-audio';
const {
  Title
} = Typography;
AgoraRTC.setLogLevel(1);
const extension = new SpatialAudioExtension({
  assetsPath: genPublicPath('/external/agora-extension-spatial-audio')
});
AgoraRTC.registerExtensions([extension]);
const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
var remoteUsersSound = [resources2Mp3];
let remoteUserClients = [];
let options = {};
function SpatialAudio() {
  const formRef = useRef();
  useUrlQuery(formRef);
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [setting, setSetting] = useState(null);
  const {
    message
  } = App.useApp();
  useUnMount(() => {
    if (joined) {
      leave();
    }
  });

  /*
   * Add the local use to a remote channel.
   *
   * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
   * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
   */
  const subscribe = async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    if (mediaType === "video") {
      // ...
    }
    if (mediaType === 'audio') {
      const processor = extension.createProcessor();
      user.processor = processor;
      const track = user.audioTrack;
      track.pipe(processor).pipe(track.processorDestination);
      track.play();
    }
  };

  /*
   * Add a user who has subscribed to the live channel to the local interface.
   *
   * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
   * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
   */
  const handleUserPublished = async (user, mediaType) => {
    const id = user.uid;
    await subscribe(user, mediaType);
    setRemoteUsers(prev => ({
      ...prev,
      [id]: user
    }));
  };

  /*
  * Remove the user specified from the channel in the local interface.
  *
  * @param  {string} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to remove.
  */
  const handleUserUnpublished = (user, mediaType) => {
    if (mediaType === 'video') {
      const id = user.uid;
      setRemoteUsers(pre => {
        delete pre[id];
        return {
          ...pre
        };
      });
    }
  };
  const mockRemoteUserJoin = async () => {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < remoteUsersSound.length; i++) {
        setTimeout(async () => {
          try {
            const track = await AgoraRTC.createBufferSourceAudioTrack({
              source: remoteUsersSound[i]
            });
            track.startProcessAudioBuffer({
              loop: true
            });
            const client = AgoraRTC.createClient({
              mode: "rtc",
              codec: "vp8"
            });
            remoteUserClients[i] = client;
            await client.join(options.appId, options.channel, options.token || null);
            await client.publish(track);
            resolve();
          } catch (error) {
            console.error(`remoteUsersSound[${i}] with buffersource track ${remoteUsersSound[i]} join and publish fail: ${error}`);
            reject(error);
          }
        }, 500 * i);
      }
    });
  };
  const join = async () => {
    try {
      options = formRef.current.getValue();
      // Add event listeners to the client.
      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);
      await mockRemoteUserJoin();
      // Join a channel
      options.uid = await client.join(options.appId, options.channel, options.token || null, options.uid || null);
      // await localPlayerStart();
      message.success("join channel success");
      setJoined(true);
      initSpatialAudio();
    } catch (error) {
      message.error(error.message);
      console.error(error);
    }
  };
  const initSpatialAudio = () => {
    updateSpatialAzimuth(setting.azimuth);
    updateSpatialElevation(setting.elevation);
    updateSpatialDistance(setting.distance);
    updateSpatialOrientation(setting.orientation);
    updateSpatialAttenuation(setting.attenuation);
    updateSpatialAirAbsorb(setting.airAbsorb);
    updateSpatialBlur(setting.blur);
  };
  const leave = async () => {
    setRemoteUsers({});
    // leave the channel
    await client?.leave();
    for (let i = 0; i < remoteUsersSound.length; i++) {
      try {
        await remoteUserClients[i]?.leave();
        console.log(`speaker[${i}] with buffersource track ${remoteUsersSound[i]} leave success`);
      } catch (error) {
        console.error(`speaker[${i}] with buffersource track ${remoteUsersSound[i]} leave fail: ${error}`);
      }
    }
    setJoined(false);
    const msg = "client leaves channel success!";
    message.success(msg);
  };
  const onSettingChange = data => {
    setSetting(data);
    if (!joined) {
      return;
    }
    if (data.azimuth !== setting.azimuth) {
      updateSpatialAzimuth(data.azimuth);
    }
    if (data.elevation !== setting.elevation) {
      updateSpatialElevation(data.elevation);
    }
    if (data.distance !== setting.distance) {
      updateSpatialDistance(data.distance);
    }
    if (data.orientation !== setting.orientation) {
      updateSpatialOrientation(data.orientation);
    }
    if (data.attenuation !== setting.attenuation) {
      updateSpatialAttenuation(data.attenuation);
    }
    if (data.airAbsorb !== setting.airAbsorb) {
      updateSpatialAirAbsorb(data.airAbsorb);
    }
    if (data.blur !== setting.blur) {
      updateSpatialBlur(data.blur);
    }
  };
  const updateSpatialBlur = val => {
    Object.keys(remoteUsers).forEach(key => {
      remoteUsers[key].processor.updateSpatialBlur(val);
    });
  };
  const updateSpatialAirAbsorb = val => {
    Object.keys(remoteUsers).forEach(key => {
      remoteUsers[key].processor.updateSpatialAirAbsorb(val);
    });
  };
  const updateSpatialAzimuth = val => {
    Object.keys(remoteUsers).forEach(key => {
      remoteUsers[key].processor.updateSpatialAzimuth(val);
    });
  };
  const updateSpatialElevation = val => {
    Object.keys(remoteUsers).forEach(key => {
      remoteUsers[key].processor.updateSpatialElevation(val);
    });
  };
  const updateSpatialDistance = val => {
    Object.keys(remoteUsers).forEach(key => {
      remoteUsers[key].processor.updateSpatialDistance(val);
    });
  };
  const updateSpatialOrientation = val => {
    Object.keys(remoteUsers).forEach(key => {
      remoteUsers[key].processor.updateSpatialOrientation(val);
    });
  };
  const updateSpatialAttenuation = val => {
    Object.keys(remoteUsers).forEach(key => {
      remoteUsers[key].processor.updateSpatialAttenuation(val);
    });
  };
  return <div className="padding-20">
    <JoinForm ref={formRef}></JoinForm>
    <Space style={{
      marginTop: "10px"
    }}>
      <Button type="primary" onClick={join} disabled={joined}>Join</Button>
      <Button onClick={leave} disabled={!joined}>Leave</Button>
    </Space>
    <div style={{
      marginTop: "10px"
    }}>
      <SpatialAudioSetting onChange={onSettingChange} disabled={!joined}></SpatialAudioSetting>
    </div>
  </div>;
}
export default SpatialAudio;