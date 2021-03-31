// create Agora client
var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

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

// the demo can auto join channel with params in url
$(() => {
  var urlParams = new URL(location.href).searchParams;
  options.appid = urlParams.get("appid");
  options.channel = urlParams.get("channel");
  options.token = urlParams.get("token");
  if (options.appid && options.channel) {
    $("#appid").val(options.appid);
    $("#token").val(options.token);
    $("#channel").val(options.channel);
    $("#join-form").submit();
  }

  $("body").on("click", ".player", function(e){
    e.preventDefault()
    const player = e.target.parentElement.parentElement
    const uid = Number(player.dataset.uid)
    // Set user clicked to HQ Stream, Other users will be set to LQ Stream
    setSomeUserHQStream([uid])
    // Control the user interface display as your wish
    const playerList = [...document.querySelectorAll(".player")].filter(p=>p!==player)
    player.style.cssText = "width: 720px;height:560px;"
    player.parentElement.classList.add("first-player")
    playerList.forEach(e=>{
      e.parentElement.classList.remove("first-player")
      e.style.cssText = "width: 160px;height:120px;"
    })
  })

})

$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#join").attr("disabled", true);
  try {
    options.appid = $("#appid").val();
    options.token = $("#token").val();
    options.channel = $("#channel").val();
    await join();
    if(options.token) {
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

  // add event listener to play remote tracks when remote user publishs.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // Customize the video profile of the low-quality stream: 160 × 120, 15 fps, 120 Kbps.
  client.setLowStreamParameter({
    width: 160,
    height: 120,
    framerate: 15,
    bitrate: 120,
  });

  // Enable dual-stream mode.
  await client.enableDualStream();

  // Set the stream type of the video streams that the client has subscribed to.
  await setSomeUserHQStream();

  // join a channel and create local tracks, we can use Promise.all to run them concurrently
  [ options.uid, localTracks.audioTrack, localTracks.videoTrack ] = await Promise.all([
    // join the channel
    client.join(options.appid, options.channel, options.token || null),
    // create local tracks, using microphone and camera
    AgoraRTC.createMicrophoneAudioTrack(),
    AgoraRTC.createCameraVideoTrack()
  ]);
  
  // play local video track
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`localVideo(${options.uid})`);

  // publish local tracks to channel
  await client.publish(Object.values(localTracks));
  console.log("publish success");
}

async function setSomeUserHQStream(HQStreamUserList = []){
  // get a list of all remote users 
  const allUserList = [...Object.keys(remoteUsers)].map(Number)
  // set default HQStreamUserList
  if(!HQStreamUserList ||(Array.isArray(HQStreamUserList) && HQStreamUserList.length === 0)){
    if(allUserList.length){
      HQStreamUserList = [allUserList[0]]
    }
  }
  // All other elements are the elements of the LQStreamUserList
  const LQStreamUserList = allUserList.filter(user=> !HQStreamUserList.includes(user))
  const handlePromiseList = []
  // Get a queue
  // The queue settings for all streams
  LQStreamUserList.forEach(user=> void handlePromiseList.push(
    async () => {
      console.log(`set user: ${user} to LQ Stream`);
      const result = await client.setRemoteVideoStreamType(user, 1)
      return result
    }
  ))
  HQStreamUserList.forEach(user=> void handlePromiseList.push(
    async ()=> {
      console.log(`set user: ${user} to HQ Stream`);
      const result = await client.setRemoteVideoStreamType(user, 0)
      return result
    }
  ))
  // return a promise.all
  // promise.all requires an array of promises.
  return Promise.all(handlePromiseList.map(m=>m()))
}

async function leave() {
  for (trackName in localTracks) {
    var track = localTracks[trackName];
    if(track) {
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
  console.log("client leaves channel success");
}

async function subscribe(user, mediaType) {
  const uid = user.uid;
  // Set stream at each subscription
  await setSomeUserHQStream();
  // subscribe to a remote user
  await client.subscribe(user, mediaType);
  console.log("subscribe success");
  if (mediaType === 'video') {
    const player = $(`
      <div id="player-wrapper-${uid}">
        <p class="player-name">remoteUser(${uid})</p>
        <div id="player-${uid}" class="player" data-uid="${uid}"></div>
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