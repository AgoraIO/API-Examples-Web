let options = getOptionsFromLocal()

var modeList = [{
  label: "Off",
  detail: "Disable Cloud Proxy",
  value: "0"
}, {
  label: "UDP Mode",
  detail: "Enable Cloud Proxy via UDP protocol",
  value: "3"
}, {
  label: "TCP Mode",
  detail: "Enable Cloud Proxy via TCP/TLS port 443",
  value: "5"
}];

var proxyModeItem;

$(() => {
  initVersion();
  initModes();
});

$(".proxy-list").change(function (e) {
  changeModes(this.value);
})


$("#setup-btn").click(function (e) {
  options.appid = escapeHTML($("#appid").val())
  options.certificate = escapeHTML($("#certificate").val())
  options.proxyMode = proxyModeItem.value
  setOptionsToLocal(options)
  message.success("Set successfully! Link to function page!")
  autoJump()
})


async function changeModes(label) {
  proxyModeItem = modeList.find(profile => profile.label === label);
}

function initModes() {
  modeList.forEach(profile => {
    $(".proxy-list").append(`<option value="${profile.label}" >${profile.label}: ${profile.detail}</option>`);
  });
  proxyModeItem = modeList.find(profile => profile.value === options.proxyMode) || modeList[0];
  $(".proxy-list").val(proxyModeItem.label);
}

function initVersion() {
  const version = AgoraRTC.VERSION
  $("#version-text").text(`v${version}`)
}


function autoJump() {
  let href = localStorage.getItem("__setupJumpHref")
  if (href) {
    localStorage.removeItem("__setupJumpHref")
  } else {
    href = `${ORIGIN_URL}/example/basic/basicVoiceCall/index.html`
  }
  window.location.href = href
}





