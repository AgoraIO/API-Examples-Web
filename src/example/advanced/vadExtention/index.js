const extension = new VAD.VADExtension({
  assetsPath: "./agora-extension-vad/wasm",
  fetchOptions: { cache: "no-cache" },
});

AgoraRTC.registerExtensions([extension]);

var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

var localTracks = {
  videoTrack: null,
  audioTrack: null,
};

var remoteUsers = {};

var options = {
  appid: null,
  channel: null,
  uid: null,
  token: null,
};

let processor = null;
let processorEnable = false;
const ctx = document.getElementById("chart");

let vadChart = null;
let vadChartData = [];
const MAX_NUM = 1000;
const labels = Array.from(Array(MAX_NUM).keys());

if (extension.checkCompatibility()) {
  processor = extension.createProcessor();
} else {
  message.error("VAD extension is not supported on current browser!");
}

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
});

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
    if (openSSO) {
      const { appId, token } = await agoraGetAppData(options);
      options.appid = appId;
      options.token = token;
      await join();
      agoraReportData(options);
      agoraContentInspect(client, options);
    } else {
      options.appid = $("#appid").val();
      options.token = $("#token").val();
      await join();
    }
    if (options.token) {
      $("#success-alert-with-token").css("display", "block");
    } else {
      $("#success-alert a").attr(
        "href",
        `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}`,
      );
      $("#success-alert").css("display", "block");
    }
    $("#vad").attr("disabled", false);
  } catch (error) {
    console.error(error);
  } finally {
    $("#leave").attr("disabled", false);
  }
});

$("#leave").click(function (e) {
  leave();
  $("#vad").attr("disabled", true);
});

$("#vad").click(async function (e) {
  if (!processorEnable) {
    enable();
    pipe();
    createVadChart();
  } else {
    unPipe();
    disable();
  }
});

function enable() {
  processor && processor.enable();

  processorEnable = true;
  $("#vad").text("Disable VAD");
}

function disable() {
  processor && processor.disable();

  processorEnable = false;
  $("#vad").text("Enable VAD");
  $("#isSpeaking").text("false");
  $("#speakingProb").text("0%");
  vadChartData = [];
  vadChart && vadChart.destroy();
  vadChart = null;
}

function dump() {
  processor && processor.dump();
}

function handleDump(blob, name) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

function handleResult(result) {
  if (result && processorEnable) {
    let speakingProb = (result.voiceProb || 0) * 100;
    $("#speakingProb").text(`${speakingProb.toFixed(4)}%`);
    $("#isSpeaking").text(speakingProb > 99 ? "true" : "false");
    updateVadChart(speakingProb);
  }
}

function createVadChart() {
  if (vadChart) {
    return;
  }
  vadChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "# VAD",
          data: vadChartData,
          borderColor: "rgb(102, 156, 246)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      animations: false,
      // responsive: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function updateVadChart(value) {
  if (vadChart) {
    if (vadChartData.length >= MAX_NUM) {
      vadChartData.shift();
    }
    vadChartData.push(value);
    vadChart.update();
  }
}

function pipe() {
  try {
    if (processor) {
      processor.on("pipeerror", handlePipeError);
      processor.on("overload", handleOverload);
      processor.on("dump", handleDump);
      processor.on("result", handleResult);

      localTracks.audioTrack &&
        localTracks.audioTrack.pipe(processor).pipe(localTracks.audioTrack.processorDestination);
    }
  } catch (error) {
    console.error(error);
    message.error(error.message);
  }
}

async function handlePipeError() {
  console.error(error);
  await unPipe();
}

async function handleOverload() {
  console.error("processor may overload");
}

async function unPipe() {
  try {
    if (processor) {
      processor.off("pipeerror", handlePipeError);
      processor.off("overload", handleOverload);
      processor.off("dump", handleDump);
      processor.off("result", handleResult);

      processor.unpipe();

      localTracks.audioTrack && localTracks.audioTrack.unpipe();
      localTracks.audioTrack &&
        localTracks.audioTrack.pipe(localTracks.audioTrack.processorDestination);
    }
  } catch (error) {
    console.error(error);
  }
}

/*
 * Join a channel, then create local video and audio tracks and publish them to the channel.
 */
async function join() {
  // Add an event listener to play remote tracks when remote user publishes.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  options.uid = await client.join(
    options.appid,
    options.channel,
    options.token || null,
    options.uid || null,
  );

  if (!localTracks.audioTrack) {
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "music_standard",
    });
  }
  if (!localTracks.videoTrack) {
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
  }

  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`localVideo(${options.uid})`);
  $("#joined-setup").css("display", "flex");

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

  // stop VAD
  disable();

  // leave the channel
  await client.leave();

  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  $("#joined-setup").css("display", "none");
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
  if (mediaType === "video") {
    const player = $(`
      <div id="player-wrapper-${uid}">
        <p class="remote-player-name">remoteUser(${uid})</p>
        <div id="player-${uid}" class="player"></div>
      </div>
    `);
    $("#remote-playerlist").append(player);
    user.videoTrack.play(`player-${uid}`);
    toggleSuperClarityOne(uid);
  }
  if (mediaType === "audio") {
    user.audioTrack.play();
  }
}

function handleUserPublished(user, mediaType) {
  const id = user.uid;
  remoteUsers[id] = user;
  subscribe(user, mediaType);
}

function handleUserUnpublished(user, mediaType) {
  if (mediaType === "video") {
    const id = user.uid;
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
  }
}
