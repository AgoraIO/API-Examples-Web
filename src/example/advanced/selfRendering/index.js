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
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // start Proxy if needed
  const mode = Number(options.proxyMode)
  if (mode != 0 && !isNaN(mode)) {
    client.startProxyServer(mode);
  }

  // join the channel
  options.uid = await client.join(options.appid, options.channel, options.token || null, options.uid || null);
  // create local audio and video tracks
  if (!localTracks.audioTrack) {
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "music_standard"
    });
  }
  if (!localTracks.videoTrack) {
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
  }
  // play local video track
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`uid: ${options.uid}`);

  mirrorPlayerShow()
  // publish local tracks to channel
  await client.publish(Object.values(localTracks));
  console.log("publish success");
}


function mirrorPlayerShow() {
  //create the mirror of local player
  $("#local-player-mirror-area").show();
  var mirrorPlayer = document.getElementById("local-player-mirror-video-track");
  //get browser-native object MediaStreamTrack from WebRTC SDK
  const msTrack = localTracks.videoTrack.getMediaStreamTrack();
  //generate browser-native object MediaStream with above video track
  const ms = new MediaStream([msTrack]);
  mirrorPlayer.srcObject = ms;
  mirrorPlayer.play();
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
  $("#audience-join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  $(".video-mirror").hide();
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
        <div class="mt-2 mb-2 mx-2">Video Mirror</div>
        <div id="player-${uid}-mirror-area" class="player" style="border: 2px dashed red ;">
            <div style="width: 100%; height: 100%; position: relative; overflow: hidden; background-color: black;">
                <video id="video_track-video-${uid}-mirror" 
                    class="agora_video_player" playsinline="" muted="" 
                    style="width: 100%; height: 100%; position: absolute; left: 0px; top: 0px; object-fit: cover;">
                </video>
            </div>
        </div>
      </div>
    `);
    $("#remote-playerlist").append(player);
    user.videoTrack.play(`player-${uid}`);

    //handling the mirror video
    $(`#player-${uid}-mirror-area`).show();
    var mirrorRemotePlayer = document.getElementById(`video_track-video-${uid}-mirror`);
    //get browser-native object MediaStreamTrack from WebRTC SDK
    const msTrack = user.videoTrack.getMediaStreamTrack();
    //generate browser-native object MediaStream with above video track
    const ms = new MediaStream([msTrack]);
    mirrorRemotePlayer.srcObject = ms;
    mirrorRemotePlayer.play();
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
