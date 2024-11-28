const ENV = "dev"; // dev, test, prod
const AREA = "external"; // internal, external
const EXTERNAL_DEMO_PATH = "api-examples-external"; // external demo path
const INTERNAL_DEMO_PATH = "api-examples-internal"; // internal demo path
const SSO_DATA_KEY = "agora_sso_data";
const ORIGIN_URL = __calcOriginUrl();
const SETUP_PAGE_URL = `${ORIGIN_URL}/index.html`; // setup page url
let REDIRECT_URI = ""; // sso redirect uri
let BASE_URL = ""; // request base url

switch (ENV) {
  case "dev":
    BASE_URL = "https://service-staging.agora.io/toolbox";
    REDIRECT_URI = "http://localhost:3001/sso/index.html";
    break;
  case "test":
    BASE_URL = "https://service-staging.agora.io/toolbox";
    REDIRECT_URI =
      "https://fullapp.oss-cn-beijing.aliyuncs.com/api-examples-internal/sso/index.html";
    break;
  case "prod":
    BASE_URL = "https://service.agora.io/toolbox";
    REDIRECT_URI = "https://webdemo.agora.io/sso/index.html";
    break;
}

/**
 *  name: menu name => zh/en text => /${name}/index.html
 */
let MENU_LIST = [
  {
    name: "settingMenu",
    data: [
      {
        name: "initializeSettings",
        url: `${ORIGIN_URL}/index.html`,
      },
    ],
  },
  {
    name: "quickMenu",
    data: [
      {
        name: "basicVoiceCall",
        url: `${ORIGIN_URL}/example/basic/basicVoiceCall/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/doc/rtc/javascript/get-started/quick-start",
        enDocUrl: "https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/basic/basicVoiceCall",
      },
      {
        name: "basicVideoCall",
        url: `${ORIGIN_URL}/example/basic/basicVideoCall/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/doc/rtc/javascript/get-started/quick-start",
        enDocUrl: "https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/basic/basicVideoCall",
      },
      {
        name: "basicLive",
        url: `${ORIGIN_URL}/example/basic/basicLive/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/doc/rtc/javascript/get-started/quick-start",
        enDocUrl: "https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/basic/basicLive",
      },
    ],
  },
  {
    name: "advancedMenu",
    data: [
      {
        name: "shareTheScreen",
        url: `${ORIGIN_URL}/example/advanced/shareTheScreen/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/doc/rtc/javascript/basic-features/screen-share",
        enDocUrl: "https://docs.agora.io/en/video-calling/develop/product-workflow?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/advanced/shareTheScreen",
      },
      {
        name: "testMediaDevices",
        url: `${ORIGIN_URL}/example/advanced/testMediaDevices/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/doc/rtc/javascript/basic-features/switch-device",
        enDocUrl:
          "https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/iagorartc.html#getcameras",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/advanced/testMediaDevices",
      },
      {
        name: "adjustVideoProfile",
        url: `${ORIGIN_URL}/example/advanced/adjustVideoProfile/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/doc/rtc/javascript/basic-features/video-profile",
        enDocUrl:
          "https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/icameravideotrack.html#setencoderconfiguration",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/advanced/adjustVideoProfile",
      },
      {
        name: "displayCallStats",
        url: `${ORIGIN_URL}/example/advanced/displayCallStats/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/in-call-quality",
        enDocUrl: "https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/networkquality.html",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/advanced/displayCallStats",
      },
      {
        name: "audioEffects",
        url: `${ORIGIN_URL}/example/advanced/audioEffects/index.html`,
        zhDocUrl:
          "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/audio-effect-mixing",
        enDocUrl:
          "https://docs.agora.io/en/video-calling/enable-features/audio-and-voice-effects?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/advanced/audioEffects",
      },
      {
        name: "joinMultipleChannel",
        url: `${ORIGIN_URL}/example/advanced/joinMultipleChannel/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/doc/rtc/javascript/basic-features/join-leave-channel",
        enDocUrl:
          "https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/iagorartcclient.html#join",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/advanced/joinMultipleChannel",
      },
      {
        name: "customVideoSource",
        url: `${ORIGIN_URL}/example/advanced/customVideoSource/index.html`,
        zhDocUrl:
          "https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/iagorartc#createCustomVideoTrack",
        enDocUrl:
          "https://docs.agora.io/en/video-calling/develop/custom-video-and-audio?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/advanced/customVideoSource",
      },
      {
        name: "selfRendering",
        url: `${ORIGIN_URL}/example/advanced/selfRendering/index.html`,
        zhDocUrl:
          "https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/ilocalvideotrack#getMediaStreamTrack",
        enDocUrl:
          "https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/ilocalvideotrack.html#getmediastreamtrack",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/advanced/selfRendering",
      },
      {
        name: "selfCapturing",
        url: `${ORIGIN_URL}/example/advanced/selfCapturing/index.html`,
        zhDocUrl:
          "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/custom-video-source",
        enDocUrl:
          "https://docs.agora.io/en/video-calling/develop/stream-raw-audio-and-video?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/advanced/selfCapturing",
      },
      {
        name: "screenshot",
        url: `${ORIGIN_URL}/example/advanced/screenshot/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/content-inspect",
        enDocUrl:
          "https://docs.agora.io/en/video-calling/enable-features/screenshot-upload?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/advanced/screenshot",
      },
      {
        name: "geoFencing",
        url: `${ORIGIN_URL}/example/advanced/geoFencing/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/region",
        enDocUrl: "https://docs.agora.io/en/video-calling/enable-features/geofencing?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/advanced/geoFencing",
      },
    ],
  },
  {
    name: "extensionMenu",
    data: [
      {
        name: "virtualBackground",
        url: `${ORIGIN_URL}/example/extension/virtualBackground/index.html`,
        zhDocUrl:
          "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/virtual-background",
        enDocUrl:
          "https://docs.agora.io/en/video-calling/enable-features/virtual-background?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/extension/virtualBackground",
      },
      {
        name: "beauty",
        url: `${ORIGIN_URL}/example/extension/beauty/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/image-enhancement",
        enDocUrl:
          "https://docs-beta.agora.io/en/video-calling/enable-features/image-enhancement?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/extension/beauty",
      },
      {
        name: "aiDenoiser",
        url: `${ORIGIN_URL}/example/extension/aiDenoiser/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/noise-reduction",
        enDocUrl:
          "https://docs.agora.io/en/video-calling/enable-features/ai-noise-suppression?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/extension/aiDenoiser",
      },
      {
        name: "superClarify",
        url: `${ORIGIN_URL}/example/extension/superClarify/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/super-clarity",
        enDocUrl:
          "https://docs-beta.agora.io/en/extensions-marketplace/develop/integrate/superclarity?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/extension/superClarify",
      },
      {
        name: "spatialAudio",
        url: `${ORIGIN_URL}/example/extension/spatialAudio/index.html`,
        zhDocUrl: "",
        enDocUrl:
          "https://docs.agora.io/en/video-calling/enable-features/spatial-audio?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/extension/spatialAudio",
      },
      {
        name: "vad",
        url: `${ORIGIN_URL}/example/extension/vad/index.html`,
        zhDocUrl:
          "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/voice-activity-detection",
        enDocUrl: "",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/extension/vad",
      },
      {
        name: "videoCompositor",
        url: `${ORIGIN_URL}/example/extension/videoCompositor/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/doc/rtc/javascript/advanced-features/video-compositing",
        enDocUrl:
          "https://docs-beta.agora.io/en/video-calling/enable-features/video-compositor?platform=web",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/extension/videoCompositor",
      },
    ],
  },
  {
    name: "othersMenu",
    data: [
      {
        name: "dualStream",
        url: `${ORIGIN_URL}/example/others/dualStream/index.html`,
        zhDocUrl:
          "https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/iagorartcclient#enableDualStream",
        enDocUrl:
          "https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/iagorartcclient.html#enabledualstream",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/others/dualStream",
      },
    ],
  },
  {
    name: "frameworkMenu",
    data: [
      {
        name: "vue",
        url: `${ORIGIN_URL}/example/framework/vue/index.html`,
        zhDocUrl: "",
        enDocUrl: "",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/framework/vue",
      },
      {
        name: "react",
        url: `${ORIGIN_URL}/example/framework/react/index.html`,
        zhDocUrl: "https://doc.shengwang.cn/api-ref/rtc/react/react-sdk/components",
        enDocUrl: "",
        githubUrl:
          "https://github.com/AgoraIO/API-Examples-Web/tree/main/src/example/framework/react",
      },
    ],
  },
];

if (AREA == "external") {
  // hide pushStreamToCDN item in othersMenu
  const othersMenu = MENU_LIST[4];
  if (othersMenu.name == "othersMenu") {
    othersMenu.data = MENU_LIST[4].data.filter((item) => item.name !== "pushStreamToCDN");
    // add stt case
    othersMenu.data.push({
      name: "stt",
      url: `https://stt-demo.agora.io/`,
      zhDocUrl: "",
      enDocUrl: "",
      githubUrl: "",
    });
  }
}

function __calcOriginUrl() {
  let { origin, href } = window.location;
  if (origin == "file://") {
    // open local file
    let reg = /file\S+\/src/g;
    return href.match(reg)[0];
  } else {
    switch (ENV) {
      case "dev":
        return origin;
      case "test":
        let TEST_PREFIX = AREA == "internal" ? INTERNAL_DEMO_PATH : EXTERNAL_DEMO_PATH;
        return `${origin}/${TEST_PREFIX}`;
      case "prod":
        return origin;
      default:
        return origin;
    }
  }
}
