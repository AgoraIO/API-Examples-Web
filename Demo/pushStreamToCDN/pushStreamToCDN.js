// create Agora client
var client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
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
  token: null,
  liveStreamingUrl: null,
  role: "host" // host or audience
};

// the demo can auto join channel with params in url
$(() => {
  var urlParams = new URL(location.href).searchParams;
  options.appid = urlParams.get("appid");
  options.channel = urlParams.get("channel");
  options.token = urlParams.get("token");
  options.liveStreamingUrl = urlParams.get("liveStreamingUrl");
  if (options.appid && options.channel) {
    $("#appid").val(options.appid);
    $("#token").val(options.token);
    $("#channel").val(options.channel);
    $("#live-streaming-url").val(options.liveStreamingUrl);
    $("#join-form").submit();
  }
  $("#live-streaming-stop").click(function(event){
    event.preventDefault()
    // Stop the push according to the cdn address.
    // Note that this is an asynchronous method, please ensure that the asynchronous operation is completed before proceeding to the next step.
    client.stopLiveStreaming(options.liveStreamingUrl).then(() => {
      console.log("stop live streaming success");
      $("#live-streaming-stop").attr("disabled", true)
      $("#live-streaming-start").attr("disabled", false)
    })
  })

  $("#live-streaming-start").click(async function(event){
    event.preventDefault()
    // We recommend that only one host has the authority to control the push in a live.
    // Please set your own permission control.

    // When the live broadcast is in progress, the authorized host starts the push stream by clicking button
    options.liveStreamingUrl &&  await liveTranscoding()
  })

})

$("#host-join").click(function (e) {
  // In this demo, the user role is host by default
  options.role = "host"
})

$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#host-join").attr("disabled", true);
  try {
    options.appid = $("#appid").val();
    options.token = $("#token").val();
    options.channel = $("#channel").val();
    options.liveStreamingUrl = $("#live-streaming-url").val();
    await join();
    if (options.role === "host") {
      $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}&liveStreamingUrl=${options.liveStreamingUrl}`);
      if(options.token) {
        $("#success-alert-with-token").css("display", "block");
      } else {
        $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}&liveStreamingUrl=${options.liveStreamingUrl}`);
        $("#success-alert").css("display", "block");
      }
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
  // create Agora client
  client.setClientRole(options.role);

  // add event listener to play remote tracks when remote user publishs.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // join the channel
  options.uid = await client.join(options.appid, options.channel, options.token || null);

  if (options.role === "host") {
    // create local audio and video tracks
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
    // play local video track
    localTracks.videoTrack.play("local-player");
    $("#local-player-name").text(`localTrack(${options.uid})`);
    // publish local tracks to channel
    await client.publish(Object.values(localTracks));
    console.log("publish success");
    $("#live-streaming-start").attr("disabled", false)
  }
}

async function liveTranscoding(){
  if(!options.liveStreamingUrl){
    console.error('you should input liveStreaming URL');
    return
  }
  // Set the order of local and remote hosts according to your preferences
  const transcodingUsers = [options.uid, ...Object.keys(remoteUsers)].map((uid, index)=>{
    // Set the size according to your idea
    const width = 600
    const height = 700
    return {
      // Set the location coordinates according to your ideas
      x: 30 * (index % 2) + index * width + 10,
      y: 10,
      width,
      height,
      zOrder: 0,
      alpha: 1.0,
      // The uid below should be consistent with the uid entered in AgoraRTCClient.join
      // uid must be an integer number
      uid: Number(uid),
    }
  })

  //  configuration of pushing stream to cdn
  const liveTranscodingConfig = {
    width: 1280,
    height: 720,
    videoBitrate: 400,
    videoFramerate: 15,
    audioSampleRate: 32000,
    audioBitrate: 48,
    audioChannels: 1,
    videoGop: 30,
    videoCodecProfile: 100,
    userCount: 1,
    // userConfigExtraInfo: {},
    backgroundColor: 0x0000EE,
    watermark: {
            url: "https://agoraio-community.github.io/AgoraWebSDK-NG/img/logo.png",
            x: 20,
            y: 20,
            width: 200,
            height: 200,
    },
    backgroundImage: {
            url: "https://agoraio-community.github.io/AgoraWebSDK-NG/img/sd_rtn.jpg",
            x: 100,
            y: 100,
            width: 1080,
            height: 520,
    },
    transcodingUsers
  }

  try {

    // To monitor errors in the middle of the push, please refer to the API documentation for the list of error codes
    client.on("live-streaming-error", (url, err) => {
      console.error("url", url, "live streaming error!", err.code);
    });
    // set live streaming transcode configuration,
    await client.setLiveTranscoding(liveTranscodingConfig)
    // then start live streaming.
    await client.startLiveStreaming(options.liveStreamingUrl, true)
  
    $("#live-streaming-stop").attr("disabled", false)
    $("#live-streaming-start").attr("disabled", true)
    
  } catch (error) {
    console.error('live streaming error:', error.message)
  }

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
  $("#host-join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  $("#live-streaming-stop").attr("disabled", true)
  $("#live-streaming-start").attr("disabled", true)

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