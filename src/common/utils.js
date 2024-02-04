let _inspectIntervalId = null

// private functions
const __alert = (message, type) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close alert-btn" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
  ].join('')

  document.body.append(wrapper)

  setTimeout(() => {
    $(".alert-btn").click()
  }, 3000)
}

function __queryUrlParams() {
  var urlParams = new URL(location.href).searchParams;
  if (urlParams.size) {
    let appid = urlParams.get("appid");
    let channel = urlParams.get("channel");
    let uid = urlParams.get("uid");
    let certificate = urlParams.get("certificate");
    if (appid) {
      setOptionsToLocal({ appid })
    }
    if (certificate) {
      setOptionsToLocal({ certificate })
    }
    if (channel) {
      setOptionsToLocal({ channel })
      $("#channel").val(channel);
    }
    if (uid) {
      setOptionsToLocal({ uid })
      $("#uid").val(uid);
    }
  } else {
    const options = getOptionsFromLocal()
    const { appid, channel, certificate } = options
    appid && $("#appid").val(appid);
    certificate && $("#certificate").val(certificate);
    channel && $("#channel").val(channel);
  }
}

function __checkLocalOptions() {
  if (window.location.href != SETUP_PAGE_URL) {
    let options = getOptionsFromLocal()
    if (!options.appid) {
      alert("Need to set up appID and appCertificate!")
      window.location.href = SETUP_PAGE_URL
    }
  }
}

function __addAppInfoUI() {
  const options = getOptionsFromLocal()
  let appid = options.appid || ""
  let certificate = options.certificate || ""
  let language = getLanguage()
  const href = window.location.href
  let reg = /\/(\w+)\/index\.html$/
  const result = href.match(reg) || []
  let name = result[1]
  const target = DOCUMENT_LIST.find(item => item?.name == name)
  let documentUrl = ""
  if (target) {
    if (language == "zh-CN" || language == "zh") {
      documentUrl = target.zhUrl
    } else {
      documentUrl = target.enUrl
    }
  }
  if (!documentUrl) {
    if (language == "zh-CN" || language == "zh") {
      documentUrl = "https://doc.shengwang.cn/doc/rtc/javascript/get-started/quick-start"
    } else {
      documentUrl = "https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=web"
    }
  }

  var $newElement = $(`<div class="info-wrapper">
    <div class="info-text">AppID: ${appid}</div> 
    <div class="info-text">AppCertificate: ${certificate}</div> 
    <a class="info-change i18n" id="jump-setup" href=${SETUP_PAGE_URL} name="clickChange">Click to change</a> 
    <div class="info-text">
      <span class="i18n" name="needHelp">If you need help, please jump to the official website</span>
      <a class="info-change i18n" id="jump-setup" href=${documentUrl} name="agoraDocs" target="__blank">Agora Docs</a> 
    </div> 
  </div>`);


  $("#app-info").append($newElement)
  $("#jump-setup").click(() => {
    const href = window.location.href
    localStorage.setItem('__setupJumpHref', href)
  })

}

function __checkExperienceTime() {
  if (AREA != "internal") {
    return
  }
  const experience = sessionStorage.getItem("__experience")
  const language = getLanguage()

  if (!experience) {
    sessionStorage.setItem("__experience", true)
    let msg = ""
    if (language == "en") {
      msg = "【This website is a test product and is only for functional experience. Please do not use it for commercial purposes. The single use time should not exceed 20 minutes. If it expires, the experience will be automatically exited.】"
    } else {
      msg = "【本网站为测试产品，仅用于功能体验，请勿商用。单次使用时长不超过20分钟，过时将自动退出体验。为配合相关部门监管要求，严谨色情、辱骂、暴恐、涉政等违规内容。警惕电信诈骗，请勿在使用过程中进行贷款申请和网银转账！国家反诈专用号码：96110】"
    }
    alert(msg)
  }

  setTimeout(() => {
    let msg = ""
    if (language == "en") {
      msg = "【Your experience time has exceeded 20 minutes. Due to system restrictions, your experience has been automatically exited. If you have any questions or need further assistance, please contact technical support and we will solve the problem for you as soon as possible.】"
    } else {
      msg = "【您的体验时间已超过20分钟，由于系统限制，已自动退出您的体验。如有任何疑问或需要进一步帮助，请联系技术支持，我们将尽快为您解决问题。】"
    }
    alert(msg)
    window.location.reload()
  }, 1000 * 60 * 20)
}

function __ImageDataToBase64(imageData) {
  let canvas = document.createElement('canvas')
  let ctx = canvas.getContext('2d')
  canvas.width = imageData.width
  canvas.height = imageData.height
  ctx.putImageData(imageData, 0, 0)
  let dataURL = canvas.toDataURL()
  const arr = dataURL.split('base64,') || []
  if (arr[1]) {
    return arr[1]
  }
  return arr[0]
}

function __genUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// public functions
const message = {
  success: (message) => __alert(message, 'success'),
  error: (message) => __alert(message, 'danger'),
  warning: (message) => __alert(message, 'warning'),
  info: (message) => __alert(message, 'info'),
}

function deepCopy(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  let clone = Array.isArray(obj) ? [] : {};

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepCopy(obj[key]);
    }
  }

  return clone;
}

function setOptionsToLocal(option) {
  option = deepCopy(option)
  if (option.token) {
    option.token = ""
  }
  let localOptions = getOptionsFromLocal()
  option = { ...localOptions, ...option }
  localStorage.setItem('__options', JSON.stringify(option))
}

function getOptionsFromLocal() {
  return JSON.parse(localStorage.getItem('__options')) || {}
}

function getLanguage() {
  const DEFAULT_LANGUAGE = "en";
  const options = getOptionsFromLocal()

  if (options && options.language) {
    return options.language
  }

  if (navigator.language) {
    if (navigator.language == "zh-CN" || navigator.language == "zh") {
      return navigator.language
    }
  }

  return DEFAULT_LANGUAGE
}

function escapeHTML(unsafeText) {
  const elem = document.createElement('div');
  elem.innerText = unsafeText;
  return elem.innerHTML;
}

async function agoraGetAppData(config) {
  const { uid, channel } = config
  const { appid, certificate } = getOptionsFromLocal()
  const url = 'https://toolbox.bj2.agoralab.co/v2/token/generate';
  const data = {
    appId: appid,
    appCertificate: certificate,
    channelName: channel,
    expire: 7200,
    src: "web",
    types: [1, 2],
    uid: uid
  };
  let resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  resp = await resp.json() || {}
  return resp?.data?.token || null
}

function addSuccessIcon(query) {
  let node = $(query)[0]
  var element = $(`
    <div class="success-svg" style="display: flex;align-items:center;margin-left:5px">
    <svg class="ft-green-tick" xmlns="http://www.w3.org/2000/svg" height="15" width="15"
      viewBox="0 0 48 48" aria-hidden="true">
      <circle class="circle" fill="#5bb543" cx="24" cy="24" r="22"></circle>
      <path class="tick" fill="none" stroke="#FFF" stroke-width="6" stroke-linecap="round"
        stroke-linejoin="round" stroke-miterlimit="10" d="M14 27l5.917 4.917L34 17"></path>
    </svg>
  </div>
  `);

  if (!node.querySelector(".success-svg")) {
    node.append(element[0])
  }
}

function removeAllIcons() {
  let nodes = $(".success-svg")
  nodes.each((index, item) => {
    item.remove()
  })
}

// tip: just use in demo code, don't use in production
async function agoraContentInspect(localVideoTrack) {
  if (AREA != "internal") {
    // content inspect only for internal area
    return
  }
  if (!localVideoTrack) {
    return
  }
  if (_inspectIntervalId) {
    clearInterval(_inspectIntervalId)
  }
  _inspectIntervalId = setInterval(async () => {
    if (!localVideoTrack.isPlaying) {
      clearInterval(_inspectIntervalId)
      return
    }
    let ImageData = localVideoTrack.getCurrentFrameData();
    const base64Str = __ImageDataToBase64(ImageData)
    let url = `${BASE_URL}/v1/moderation/image`
    const options = getOptionsFromLocal()
    let resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: base64Str,
        appId: options.appid,
        channelName: options.channel,
        src: "web",
        traceId: __genUUID(),
        userId: options.uid + ""
      })
    }).then(resp => resp.json())
    if (resp.code == 0) {
      console.log(`[agora content inspect] ${new Date()}`, resp.data)
    } else {
      console.error(resp)
    }
  }, 1000 * 10)

}

// exec functions
__queryUrlParams()
__checkLocalOptions()
__addAppInfoUI()
__checkExperienceTime()

