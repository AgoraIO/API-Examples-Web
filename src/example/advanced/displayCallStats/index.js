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
var options = getOptionsFromLocal()
let statsInterval;


$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#join").attr("disabled", true);
  try {
    options.channel = $("#channel").val();
    options.uid = Number($("#uid").val());
    options.token = await agoraGetAppData(options);
    await join();
    setOptionsToLocal(options)
    message.success("join channel success!");
  } catch (error) {
    console.error(error);
    message.error(error.message)
  } finally {
    $("#leave").attr("disabled", false);
  }
});

$("#leave").click(function (e) {
  leave();
});

async function join() {
  // add event listener to play remote tracks when remote user publishs.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // start Proxy if needed
  const mode = Number(options.proxyMode)
  if (mode != 0 && !isNaN(mode)) {
    client.startProxyServer(mode);
  }

  // join the channel
  options.uid = await client.join(options.appid, options.channel, options.token || null, options.uid || null);
  if (!localTracks.audioTrack) {
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "music_standard"
    });
  }
  if (!localTracks.videoTrack) {
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
  }
  // play local video track
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`uid: ${options.uid}`);

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
        <div class="player-with-stats">
          <div id="player-${uid}" class="player">
            <div class="player-name">uid: ${uid}</div>
          </div>
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
  $("#client-stats").html("");
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
    <div>client-stats:</div>
    ${clientStatsList.map(stat => `<div class="stats-row">${stat.description}: ${stat.value} ${stat.unit}</div>`).join("")}
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
    ${localStatsList.map(stat => `<div class="stats-row">${stat.description}: ${stat.value} ${stat.unit}</div>`).join("")}
  `);
  Object.keys(remoteUsers).forEach(uid => {
    // get the remote track stats message
    const remoteTracksStats = {
      video: client.getRemoteVideoStats()[uid],
      audio: client.getRemoteAudioStats()[uid]
    };
    const remoteTracksStatsList = [{
      description: "Delay of audio from sending to receiving",
      value: Number(remoteTracksStats.audio?.receiveDelay).toFixed(2),
      unit: "ms"
    }, {
      description: "Delay of video from sending to receiving",
      value: Number(remoteTracksStats.video?.receiveDelay).toFixed(2),
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
      ${remoteTracksStatsList.map(stat => `<div class="stats-row">${stat.description}: ${stat.value} ${stat.unit}</div>`).join("")}
    `);
  });
}
