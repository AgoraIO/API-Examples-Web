AgoraRTC.enableLogUpload();

// create Agora client
var client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
var localTracks = {
  videoTrack: null,
  audioTrack: null,
};
var remoteUsers = {};
// Agora client options
var localOptions = getOptionsFromLocal();
var options = {
  ...localOptions,
  role: "audience", // host or audience
  audienceLatency: 2,
};

var localTrackState = {
  videoTrackMuted: false,
  videoTrackEnabled: true,
  audioTrackMuted: false,
  audioTrackEnabled: true,
};

var TRACK_STATE = {
  SET_MUTED: "setMuted",
  SET_ENABLED: "setEnabled",
};

$("#video-set-muted").click(function (e) {
  if (localTrackState.videoTrackMuted) {
    setMute("video", false);
    $(this).text("SetMuted false");
  } else {
    setMute("video", true);
    $(this).text("SetMuted true");
  }
});

$("#video-set-enabled").click(function (e) {
  if (localTrackState.videoTrackEnabled) {
    setEnabled("video", false);
    $(this).text("SetEnabled false");
  } else {
    setEnabled("video", true);
    $(this).text("SetEnabled true");
  }
});

$("#audio-set-muted").click(function (e) {
  if (localTrackState.audioTrackMuted) {
    setMute("audio", false);
    $(this).text("SetMuted false");
  } else {
    setMute("audio", true);
    $(this).text("SetMuted true");
  }
});

$("#audio-set-enabled").click(function (e) {
  if (localTrackState.audioTrackEnabled) {
    setEnabled("audio", false);
    $(this).text("SetEnabled false");
  } else {
    setEnabled("audio", true);
    $(this).text("SetEnabled true");
  }
});

$("#host-join").click(function (e) {
  options.role = "host";
});

$("#lowLatency").click(function (e) {
  options.role = "audience";
  options.audienceLatency = 1;
  $("#join-form").submit();
});

$("#ultraLowLatency").click(function (e) {
  options.role = "audience";
  options.audienceLatency = 2;
  $("#join-form").submit();
});

$("#join-form").submit(async function (e) {
  e.preventDefault();
  try {
    options.channel = $("#channel").val();
    options.uid = Number($("#uid").val());
    const token = $("#token").val();
    if (token) {
      options.token = token;
    } else {
      options.token = await agoraGetAppData(options);
    }
    await join();
    setOptionsToLocal(options);
    message.success("join channel success!");
    $("#host-join").attr("disabled", true);
    $("#audience-join").attr("disabled", true);
    if (options.role == "host") {
      $("#video-set-muted").attr("disabled", false);
      $("#video-set-enabled").attr("disabled", false);
      $("#audio-set-muted").attr("disabled", false);
      $("#audio-set-enabled").attr("disabled", false);
    }
  } catch (error) {
    if (error.code === 'CAN_NOT_GET_GATEWAY_SERVER') {
      return message.error("Token parameter error,please check your token.");
    }
    console.error(error);
    message.error(error.message);
  } finally {
    $("#leave").attr("disabled", false);
  }
});

$("#leave").click(function (e) {
  leave();
  $("#video-set-muted").attr("disabled", true);
  $("#video-set-enabled").attr("disabled", true);
  $("#audio-set-muted").attr("disabled", true);
  $("#audio-set-enabled").attr("disabled", true);
});

$("#doubt").click(function (e) {
  let language = getLanguage();
  let url = "";
  if (language == "zh" || language == "zh-CN") {
    url = "https://doc.shengwang.cn/faq/integration-issues/diff-setenabled-setmuted";
  } else {
    url =
      "https://docs.agora.io/en/video-calling/develop/product-workflow?platform=web#setenabled-and-setmuted";
  }
  window.open(url, "_blank");
});

async function join() {
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // start Proxy if needed
  const mode = Number(options.proxyMode);
  if (mode != 0 && !isNaN(mode)) {
    client.startProxyServer(mode);
  }

  if (options.role === "audience") {
    client.setClientRole(options.role, { level: options.audienceLatency });
    // add event listener to play remote tracks when remote user publishs.
  } else {
    client.setClientRole(options.role);
  }

  // join the channel
  options.uid = await client.join(
    options.appid,
    options.channel,
    options.token || null,
    options.uid || null,
  );

  if (options.role === "host") {
    // create local audio and video tracks
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "music_standard",
    });

    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();

    // play local video track
    localTracks.videoTrack.play("local-player");
    $("#local-player-name").text(`uid: ${options.uid}`);

    // publish local tracks to channel
    await client.publish(Object.values(localTracks));
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
}

async function subscribe(user, mediaType) {
  const uid = user.uid;
  // subscribe to a remote user
  await client.subscribe(user, mediaType);
  if (mediaType === "video") {
    const player = $(`
     <div id="player-wrapper-${uid}">
            <div id="player-${uid}" class="player">
                 <div class="remote-player-name">uid: ${uid}</div>
            </div>
     </div>
    `);
    $("#remote-playerlist").append(player);
    user.videoTrack.play(`player-${uid}`);
  }
  if (mediaType === "audio") {
    user.audioTrack.play();
  }
}

function handleUserPublished(user, mediaType) {
  const id = user.uid;
  remoteUsers[id] = user;
  subscribe(user, mediaType);
}

function handleUserUnpublished(user, mediaType) {
  //print in the console log for debugging
  if (mediaType === "video") {
    const id = user.uid;
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
  }
}

async function setMute(type, state) {
  try {
    if (type == "audio") {
      await localTracks.audioTrack.setMuted(state);
      localTrackState.audioTrackMuted = state;
    } else if (type == "video") {
      await localTracks.videoTrack.setMuted(state);
      localTrackState.videoTrackMuted = state;
    }
  } catch (err) {
    console.error(err);
    message.error(err.message);
  }
}

async function setEnabled(type, state) {
  try {
    if (type == "audio") {
      await localTracks.audioTrack.setEnabled(state);
      localTrackState.audioTrackEnabled = state;
    } else if (type == "video") {
      await localTracks.videoTrack.setEnabled(state);
      localTrackState.videoTrackEnabled = state;
    }
  } catch (err) {
    console.error(err);
    message.error(err.message);
  }
}
