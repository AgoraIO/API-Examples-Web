// create Agora client
var client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
AgoraRTC.enableLogUpload();
var localTracks = {
  videoTrack: null,
  audioTrack: null
};
var remoteUsers = {};
// Agora client options
var options = getOptionsFromLocal()

$("body").on("click", ".player", async function (e) {
  e.preventDefault();
  const player = e.target.parentElement.parentElement;
  const uid = Number(player.dataset.uid);

  try {
    // Set user clicked to HQ/LQ Stream
    await changeSomeUserStream(uid);
  } catch (error) {
    console.error(error);
    message.error(error.message)
  }

});


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

  // Customize the video profile of the low-quality stream: 160 × 120, 15 fps, 120 Kbps.
  client.setLowStreamParameter({
    width: 160,
    height: 120,
    framerate: 15,
    bitrate: 120
  });

  // Enable dual-stream mode.
  await client.enableDualStream();

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
  await client.publish(Object.values(localTracks));
  console.log("publish success");
}

async function changeSomeUserStream(uid) {
  const streamType = $(`#stream-type-${uid}`).text()
  if (streamType == "HQ Stream") {
    // Set the remote user to the low-quality video stream.
    await client.setRemoteVideoStreamType(uid, 1);
    $(`#stream-type-${uid}`).text("LQ Stream");
  } else if (streamType == "LQ Stream") {
    // Set the remote user to the high-quality video stream.
    await client.setRemoteVideoStreamType(uid, 0);
    $(`#stream-type-${uid}`).text("HQ Stream");
  }
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

  // disable dual-stream mode
  await client.disableDualStream();

  // leave the channel
  await client.leave();
  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
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
        <div id="player-${uid}" class="player" data-uid="${uid}">
          <div class="player-name">uid: ${uid} 
            <span id="stream-type-${uid}">HQ Stream</span> 
          </div>
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
