// create Agora client
var client = AgoraRTC.createClient({
  mode: "live",
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
  token: null,
  liveStreamingUrl: null,
  role: "host" // host or audience
};

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
  options.liveStreamingUrl = urlParams.get("liveStreamingUrl");
  options.uid = urlParams.get("uid");
  if (options.appid && options.channel) {
    $("#uid").val(options.uid);
    $("#channel").val(options.channel);
    $("#live-streaming-url").val(options.liveStreamingUrl);
    $("#join-form").submit();
  }
  $("#live-streaming-stop").click(function (event) {
    event.preventDefault();
    // Stop the push according to the cdn address.
    // Note that this is an asynchronous method, please ensure that the asynchronous operation is completed before proceeding to the next step.
    client.stopLiveStreaming(options.liveStreamingUrl).then(() => {
      console.log("stop live streaming success");
      $("#live-streaming-stop").attr("disabled", true);
      $("#live-streaming-start").attr("disabled", false);
    });
  });
  $("#live-streaming-start").click(async function (event) {
    event.preventDefault();
    // We recommend that only one host has the authority to control the push in a live.
    // Please set your own permission control.

    // When the live broadcast is in progress, the authorized host starts the push stream by clicking button
    options.liveStreamingUrl && (await liveTranscoding());
  });
});
$("#host-join").click(function (e) {
  // In this demo, the user role is host by default
  options.role = "host";
});
$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#host-join").attr("disabled", true);
  try {
    options.liveStreamingUrl = $("#live-streaming-url").val();
    options.channel = $("#channel").val();
    options.uid = Number($("#uid").val());
    options.appid = $("#appid").val();
    options.token = $("#token").val();
    await join();
    if (options.role === "host") {
      $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}&liveStreamingUrl=${options.liveStreamingUrl}`);
      if (options.token) {
        $("#success-alert-with-token").css("display", "block");
      } else {
        $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}&liveStreamingUrl=${options.liveStreamingUrl}`);
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
  // create Agora client
  client.setClientRole(options.role);

  // add event listener to play remote tracks when remote user publishs.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // join the channel
  options.uid = await client.join(options.appid, options.channel, options.token || null, options.uid || null);
  if (options.role === "host") {
    // create local audio and video tracks
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
    // play local video track
    localTracks.videoTrack.play("local-player");
    $("#local-player-name").text(`localTrack(${options.uid})`);
    $("#joined-setup").css("display", "flex");
    // publish local tracks to channel
    await client.publish(Object.values(localTracks));
    console.log("publish success");
    $("#live-streaming-start").attr("disabled", false);
  }
}
async function liveTranscoding() {
  if (!options.liveStreamingUrl) {
    console.error('you should input liveStreaming URL');
    return;
  }
  // Set the order of local and remote hosts according to your preferences
  const transcodingUsers = [options.uid, ...Object.keys(remoteUsers)].map((uid, index) => {
    // Set the size according to your idea
    const width = 600;
    const height = 700;
    return {
      // Set the location coordinates according to your ideas
      x: 30 * (index % 2) + index * width + 10,
      y: 10,
      width,
      height,
      zOrder: 0,
      alpha: 1.0,
      // The uid below should be consistent with the uid entered in AgoraRTCClient.join
      // uid must be an integer number
      uid: Number(uid)
    };
  });

  //  configuration of pushing stream to cdn
  const liveTranscodingConfig = {
    width: 1280,
    height: 720,
    videoBitrate: 400,
    videoFrameRate: 15,
    audioSampleRate: 32000,
    audioBitrate: 48,
    audioChannels: 1,
    videoGop: 30,
    videoCodecProfile: 100,
    userCount: 2,
    // userConfigExtraInfo: {},
    backgroundColor: 0x0000EE,
    watermark: {
      url: "https://agoraio-community.github.io/AgoraWebSDK-NG/img/logo.png",
      x: 20,
      y: 20,
      width: 200,
      height: 200
    },
    backgroundImage: {
      url: "https://agoraio-community.github.io/AgoraWebSDK-NG/img/sd_rtn.jpg",
      x: 100,
      y: 100,
      width: 1080,
      height: 520
    },
    transcodingUsers
  };
  try {
    // To monitor errors in the middle of the push, please refer to the API documentation for the list of error codes
    client.on("live-streaming-error", (url, err) => {
      console.error("url", url, "live streaming error!", err.code);
    });
    // set live streaming transcode configuration,
    await client.setLiveTranscoding(liveTranscodingConfig);
    // then start live streaming.
    await client.startLiveStreaming(options.liveStreamingUrl, true);
    $("#live-streaming-stop").attr("disabled", false);
    $("#live-streaming-start").attr("disabled", true);
  } catch (error) {
    console.error('live streaming error:', error.message);
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
  $("#leave").attr("disabled", true);
  $("#live-streaming-stop").attr("disabled", true);
  $("#live-streaming-start").attr("disabled", true);
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
        <div id="player-${uid}" class="player"></div>
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