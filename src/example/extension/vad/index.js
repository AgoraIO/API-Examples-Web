// safari sampleRate 48000
// AgoraRTC.setParameter('WEBAUDIO_INIT_OPTIONS', {latencyHint: 0.02,sampleRate: 48000,});

const extension = new VAD.VADExtension({
  assetsPath: "./agora-extension-vad/wasm",
  fetchOptions: { cache: "no-cache" },
});

AgoraRTC.registerExtensions([extension]);

let processor = null;
// create Agora client
var client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});
var localTracks = {
  videoTrack: null,
  audioTrack: null,
};
var remoteUsers = {};
// Agora client options
var options = getOptionsFromLocal();
const ctx = document.getElementById("chart");
let vadChart = null;
let vadChartData = [];
const MAX_NUM = 1000;
const labels = Array.from(Array(MAX_NUM).keys());

$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#join").attr("disabled", true);
  try {
    options.channel = $("#channel").val();
    options.uid = Number($("#uid").val());
    options.token = await agoraGetAppData(options);
    await join();
    setOptionsToLocal(options);
    message.success("join channel success!");
    $("#vad").attr("disabled", false);
  } catch (error) {
    console.error(error);
    message.error(error.message);
  } finally {
    $("#leave").attr("disabled", false);
  }
});

$("#leave").click(function (e) {
  leave();
  $("#vad").attr("disabled", true);
  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
});

$("#vad").click(async function (e) {
  if (!processor) {
    createProcessor();
  }
  if (!isVadEnable()) {
    pipe();
    enable();
    createVadChart();
  } else {
    disable();
    unPipe();
  }
});

function createProcessor() {
  if (processor) {
    return;
  }
  if (extension.checkCompatibility()) {
    processor = extension.createProcessor();
  } else {
    message.error("VAD extension is not supported on current browser!");
  }
}

function isVadEnable() {
  const text = $("#vad").text();
  return text === "Disable VAD";
}

const throttledHandleResult = throttle(handleResult, 100);

function pipe() {
  try {
    if (processor) {
      processor.on("pipeerror", handlePipeError);
      processor.on("overload", handleOverload);
      processor.on("dump", handleDump);
      processor.on("result", throttledHandleResult);

      if (localTracks.audioTrack) {
        localTracks.audioTrack.pipe(processor).pipe(localTracks.audioTrack.processorDestination);
      }
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
      processor.off("result", throttledHandleResult);

      processor.unpipe();

      localTracks.audioTrack && localTracks.audioTrack.unpipe();
      localTracks.audioTrack &&
        localTracks.audioTrack.pipe(localTracks.audioTrack.processorDestination);
    }
  } catch (error) {
    console.error(error);
  }
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
  if (result && vadChart) {
    console.log("result", result);
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

async function join() {
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);
  // start Proxy if needed
  const mode = Number(options.proxyMode);
  if (mode != 0 && !isNaN(mode)) {
    client.startProxyServer(mode);
  }
  // join the channel
  options.uid = await client.join(
    options.appid,
    options.channel,
    options.token || null,
    options.uid || null,
  );
  // create local audio and video tracks
  localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
  // play local video track
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`uid: ${options.uid}`);
  // publish local tracks to channel
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

  // remove remote users and player views
  remoteUsers = {};
  $("#remote-playerlist").html("");

  // destroy VAD
  destroyProcessor();

  // leave the channel
  await client.leave();

  console.log("client leaves channel success");
}

async function destroyProcessor() {
  if (processor) {
    disable();
    await unPipe();
    await processor.destroy();

    processor = null;
  }
}

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

function enable() {
  processor && processor.enable();
  $("#vad").text("Disable VAD");
}

function disable() {
  processor && processor.disable();
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

function throttle(func, wait) {
  let lastTime = 0;
  let timeout;

  return function () {
    const context = this;
    const args = arguments;
    const currentTime = new Date().getTime();

    if (currentTime - lastTime < wait) {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(function () {
        lastTime = currentTime;
        func.apply(context, args);
      }, wait);
    } else {
      lastTime = currentTime;
      func.apply(context, args);
    }
  };
}
