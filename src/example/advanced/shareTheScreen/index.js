// create Agora client
var client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
AgoraRTC.enableLogUpload();
var localTracks = {
  screenVideoTrack: null,
  audioTrack: null,
  screenAudioTrack: null
};
var remoteUsers = {};
let local
var localOptions = getOptionsFromLocal()
var options = {
  ...localOptions,
  role: "audience",
};

$("#host-join").click(function (e) {
  options.role = "host"
})

$("#audience-join").click(function (e) {
  options.role = "audience"
})


$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#join").attr("disabled", true);
  try {
    options.channel = $("#channel").val();
    options.uid = Number($("#uid").val());
    options.token = await agoraGetAppData(options);
    await join();
    $("#host-join").attr("disabled", true);
    $("#audience-join").attr("disabled", true);
    setOptionsToLocal(options)
  } catch (error) {
    console.error(error);
    message.error(error.message)
  } finally {
    $("#leave").attr("disabled", false);
  }
})

$("#leave").click(async function (e) {
  await leave()
  $("#host-join").attr("disabled", false);
  $("#audience-join").attr("disabled", false);;
})

async function join() {
  // add event listener to play remote tracks when remote user publishs.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // start Proxy if needed
  const mode = Number(options.proxyMode)
  if (mode != 0 && !isNaN(mode)) {
    client.startProxyServer(mode);
  }

  client.setClientRole(options.role,);
  let screenTrack;
  options.uid = await client.join(options.appid, options.channel, options.token || null, options.uid || null)
  message.success("join channel success!");
  if (options.role == "audience") {
    return
  }

  // join a channel and create local tracks, we can use Promise.all to run them concurrently
  [localTracks.audioTrack, screenTrack] = await Promise.all([
    // ** create local tracks, using microphone and screen
    AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "music_standard"
    }),
    AgoraRTC.createScreenVideoTrack({
      encoderConfig: "720p"
    }, "auto")
  ])

  if (screenTrack instanceof Array) {
    localTracks.screenVideoTrack = screenTrack[0]
    localTracks.screenAudioTrack = screenTrack[1]
  }
  else {
    localTracks.screenVideoTrack = screenTrack
  }
  // play local video track
  localTracks.screenVideoTrack.play("local-player");
  $("#local-player-name").text(`uid: ${options.uid}`);

  //bind "track-ended" event, and when screensharing is stopped, there is an alert to notify the end user.
  localTracks.screenVideoTrack.on("track-ended", handleScreenTrackEnd);

  // publish local tracks to channel
  if (localTracks.screenAudioTrack == null) {
    await client.publish([localTracks.screenVideoTrack, localTracks.audioTrack]);
  }
  else {
    await client.publish([localTracks.screenVideoTrack, localTracks.audioTrack, localTracks.screenAudioTrack]);
  }
}

function handleScreenTrackEnd() {
  message.info(`Screen-share track ended, stop sharing screen ` + localTracks.screenVideoTrack.getTrackId());
  localTracks.screenVideoTrack && localTracks.screenVideoTrack.close();
  localTracks.screenAudioTrack && localTracks.screenAudioTrack.close();
  localTracks.audioTrack && localTracks.audioTrack.close();
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
}

async function subscribe(user, mediaType) {
  const uid = user.uid;
  // subscribe to a remote user
  await client.subscribe(user, mediaType);
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
