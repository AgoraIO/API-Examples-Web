import { SpatialAudioExtension, } from "./index.esm.js";

AgoraRTC.setLogLevel(1);

const extension = new SpatialAudioExtension();
AgoraRTC.registerExtensions([extension]);

var options = {
  appid: null,
  channel: null,
  uid: null,
  token: null
};
var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
var localUserTrack = {
  videoTrack: null,
  audioTrack: null
};

var remoteUsers = [];
var remoteUsersSound = [
  // './resources/1.mp3',
  // './resources/2.mp3',
  './resources/3.mp3',
  // './resources/4.mp3',
];

var localPlayerSound = [
  // './resources/1.mp3',
  './resources/2.mp3',
  // './resources/3.mp3',
  // './resources/4.mp3',
];
var localPlayTracks = [];
var localPlayProcessors = [];

async function localPlayerStart() {
  for (let i = 0; i < localPlayerSound.length; i++) {
    setTimeout(async () => {
      try {
        const track = await AgoraRTC.createBufferSourceAudioTrack({ source: localPlayerSound[i] });
        localPlayTracks.push(track);
        track.startProcessAudioBuffer({ loop: true });
        const processor = extension.createProcessor();
        localPlayProcessors.push(processor);
        track.pipe(processor).pipe(track.processorDestination);
        track.play();
      } catch (error) {
        console.error(`localPlayerSound[${i}] with buffersource track ${localPlayerSound[i]} play fail: ${error}`);
      }
    }, 500 * i);
  }
}
function localPlayerStop() {
  for (let i = 0; i < localPlayerSound.length; i++) {
    localPlayTracks[i].stop();
  }
  localPlayTracks = [];
}

var remoteUserClients = [];
async function mockRemoteUserJoin() {
  for (let i = 0; i < remoteUsersSound.length; i++) {
    setTimeout(async () => {
      try {
        const track = await AgoraRTC.createBufferSourceAudioTrack({ source: remoteUsersSound[i] });
        track.startProcessAudioBuffer({ loop: true });
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        remoteUserClients[i] = client;
        await client.join(options.appid, options.channel, options.token || null);
        await client.publish(track);
      } catch (error) {
        console.error(`remoteUsersSound[${i}] with buffersource track ${remoteUsersSound[i]} join and publish fail: ${error}`);
      }
    }, 500 * i);
  }
}
async function mockRemoteUserLeave() {
  for (let i = 0; i < remoteUsersSound.length; i++) {
    try {
      await remoteUserClients[i].leave();
      console.log(`speaker[${i}] with buffersource track ${remoteUsersSound[i]} leave success`);
    } catch (error) {
      console.error(`speaker[${i}] with buffersource track ${remoteUsersSound[i]} leave fail: ${error}`);
    }
  }
}

$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#join").attr("disabled", true);
  try {
    options.appid = $("#appid").val();
    options.token = $("#token").val();
    options.channel = $("#channel").val();
    await mockRemoteUserJoin();
    await join();
    await localPlayerStart();
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
})

$("#leave").click(function (e) {
  leave();
})

async function join() {
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  [options.uid,] = await Promise.all([
    client.join(options.appid, options.channel, options.token || null),
  ]);
}
async function leave() {
  for (const trackName in localUserTrack) {
    var track = localUserTrack[trackName];
    if (track) {
      track.stop();
      track.close();
      localUserTrack[trackName] = undefined;
    }
  }
  remoteUsers = [];
  $("#remote-playerlist").html("");
  await client.leave();
  await mockRemoteUserLeave();
  localPlayerStop();

  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  console.log("client leaves channel success");
}

async function subscribe(user, mediaType) {
  const uid = user.uid;
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
    const processor = extension.createProcessor();
    user.processor = processor;
    const track = user.audioTrack;
    track.pipe(processor).pipe(track.processorDestination);
    track.play();
  }
}

function handleUserPublished(user, mediaType) {
  const id = user.uid;
  remoteUsers.push(user);
  subscribe(user, mediaType);
}

function handleUserUnpublished(user) {
  const id = user.uid;
  $(`#player-wrapper-${id}`).remove();
}

const azimuthSlider = document.getElementById("azimuth");
const azimuthOutput = document.getElementById("azimuthValue");
azimuthSlider.oninput = function () {
  azimuthOutput.innerHTML = this.value;
  remoteUsers.forEach(e => {
    e.processor.updateSpatialAzimuth(this.value);
  });
  localPlayProcessors.forEach(e => {
    e.updateSpatialAzimuth(this.value);
  });
}

const elevationSlider = document.getElementById("elevation");
const elevationOutput = document.getElementById("elevationValue");
elevationSlider.oninput = function () {
  elevationOutput.innerHTML = this.value;
  remoteUsers.forEach(e => {
    e.processor.updateSpatialElevation(this.value);
  });
  localPlayProcessors.forEach(e => {
    e.updateSpatialElevation(this.value);
  });
}

const distanceSlider = document.getElementById("distance");
const distanceOutput = document.getElementById("distanceValue");
distanceSlider.oninput = function () {
  distanceOutput.innerHTML = this.value;
  remoteUsers.forEach(e => {
    e.processor.updateSpatialDistance(this.value);
  });
  localPlayProcessors.forEach(e => {
    e.updateSpatialDistance(this.value);
  });
}

const orientationSlider = document.getElementById("orientation");
const orientationOutput = document.getElementById("orientationValue");
orientationSlider.oninput = function () {
  orientationOutput.innerHTML = this.value;
  remoteUsers.forEach(e => {
    e.processor.updateSpatialOrientation(this.value);
  });
  localPlayProcessors.forEach(e => {
    e.updateSpatialOrientation(this.value);
  });
}

const attenuationSlider = document.getElementById("attenuation");
const attenuationOutput = document.getElementById("attenuationValue");
attenuationSlider.oninput = function () {
  attenuationOutput.innerHTML = this.value;
  remoteUsers.forEach(e => {
    e.processor.updateSpatialAttenuation(this.value);
  });
  localPlayProcessors.forEach(e => {
    e.updateSpatialAttenuation(this.value);
  });
}

const blurButton = document.getElementById("blurbtn");
const blurCheckbox = document.getElementById("blurcbx");
blurButton.onclick = function () {
  if (blurCheckbox.checked === true) {
    remoteUsers.forEach(e => {
      e.processor.updateSpatialBlur(true);
    });
    localPlayProcessors.forEach(e => {
      e.updateSpatialBlur(true);
    });
  } else {
    remoteUsers.forEach(e => {
      e.processor.updateSpatialBlur(false);
    });
    localPlayProcessors.forEach(e => {
      e.updateSpatialBlur(false);
    });
  }
}

const airabsorbButton = document.getElementById("airabsorbbtn");
const airabsorbCheckbox = document.getElementById("airabsorbcbx");
airabsorbButton.onclick = function () {
  if (airabsorbCheckbox.checked === true) {
    remoteUsers.forEach(e => {
      e.processor.updateSpatialAirAbsorb(true);
    });
    localPlayProcessors.forEach(e => {
      e.updateSpatialAirAbsorb(true);
    });
  } else {
    remoteUsers.forEach(e => {
      e.processor.updateSpatialAirAbsorb(false);
    });
    localPlayProcessors.forEach(e => {
      e.updateSpatialAirAbsorb(false);
    });
  }
}
