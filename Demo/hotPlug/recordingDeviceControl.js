// create Agora client
var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
var uplinkClient;
var downlinkClient;
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

var mics = []; // all microphones devices you can use
var cams = []; // all cameras devices you can use
var currentMic; // the microphone you are using
var currentCam; // the camera you are using

let volumeAnimation;

// the demo can auto join channel with params in url
$(async () => {
  changeHotPlugState(true);
  $("#media-device-test").modal("show");
  $(".cam-list").delegate("a", "click", function (e) {
    switchCamera(this.text);
  });
  $(".mic-list").delegate("a", "click", function (e) {
    switchMicrophone(this.text);
  });

  var urlParams = new URL(location.href).searchParams;
  options.appid = urlParams.get("appid");
  options.channel = urlParams.get("channel");
  options.token = urlParams.get("token");
  options.uid = urlParams.get("uid");
  await mediaDeviceTest();
  volumeAnimation = requestAnimationFrame(setVolumeWave);
})

$("#join-form").submit(async function (e) {
  e.preventDefault();

  //check the id of submitter to decide to join a channel or do netwwork test
  let submitterId = e.originalEvent.submitter.attributes[0].value;

  if (submitterId == "join") {

    $("#join").attr("disabled", true);
    $("#device-wrapper").css("display", "flex");
    try {
      options.appid = $("#appid").val();
      options.token = $("#token").val();
      options.channel = $("#channel").val();
      options.uid = Number($("#uid").val());
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

  } else if (submitterId == "startNetworkTest") {
    options.appid = $("#appid").val();
    options.token = $("#token").val();
    options.channel = $("#channel").val();
    options.uid = Number($("#uid").val());
    await goToNetworkTestPage();
  } else {
  }


})

$("#network-test-finish").click(function (e) {
  if (!uplinkClient || !downlinkClient) {
    return;
  }
  uplinkClient.leave();
  downlinkClient.leave();
})


$("#leave").click(function (e) {
  leave();
})

$("#media-device-test").on("hidden.bs.modal", function (e) {
  cancelAnimationFrame(volumeAnimation);
  if (options.appid && options.channel) {
    $("#appid").val(options.appid);
    $("#token").val(options.token);
    $("#channel").val(options.channel);
    $("#join-form").submit();
  }
})


async function join() {
  // add event listener to play remote tracks when remote user publishs.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // join a channel.
  options.uid = await client.join(options.appid, options.channel, options.token || null, options.uid || null);

  if (!localTracks.audioTrack || !localTracks.videoTrack) {
    [localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
      // create local tracks, using microphone and camera
      AgoraRTC.createMicrophoneAudioTrack({ microphoneId: currentMic.deviceId }),
      AgoraRTC.createCameraVideoTrack({ cameraId: currentCam.deviceId })
    ]);
  }

  // play local video track
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`localVideo(${options.uid})`);

  // publish local tracks to channel
  await client.publish(Object.values(localTracks));
  console.log("publish success");
}

async function mediaDeviceTest() {
  // create local tracks
  [localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
    // create local tracks, using microphone and camera
    AgoraRTC.createMicrophoneAudioTrack(),
    // Video has a default parameter that may differ from the browser's default options，So I assign a value {}
    AgoraRTC.createCameraVideoTrack({})
  ]);

  // play local track on device detect dialog
  localTracks.videoTrack.play("pre-local-player");
  // localTracks.audioTrack.play();

  // get mics
  mics = await AgoraRTC.getMicrophones();
  currentMic = mics[0];
  $(".mic-input").val(currentMic.label);
  mics.forEach(mic => {
    $(".mic-list").append(`<a class="dropdown-item" id=${mic.deviceId} href="#">${mic.label}</a>`);
  });

  // get cameras
  cams = await AgoraRTC.getCameras();
  currentCam = cams[0];
  $(".cam-input").val(currentCam.label);
  cams.forEach(cam => {
    $(".cam-list").append(`<a class="dropdown-item" id=${cam.deviceId} href="#">${cam.label}</a>`);
  });
}

async function goToNetworkTestPage() {
  $("#network-test").modal("show");
  await doNetworkTest();
}

async function doNetworkTest() {
  uplinkClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  downlinkClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  if (!localTracks.audioTrack || !localTracks.videoTrack) {
    [localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
      // create local tracks, using microphone and camera
      AgoraRTC.createMicrophoneAudioTrack({ microphoneId: currentMic.deviceId }),
      AgoraRTC.createCameraVideoTrack({ cameraId: currentCam.deviceId })
    ]);
  }

  // join network test channel.
  let upClientUid = await uplinkClient.join(options.appid, options.channel, options.token || null, null);
  await downlinkClient.join(options.appid, options.channel, options.token || null, null);
  // publish local audio and video tracks
  await uplinkClient.publish(Object.values(localTracks));

  downlinkClient.on("user-published", async (user, mediaType) => {
    await downlinkClient.subscribe(user, mediaType);
  })

  //whether to play or not??????

  // 获取上行网络质量
  uplinkClient.on("network-quality", (quality) => {
    console.log("uplink network quality", quality.uplinkNetworkQuality);
    $("#uplink-network-quality").JSONView(JSON.stringify(quality.uplinkNetworkQuality));
    console.log("uplink audio stats", uplinkClient.getLocalAudioStats());
    $("#local-audio-stats").JSONView(JSON.stringify(uplinkClient.getLocalAudioStats()));
    console.log("uplink video stats", uplinkClient.getLocalVideoStats());
    $("#local-video-stats").JSONView(JSON.stringify(uplinkClient.getLocalVideoStats()));
  });

  // 获取下行网络质量
  downlinkClient.on("network-quality", (quality) => {
    console.log("downlink network quality", quality.downlinkNetworkQuality);
    $("#downlink-network-quality").JSONView(JSON.stringify(quality.downlinkNetworkQuality));
    console.log("downlink audio stats", downlinkClient.getRemoteAudioStats()[upClientUid]);
    $("#remote-audio-stats").JSONView(JSON.stringify(downlinkClient.getRemoteAudioStats()[upClientUid]));
    console.log("downlink video stats", downlinkClient.getRemoteVideoStats()[upClientUid]);
    $("#remote-video-stats").JSONView(JSON.stringify(downlinkClient.getRemoteVideoStats()[upClientUid]));
  });
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

  localTracks = {};

  // remove remote users and player views
  remoteUsers = {};
  $("#remote-playerlist").html("");

  // leave the channel
  await client.leave();

  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  $("#device-wrapper").css("display", "none");
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

// show real-time volume while adjusting device. 
function setVolumeWave() {
  volumeAnimation = requestAnimationFrame(setVolumeWave);
  $(".progress-bar").css("width", localTracks.audioTrack.getVolumeLevel() * 100 + "%")
  $(".progress-bar").attr("aria-valuenow", localTracks.audioTrack.getVolumeLevel() * 100)
}

async function changeHotPlugState(flag) {
  if (!flag) {
    console.log('close hot plug');
    AgoraRTC.onMicrophoneChanged = undefined;
    AgoraRTC.onCameraChanged = undefined;
    return;
  }
  console.log('open hot plug');
  AgoraRTC.onMicrophoneChanged = async (changedDevice) => {
    // 插入设备时，切换到新插入的设备。
    if (changedDevice.state === "ACTIVE") {
      localTracks.audioTrack.setDevice(changedDevice.device.deviceId);
      mics.push(changedDevice.device);
      $(".mic-list").append(`<a class="dropdown-item" id=${changedDevice.device.deviceId} href="#">${changedDevice.device.label}</a>`);
      currentMic = changedDevice.device;
      $(".mic-input").val(currentMic.label);
      // 拔出设备为当前设备时，切换到一个已有的设备。
    } else if (changedDevice.device.label === localTracks.audioTrack.getTrackLabel()) {
      const oldMicrophones = await AgoraRTC.getMicrophones();
      oldMicrophones[0] && localTracks.audioTrack.setDevice(oldMicrophones[0].deviceId);
      mics = oldMicrophones;
      $(".mic-list").children(`#${changedDevice.device.deviceId}`).remove();
      currentMic = oldMicrophones[0];
      $(".mic-input").val(oldMicrophones[0].label);
    }
  }

  AgoraRTC.onCameraChanged = async (changedDevice) => {
    cams = await AgoraRTC.getCameras();
    // 插入设备时，切换到新插入的设备。
    if (changedDevice.state === "ACTIVE") {
      localTracks.videoTrack.setDevice(changedDevice.device.label);
      cams.push(changedDevice.device);
      $(".cam-list").append(`<a class="dropdown-item" id=${changedDevice.device.deviceId} href="#">${changedDevice.device.label}</a>`);
      currentCam = changedDevice.device;
      $(".cam-input").val(currentCam.label);
      // 拔出设备为当前设备时，切换到一个已有的设备。
    } else if (changedDevice.device.label === localTracks.videoTrack.getTrackLabel()) {
      const oldCameras = await AgoraRTC.getCameras();
      oldCameras[0] && localTracks.videoTrack.setDevice(oldCameras[0].deviceId);
      cams = oldCameras;
      $(".cam-list").children(`#${changedDevice.device.deviceId}`).remove();
      currentCam = oldCameras[0];
      $(".cam-input").val(oldCameras[0].label);
    }
  }
}

async function resetMedia(type) {
  if (type === 'video') {
    // get cameras
    cams = await AgoraRTC.getCameras();
    $(".cam-list").empty();
    cams.forEach(cam => {
      $(".cam-list").append(`<a class="dropdown-item" href="#">${cam.label}</a>`);
    });
    $(".cam-input").val(currentCam.label);
  } else {
    // get mics
    mics = await AgoraRTC.getMicrophones();
    $(".mic-list").empty();
    mics.forEach(mic => {
      $(".mic-list").append(`<a class="dropdown-item" href="#">${mic.label}</a>`);
    });
    $(".mic-input").val(currentMic.label);
  }
}
