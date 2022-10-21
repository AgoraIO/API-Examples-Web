// create Agora client
var client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
AgoraRTC.enableLogUpload();
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
  token: null
};
let statsInterval;

// you can find all the agora preset video profiles here https://docs.agora.io/en/Voice/API%20Reference/web_ng/globals.html#videoencoderconfigurationpreset
var videoProfiles = [{
  label: "360p_7",
  detail: "480×360, 15fps, 320Kbps",
  value: "360p_7"
}, {
  label: "360p_8",
  detail: "480×360, 30fps, 490Kbps",
  value: "360p_8"
}, {
  label: "480p_1",
  detail: "640×480, 15fps, 500Kbps",
  value: "480p_1"
}, {
  label: "480p_2",
  detail: "640×480, 30fps, 1000Kbps",
  value: "480p_2"
}, {
  label: "720p_1",
  detail: "1280×720, 15fps, 1130Kbps",
  value: "720p_1"
}, {
  label: "720p_2",
  detail: "1280×720, 30fps, 2000Kbps",
  value: "720p_2"
}, {
  label: "1080p_1",
  detail: "1920×1080, 15fps, 2080Kbps",
  value: "1080p_1"
}, {
  label: "1080p_2",
  detail: "1920×1080, 30fps, 3000Kbps",
  value: "1080p_2"
}, {
  label: "200×640",
  detail: "200×640, 30fps",
  value: {
    width: 200,
    height: 640,
    frameRate: 30
  }
} // custom video profile
];

var curVideoProfile;

// the demo can auto join channel with params in url
$(() => {
  initVideoProfiles();
  $(".profile-list").delegate("a", "click", function (e) {
    changeVideoProfile(this.getAttribute("label"));
  });
  var urlParams = new URL(location.href).searchParams;
  options.channel = urlParams.get("channel");
  options.uid = urlParams.get("uid");
  if (options.appid && options.channel) {
    $("#uid").val(options.uid);
    $("#channel").val(options.channel);
    $("#join-form").submit();
  }
});
$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#join").attr("disabled", true);
  try {
    options.channel = $("#channel").val();
    options.uid = Number($("#uid").val());
    options.appid = $("#appid").val();
    options.token = $("#token").val();
    await join();
    if (options.token) {
      $("#success-alert-with-token").css("display", "block");
    } else {
      $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}`);
      $("#success-alert").css("display", "block");
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
$("#finish").click(function (e) {
  const leaveDisabled = $("#leave").attr("disabled");
  if (!leaveDisabled && localTracks.videoTrack) {
    localTracks.videoTrack.play("local-player");
  }
});
$(".cam-list").delegate("a", "click", function (e) {
  switchCamera(this.text);
});
$(".mic-list").delegate("a", "click", function (e) {
  switchMicrophone(this.text);
});
$("#switch-devices").click(async function (e) {
  $("#switch-devices-modal").modal("show");
  if (!localTracks.audioTrack) {
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  }
  if (!localTracks.videoTrack) {
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
  }

  // play local track on device detect dialog
  localTracks.videoTrack.play("pre-local-player");
  localTracks.audioTrack.play();

  // get mics
  mics = await AgoraRTC.getMicrophones();
  const audioTrackLabel = localTracks.audioTrack.getTrackLabel();
  currentMic = mics.find(item => item.label === audioTrackLabel);
  $(".mic-input").val(currentMic.label);
  $(".mic-list").empty();
  mics.forEach(mic => {
    $(".mic-list").append(`<a class="dropdown-item" href="#">${mic.label}</a>`);
  });

  // get cameras
  cams = await AgoraRTC.getCameras();
  const videoTrackLabel = localTracks.videoTrack.getTrackLabel();
  currentCam = cams.find(item => item.label === videoTrackLabel);
  $(".cam-input").val(currentCam.label);
  $(".cam-list").empty();
  cams.forEach(cam => {
    $(".cam-list").append(`<a class="dropdown-item" href="#">${cam.label}</a>`);
  });
});
async function switchCamera(label) {
  currentCam = cams.find(cam => cam.label === label);
  $(".cam-input").val(currentCam.label);
  // switch device of local video track.
  await localTracks.videoTrack.setDevice(currentCam.deviceId);
}
async function switchMicrophone(label) {
  currentMic = mics.find(mic => mic.label === label);
  $(".mic-input").val(currentMic.label);
  // switch device of local audio track.
  await localTracks.audioTrack.setDevice(currentMic.deviceId);
}
function initVideoProfiles() {
  videoProfiles.forEach(profile => {
    $(".profile-list").append(`<a class="dropdown-item" label="${profile.label}" href="#">${profile.label}: ${profile.detail}</a>`);
  });
  curVideoProfile = videoProfiles.find(item => item.label == '480p_1');
  $(".profile-input").val(`${curVideoProfile.detail}`);
}
async function changeVideoProfile(label) {
  curVideoProfile = videoProfiles.find(profile => profile.label === label);
  $(".profile-input").val(`${curVideoProfile.detail}`);
  // change the local video track`s encoder configuration
  localTracks.videoTrack && (await localTracks.videoTrack.setEncoderConfiguration(curVideoProfile.value));
}
async function join() {
  // add event listener to play remote tracks when remote user publishs.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // join the channel
  options.uid = await client.join(options.appid, options.channel, options.token || null, options.uid || null);
  if (!localTracks.audioTrack) {
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  }
  if (!localTracks.videoTrack) {
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
  }
  // play local video track
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`localVideo(${options.uid})`);
  $("#joined-setup").css("display", "flex");

  // publish local tracks to channel
  await client.publish(Object.values(localTracks));
  console.log("publish success");
  initStats();
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
  destructStats();

  // remove remote users and player views
  remoteUsers = {};
  $("#remote-playerlist").html("");

  // leave the channel
  await client.leave();
  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  $("#joined-setup").css("display", "none");
  console.log("client leaves channel success");
}
async function subscribe(user, mediaType) {
  const uid = user.uid;
  // subscribe to a remote user
  await client.subscribe(user, mediaType);
  console.log("subscribe success");
  if (mediaType === 'video') {
    const player = $(`
      <div id="player-wrapper-${uid}">
        <p class="player-name">remoteUser(${uid})</p>
        <div class="player-with-stats">
          <div id="player-${uid}" class="player"></div>
          <div class="track-stats stats"></div>
        </div>
      </div>
    `);
    $("#remote-playerlist").append(player);
    user.videoTrack.play(`player-${uid}`);
  }
  if (mediaType === 'audio') {
    user.audioTrack.play();
  }
}
function handleUserPublished(user, mediaType) {
  const id = user.uid;
  remoteUsers[id] = user;
  subscribe(user, mediaType);
}
function handleUserUnpublished(user, mediaType) {
  if (mediaType === 'video') {
    const id = user.uid;
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
  }
}

// start collect and show stats information
function initStats() {
  statsInterval = setInterval(flushStats, 1000);
}

// stop collect and show stats information
function destructStats() {
  clearInterval(statsInterval);
  $("#session-stats").html("");
  $("#transport-stats").html("");
  $("#local-stats").html("");
}

// flush stats views
function flushStats() {
  // get the client stats message
  const clientStats = client.getRTCStats();
  const clientStatsList = [{
    description: "Number of users in channel",
    value: clientStats.UserCount,
    unit: ""
  }, {
    description: "Duration in channel",
    value: clientStats.Duration,
    unit: "s"
  }, {
    description: "Bit rate receiving",
    value: clientStats.RecvBitrate,
    unit: "bps"
  }, {
    description: "Bit rate being sent",
    value: clientStats.SendBitrate,
    unit: "bps"
  }, {
    description: "Total bytes received",
    value: clientStats.RecvBytes,
    unit: "bytes"
  }, {
    description: "Total bytes sent",
    value: clientStats.SendBytes,
    unit: "bytes"
  }, {
    description: "Outgoing available bandwidth",
    value: clientStats.OutgoingAvailableBandwidth.toFixed(3),
    unit: "kbps"
  }, {
    description: "RTT from SDK to SD-RTN access node",
    value: clientStats.RTT,
    unit: "ms"
  }];
  $("#client-stats").html(`
    ${clientStatsList.map(stat => `<p class="stats-row">${stat.description}: ${stat.value} ${stat.unit}</p>`).join("")}
  `);

  // get the local track stats message
  const localStats = {
    video: client.getLocalVideoStats(),
    audio: client.getLocalAudioStats()
  };
  const localStatsList = [{
    description: "Send audio bit rate",
    value: localStats.audio.sendBitrate,
    unit: "bps"
  }, {
    description: "Total audio bytes sent",
    value: localStats.audio.sendBytes,
    unit: "bytes"
  }, {
    description: "Total audio packets sent",
    value: localStats.audio.sendPackets,
    unit: ""
  }, {
    description: "Total audio packets loss",
    value: localStats.audio.sendPacketsLost,
    unit: ""
  }, {
    description: "Video capture resolution height",
    value: localStats.video.captureResolutionHeight,
    unit: ""
  }, {
    description: "Video capture resolution width",
    value: localStats.video.captureResolutionWidth,
    unit: ""
  }, {
    description: "Video send resolution height",
    value: localStats.video.sendResolutionHeight,
    unit: ""
  }, {
    description: "Video send resolution width",
    value: localStats.video.sendResolutionWidth,
    unit: ""
  }, {
    description: "video encode delay",
    value: Number(localStats.video.encodeDelay).toFixed(2),
    unit: "ms"
  }, {
    description: "Send video bit rate",
    value: localStats.video.sendBitrate,
    unit: "bps"
  }, {
    description: "Total video bytes sent",
    value: localStats.video.sendBytes,
    unit: "bytes"
  }, {
    description: "Total video packets sent",
    value: localStats.video.sendPackets,
    unit: ""
  }, {
    description: "Total video packets loss",
    value: localStats.video.sendPacketsLost,
    unit: ""
  }, {
    description: "Video duration",
    value: localStats.video.totalDuration,
    unit: "s"
  }, {
    description: "Total video freeze time",
    value: localStats.video.totalFreezeTime,
    unit: "s"
  }];
  $("#local-stats").html(`
    ${localStatsList.map(stat => `<p class="stats-row">${stat.description}: ${stat.value} ${stat.unit}</p>`).join("")}
  `);
  Object.keys(remoteUsers).forEach(uid => {
    // get the remote track stats message
    const remoteTracksStats = {
      video: client.getRemoteVideoStats()[uid],
      audio: client.getRemoteAudioStats()[uid]
    };
    const remoteTracksStatsList = [{
      description: "Delay of audio from sending to receiving",
      value: Number(remoteTracksStats.audio.receiveDelay).toFixed(2),
      unit: "ms"
    }, {
      description: "Delay of video from sending to receiving",
      value: Number(remoteTracksStats.video.receiveDelay).toFixed(2),
      unit: "ms"
    }, {
      description: "Total audio bytes received",
      value: remoteTracksStats.audio.receiveBytes,
      unit: "bytes"
    }, {
      description: "Total audio packets received",
      value: remoteTracksStats.audio.receivePackets,
      unit: ""
    }, {
      description: "Total audio packets loss",
      value: remoteTracksStats.audio.receivePacketsLost,
      unit: ""
    }, {
      description: "Total audio packets loss rate",
      value: Number(remoteTracksStats.audio.packetLossRate).toFixed(3),
      unit: "%"
    }, {
      description: "Video received resolution height",
      value: remoteTracksStats.video.receiveResolutionHeight,
      unit: ""
    }, {
      description: "Video received resolution width",
      value: remoteTracksStats.video.receiveResolutionWidth,
      unit: ""
    }, {
      description: "Receiving video bit rate",
      value: remoteTracksStats.video.receiveBitrate,
      unit: "bps"
    }, {
      description: "Total video bytes received",
      value: remoteTracksStats.video.receiveBytes,
      unit: "bytes"
    }, {
      description: "Total video packets received",
      value: remoteTracksStats.video.receivePackets,
      unit: ""
    }, {
      description: "Total video packets loss",
      value: remoteTracksStats.video.receivePacketsLost,
      unit: ""
    }, {
      description: "Total video packets loss rate",
      value: Number(remoteTracksStats.video.receivePacketsLost).toFixed(3),
      unit: "%"
    }, {
      description: "Video duration",
      value: remoteTracksStats.video.totalDuration,
      unit: "s"
    }, {
      description: "Total video freeze time",
      value: remoteTracksStats.video.totalFreezeTime,
      unit: "s"
    }, {
      description: "video freeze rate",
      value: Number(remoteTracksStats.video.freezeRate).toFixed(3),
      unit: "%"
    }];
    $(`#player-wrapper-${uid} .track-stats`).html(`
      ${remoteTracksStatsList.map(stat => `<p class="stats-row">${stat.description}: ${stat.value} ${stat.unit}</p>`).join("")}
    `);
  });
}