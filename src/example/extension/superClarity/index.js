const superClarityExtension = new SuperClarityExtension();
const pvcExtension = new PvcExtension();
let pvcProcessor = null;

// key: uid (string)
// value: processor
const superClarityProcessorMap = new Map();

const isBrowserSupport = pvcExtension.checkCompatibility();
if (!isBrowserSupport) {
  let message = "PVC extension is not supported on current browser!";
  message.warning(message);
  console.log(message);
}

AgoraRTC.registerExtensions([superClarityExtension, pvcExtension]);

var client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});
var localTracks = {
  videoTrack: null,
  audioTrack: null,
};
var remoteUsers = {};
var options = getOptionsFromLocal();
var curVideoProfile;

let AGORA_VIDEO_PROFILES = [
  {
    label: "360p_7",
    detail: "480×360, 15fps, 320Kbps",
    value: "360p_7",
  },
  {
    label: "360p_8",
    detail: "480×360, 30fps, 490Kbps",
    value: "360p_8",
  },
  {
    label: "480p_1",
    detail: "640×480, 15fps, 500Kbps",
    value: "480p_1",
  },
  {
    label: "480p_2",
    detail: "640×480, 30fps, 1000Kbps",
    value: "480p_2",
  },
  {
    label: "720p_1",
    detail: "1280×720, 15fps, 1130Kbps",
    value: "720p_1",
  },
  {
    label: "720p_2",
    detail: "1280×720, 30fps, 2000Kbps",
    value: "720p_2",
  },
  {
    label: "1080p_1",
    detail: "1920×1080, 15fps, 2080Kbps",
    value: "1080p_1",
  },
  {
    label: "1080p_2",
    detail: "1920×1080, 30fps, 3000Kbps",
    value: "1080p_2",
  },
];
const DEFAULT_VIDEO_PROFILE = "480p_1";

$("#switch-super-clarity").attr("disabled", true);
$("#switch-pvc").attr("disabled", true);

$(() => {
  initVideoProfiles();
  $(".profile-list").change(function (e) {
    changeVideoProfile(this.value);
  });
});

$("#switch-super-clarity").on("change", function (e) {
  if ($(this).is(":checked")) {
    toggleSuperClarity(true);
  } else {
    toggleSuperClarity(false);
  }
});

$("#switch-pvc").on("change", async function (e) {
  if (!pvcProcessor) {
    await initPvcProcessor();
    localTracks.videoTrack.pipe(pvcProcessor).pipe(localTracks.videoTrack.processorDestination);
  }
  if ($(this).is(":checked")) {
    await pvcProcessor.enable();
  } else {
    await pvcProcessor.disable();
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
    options.token = await agoraGetAppData(options);
    await join();
    setOptionsToLocal(options);
    message.success("join channel success!");
    $("#switch-super-clarity").attr("disabled", false);
    $("#switch-pvc").attr("disabled", false);
  } catch (error) {
    console.error(error);
    message.error(error.message);
  } finally {
    $("#leave").attr("disabled", false);
  }
});

$("#leave").click(function (e) {
  leave();
});

$("#agora-collapse").on("show.bs.collapse	", function () {
  initDevices();
  AgoraRTC.onCameraChanged = async (changedDevice) => {
    initDevices();
  };
});

$(".cam-list").change(function (e) {
  switchCamera(e.target.value);
})

async function initPvcProcessor() {
  if (!pvcProcessor) {
    pvcProcessor = pvcExtension.createProcessor();
    pvcProcessor.onoverload = () => {
      console.log("overload event!");
    };
    pvcProcessor.enableAutoAdjust(localTracks.videoTrack, () => {
      console.log("PVC processor was disabled by auto adjuster");
    });
    await pvcProcessor.init();
  }
}

// Super Clarity only work on remote users
async function toggleSuperClarity(open) {
  const uids = Object.keys(remoteUsers);
  for (let uid of uids) {
    uid = String(uid);
    const user = remoteUsers[uid];
    let processor = superClarityProcessorMap.get(uid);
    if (!processor) {
      processor = superClarityExtension.createProcessor();
      superClarityProcessorMap.set(uid, processor);
      user.videoTrack.pipe(processor).pipe(user.videoTrack.processorDestination);
    }
    if (open) {
      await processor.enable();
    } else {
      await processor.disable();
    }
  }
}

async function closeProcessor(uid) {
  uid = String(uid);
  let processor = superClarityProcessorMap.get(uid);
  if (processor) {
    await processor.disable();
    await processor.release();
    superClarityProcessorMap.delete(uid);
  }
}

async function toggleSuperClarityOne(uid) {
  uid = String(uid);
  const user = remoteUsers[uid];
  let processor = superClarityProcessorMap.get(uid);
  if (!processor) {
    processor = superClarityExtension.createProcessor();
    superClarityProcessorMap.set(uid, processor);
    user.videoTrack.pipe(processor).pipe(user.videoTrack.processorDestination);
  }
  if ($("#switch-super-clarity").is(":checked")) {
    await processor.enable();
  } else {
    await processor.disable();
  }
}

async function changeVideoProfile(label) {
  curVideoProfile = AGORA_VIDEO_PROFILES.find((profile) => profile.label === label);
  // change the local video track`s encoder configuration
  localTracks.videoTrack &&
    (await localTracks.videoTrack.setEncoderConfiguration(curVideoProfile.value));
}

async function initDevices() {
  if (!localTracks.audioTrack) {
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "music_standard",
    });
  }
  if (!localTracks.videoTrack) {
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: curVideoProfile.value,
    });
  }
  // get cameras
  cams = await AgoraRTC.getCameras();
  const videoTrackLabel = localTracks.videoTrack.getTrackLabel();
  currentCam = cams.find((item) => item.label === videoTrackLabel);
  $(".cam-list").empty();
  cams.forEach((cam) => {
    const value = cam.label.split(" ").join("");
    $(".cam-list").append(`<option value=${value}>${cam.label}</option>`);
  });

  $(".cam-list").val(videoTrackLabel.split(" ").join(""));
}

async function switchCamera(label) {
  currentCam = cams.find((cam) => cam.label.split(" ").join("") === label);
  // switch device of local video track.
  await localTracks.videoTrack.setDevice(currentCam.deviceId);
}

function initVideoProfiles() {
  AGORA_VIDEO_PROFILES.forEach((profile) => {
    $(".profile-list").append(
      `<option value=${profile.label}>${profile.label}: ${profile.detail}</option>`,
    );
  });
  curVideoProfile = AGORA_VIDEO_PROFILES.find((item) => item.label == DEFAULT_VIDEO_PROFILE);
  $(".profile-list").val(curVideoProfile.label);
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
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: curVideoProfile.value,
    });
  }
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`uid: ${options.uid}`);
  await client.publish(Object.values(localTracks));
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

  for (let uid of superClarityProcessorMap.keys()) {
    await closeProcessor(uid);
  }

  // Remove remote users and player views.
  remoteUsers = {};
  $("#remote-playerlist").html("");

  if (pvcProcessor) {
    pvcProcessor = null;
  }

  // leave the channel
  await client.leave();

  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  $("#switch-pvc").prop("checked", false);
  $("#switch-pvc").attr("disabled", true);
  $("#switch-super-clarity").prop("checked", false);
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
            <div id="player-${uid}" class="player">
                 <div class="remote-player-name">uid: ${uid}</div>
            </div>
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

async function handleUserUnpublished(user, mediaType) {
  if (mediaType === "video") {
    const id = user.uid;
    closeProcessor(id);
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
  }
}
