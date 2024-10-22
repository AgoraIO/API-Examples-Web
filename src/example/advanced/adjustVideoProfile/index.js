// create Agora client
var client;
var localTracks = {
  videoTrack: null,
  audioTrack: null
};
var remoteUsers = {};
// Agora client options
var options = getOptionsFromLocal()
var curVideoProfile;
var curCodec;

const AGORA_CODEC_LIST = [{
  label: "vp8",
  value: "vp8"
}, {
  label: "vp9",
  value: "vp9"
}, {
  label: "h264",
  value: "h264"
}];

const AGORA_VIDEO_PROFILES = [{
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

const DEFAULT_VIDEO_PROFILE = "480p_1"
const AGORA_CODEC = "vp8"

// the demo can auto join channel with params in url
$(() => {
  initVideoProfiles();
  initCodecList();

  $(".profile-list").change(function (e) {
    changeVideoProfile(this.value);
  })

  $(".codec-list").change(function (e) {
    changeCodec(this.value);
  })

});

$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#join").attr("disabled", true);
  try {
    client = AgoraRTC.createClient({
      mode: "rtc",
      codec: curCodec
    });
    options.channel = $("#channel").val();
    options.uid = Number($("#uid").val());
    options.token = await agoraGetAppData(options);
    await join();
    setOptionsToLocal(options)
    message.success("join channel success!");
    $(".codec-list").attr("disabled", true);
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
  // create local tracks, using microphone and camera
  if (!localTracks.videoTrack) {
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: curVideoProfile.value
    });
  }
  if (!localTracks.audioTrack) {
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "music_standard"
    });
  }

  // play local video track
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`uid: ${options.uid}`);
  // publish local tracks to channel
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

  // remove remote users and player views
  remoteUsers = {};
  $("#remote-playerlist").html("");

  // leave the channel
  await client.leave();
  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  $(".codec-list").attr("disabled", false);
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

function initVideoProfiles() {
  AGORA_VIDEO_PROFILES.forEach(profile => {
    $(".profile-list").append(`<option value=${profile.label}>${profile.label}: ${profile.detail}</option>`);
  });
  curVideoProfile = AGORA_VIDEO_PROFILES.find(item => item.label == DEFAULT_VIDEO_PROFILE);
  $(".profile-list").val(curVideoProfile.label);
}

function initCodecList() {
  AGORA_CODEC_LIST.forEach(item => {
    $(".codec-list").append(`<option value=${item.label}>${item.label}</option>`);
  });
  curCodec = AGORA_CODEC;
  $(".codec-list").val(curCodec);
}

async function changeVideoProfile(label) {
  curVideoProfile = AGORA_VIDEO_PROFILES.find(profile => profile.label === label);
  $(".profile-list").val(curVideoProfile.label);
  // change the local video track`s encoder configuration
  localTracks.videoTrack && (await localTracks.videoTrack.setEncoderConfiguration(curVideoProfile.value));
}

function changeCodec(label) {
  curCodec = label;
  $(".codec-list").val(curCodec);
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
