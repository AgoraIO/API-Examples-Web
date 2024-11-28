let options = getOptionsFromLocal();
let modeList = [
  {
    label: "Off",
    detail: "Disable Cloud Proxy",
    value: "0",
  },
  {
    label: "UDP Mode",
    detail: "Enable Cloud Proxy via UDP protocol",
    value: "3",
  },
  {
    label: "TCP Mode",
    detail: "Enable Cloud Proxy via TCP/TLS port 443",
    value: "5",
  },
];
let proxyModeItem;
let projectList = [];

$(() => {
  initVersion();
  initModes();
  let appCertificateLink = "https://docs.agora.io/en/voice-calling/reference/glossary?platform=android#app-certificate";
  let appIdLink = "https://docs.agora.io/en/Agora%20Platform/terms?platform=All%20Platforms#a-nameappidaapp-id";
  if (AREA == "internal") {
    appCertificateLink = "https://docportal.shengwang.cn/cn/Agora%20Platform/get_appid_token?platform=All%20Platforms#%E8%8E%B7%E5%8F%96-app-%E8%AF%81%E4%B9%A6";
    appIdLink = "https://docportal.shengwang.cn/cn/Agora%20Platform/get_appid_token?platform=Android#%E8%8E%B7%E5%8F%96-app-id";
    $(".hidden").removeClass("hidden");
    initProjects();
  }

  $("#certificate-link").attr("href", appCertificateLink);
  $("#appid-link").attr("href", appIdLink);
  
});

$(".proxy-list").change(function (e) {
  changeModes(this.value);
});

$("#setup-btn").click(function (e) {
  options.appid = escapeHTML($("#appid").val());
  options.certificate = escapeHTML($("#certificate").val());
  options.proxyMode = proxyModeItem.value;
  setOptionsToLocal(options);
  message.success("Set successfully! Link to function page!");
  const href = getJumpBackUrl();
  window.location.href = href;
});

$("#project-id-select").change(function (e) {
  const appId = this.value;
  const project = projectList.find((project) => project.appId === appId);
  $("#appid").val(project.appId);
  $("#certificate").val(project.appSecret);
});

async function changeModes(label) {
  proxyModeItem = modeList.find((profile) => profile.label === label);
}

function initModes() {
  modeList.forEach((profile) => {
    $(".proxy-list").append(
      `<option value="${profile.label}" >${profile.label}: ${profile.detail}</option>`,
    );
  });
  proxyModeItem = modeList.find((profile) => profile.value === options.proxyMode) || modeList[0];
  $(".proxy-list").val(proxyModeItem.label);
}

function initVersion() {
  const version = AgoraRTC.VERSION;
  $("#version-text").text(`v${version}`);
}

async function initProjects() {
  const data = await agoraGetProjects();
  if (data.length) {
    projectList = data;
    projectList.forEach((project) => {
      $("#project-id-select").append(
        `<option value="${project.appId}" id="project-${project.appId}">${project.name}</option>`,
      );
    });
    $("#project-id-select").prop("selectedIndex", -1);
    if (!options.appid) {
      // default select the first project
      const firstProject = projectList[0];
      $("#project-id-select").val(firstProject.appId);
      $("#appid").val(firstProject.appId);
      $("#certificate").val(firstProject.appSecret);
    } else {
      const target = projectList.find((project) => project.appId === options.appid);
      if (target) {
        $("#project-id-select").val(options.appid);
      }
    }
  }
}
