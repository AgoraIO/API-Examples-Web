// create Agora client
var client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});

const extension = new BeautyExtension();
AgoraRTC.registerExtensions([extension]);
let processor = extension.createProcessor();


let softenRange = document.getElementById('softenlevel');
let sharpRange = document.getElementById('sharplevel');
let disableBtn = document.getElementById('disable');
let enableBtn = document.getElementById('enable');
let whiteRange = document.getElementById('whitelevel');
let rednessRange = document.getElementById('rednesslevel');
let contrastRange = document.getElementById('contrastlevel');

var localTracks = {
  videoTrack: null,
  audioTrack: null
};
var remoteUsers = {};
// Agora client options
var options = getOptionsFromLocal()
var beautyEnabled = false;
var virtualBackgroundInstance;



$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#join").attr("disabled", true);
  try {
    options.channel = $("#channel").val();
    options.uid = Number($("#uid").val());
    options.token = await agoraGetAppData(options);
    await createTracks();
    await join();
    setOptionsToLocal(options)
    message.success("join channel success!");
  } catch (error) {
    console.error(error);
    message.error(error.message)
  } finally {
    $("#leave").attr("disabled", false);
    $("#publish").attr("disabled", false);
  }
});

$("#leave").click(function (e) {
  leave();
});

$("#publish").click(async function (e) {
  await publish();
});

async function join() {
  // add event listener to play remote tracks when remote user publishs.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // join a channel and create local tracks, we can use Promise.all to run them concurrently
  options.uid = await client.join(options.appid, options.channel, options.token || null, options.uid || null)
  $("#local-player-name").text(`uid: ${options.uid}`);

  // publish local tracks to channel
  if (localTracks.videoTrack && localTracks.audioTrack) {
    await client.publish([
      localTracks.audioTrack,
      localTracks.videoTrack
    ]);
  }

}


async function createTracks() {
  localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
    encoderConfig: "music_standard"
  });
  localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
    encoderConfig: '720p_2'
  });

  // play local video track
  localTracks.videoTrack.play("local-player");

  if (processor && localTracks.videoTrack) {
    localTracks.videoTrack.pipe(processor).pipe(localTracks.videoTrack.processorDestination);
  }
};



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
  $("#publish").attr("disabled", true);
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


softenRange.onchange = function (e) {
  let smoothnessLevel = parseInt(softenRange.value) / 100;
  softenRange.nextElementSibling.innerHTML = smoothnessLevel;
  processor.setOptions({
    smoothnessLevel: smoothnessLevel
  });
};


sharpRange.onchange = function (e) {
  let sharpnessLevel = parseInt(sharpRange.value) / 100;
  sharpRange.nextElementSibling.innerHTML = sharpnessLevel;
  processor.setOptions({
    sharpnessLevel: sharpnessLevel
  });
};


whiteRange.onchange = function (e) {
  let lighteningLevel = parseInt(whiteRange.value) / 100;
  whiteRange.nextElementSibling.innerHTML = lighteningLevel;
  processor.setOptions({
    lighteningLevel: lighteningLevel
  });
};


rednessRange.onchange = function (e) {
  let rednessLevel = parseInt(rednessRange.value) / 100;
  rednessRange.nextElementSibling.innerHTML = rednessLevel;
  processor.setOptions({
    rednessLevel: rednessLevel
  });
};


contrastRange.onchange = function (e) {
  let contrastLevel = parseInt(contrastRange.value);
  processor.setOptions({
    lighteningContrastLevel: contrastLevel
  });
};


enableBtn.onclick = async function (e) {
  if (processor && localTracks.videoTrack) {
    await processor.enable();
    beautyEnabled = true;
    document.getElementById('enable').disabled = true;
    document.getElementById('disable').disabled = false;
  }
};


disableBtn.onclick = async function (e) {
  if (processor && localTracks.videoTrack) {
    await processor.disable();
    beautyEnabled = false;
    document.getElementById('enable').disabled = false;
    document.getElementById('disable').disabled = true;
  }
};
