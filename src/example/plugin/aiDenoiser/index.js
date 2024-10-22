var client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});
var localTracks = {
  videoTrack: null,
  audioTrack: null
};
var remoteUsers = {};
var options = getOptionsFromLocal();
let extension = null;
let processor = null;
let processorEnable = true;


$("#openAiDenosier").attr("disabled", true);
$("#enableAiDenosier").attr("disabled", true);
$("#dump").attr("disabled", true);

/*
 * When a user clicks Join or Leave in the HTML form, this procedure gathers the information
 * entered in the form and calls join asynchronously. The UI is updated to match the options entered
 * by the user.
 */
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
    $("#openAiDenosier").attr("disabled", false);
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

/*
 * Join a channel, then create local video and audio tracks and publish them to the channel.
 */
async function join() {
  // Add an event listener to play remote tracks when remote user publishes.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);
  [options.uid, localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([client.join(options.appid, options.channel, options.token || null, options.uid || null), AgoraRTC.createMicrophoneAudioTrack({
    encoderConfig: "music_standard"
  }), AgoraRTC.createCameraVideoTrack()]);
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`uid: ${options.uid}`);

  // localTracks.audioTrack.play();
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



$("#openAiDenosier").click(async e => {
  let extension = new AIDenoiser.AIDenoiserExtension({
    assetsPath: './agora-extension-ai-denoiser/external'
  });
  AgoraRTC.registerExtensions([extension]);
  extension.onloaderror = e => {
    console.error(e);
    processor = null;
  };

  processor = extension.createProcessor();

  processor.onoverload = async () => {
    await processor.disable();
    $("#enableAiDenosier").val("Enable AIDenoiser");
    $("#ai-status-tip").text("AIDenoiser is disabled");
    processorEnable = true;
  };

  localTracks.audioTrack.pipe(processor).pipe(localTracks.audioTrack.processorDestination);

  message.success("open AIDenoiser success!");
  $("#openAiDenosier").attr("disabled", true);
  $("#enableAiDenosier").attr("disabled", false);
  $("#dump").attr("disabled", false);
});

$("#enableAiDenosier").click(async e => {
  try {
    $("#enableAiDenosier").attr("disabled", true);
    if (processorEnable) {
      await processor.enable();
      $("#enableAiDenosier").text("Disable AIDenoiser");
      $("#ai-status-tip").text("AIDenoiser is enabled");
      processorEnable = false;
    } else {
      await processor.disable();
      $("#enableAiDenosier").text("Enable AIDenoiser");
      $("#ai-status-tip").text("AIDenoiser is disabled");
      processorEnable = true;
    }
  } catch (e) {
    console.error("enable AIDenoiser failure", e);
  } finally {
    $("#enableAiDenosier").attr("disabled", false);
  }

});

$("#dump").click(async e => {
  if (!processor) {
    return;
  }
  processor.ondump = (blob, name) => {
    const objectURL = URL.createObjectURL(blob);
    const tag = document.createElement("a");
    tag.download = name + ".wav";
    tag.href = objectURL;
    tag.click();
  };
  processor.ondumpend = () => {
    console.log("dump ended!!");
  };
  processor.dump();
});
