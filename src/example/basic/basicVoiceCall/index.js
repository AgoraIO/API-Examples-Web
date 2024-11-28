AgoraRTC.enableLogUpload();

var client = null;

var localTracks = {
  audioTrack: null,
};

var remoteUsers = {};
var currentMic = null;
var mics = [];

var options = getOptionsFromLocal();

AgoraRTC.onAutoplayFailed = () => {
  alert("click to start autoplay!");
};

AgoraRTC.onMicrophoneChanged = async (changedDevice) => {
  // When plugging in a device, switch to a device that is newly plugged in.
  if (changedDevice.state === "ACTIVE") {
    localTracks.audioTrack.setDevice(changedDevice.device.deviceId);
    // Switch to an existing device when the current device is unplugged.
  } else if (changedDevice.device.label === localTracks.audioTrack.getTrackLabel()) {
    const oldMicrophones = await AgoraRTC.getMicrophones();
    oldMicrophones[0] && localTracks.audioTrack.setDevice(oldMicrophones[0].deviceId);
  }
};

$("#step-join").attr("disabled", true);
$("#step-publish").attr("disabled", true);
$("#step-subscribe").attr("disabled", true);
$("#step-leave").attr("disabled", true);
$("#remote-uid-select").val("");

$(".mic-list").change(function (e) {
  switchMicrophone(this.value);
});

$("#step-create").click(function (e) {
  createClient();
  addSuccessIcon("#step-create");
  message.success("Create client success!");
  $("#step-create").attr("disabled", true);
  $("#step-join").attr("disabled", false);
});

$("#step-join").click(async function (e) {
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
    addSuccessIcon("#step-join");
    message.success("Join channel success!");
    $("#step-join").attr("disabled", true);
    $("#step-publish").attr("disabled", false);
    $("#step-subscribe").attr("disabled", false);
    $("#step-leave").attr("disabled", false);
  } catch (error) {
    if (error.code === 'CAN_NOT_GET_GATEWAY_SERVER') {
      return message.error("Token parameter error,please check your token.");
    }
    message.error(error.message);
  }
});

$("#step-publish").click(async function (e) {
  await createTrackAndPublish();
  addSuccessIcon("#step-publish");
  message.success("Create tracks and publish success!");
  $("#step-publish").attr("disabled", true);
  await initDevices();
});

$("#step-subscribe").click(async function (e) {
  const uid = $("#remote-uid-select").val();
  let remoteUser = remoteUsers[uid];
  if (!remoteUser) {
    return message.error(`User:${uid} not found!`);
  }
  const checked = $("#audio-check").prop("checked");
  if (checked) {
    subscribe(remoteUser, "audio");
    message.success("Subscribe and play success!");
  }
});

$("#step-leave").click(async function (e) {
  await leave();
  message.success("Leave channel success!");
  removeAllIcons();
  $("#step-leave").attr("disabled", true);
  $("#step-subscribe").attr("disabled", true);
  $("#step-publish").attr("disabled", true);
  $("#step-create").attr("disabled", false);
  $("#remote-uid-select option:not([disabled])").remove();
  $("#remote-uid-select").val("");
  $(".player-name").html("");
});

function createClient() {
  // create Agora client
  client = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8",
  });
}

async function createTrackAndPublish() {
  // create local tracks
  localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
    encoderConfig: "music_standard",
  });
  // publish local tracks to channel
  await client.publish(Object.values(localTracks));
}

async function join() {
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // start Proxy if needed
  const mode = Number(options.proxyMode);
  if (mode != 0 && !isNaN(mode)) {
    client.startProxyServer(mode);
  }

  options.uid = await client.join(
    options.appid,
    options.channel,
    options.token || null,
    options.uid || null,
  );
}

async function initDevices() {
  mics = await AgoraRTC.getMicrophones();
  $(".mic-list").empty();
  mics.forEach((mic) => {
    const value = mic.label.split(" ").join("");
    $(".mic-list").append(`<option value=${value}>${mic.label}</option>`);
  });

  const audioTrackLabel = localTracks.audioTrack.getTrackLabel();
  currentMic = mics.find((item) => item.label === audioTrackLabel);
  $(".mic-list").val(currentMic.label.split(" ").join(""));
}

async function switchMicrophone(label) {
  currentMic = mics.find((mic) => mic.label.split(" ").join("") === label);
  // switch device of local audio track.
  await localTracks.audioTrack.setDevice(currentMic.deviceId);
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
  // clear remote players views
  $("#remote-audio").html("");

  // leave the channel
  await client.leave();
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
  if (mediaType === "audio") {
    user.audioTrack.play();
  }
  if (!$(`#player-wrapper-${uid}`).length) {
    const player = $(`<div id="player-wrapper-${uid}">uid: ${uid}</div>`);
    $("#remote-audio").append(player);
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
  if (!$(`#remote-option-${id}`).length) {
    $("#remote-uid-select").append(`<option value="${id}" id="remote-option-${id}">${id}</option>`);
    $("#remote-uid-select").val(id);
  }
}

/*
 * Remove the user specified from the channel in the local interface.
 *
 * @param  {string} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to remove.
 */
function handleUserUnpublished(user, mediaType) {
  if (mediaType === "audio") {
    const id = user.uid;
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
    $(`#remote-option-${id}`).remove();
  }
}
