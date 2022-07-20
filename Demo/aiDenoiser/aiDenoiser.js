
var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

var localTracks = {
  videoTrack: null,
  audioTrack: null
};

var remoteUsers = {};

var options = {
  appid: null,
  channel: null,
  uid: null,
  token: null
};

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
    options.uid = Number($("#uid").val());
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

/*
 * Join a channel, then create local video and audio tracks and publish them to the channel.
 */
async function join() {

  // Add an event listener to play remote tracks when remote user publishes.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  [ options.uid, localTracks.audioTrack, localTracks.videoTrack ] = await Promise.all([
    client.join(options.appid, options.channel, options.token || null, options.uid || null),
    AgoraRTC.createMicrophoneAudioTrack(),
    AgoraRTC.createCameraVideoTrack()
  ]);

  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`localVideo(${options.uid})`);

  // localTracks.audioTrack.play();
  await client.publish(Object.values(localTracks));
  console.log("publish success");
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

  // Remove remote users and player views.
  remoteUsers = {};
  $("#remote-playerlist").html("");

  // leave the channel
  await client.leave();

  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  console.log("client leaves channel success");
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

let denoiser = null;
let processor = null;
let processorEnable = true;

const pipeAIDenosier = (audioTrack, processor) => {
  audioTrack.pipe(processor).pipe(audioTrack.processorDestination);
}

$("#openAiDenosier").click(async (e) => {
  e.preventDefault();

  denoiser = denoiser || ((()=>{
    let denoiser = new AIDenoiser.AIDenoiserExtension({
      assetsPath:'./aiDenoiserExtension/external'
    })
    AgoraRTC.registerExtensions([denoiser]);
    denoiser.onloaderror = (e) => {
      console.error(e);
      processor = null;
    }
    return denoiser;
  })())
  processor = processor || ((()=>{
    let processor = denoiser.createProcessor()
    processor.onoverload = async () => {
      console.log("overload!!!");
      try {
        await processor.disable();
        $("#enableAiDenosier").val("Enable AIDenoiser");
        $("#ai-status-tip").text("AIDenoiser is disabled");
        processorEnable = true;
      } catch (error) {
        console.error("disable AIDenoiser failure");
      }finally{
        $("#enableAiDenosier").disable = false;
      }
    }
    return processor;
  })());
  pipeAIDenosier(localTracks.audioTrack, processor);
})

$("#enableAiDenosier").click(async(e)=>{
  e.preventDefault();
  $("#enableAiDenosier").disable = true;
  if(processorEnable){
    try{
      await processor.enable();
      $("#enableAiDenosier").val("Disable AIDenoiser");
      $("#ai-status-tip").text("AIDenoiser is enabled");
      processorEnable = false;
    }catch(e){
      console.error("enable AIDenoiser failure");
    }finally{
      $("#enableAiDenosier").disable = false;
    }
  }else{
    try{
      await processor.disable();
      $("#enableAiDenosier").val("Enable AIDenoiser");
      $("#ai-status-tip").text("AIDenoiser is disabled");
      processorEnable = true;
    }catch(e){
      console.error("disable AIDenoiser failure");
    }finally{
      $("#enableAiDenosier").disable = false;
    }
  }
})

$("#dump").click(async(e)=>{
  e.preventDefault();
  if(!processor){return;}
  processor.ondump = (blob, name) => {
    const objectURL = URL.createObjectURL(blob);
    const tag = document.createElement("a");
    tag.download = name + ".wav";
    tag.href = objectURL;
    tag.click();
  }
  
  processor.ondumpend = () => {
    console.log("dump ended!!");
  }
  
  processor.dump();
})
