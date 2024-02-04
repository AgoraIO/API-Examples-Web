AgoraRTC.enableLogUpload();

var client;
var localTracks = {
  videoTrack: null,
  audioTrack: null
};
var currentMic = null
var currentCam = null
var mics = []
var cams = []
var remoteUsers = {};
var options = getOptionsFromLocal()
var curVideoProfile;

AgoraRTC.onAutoplayFailed = () => {
  alert("click to start autoplay!");
};

AgoraRTC.onMicrophoneChanged = async changedDevice => {
  // When plugging in a device, switch to a device that is newly plugged in.
  if (changedDevice.state === "ACTIVE") {
    localTracks.audioTrack.setDevice(changedDevice.device.deviceId);
    // Switch to an existing device when the current device is unplugged.
  } else if (changedDevice.device.label === localTracks.audioTrack.getTrackLabel()) {
    const oldMicrophones = await AgoraRTC.getMicrophones();
    oldMicrophones[0] && localTracks.audioTrack.setDevice(oldMicrophones[0].deviceId);
  }
};

AgoraRTC.onCameraChanged = async changedDevice => {
  // When plugging in a device, switch to a device that is newly plugged in.
  if (changedDevice.state === "ACTIVE") {
    localTracks.videoTrack.setDevice(changedDevice.device.deviceId);
    // Switch to an existing device when the current device is unplugged.
  } else if (changedDevice.device.label === localTracks.videoTrack.getTrackLabel()) {
    const oldCameras = await AgoraRTC.getCameras();
    oldCameras[0] && localTracks.videoTrack.setDevice(oldCameras[0].deviceId);
  }
};


$("#step-join").attr("disabled", true);
$("#step-publish").attr("disabled", true);
$("#step-subscribe").attr("disabled", true);
$("#step-leave").attr("disabled", true);

$(".mic-list").change(function (e) {
  switchMicrophone(this.value);
})

$(".cam-list").change(function (e) {
  switchCamera(this.value);
})


$("#step-create").click(function (e) {
  createClient()
  addSuccessIcon("#step-create")
  message.success("Create client success!");
  $("#step-create").attr("disabled", true);
  $("#step-join").attr("disabled", false);
})


$("#step-join").click(async function (e) {
  try {
    options.channel = $("#channel").val();
    options.uid = Number($("#uid").val());
    options.token = await agoraGetAppData(options);
    await join()
    setOptionsToLocal(options)
    addSuccessIcon("#step-join")
    message.success("Join channel success!");
    $("#step-join").attr("disabled", true);
    $("#step-publish").attr("disabled", false);
    $("#step-subscribe").attr("disabled", false);
    $("#step-leave").attr("disabled", false);
    $("#mirror-check").attr("disabled", false);
  } catch (error) {
    message.error(error.message)
    console.error(error);
  }
})

$("#step-publish").click(async function (e) {
  await createTrackAndPublish()
  addSuccessIcon("#step-publish")
  message.success("Create tracks and publish success!");
  initDevices()
  $("#step-publish").attr("disabled", true);
  $("#mirror-check").attr("disabled", true)
  // agora content inspect start  
  agoraContentInspect(localTracks.videoTrack)
  // agora content inspect end ;
})

$("#step-subscribe").click(function (e) {
  const uid = $("#remote-uid").val()
  const user = remoteUsers[uid]
  if (!user) {
    return message.error(`User:${uid} not found!`)
  }
  const audioCheck = $("#audio-check").prop("checked")
  const videoCheck = $("#video-check").prop("checked")
  if (audioCheck) {
    subscribe(user, "audio");
  }
  if (videoCheck) {
    subscribe(user, "video");
  }
  addSuccessIcon("#step-subscribe")
  message.success("Subscribe and Play success!");
})

$("#step-leave").click(async function (e) {
  await leave()
  message.success("Leave channel success!");
  removeAllIcons()
  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  $("#step-leave").attr("disabled", true);
  $("#step-join").attr("disabled", true);
  $("#step-publish").attr("disabled", true);
  $("#step-subscribe").attr("disabled", true);
  $("#mirror-check").attr("disabled", true);
  $("#step-create").attr("disabled", false);
  $("#remote-uid").val("")
  $("#remote-playerlist").html("");
})


function createClient() {
  // create Agora client
  client = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8"
  });
}

async function createTrackAndPublish() {
  // create local audio and video tracks
  const tracks = await Promise.all([
    AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "music_standard"
    }),
    AgoraRTC.createCameraVideoTrack()
  ])
  localTracks.audioTrack = tracks[0]
  localTracks.videoTrack = tracks[1]
  // play local video track
  localTracks.videoTrack.play("local-player", {
    mirror: $("#mirror-check").prop("checked")
  });
  $("#local-player-name").text(`uid: ${options.uid}`);
  // publish local tracks to channel
  await client.publish(Object.values(localTracks));
}

/*
 * Join a channel, then create local video and audio tracks and publish them to the channel.
 */
async function join() {
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // start Proxy if needed
  const mode = Number(options.proxyMode)
  if (mode != 0 && !isNaN(mode)) {
    client.startProxyServer(mode);
  }

  options.uid = await client.join(options.appid, options.channel, options.token || null, options.uid || null)
}

/*
 * Stop all local and remote tracks then leave the channel.
 */
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
  // leave the channel
  await client.leave();
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
  if (mediaType === "video") {
    if ($(`#player-${uid}`).length) {
      return
    }
    const player = $(`
     <div id="player-wrapper-${uid}">
            <div id="player-${uid}" class="player">
                 <div class="player-name">uid: ${uid}</div>
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

/*
 * Add a user who has subscribed to the live channel to the local interface.
 *
 * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
 * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
 */
function handleUserPublished(user, mediaType) {
  const id = user.uid;
  remoteUsers[id] = user;
  $("#remote-uid").val(id)
}

/*
 * Remove the user specified from the channel in the local interface.
 *
 * @param  {string} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to remove.
 */
function handleUserUnpublished(user, mediaType) {
  if (mediaType === "video") {
    const id = user.uid;
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
  }
}


async function initDevices() {
  // get mics
  mics = await AgoraRTC.getMicrophones();
  $(".mic-list").empty();
  mics.forEach(mic => {
    const value = mic.label.split(" ").join("")
    $(".mic-list").append(`<option value=${value}>${mic.label}</option>`);
  });

  const audioTrackLabel = localTracks.audioTrack.getTrackLabel();
  currentMic = mics.find(item => item.label === audioTrackLabel);
  $(".mic-list").val(audioTrackLabel.split(" ").join(""));

  // get cameras
  cams = await AgoraRTC.getCameras();
  $(".cam-list").empty();
  cams.forEach(cam => {
    const value = cam.label.split(" ").join("")
    $(".cam-list").append(`<option value=${value}>${cam.label}</option>`);
  });

  const videoTrackLabel = localTracks.videoTrack.getTrackLabel();
  currentCam = cams.find(item => item.label === videoTrackLabel);
  $(".cam-list").val(videoTrackLabel.split(" ").join(""));
}

async function switchCamera(label) {
  currentCam = cams.find(cam => cam.label.split(" ").join("") === label);
  // switch device of local video track.
  await localTracks.videoTrack.setDevice(currentCam.deviceId);
}

async function switchMicrophone(label) {
  currentMic = mics.find(mic => mic.label.split(" ").join("") === label);
  // switch device of local audio track.
  await localTracks.audioTrack.setDevice(currentMic.deviceId);
}


