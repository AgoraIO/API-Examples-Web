AgoraRTC.enableLogUpload();

// create Agora client
var client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});

var uplinkClient;
var downlinkClient;
var upClientUid;
var downClientUid;

var localTracks = {
  videoTrack: null,
  audioTrack: null
};
var remoteUsers = {};
// Agora client options
var options = getOptionsFromLocal()
var mics = []; // all microphones devices you can use
var cams = []; // all cameras devices you can use
var currentMic; // the microphone you are using
var currentCam; // the camera you are using
let volumeAnimation;

// the demo can auto join channel with params in url
$(async () => {
  const deviceTestModel = new bootstrap.Modal('#model-device-test')
  deviceTestModel.show()
  document.getElementById('model-device-test').addEventListener('hidden.bs.modal', event => {
    cancelAnimationFrame(volumeAnimation);
  })

  $(".mic-list").change(function (e) {
    switchMicrophone(this.value);
  })

  $(".cam-list").change(function (e) {
    switchCamera(this.value);
  });

  await mediaDeviceTest();

});

$("#join-form").submit(async function (e) {
  e.preventDefault();
  //check the id of submitter to decide to join a channel or do netwwork test
  let submitterId = e.originalEvent ? e.originalEvent.submitter.attributes[0].value : "join";
  if (submitterId == "join") {
    $("#join").attr("disabled", true);
    $("#device-wrapper").css("display", "flex");
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
  } else if (submitterId == "startNetworkTest") {
    await goToNetworkTestPage();
  } else {
    // ...
  }
});

$("#network-test-finish").click(function (e) {
  if (!uplinkClient || !downlinkClient) {
    return;
  }
  uplinkClient.leave();
  downlinkClient.leave();
});

$("#leave").click(function (e) {
  leave();
});

function getRandomUid() {
  var min = 100000;
  var max = 10000000;
  return Math.floor(Math.random() * (max - min)) + min;
}

async function join() {
  // add event listener to play remote tracks when remote user publishs.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // start Proxy if needed
  const mode = Number(options.proxyMode)
  if (mode != 0 && !isNaN(mode)) {
    client.startProxyServer(mode);
  }

  // join a channel.
  options.uid = await client.join(options.appid, options.channel, options.token || null, options.uid || null);
  if (!localTracks.audioTrack || !localTracks.videoTrack) {
    [localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
      // create local tracks, using microphone and camera
      AgoraRTC.createMicrophoneAudioTrack({
        microphoneId: currentMic.deviceId,
        encoderConfig: "music_standard"
      }), AgoraRTC.createCameraVideoTrack({
        cameraId: currentCam.deviceId
      })]);
  }

  // play local video track
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`uid: ${options.uid}`);

  // publish local tracks to channel
  await client.publish(Object.values(localTracks));
  console.log("publish success");
}

async function mediaDeviceTest() {
  // create local tracks
  [localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
    // create local tracks, using microphone and camera
    AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "music_standard"
    }), AgoraRTC.createCameraVideoTrack()]);

  // play local track on device detect dialog
  localTracks.videoTrack.play("pre-local-player");
  // localTracks.audioTrack.play();

  volumeAnimation = requestAnimationFrame(setVolumeWave);

  await initDevices();
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


async function goToNetworkTestPage() {
  const networkTestModel = new bootstrap.Modal('#model-network-test')
  networkTestModel.show()

  document.getElementById('model-network-test').addEventListener('hidden.bs.modal', event => {
    handleNetworkTestModelHide()
  })

  await doNetworkTest();

}

async function handleNetworkTestModelHide() {
  if (uplinkClient) {
    await uplinkClient.leave();
    uplinkClient = null
    upClientUid = null
  }
  if (downlinkClient) {
    await downlinkClient.leave();
    downlinkClient = null
    downClientUid = null
  }
}

async function doNetworkTest() {
  uplinkClient = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8"
  });
  downlinkClient = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8"
  });

  let networkTestChannel = "network_test"
  upClientUid = getRandomUid();
  downClientUid = getRandomUid();
  upToken = await agoraGetAppData({
    uid: upClientUid,
    channel: networkTestChannel
  });
  downToken = await agoraGetAppData({
    uid: downClientUid,
    channel: networkTestChannel
  })

  // join network test channel.
  await uplinkClient.join(options.appid, networkTestChannel, upToken, upClientUid);
  await downlinkClient.join(options.appid, networkTestChannel, downToken, downClientUid);

  // uplinkClient publish local audio and video tracks
  await uplinkClient.publish(Object.values(localTracks));
  // downlinkClient subscribe uplinkClient's audio and video tracks
  downlinkClient.on("user-published", async (user, mediaType) => {
    await downlinkClient.subscribe(user, mediaType);
  });


  uplinkClient.on("network-quality", quality => {
    console.log("uplink network quality", quality.uplinkNetworkQuality);
    $("#uplink-network-quality").JSONView(JSON.stringify(quality.uplinkNetworkQuality));
    console.log("uplink audio stats", uplinkClient.getLocalAudioStats());
    $("#local-audio-stats").JSONView(JSON.stringify(uplinkClient.getLocalAudioStats()));
    console.log("uplink video stats", uplinkClient.getLocalVideoStats());
    $("#local-video-stats").JSONView(JSON.stringify(uplinkClient.getLocalVideoStats()));
  });

  downlinkClient.on("network-quality", quality => {
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
            <div id="player-${uid}" class="player">
                 <div class="player-name">uid: ${uid}</div>
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

// show real-time volume while adjusting device. 
function setVolumeWave() {
  volumeAnimation = requestAnimationFrame(setVolumeWave);
  if (localTracks.audioTrack) {
    $(".progress-bar").css("width", localTracks.audioTrack.getVolumeLevel() * 100 + "%");
    $(".progress-bar").attr("aria-valuenow", localTracks.audioTrack.getVolumeLevel() * 100);
  }
}
