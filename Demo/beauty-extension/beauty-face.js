// create Agora client
var client = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});
const extension = new BeautyExtension();
AgoraRTC.registerExtensions([extension]);
let processor = extension.createProcessor();

let videoSelect = document.querySelector('select#videoSource');
AgoraRTC.getDevices().then(devices => {
  const videoDevices = devices.filter(function(device){
    return device.kind === "videoinput";
  });
  for (let i = 0; i !== videoDevices.length; ++i) {
    const deviceInfo = videoDevices[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
    videoSelect.appendChild(option);
  }
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
  token: null
};
var beautyEnabled = false;
var virtualBackgroundInstance;

// the demo can auto join channel with params in url
$(() => {})

document.getElementById('start').onclick = async () => {
  localTracks.audioTrack = localTracks.audioTrack ||
                           await AgoraRTC.createMicrophoneAudioTrack();
  localTracks.videoTrack = localTracks.videoTrack ||
                           await AgoraRTC.createCameraVideoTrack({cameraId: videoSelect.value, encoderConfig: '720p_2'});
  
  // play local video track
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`localVideo`);

  if (processor && localTracks.videoTrack) {
    localTracks.videoTrack.pipe(processor).pipe(localTracks.videoTrack.processorDestination);
  }
}

$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#join").attr("disabled", true);
  try {
    options.appid = $("#appid").val();
    options.token = $("#token").val();
    options.channel = $("#channel").val();
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
    $("#publish").attr("disabled", false);
  }
})

$("#leave").click(function (e) {
  leave();
})

$("#publish").click(async function (e) {
  await publish();
})

async function join() {

  // add event listener to play remote tracks when remote user publishs.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // join a channel and create local tracks, we can use Promise.all to run them concurrently
  options.uid = await client.join(options.appid, options.channel, options.token || null),
  $("#local-player-name").text(`localVideo(${options.uid})`);
  console.log("publish success");
}

async function leave() {
  // remove remote users and player views
  remoteUsers = {};
  $("#remote-playerlist").html("");

  // leave the channel
  await client.leave();

  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  $("#publish").attr("disabled", true);
  console.log("client leaves channel success");
}

async function publish() {
  // publish local tracks to channel
  await client.publish(Object.values(localTracks));
  console.log("publish success");
  $("#publish").attr("disabled", true);
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

function handleUserUnpublished(user) {
  const id = user.uid;
  delete remoteUsers[id];
  $(`#player-wrapper-${id}`).remove();
}

let softenRange = document.getElementById('softenlevel');
softenRange.onchange = function(e) {
  let smoothnessLevel = parseInt(softenRange.value) / 100;
  softenRange.nextElementSibling.innerHTML = smoothnessLevel;
  processor.setOptions({smoothnessLevel: smoothnessLevel});
}

let sharpRange = document.getElementById('sharplevel');
sharpRange.onchange = function(e) {
  let sharpnessLevel = parseInt(sharpRange.value) / 100;
  sharpRange.nextElementSibling.innerHTML = sharpnessLevel;
  processor.setOptions({sharpnessLevel: sharpnessLevel});
}

let whiteRange = document.getElementById('whitelevel');
whiteRange.onchange = function(e) {
  let lighteningLevel = parseInt(whiteRange.value) / 100;
  whiteRange.nextElementSibling.innerHTML = lighteningLevel;
  processor.setOptions({lighteningLevel: lighteningLevel});
}

let rednessRange = document.getElementById('rednesslevel');
rednessRange.onchange = function(e) {
  let rednessLevel = parseInt(rednessRange.value) / 100;
  rednessRange.nextElementSibling.innerHTML = rednessLevel;
  processor.setOptions({rednessLevel: rednessLevel});
}

let contrastRange = document.getElementById('contrastlevel');
contrastRange.onchange = function(e) {
  let contrastLevel = parseInt(contrastRange.value);
  processor.setOptions({lighteningContrastLevel: contrastLevel});
}

let enableBtn = document.getElementById('enable');
enableBtn.onclick = async function(e) {
  if (processor && localTracks.videoTrack) {
    await processor.enable();
    beautyEnabled = true;
    document.getElementById('enable').disabled = true;
    document.getElementById('disable').disabled = false;
  }
}

let disableBtn = document.getElementById('disable');
disableBtn.onclick = async function(e) {
  if (processor && localTracks.videoTrack) {
    await processor.disable();
    beautyEnabled = false;
    document.getElementById('enable').disabled = false;
    document.getElementById('disable').disabled = true;
  }
}