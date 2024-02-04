// create Agora client
var client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
var localTracks = {
  videoTrack: null,
  audioTrack: null,
  audioMixingTrack: null,
  audioEffectTrack: null
};
var remoteUsers = {};
// Agora client options
var options = getOptionsFromLocal()
var audioMixing = {
  state: "IDLE",
  // "IDLE" | "LOADING | "PLAYING" | "PAUSE"
  duration: 0
};
const playButton = $(".play");
let audioMixingProgressAnimation;


$("#select-local-file").click(function (e) {
  $("#local-file").click();
})

$("#local-file").change(function (e) {
  const file = $("#local-file").prop("files")[0];
  if (!file) {
    console.warn("please choose a audio file");
    return;
  }
  $("#local-file-name").text(file.name);
})

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
    $("#audio-mixing").attr("disabled", false);
    $("#audio-effect").attr("disabled", false);
    $("#stop-audio-mixing").attr("disabled", false);
    $("#local-audio-mixing").attr("disabled", false);
  }
});

$("#leave").click(async function (e) {
  leave();
});

$("#audio-mixing").click(function (e) {
  startAudioMixing();
});

$("#audio-effect").click(async function (e) {
  // play the audio effect
  await playEffect(1, {
    source: "audio.mp3"
  });
  console.log("play audio effect success");
});

$("#stop-audio-mixing").click(function (e) {
  stopAudioMixing();
  return false;
});

$(".audio-bar .progress").click(function (e) {
  setAudioMixingPosition(e.offsetX);
  return false;
});

$("#volume").click(function (e) {
  setVolume($("#volume").val());
});

$("#local-audio-mixing").click(function (e) {
  // get selected file
  const file = $("#local-file").prop("files")[0];
  if (!file) {
    console.warn("please choose a audio file");
    return;
  }
  startAudioMixing(file);
  return false;
});

playButton.click(function () {
  if (audioMixing.state === "IDLE" || audioMixing.state === "LOADING") return;
  toggleAudioMixing();
  return false;
});

function setAudioMixingPosition(clickPosX) {
  if (audioMixing.state === "IDLE" || audioMixing.state === "LOADING") return;
  const newPosition = clickPosX / $(".progress").width();

  // set the audio mixing playing position
  localTracks.audioMixingTrack.seekAudioBuffer(newPosition * audioMixing.duration);
}

function setVolume(value) {
  try {
    // set the audio mixing playing position
    localTracks.audioMixingTrack.setVolume(parseInt(value));
  } catch (error) {
    console.error(error)
    message.error(error.message)
  }
}

async function startAudioMixing(file) {
  if (audioMixing.state === "PLAYING" || audioMixing.state === "LOADING") return;
  const options = {};
  if (file) {
    options.source = file;
  } else {
    options.source = "HeroicAdventure.mp3";
  }
  try {
    audioMixing.state = "LOADING";
    // if the published track will not be used, you had better unpublish it
    if (localTracks.audioMixingTrack) {
      await client.unpublish(localTracks.audioMixingTrack);
    }
    // start audio mixing with local file or the preset file
    localTracks.audioMixingTrack = await AgoraRTC.createBufferSourceAudioTrack(options);
    await client.publish(localTracks.audioMixingTrack);
    localTracks.audioMixingTrack.play();
    localTracks.audioMixingTrack.startProcessAudioBuffer({
      loop: true
    });
    audioMixing.duration = localTracks.audioMixingTrack.duration;
    $(".audio-duration").text(toMMSS(audioMixing.duration));
    playButton.toggleClass('active', true);
    setAudioMixingProgress();
    audioMixing.state = "PLAYING";
    console.log("start audio mixing");
  } catch (e) {
    audioMixing.state = "IDLE";
    console.error(e);
  }
}

function stopAudioMixing() {
  if (audioMixing.state === "IDLE" || audioMixing.state === "LOADING") return;
  audioMixing.state = "IDLE";

  // stop audio mixing track
  localTracks.audioMixingTrack.stopProcessAudioBuffer();
  localTracks.audioMixingTrack.stop();
  $(".progress-bar").css("width", "0%");
  $(".audio-current-time").text(toMMSS(0));
  $(".audio-duration").text(toMMSS(0));
  playButton.toggleClass('active', false);
  cancelAnimationFrame(audioMixingProgressAnimation);
  console.log("stop audio mixing");
}

function toggleAudioMixing() {
  if (audioMixing.state === "PAUSE") {
    playButton.toggleClass('active', true);

    // resume audio mixing
    localTracks.audioMixingTrack.resumeProcessAudioBuffer();
    audioMixing.state = "PLAYING";
  } else {
    playButton.toggleClass('active', false);

    // pause audio mixing
    localTracks.audioMixingTrack.pauseProcessAudioBuffer();
    audioMixing.state = "PAUSE";
  }
}

function setAudioMixingProgress() {
  audioMixingProgressAnimation = requestAnimationFrame(setAudioMixingProgress);
  const currentTime = localTracks.audioMixingTrack.getCurrentTime();
  $(".progress-bar").css("width", `${currentTime / audioMixing.duration * 100}%`);
  $(".audio-current-time").text(toMMSS(currentTime));
}

// use buffer source audio track to play effect.
async function playEffect(cycle, options) {
  // if the published track will not be used, you had better unpublish it
  if (localTracks.audioEffectTrack) {
    await client.unpublish(localTracks.audioEffectTrack);
  }
  localTracks.audioEffectTrack = await AgoraRTC.createBufferSourceAudioTrack(options);
  await client.publish(localTracks.audioEffectTrack);
  localTracks.audioEffectTrack.play();
  localTracks.audioEffectTrack.startProcessAudioBuffer({
    cycle
  });
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

  // join a channel and create local tracks, we can use Promise.all to run them concurrently
  [options.uid, localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
    // join the channel
    client.join(options.appid, options.channel, options.token || null, options.uid || null),
    // create local tracks, using microphone and camera
    AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "music_standard"
    }), AgoraRTC.createCameraVideoTrack()]);
  // play local video track
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`uid: ${options.uid}`);

  // publish local tracks to channel
  await client.publish(Object.values(localTracks).filter(track => track !== null));
  console.log("publish success");
}

async function leave() {
  stopAudioMixing();
  for (trackName in localTracks) {
    var track = localTracks[trackName];
    if (track) {
      track.stop();
      track.close();
      localTracks[trackName] = null;
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
  $("#audio-mixing").attr("disabled", true);
  $("#audio-effect").attr("disabled", true);
  $("#stop-audio-mixing").attr("disabled", true);
  $("#local-audio-mixing").attr("disabled", true);
  $("#local-file-name").text("");
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

// calculate the MM:SS format from millisecond
function toMMSS(second) {
  // const second = millisecond / 1000;
  let MM = parseInt(second / 60);
  let SS = parseInt(second % 60);
  MM = MM < 10 ? "0" + MM : MM;
  SS = SS < 10 ? "0" + SS : SS;
  return `${MM}:${SS}`;
}
