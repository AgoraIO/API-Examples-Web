// create Agora client
var client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
var localTracks = {
  videoTrack: null,
  audioTrack: null
};
var localTrackState = {
  videoTrackMuted: false,
  audioTrackMuted: false
};
var remoteUsers = {};
// Agora client options
var options = {
  appid: null,
  channel: null,
  uid: null,
  token: null
};

// the demo can auto join channel with params in url
$(() => {
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
$("#mute-audio").click(function (e) {
  if (!localTrackState.audioTrackMuted) {
    muteAudio();
  } else {
    unmuteAudio();
  }
});
$("#mute-video").click(function (e) {
  if (!localTrackState.videoTrackMuted) {
    muteVideo();
  } else {
    unmuteVideo();
  }
});
async function join() {
  // add event listener to play remote tracks when remote users join, publish and leave.
  client.on("user-published", handleUserPublished);
  client.on("user-joined", handleUserJoined);
  client.on("user-left", handleUserLeft);

  // join a channel and create local tracks, we can use Promise.all to run them concurrently
  [options.uid, localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
  // join the channel
  client.join(options.appid, options.channel, options.token || null, options.uid || null),
  // create local tracks, using microphone and camera
  AgoraRTC.createMicrophoneAudioTrack({
    encoderConfig: "music_standard"
  }), AgoraRTC.createCameraVideoTrack()]);
  showMuteButton();

  // play local video track
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`localVideo(${options.uid})`);
  $("#joined-setup").css("display", "flex");

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
  $("#joined-setup").css("display", "none");
  hideMuteButton();
  console.log("client leaves channel success");
}
async function subscribe(user, mediaType) {
  const uid = user.uid;
  // subscribe to a remote user
  await client.subscribe(user, mediaType);
  console.log("subscribe success");

  // if the video wrapper element is not exist, create it.
  if (mediaType === 'video') {
    if ($(`#player-wrapper-${uid}`).length === 0) {
      const player = $(`
        <div id="player-wrapper-${uid}">
          <p class="player-name">remoteUser(${uid})</p>
          <div id="player-${uid}" class="player"></div>
        </div>
      `);
      $("#remote-playerlist").append(player);
    }

    // play the remote video.
    user.videoTrack.play(`player-${uid}`);
  }
  if (mediaType === 'audio') {
    user.audioTrack.play();
  }
}
function handleUserJoined(user) {
  const id = user.uid;
  remoteUsers[id] = user;
}
function handleUserLeft(user) {
  const id = user.uid;
  delete remoteUsers[id];
  $(`#player-wrapper-${id}`).remove();
}
function handleUserPublished(user, mediaType) {
  subscribe(user, mediaType);
}
function hideMuteButton() {
  $("#mute-video").css("display", "none");
  $("#mute-audio").css("display", "none");
}
function showMuteButton() {
  $("#mute-video").css("display", "inline-block");
  $("#mute-audio").css("display", "inline-block");
}
async function muteAudio() {
  if (!localTracks.audioTrack) return;
  /**
   * After calling setMuted to mute an audio or video track, the SDK stops sending the audio or video stream. Users whose tracks are muted are not counted as users sending streams.
   * Calling setEnabled to disable a track, the SDK stops audio or video capture
   */
  await localTracks.audioTrack.setMuted(true);
  localTrackState.audioTrackMuted = true;
  $("#mute-audio").text("Unmute Audio");
}
async function muteVideo() {
  if (!localTracks.videoTrack) return;
  await localTracks.videoTrack.setMuted(true);
  localTrackState.videoTrackMuted = true;
  $("#mute-video").text("Unmute Video");
}
async function unmuteAudio() {
  if (!localTracks.audioTrack) return;
  await localTracks.audioTrack.setMuted(false);
  localTrackState.audioTrackMuted = false;
  $("#mute-audio").text("Mute Audio");
}
async function unmuteVideo() {
  if (!localTracks.videoTrack) return;
  await localTracks.videoTrack.setMuted(false);
  localTrackState.videoTrackMuted = false;
  $("#mute-video").text("Mute Video");
}