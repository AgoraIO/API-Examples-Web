// create Agora client
var client = AgoraRTC.createClient({
  mode: "live",
  codec: "vp8"
});
var localTracks = {
  videoTrack: null,
  audioTrack: null
};
var remoteUsers = {};
// Agora client options
var options = {
  appid: null,
  channel: null,
  uid: null,
  token: null,
  role: "audience" // host or audience
};

var gatewayAddress = "https://api.agora.io";
let curSentenceIndex = 0;
let taskId = '';
let tokenName = '';

// the demo can auto join channel with params in url
$(() => {
  var urlParams = new URL(location.href).searchParams;
  options.appid = urlParams.get("appid");
  options.channel = urlParams.get("channel");
  options.token = urlParams.get("token");
  options.uid = urlParams.get("uid");
  if (options.appid && options.channel) {
    $("#uid").val(options.uid);
    $("#appid").val(options.appid);
    $("#token").val(options.token);
    $("#channel").val(options.channel);
    $("#join-form").submit();
  }
});
$("#host-join").click(function (e) {
  options.role = "host";
});
$("#audience-join").click(function (e) {
  options.role = "audience";
});
$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#host-join").attr("disabled", true);
  $("#audience-join").attr("disabled", true);
  try {
    options.channel = $("#channel").val();
    options.uid = Number($("#uid").val());
    options.appid = $("#appid").val();
    options.token = $("#token").val();
    await join();
    if (options.role === "host") {
      $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}`);
      if (options.token) {
        $("#success-alert-with-token").css("display", "block");
      } else {
        $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}`);
        $("#success-alert").css("display", "block");
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    $("#leave").attr("disabled", false);
  }
});
$("#leave").click(function (e) {
  leave();
});
$("#start-trans").click(async function (e) {
  $("#start-trans").attr("disabled", true);
  $("#stop-trans").attr("disabled", false);
  $("#stt-trans").css("display", "block");
  await startTranscription();
});
$("#stop-trans").click(function (e) {
  stopTranscription();
  $("#start-trans").attr("disabled", false);
  $("#stop-trans").attr("disabled", true);
  $("#stt-trans").css("display", "none");
  $("#stt-trans .content").html("");
});
async function join() {
  client.setClientRole(options.role);
  client.on("stream-message", handleStreammessage);
  options.uid = await client.join(options.appid, options.channel, options.token || null, options.uid || null);
  if (!localTracks.audioTrack) {
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "music_standard"
    });
  }
  if (options.role === "host") {
    await client.publish(localTracks.audioTrack);
  }
}
async function leave() {
  for (trackName in localTracks) {
    var track = localTracks[trackName];
    if (track) {
      track.stop();
      track.close();
      localTracks[trackName] = undefined;
    }
  }

  // remove remote users and player views
  remoteUsers = {};
  $("#remote-playerlist").html("");

  // leave the channel
  await client.leave();
  $("#local-player-name").text("");
  $("#host-join").attr("disabled", false);
  $("#audience-join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  $("#joined-setup").css("display", "none");
  console.log("client leaves channel success");
}
function GetAuthorization() {
  const customerKey = $("#key").val();
  const customerSecret = $("#secret").val();
  if (!customerKey || !customerSecret) {
    return "";
  }
  const authorization = `Basic ` + btoa(`${customerKey}:${customerSecret}`);
  return authorization;
}
function handleStreammessage(msgUid, data) {
  const msg = $protobufRoot.lookup("Text").decode(data) || {};
  console.log("handleStreammessage", msg);
  const {
    words,
    data_type,
    trans = [],
    duration_ms,
    uid
  } = msg;
  if (data_type == "translate") {
    if (trans.length) {
      trans.forEach(item => {
        let text = "";
        item?.texts.forEach(v => text += v);
        console.log(text);
      });
    }
  } else {
    if (words.length) {
      let isFinal = false;
      let text = "";
      words.forEach(item => {
        if (item.isFinal) {
          isFinal = true;
        }
        text += item?.text;
      });
      addTransItem(uid, text);
      if (isFinal) {
        curSentenceIndex++;
      }
    }
  }
}
async function acquireToken() {
  const url = `${gatewayAddress}/v1/projects/${options.appid}/rtsc/speech-to-text/builderTokens`;
  const data = {
    instanceId: options.channel
  };
  let res = await fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": GetAuthorization()
    },
    body: JSON.stringify(data)
  });
  if (res.status == 200) {
    res = await res.json();
    return res;
  } else {
    console.error(res.status, res);
    throw new Error(res);
  }
}
async function startTranscription() {
  const appId = options.appid;
  const channel = options.channel;
  if (!appId || !channel) {
    $("#danger-alert").css("display", "block");
    return;
  }
  const authorization = GetAuthorization();
  if (!authorization) {
    throw new Error("key or secret is empty");
  }
  const data = await acquireToken();
  tokenName = data.tokenName;
  const url = `${gatewayAddress}/v1/projects/${options.appid}/rtsc/speech-to-text/tasks?builderToken=${tokenName}`;
  const pullUid = $("#puller-uid").val();
  const pullToken = $("#puller-token").val();
  const pushUid = $("#pusher-uid").val();
  const pushToken = $("#pusher-token").val();
  const language = $("#language").val();
  const body = JSON.stringify({
    "audio": {
      "subscribeSource": "AGORARTC",
      "agoraRtcConfig": {
        "channelName": options.channel,
        "uid": pullUid,
        "token": pullToken,
        "channelType": "LIVE_TYPE",
        "subscribeConfig": {
          "subscribeMode": "CHANNEL_MODE"
        },
        "maxIdleTime": 10
      }
    },
    "config": {
      "features": ["RECOGNIZE"],
      "recognizeConfig": {
        "language": language,
        "model": "Model",
        "connectionTimeout": 60,
        "output": {
          "destinations": ["AgoraRTCDataStream"],
          "agoraRTCDataStream": {
            "channelName": options.channel,
            "uid": pushUid,
            "token": pushToken
          }
        }
      }
    }
  });
  let res = await fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": authorization
    },
    body: body
  });
  res = await res.json();
  taskId = res.taskId;
}
async function stopTranscription() {
  if (!taskId) {
    return;
  }
  const url = `${gatewayAddress}/v1/projects/${options.appid}/rtsc/speech-to-text/tasks/${taskId}?builderToken=${tokenName}`;
  await fetch(url, {
    method: 'DELETE',
    headers: {
      "Content-Type": "application/json",
      "Authorization": GetAuthorization()
    }
  });
  taskId = null;
}
function addTransItem(uid, msg) {
  $("#stt-trans").css("display", "block");
  if ($(`#sentence-${curSentenceIndex}`)[0]) {
    $(`#sentence-${curSentenceIndex} .msg`).html(msg);
  } else {
    const $item = $(`<div class="item" id="sentence-${curSentenceIndex}">
    <span class="uid">${uid}</span>:
    <span class="msg">${msg}</span>
  </div>`);
    $("#stt-trans .content").append($item);
  }
}