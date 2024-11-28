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
var client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});
AgoraRTC.enableLogUpload();

/*
 *  Clear the video and audio tracks used by `client` on initiation.
 */
var localTracks = {
  videoTrack: null,
  audioTrack: null,
};

/*
 *  On initiation no users are connected.
 */
var remoteUsers = {};

var options = getOptionsFromLocal();
var currentStream = "mp4";

var videoFromDiv = document.getElementById("sample-video");
$(".form-select").attr("disabled", true);

$(".form-select").change(function (e) {
  switchChannel(this.value);
});
$("#play").click(function (e) {
  videoFromDiv.play();
});

function isMobileSafari() {
  var ua = navigator.userAgent;
  return /iP(ad|hone|od).+Version\/[\d.]+.*Safari/i.test(ua);
}

$(() => {
  console.log('update video attr 12343');
  if (isMobileSafari()) {
    $('#sample-video').attr('playsinline', 'true');
    $('#sample-video').attr('webkit-playsinline', 'true');
  }
})
/*
 * When a user clicks Join or Leave in the HTML form, this procedure gathers the information
 * entered in the form and calls join asynchronously. The UI is updated to match the options entered
 * by the user.
 */
$("#join").click(async function (e) {
  e.preventDefault();
  $("#join").attr("disabled", true);
  try {
    currentStream = $("#stream-source").val();
    options.channel = $("#channel").val();
    options.uid = Number($("#uid").val());
    options.token = await agoraGetAppData(options);
    // 移动端的safari浏览器需要用户的click事件手动触发视频播放
    if (currentStream !== "camera" && isMobileSafari()) {
      try {
        videoFromDiv.play();
      } catch (error) {
        console.error(error);
        message.error(error.message);
      }
    }
    await join();
    setOptionsToLocal(options);
    message.success("join channel success!");
    $(".form-select").attr("disabled", false);
  } catch (error) {
    console.error(error);
    message.error(error.message);
  } finally {
    $("#leave").attr("disabled", false);
    $("#switch-channel").attr("disabled", false);
  }
});

/*
 * Called when a user clicks Leave in order to exit a channel.
 */
$("#leave").click(function (e) {
  leave();
  $(".form-select").attr("disabled", true);
});

/*
 * Join a channel, then create local video and audio tracks and publish them to the channel.
 */
async function join() {
  // Add an event listener to play remote tracks when remote user publishes.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // start Proxy if needed
  const mode = Number(options.proxyMode);
  if (mode != 0 && !isNaN(mode)) {
    client.startProxyServer(mode);
  }

  // Default publish local microphone audio track to both options.
  localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
    encoderConfig: "music_standard",
  });

  // Join the channel.
  await client.join(options.appid, options.channel, options.token || null, options.uid || null);
  createAndPublishVideoTrack();
}


function stopCurrentLocalVideoTrack() {
  client.unpublish(localTracks.videoTrack);
  if (localTracks.videoTrack) {
    localTracks.videoTrack.stop();
    localTracks.videoTrack.close();
    localTracks.videoTrack = undefined;
  }
  videoFromDiv.pause();
  videoFromDiv.currentTime = 0;
}


const getCaptureStream = () => {
  let stream;
  const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  debugger;
  console.log('isFirefox', isFirefox);
  if (isFirefox) {
      stream = videoFromDiv.mozCaptureStream();
  } else if (isSafari) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = videoFromDiv.videoWidth;
    canvas.height = videoFromDiv.videoHeight;
    function drawFrame() {
      ctx.drawImage(videoFromDiv, 0, 0, canvas.width, canvas.height);
      requestAnimationFrame(drawFrame);
    }

    drawFrame();

    stream = canvas.captureStream();
  } else {
    stream = videoFromDiv.captureStream();
  }
  if (stream) {
    return stream.getVideoTracks()[0];
  }
  return null;
}

async function createAndPublishVideoTrack(){

  if (currentStream == "camera") {
     // Create tracks to the local camera.
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
  } else {
    // https://developers.google.com/web/updates/2016/10/capture-stream - captureStream()
    // can only be called after the video element is able to play video;
    try {
      videoFromDiv.play();
    } catch (error) {
      console.error(error);
      message.error(error.message);
    }
    //specify mozCaptureStream for Firefox.
    // var videoStream =
    //   navigator.userAgent.indexOf("Firefox") > -1
    //     ? videoFromDiv.mozCaptureStream()
    //     : videoFromDiv.captureStream();
    const videoStream = getCaptureStream();

    localTracks.videoTrack = await AgoraRTC.createCustomVideoTrack({
      mediaStreamTrack: videoStream,
    })
  }


  await client.publish(Object.values(localTracks));
  // Play the local video track to the local browser and update the UI with the user ID.
  localTracks.videoTrack.play("local-player", {
    fit: "cover",
  });
  $("#local-player-name").text(`uid: ${options.uid}`);
  console.log("publish success");
}

/*
 * Stop all local and remote tracks then leave the channel.
 */

async function stopCurrentChannel() {
  for (trackName in localTracks) {
    var track = localTracks[trackName];
    if (track) {
      track.stop();
      track.close();
      localTracks[trackName] = undefined;
    }
  }

  // Remove remote users and player views.
  remoteUsers = {};
  $("#remote-playerlist").html("");
  $("#local-player-name").text("");

  videoFromDiv.pause();
  videoFromDiv.currentTime = 0;
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
async function switchChannel(val) {
  currentStream = val;
  // stop current video track
  stopCurrentLocalVideoTrack();
  // create and publish new video track
  await createAndPublishVideoTrack();
  agoraContentInspect(localTracks.videoTrack);
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
  if (mediaType === "video") {
    const player = $(`
     <div id="player-wrapper-${uid}">
            <div id="player-${uid}" class="player">
                 <div class="remote-player-name">uid: ${uid}</div>
            </div>
     </div>
    `);
    $("#remote-playerlist").append(player);
    user.videoTrack.play(`player-${uid}`);
  }
  if (mediaType === "audio") {
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
  if (mediaType === "video") {
    const id = user.uid;
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
  }
}
