import { useState, useEffect } from 'react';
import AgoraRTC, {
  IAgoraRTCClient, IAgoraRTCRemoteUser, ILocalVideoTrack, ILocalAudioTrack } from 'agora-rtc-sdk-ng';

import AIDenoiserEnabler from "./AIDenoiserEnabler";
import { AIDenoiserExtension } from 'agora-extension-ai-denoiser';


let localTracks = { videoTrack: undefined, audioTrack: undefined };



export default function useAgora(client: IAgoraRTCClient | undefined)
  :
   {
      localAudioTrack: ILocalAudioTrack | undefined ,
      localVideoTrack: ILocalVideoTrack | undefined ,
      joinState: boolean,
      aiDenoiserState: boolean,
      leave: Function,
      join: Function,
      controler: Function,
      remoteUsers: IAgoraRTCRemoteUser[],
    }
    {
  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | undefined>(undefined);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | undefined>(undefined);

  const [joinState, setJoinState] = useState(false);

  const [aiDenoiserState, setAIDenoiser] = useState(false);


  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  
  let enableDenoiser4AudioTrack: { enabler: any; processor: any; controler: any; denoiser?: AIDenoiserExtension; } | null = null;


  let options = { appid: null, channel: null, uid: null, token: null };



  // async function createLocalTracks(audioConfig?: MicrophoneAudioTrackInitConfig, videoConfig?: CameraVideoTrackInitConfig)
  // : Promise<void> {
  //   // [localTracks.audioTrack, localTracks.videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(audioConfig, videoConfig);
  //   // setLocalAudioTrack(localTracks.audioTrack);
  //   // setLocalVideoTrack(localTracks.videoTrack);
  //   // return [microphoneTrack, cameraTrack];
  // }

  async function join(appid: string, channel: string, token?: string, uid?: string | number | null) {

    if (!client) return;

    // let microphoneAudioTrack = await AgoraRTC.createMicrophoneAudioTrack() ;

    // let cameraVideoTrack = await AgoraRTC.createCameraVideoTrack();



    // localTracks = { videoTrack: cameraVideoTrack, audioTrack: microphoneAudioTrack };


    enableDenoiser4AudioTrack = AIDenoiserEnabler();

    
    // await client.join(appid, channel, token || null);


    // @ts-ignore
    [options.uid, localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
      client.join(appid, channel, token || null),
      AgoraRTC.createMicrophoneAudioTrack(),
      AgoraRTC.createCameraVideoTrack(),
    ]);




    await enableDenoiser4AudioTrack.enabler(localTracks.audioTrack);
    setAIDenoiser(enableDenoiser4AudioTrack.processor.enabled);
    

    setLocalAudioTrack(localTracks.audioTrack);
    setLocalVideoTrack(localTracks.videoTrack);
    
    // @ts-ignore
    await client.publish(Object.values(localTracks));

    (window as any).client = client;
    (window as any).videoTrack = localTracks.videoTrack;

    setJoinState(true);
  }

  async function leave() {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }
    setRemoteUsers([]);
    setJoinState(false);
    await client?.leave();
  }

  async function controler(flag: boolean){
    await enableDenoiser4AudioTrack?.controler(flag);
    console.log("execute controler function with flag: " + flag);
  }




  useEffect(() => {
    if (!client) return;
    setRemoteUsers(client.remoteUsers);

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      await client.subscribe(user, mediaType);
      // toggle rerender while state of remoteUsers changed.
      setRemoteUsers(remoteUsers => Array.from(client.remoteUsers));
    }
    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers(remoteUsers => Array.from(client.remoteUsers));
    }
    const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers(remoteUsers => Array.from(client.remoteUsers));
    }
    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers(remoteUsers => Array.from(client.remoteUsers));
    }
    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-joined', handleUserJoined);
    client.on('user-left', handleUserLeft);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-joined', handleUserJoined);
      client.off('user-left', handleUserLeft);
    };
  }, [client]);

  return {
    localAudioTrack,
    localVideoTrack,
    joinState,
    aiDenoiserState,
    leave,
    join,
    controler,
    remoteUsers,
  };
}