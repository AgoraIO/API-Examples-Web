
/*
 *  These procedures use Agora Video Call SDK for Web to enable local and remote
 *  users to join and leave a Video Call channel managed by Agora Platform.
 */

/*
 *  Create an {@link https://docs.agora.io/en/Video/API%20Reference/web_ng/interfaces/iagorartcclient.html|AgoraRTCClient} instance.
 *
 *  @param {string} mode - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/clientconfig.html#mode| streaming algorithm} used by Agora SDK.
 *  @param  {string} codec - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/clientconfig.html#codec| client codec} used by the browser.
 */
var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

/*
 *  Clear the video and audio tracks used by `client` on initiation.
 */
var localTracks = {
  videoTrack: null,
  audioTrack: null
};

/*
 *  On initiation no users are connected.
 */
var remoteUsers = {};

/*
 *  On initiation. `client` is not attached to any project or channel for any specific user.
 */
var options = {
  appid: null,
  channel: null,
  uid: null,
  token: null
};

var currentStream = null;

/*
 * When this page is called with parameters in the URL, this procedure
 * attempts to join a Video Call channel using those parameters.
 */
$(() => {
  var urlParams = new URL(location.href).searchParams;
  options.appid = urlParams.get("appid");
  options.channel = urlParams.get("channel");
  options.token = urlParams.get("token");
  options.uid = urlParams.get("uid");
  currentStream = urlParams.get("stream-source");
  if (options.appid && options.channel) {
    $("#uid").val(options.uid);
    $("#appid").val(options.appid);
    $("#token").val(options.token);
    $("#channel").val(options.channel);
    $("#join-form").submit();
  }
})

/*
 * When a user clicks Join or Leave in the HTML form, this procedure gathers the information
 * entered in the form and calls join asynchronously. The UI is updated to match the options entered
 * by the user.
 */
$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#join").attr("disabled", true);
  try {
    options.appid = $("#appid").val();
    options.token = $("#token").val();
    options.channel = $("#channel").val();
    options.uid = $("#uid").val();
    currentStream = $("#stream-source").val();
    console.log(currentStream);
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
    $("#switch-channel").attr("disabled", false);
  }
})

/*
 * Called when a user clicks Leave in order to exit a channel.
 */
$("#leave").click(function (e) {
  leave();
})


/*
 * Called when a user clicks Switch button to switch input stream.
 */
 $("#switch-channel").click(function (e) {
    switchChannel();
 })

/*
 * Join a channel, then create local video and audio tracks and publish them to the channel.
 */
async function join() {

  // Add an event listener to play remote tracks when remote user publishes.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // Default publish local microphone audio track to both options.
  localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

  if (currentStream == "camera") {
    // Join a channel and create local tracks. Best practice is to use Promise.all and run them concurrently.
    [ options.uid, localTracks.videoTrack ] = await Promise.all([
      // Join the channel.
      client.join(options.appid, options.channel, options.token || null, options.uid || null),
      // Create tracks to the localcamera.
      AgoraRTC.createCameraVideoTrack()
    ]);

    // Publish the local video and audio tracks to the channel.
    
  } else {
  
      var videoFromDiv = document.getElementById("sample-video");
      // https://developers.google.com/web/updates/2016/10/capture-stream - captureStream() 
      // can only be called after the video element is able to play video;
      try {
        videoFromDiv.play();
      } catch (e) {
        console.log(error);
      }
      //specify mozCaptureStream for Firefox.
      var videoStream = (navigator.userAgent.indexOf("Firefox") > -1)? videoFromDiv.mozCaptureStream():videoFromDiv.captureStream();
      [ options.uid, localTracks.videoTrack ] = await Promise.all([
        // Join the channel.
        client.join(options.appid, options.channel, options.token || null, options.uid || null),
        // Create tracks to the customized video source.
        AgoraRTC.createCustomVideoTrack({mediaStreamTrack:videoStream.getVideoTracks()[0]})
      ]);
 
    }

  await client.publish(Object.values(localTracks));
  // Play the local video track to the local browser and update the UI with the user ID.
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`localVideo(${options.uid})`);
  console.log("publish success");
}

/*
 * Stop all local and remote tracks then leave the channel.
 */

async function stopCurrentChannel() {
  for (trackName in localTracks) {
    var track = localTracks[trackName];
    if(track) {
      track.stop();
      track.close();
      localTracks[trackName] = undefined;
    }
  }

  // Remove remote users and player views.
  remoteUsers = {};
  $("#remote-playerlist").html("");
  $("#local-player-name").text("");

  // leave the channel
  await client.leave();
  console.log("client leaves channel success");
}
async function leave() {
  
  await stopCurrentChannel();
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  $("#switch-channel").attr("disabled", true);
}

/*
 *
 */
 async function switchChannel() {
  console.log("switchChannel entered");
  let prev = currentStream;
  currentStream = $("#stream-source").val();

  if (currentStream == prev) {
    console.log("no change from " + prev + " to" + currentStream);
  } else if (currentStream != prev){
    console.log("channel is switched from " + prev + " to" + currentStream);
    await stopCurrentChannel().then(join());
   //await join();
    //TO-DO
  }
 }


/*
 * Add the local use to a remote channel.
 *
 * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
 * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
 */
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

/*
 * Add a user who has subscribed to the live channel to the local interface.
 *
 * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
 * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
 */
function handleUserPublished(user, mediaType) {
  const id = user.uid;
  remoteUsers[id] = user;
  subscribe(user, mediaType);
}

/*
 * Remove the user specified from the channel in the local interface.
 *
 * @param  {string} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to remove.
 */
function handleUserUnpublished(user, mediaType) {
  if (mediaType === 'video') {
    const id = user.uid;
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();

  }
}
