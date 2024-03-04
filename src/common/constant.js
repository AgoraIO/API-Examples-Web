const ENV = "dev" // dev, test, prod
const AREA = "external"  // internal, external 
const ORIGIN_URL = __calcOriginUrl()
const SETUP_PAGE_URL = `${ORIGIN_URL}/index.html`
let REDIRECT_URI = '' // sso redirect uri
let BASE_URL = '' // request base url

switch (ENV) {
  case "dev":
    BASE_URL = "https://test-toolbox.bj2.agoralab.co"
    REDIRECT_URI = "http://localhost:3001/sso/index.html";
    break;
  case "test":
    BASE_URL = "https://test-toolbox.bj2.agoralab.co"
    REDIRECT_URI = "https://fullapp.oss-cn-beijing.aliyuncs.com/api-examples-test/sso/index.html";
    break;
  case "prod":
    BASE_URL = "https://toolbox.bj2.agoralab.co"
    REDIRECT_URI = "https://webdemo.agora.io/sso/index.html";
    break;
}

const DOCUMENT_LIST = [
  {
    name: "default",  // base url and file name
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/get-started/enable-service",
    enUrl: "https://docs.agora.io/en/video-calling/get-started/authentication-workflow?platform=web",
  }, {
    name: "basicVoiceCall",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/get-started/quick-start",
    enUrl: "https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=web"
  }, {
    name: "basicVideoCall",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/get-started/quick-start",
    enUrl: "https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=web"
  }, {
    name: "basicLive",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/get-started/quick-start",
    enUrl: "https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=web"
  }, {
    name: "shareTheScreen",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/basic-features/screen-share",
    enUrl: "https://docs.agora.io/en/video-calling/develop/product-workflow?platform=web"
  }, {
    name: "recordingDeviceControl",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/basic-features/switch-device",
    enUrl: "https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/iagorartc.html#getcameras"
  }, {
    name: "adjustVideoProfile",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/basic-features/video-profile",
    enUrl: "https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/icameravideotrack.html#setencoderconfiguration"
  }, {
    name: "displayCallStats",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/in-call-quality",
    enUrl: "https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/networkquality.html"
  }, {
    name: "audioMixingAndAudioEffect",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/audio-effect-mixing",
    enUrl: "https://docs.agora.io/en/video-calling/enable-features/audio-and-voice-effects?platform=web"
  }, {
    name: "joinMutlipleChannel",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/basic-features/join-leave-channel",
    enUrl: "https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/iagorartcclient.html#join"
  }, , {
    name: "customVideoSource",
    zhUrl: "https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/iagorartc#createCustomVideoTrack",
    enUrl: "https://docs.agora.io/en/video-calling/develop/custom-video-and-audio?platform=web"
  }, {
    name: "selfRendering",
    zhUrl: "https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/ilocalvideotrack#getMediaStreamTrack",
    enUrl: "https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/ilocalvideotrack.html#getmediastreamtrack"
  }, {
    name: "selfCapturing",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/custom-video-source",
    enUrl: "https://docs.agora.io/en/video-calling/develop/stream-raw-audio-and-video?platform=web"
  }, {
    name: "screenshot",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/content-inspect",
    enUrl: "https://docs.agora.io/en/video-calling/enable-features/screenshot-upload?platform=web"
  }, {
    name: "geoFencing",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/region",
    enUrl: "https://docs.agora.io/en/video-calling/enable-features/geofencing?platform=web"
  }, {
    name: "virtualBackground",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/virtual-background",
    enUrl: "https://docs.agora.io/en/video-calling/enable-features/virtual-background?platform=web"
  }, {
    name: "beauty",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/image-enhancement",
    enUrl: "https://docs-beta.agora.io/en/video-calling/enable-features/image-enhancement?platform=web"
  }, {
    name: "aiDenoiser",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/noise-reduction",
    enUrl: "https://docs.agora.io/en/video-calling/enable-features/ai-noise-suppression?platform=web"
  }, {
    name: "superClarity",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/super-clarity",
    enUrl: "https://docs-beta.agora.io/en/extensions-marketplace/develop/integrate/superclarity?platform=web"
  }, {
    name: "vad",
    zhUrl: "",
    enUrl: ""
  }, {
    name: "spatialAudio",
    zhUrl: "",
    enUrl: "https://docs.agora.io/en/video-calling/enable-features/spatial-audio?platform=web"
  }, {
    name: "videoCompositor",
    zhUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/video-compositing",
    enUrl: "https://docs-beta.agora.io/en/video-calling/enable-features/video-compositor?platform=web"
  }, {
    name: "pushStreamToCDN",
    zhUrl: "https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/iagorartcclient#startlivestreaming",
    enUrl: "https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/iagorartcclient.html#startlivestreaming"
  }, {
    name: "dualStream",
    zhUrl: "https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/iagorartcclient#enableDualStream",
    enUrl: "https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/iagorartcclient.html#enabledualstream"
  }, {
    name: "vue",
    zhUrl: "",
    enUrl: ""
  }, {
    name: "react",
    zhUrl: "https://doc.shengwang.cn/api-ref/rtc/react/react-sdk/components",
    enUrl: ""
  }
]

const SETUP_LIST = [{
  title: "initializeSettings",
  url: `${ORIGIN_URL}/index.html`,
}]

const BASIC_LIST = [
  {
    title: "basicVoice",
    url: `${ORIGIN_URL}/example/basic/basicVoiceCall/index.html`,
  },
  {
    title: "basicVideo",
    url: `${ORIGIN_URL}/example/basic/basicVideoCall/index.html`,
  },
  {
    title: "basicLive",
    url: `${ORIGIN_URL}/example/basic/basicLive/index.html`,
  },
]

const ADVANCED_LIST = [
  {
    title: "screenShare",
    url: `${ORIGIN_URL}/example/advanced/shareTheScreen/index.html`,
  },
  {
    title: "testMediaDevices",
    url: `${ORIGIN_URL}/example/advanced/recordingDeviceControl/index.html`,
  },
  {
    title: "adjustVideoProfile",
    url: `${ORIGIN_URL}/example/advanced/adjustVideoProfile/index.html`,
  },
  {
    title: "displayCallStatistics",
    url: `${ORIGIN_URL}/example/advanced/displayCallStats/index.html`,
  },
  {
    title: "audioEffects",
    url: `${ORIGIN_URL}/example/advanced/audioMixingAndAudioEffect/index.html`,
  },
  {
    title: "joinMultipleChannels",
    url: `${ORIGIN_URL}/example/advanced/joinMutlipleChannel/index.html`,
  },
  {
    title: "customVideoSource",
    url: `${ORIGIN_URL}/example/advanced/customVideoSource/index.html`,
  },
  {
    title: "videoSelfRendering",
    url: `${ORIGIN_URL}/example/advanced/selfRendering/index.html`,
  },
  {
    title: "videoSelfCapturing",
    url: `${ORIGIN_URL}/example/advanced/selfCapturing/index.html`,
  },
  {
    title: "videoScreenshot",
    url: `${ORIGIN_URL}/example/advanced/screenshot/index.html`,
  },
  {
    title: "networkGeofencing",
    url: `${ORIGIN_URL}/example/advanced/geoFencing/index.html`,
  },
]

const PLUGIN_LIST = [
  {
    title: "virtualBackground",
    url: `${ORIGIN_URL}/example/plugin/virtualBackground/index.html`,
  },
  {
    title: "beauty",
    url: `${ORIGIN_URL}/example/plugin/beauty/index.html`,
  },
  {
    title: "ains",
    url: `${ORIGIN_URL}/example/plugin/aiDenoiser/index.html`,
  },
  {
    title: "superClarify",
    url: `${ORIGIN_URL}/example/plugin/superClarity/index.html`,
  },
  {
    title: "spatialAudio",
    url: `${ORIGIN_URL}/example/plugin/spatialAudio/index.html`,
  },
  {
    title: "vad",
    url: `${ORIGIN_URL}/example/plugin/vad/index.html`,
  },
  {
    title: "localVideoCompositing",
    url: `${ORIGIN_URL}/example/plugin/videoCompositor/index.html`,
  },
]

const OTHER_LIST = [
  {
    title: "pushStreamsCDN",
    url: `${ORIGIN_URL}/example/others/pushStreamToCDN/index.html`,
  },
  {
    title: "enableDualStreamMode",
    url: `${ORIGIN_URL}/example/others/dualStream/index.html`,
  },
]

const FRAMEWORK_LIST = [
  {
    title: "vue",
    url: `${ORIGIN_URL}/example/framework/vue/index.html`,
  },
  {
    title: "react",
    url: `${ORIGIN_URL}/example/framework/react/index.html`,
  },
]

function __calcOriginUrl() {
  let TEST_PREFIX = ""
  if (AREA == "internal") {
    TEST_PREFIX = "api-examples-test"
  } else {
    TEST_PREFIX = "api-examples-test-external"
  }
  let { origin, href } = window.location
  if (origin == "file://") {
    // open local file
    let reg = /file\S+\/src/g
    return href.match(reg)[0]
  } else {
    switch (ENV) {
      case "dev":
        return origin
      case "test":
        return `${origin}/${TEST_PREFIX}`
      case "prod":
        return origin
      default:
        return origin
    }
  }

}



