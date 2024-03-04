const basicItems = [
  {
    title: 'basicVoiceCalling',
    content: 'basicVoiceCallingNote',
    to: "/basic-voice-call"
  },
  {
    title: 'basicVideoCalling',
    content: 'basicVideoCallingNote',
    to: "/basic-video-call"
  },
  {
    title: 'basicLiveStreaming',
    content: 'basicLiveStreamingNote',
    to: "/basic-live"
  },
  {
    title: 'cloudProxy',
    content: 'cloudProxyNote',
    to: "/cloud-proxy"
  },
  {
    title: 'selfRendering',
    content: 'selfRenderingNote',
    to: "/self-rendering"
  },
  {
    title: 'selfCapturing',
    content: 'selfCapturingNote',
    to: "/self-capturing"
  },
  {
    title: 'videoScreenshot',
    content: 'videoScreenshotNote',
    to: "/screenshot"
  },
  {
    title: 'sharescreen',
    content: 'sharescreenNote',
    to: "/sharescreen"
  }
]

const advancedItems = [
  {
    title: 'testdevices',
    content: 'testdevicesNote',
    to: "/recording-device-control"
  },
  {
    title: 'adjustvideoprofile',
    content: 'adjustvideoprofileNote',
    to: "/adjust-video-profile"
  },
  {
    title: 'incallstats',
    content: 'incallstatsNote',
    to: "/display-call-stats"
  },
  {
    title: 'muteaudiovideosetmuted',
    content: 'muteaudiovideosetmutedNote',
    to: "/basic-mute"
  },
  {
    title: 'muteaudiovideosetenabled',
    content: 'muteaudiovideosetenabledNote',
    to: "/basic-mute-set-enabled"
  },
  {
    title: 'muteaudiovideomediastreamtrackenabled',
    content: 'muteaudiovideomediastreamtrackenabledNote',
    to: "/basic-mute-mediastream-track-enabled"
  },
  {
    title: 'audioeffect',
    content: 'audioeffectNote',
    to: "/audio-effect"
  },
  {
    title: 'cdnstreaming',
    content: 'cdnstreamingNote',
    to: "/push-stream-cdn"
  },
  {
    title: 'dualstream',
    content: 'dualstreamNote',
    to: "/dual-stream"
  },
  // {
  //   title: 'geofencing',
  //   content: 'geofencingNote',
  //   to: "/geofencing"
  // },
  // {
  //   title: 'multiplechannel',
  //   content: 'multiplechannelNote',
  //   to: "/multiple-channel"
  // },
  // {
  //   title: 'customvideosource',
  //   content: 'customvideosourceNote',
  //   to: "/custom-video-source"
  // },
  // {
  //   title: 'beauty',
  //   content: 'beautyNote',
  //   to: "/beauty"
  // },
]


const pluginItems = [
  {
    title: 'virtualbackground',
    content: 'virtualbackgroundNote',
    to: "/virtual-background"
  },
  {
    title: 'aidenoiser',
    content: 'aidenoiserNote',
    to: "/ai-denoiser"
  },
  {
    title: 'spatialAudioExtention',
    content: 'spatialAudioExtentionNote',
    to: "/spatial-audio"
  }
]

const scenarioItems = [
  {
    title: 'groupvideocalling',
    content: 'groupvideocallingNote',
    pathname: "https://github.com/AgoraIO-Community/AgoraMultiCall-vue"
  },
  {
    title: 'movietogether',
    content: 'movietogetherNote',
    pathname: "https://github.com/AgoraIO-Community/MovieTogether"
  }
]

export const finalItems = [
  {
    data: basicItems,
    title: 'basic'
  },
  {
    data: advancedItems,
    title: 'advanced'
  },
  // {
  //   data: pluginItems,
  //   title: 'plugins'
  // },
  {
    data: scenarioItems,
    title: 'scenarios'
  }
]
