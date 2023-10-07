const extension = new SuperClarityExtension();
AgoraRTC.registerExtensions([extension]);
const processorMap = new Map();
var client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
var localTracks = {
  videoTrack: null,
  audioTrack: null
};
var remoteUsers = {};
var options = {
  appid: null,
  channel: null,
  uid: null,
  token: null
};
var superClarifyOpen = true;
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
}];
var curVideoProfile;

/*
 * When this page is called with parameters in the URL, this procedure
 * attempts to join a Video Call channel using those parameters.
 */
$(() => {
  initVideoProfiles();
  $(".profile-list").delegate("a", "click", function (e) {
    changeVideoProfile(this.getAttribute("label"));
  });
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
$("#switch-super-clarify").on("change", function (e) {
  if ($(this).is(":checked")) {
    toggleSuperClarify(true);
  } else {
    toggleSuperClarify(false);
  }
});

/*
 * When a user clicks Join or Leave in the HTML form, this procedure gathers the information
 * entered in the form and calls join asynchronously. The UI is updated to match the options entered
 * by the user.
 */
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
$('#agora-collapse').on('show.bs.collapse	', function () {
  initDevices();
});
$(".cam-list").delegate("a", "click", function (e) {
  switchCamera(this.text);
});
async function toggleSuperClarify(val) {
  superClarifyOpen = val;
  const uids = Object.keys(remoteUsers);
  for (let uid of uids) {
    const user = remoteUsers[uid];
    let processor = processorMap.get(uid);
    if (!processor) {
      processor = extension.createProcessor();
      processorMap.set(uid, processor);
      user.videoTrack.pipe(processor).pipe(user.videoTrack.processorDestination);
    }
    if (superClarifyOpen) {
      await processor.enable();
    } else {
      await processor.disable();
    }
  }
}
async function toggleSuperClarifyOne(uid) {
  uid = uid.toString();
  const user = remoteUsers[uid];
  let processor = processorMap.get(uid);
  if (!processor) {
    processor = extension.createProcessor();
    processorMap.set(uid, processor);
    user.videoTrack.pipe(processor).pipe(user.videoTrack.processorDestination);
  }
  if (superClarifyOpen) {
    await processor.enable();
  } else {
    await processor.disable();
  }
}
async function changeVideoProfile(label) {
  curVideoProfile = videoProfiles.find(profile => profile.label === label);
  $(".profile-input").val(`${curVideoProfile.detail}`);
  // change the local video track`s encoder configuration
  localTracks.videoTrack && (await localTracks.videoTrack.setEncoderConfiguration(curVideoProfile.value));
}
async function initDevices() {
  if (!localTracks.audioTrack) {
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "music_standard"
    });
  }
  if (!localTracks.videoTrack) {
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: curVideoProfile.value
    });
  }
  // get cameras
  cams = await AgoraRTC.getCameras();
  const videoTrackLabel = localTracks.videoTrack.getTrackLabel();
  currentCam = cams.find(item => item.label === videoTrackLabel);
  $(".cam-input").val(currentCam.label);
  $(".cam-list").empty();
  cams.forEach(cam => {
    $(".cam-list").append(`<a class="dropdown-item" href="#">${cam.label}</a>`);
  });
}
async function switchCamera(label) {
  currentCam = cams.find(cam => cam.label === label);
  $(".cam-input").val(currentCam.label);
  // switch device of local video track.
  await localTracks.videoTrack.setDevice(currentCam.deviceId);
}
function initVideoProfiles() {
  videoProfiles.forEach(profile => {
    $(".profile-list").append(`<a class="dropdown-item" label="${profile.label}" href="#">${profile.label}: ${profile.detail}</a>`);
  });
  curVideoProfile = videoProfiles.find(item => item.label == '720p_1');
  $(".profile-input").val(`${curVideoProfile.detail}`);
}

/*
 * Join a channel, then create local video and audio tracks and publish them to the channel.
 */
async function join() {
  // Add an event listener to play remote tracks when remote user publishes.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);
  options.uid = await client.join(options.appid, options.channel, options.token || null, options.uid || null);
  if (!localTracks.audioTrack) {
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "music_standard"
    });
  }
  if (!localTracks.videoTrack) {
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: curVideoProfile.value
    });
  }
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`localVideo(${options.uid})`);
  $("#joined-setup").css("display", "flex");
  await client.publish(Object.values(localTracks));
  console.log("publish success");
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

  // Remove remote users and player views.
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

/*
 * Add the local use to a remote channel.
 *
 * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
 * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
 */
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
    toggleSuperClarifyOne(uid);
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