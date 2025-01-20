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
  initDocUrl();
});



const saveConfig = () => {
  options.appid = escapeHTML($("#appid").val().trim());
  options.certificate = escapeHTML($("#certificate").val().trim());
  options.proxyMode = proxyModeItem.value;
  setOptionsToLocal(options);
}



const checkAppId = () => {
  const projectAppIdType = $("#project-id-select").val();
  if(projectAppIdType !== 'custom_settings'){
    return  true
  }
  // check appid
  const appId = $("#appid").val().trim();
  if (!appId) {
    alert("Need to set up appID and appCertificate!");
    return;
  }
  const isValidate = /^[A-Za-z0-9]{32}$/.test(appId);
  if (!isValidate) {
    alert("AppID verification failed, please enter correct information and try again!");
  }
  return isValidate;

}
$(document).ready(function () {
  $(document).off('click', '.sidebar-bottom').on('click', '.sidebar-bottom', function (e) {
    if ($(e.target).closest('.sidebar-bottom').length) {
      saveConfig();
    }

    const target = $(e.target).attr('data-href');
    if (!target) {
      return;
    }
    const isValidate = checkAppId();
    if (!isValidate) {
      return;
    }
    window.location.href = $(e.target).attr('data-href');
  });
});


$(".proxy-list").change(function (e) {
  changeModes(this.value);
  saveConfig();
});

$("#setup-btn").click(function (e) {
  saveConfig();
  const isValidate = checkAppId();
  if (!isValidate) {
    return;
  }  
  message.success("Set successfully! Link to function page!");
  const href = getJumpBackUrl();
  window.location.href = href;
});

$("#appid").change(function (e) {
  saveConfig();
})

$("#certificate").change(function (e) {
  saveConfig();
});

$("#project-id-select").change(function (e) {
  const appId = this.value;
  if (appId === "custom_settings") {
    $("#appid").val("");
    $("#certificate").val("");
    $("#appid").prop("disabled", false);
    $("#certificate").prop("disabled", false);
    return;
  } else {
    $("#appid").prop("disabled", true);
    $("#certificate").prop("disabled", true);
  }
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

function appendCustomOption() {
  $("#project-id-select").append(
    `<option value="custom_settings" id="project-custom-settings">Custom</option>`,
  )
}
function initDocUrl() {
  $("#certificate-link").attr("href", appCertificateLink);
  $("#appid-link").attr("href", appIdLink);
  $("#proxy-link").attr("href", proxyLink);

  $('.sidebar-bottom a').each(function () {
    const href = $(this).attr('href');
    $(this).attr('data-href', href);
    $(this).removeAttr('href');
  });
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      $('.sidebar-bottom a').each(function () {
        const href = $(this).attr('href');
        $(this).attr('data-href', href);
        $(this).removeAttr('href');
      });
      if (mutation.type === 'childList') {
        const certificateLinkNode = document.getElementById('certificate-link');
        const appidLinkNode = document.getElementById('appid-link');
        const proxyLinkNode = document.getElementById('proxy-link');
        if (certificateLinkNode) {
          certificateLinkNode.setAttribute('href', appCertificateLink);
        }
        if (appidLinkNode) {
          appidLinkNode.setAttribute('href', appIdLink);
        }
        if (proxyLinkNode) {
          proxyLinkNode.setAttribute('href', proxyLink);
        }
        if (certificateLinkNode && appidLinkNode && proxyLinkNode) {
          observer.disconnect();
        }
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

let reGetProjects = false;
