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

let denoiser = null;
let processor = null;
let processorIsDisable = true;

const optionState = {
  currentBlurDegree: 1,
  // 1, 2, 3
  currentColor: "#00ff00",
  currentImageUrl: ""
};

$("#vb-area").hide();


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
    $("#vb-area").show()
    let curType = $("#pills-tab").val();
    showChoseType(curType)
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

function showChoseType(curType) {
  let types = ["blur", "color", "image"]
  types.forEach(type => {
    if (type == curType) {
      $(`#${type}-wrapper`).show()
    } else {
      $(`#${type}-wrapper`).hide()
    }
  })
}

async function join() {
  // Add an event listener to play remote tracks when remote user publishes.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);
  [options.uid, localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([client.join(options.appid, options.channel, options.token || null, options.uid || null), AgoraRTC.createMicrophoneAudioTrack({
    encoderConfig: "music_standard"
  }), AgoraRTC.createCameraVideoTrack()]);

  // Play the local video track to the local browser and update the UI with the user ID.
  localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`uid: ${options.uid}`);

  localTracks.audioTrack.play();

  // Publish the local video and audio tracks to the channel.
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
  $("#vb-area").removeClass("show").addClass("hide");
  $("#openVirtualBackground").attr("disabled", false);
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
    // user.audioTrack.play();
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

const loadImage = url => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("url is empty"));
    }
    const image = new Image();
    image.src = url;
    image.style = "display:none;width:10px;height:10px;";
    image.crossOrigin = "anonymous";
    image.onload = () => {
      resolve(image);
    };
    document.body.appendChild(image);
  });
};


const pipeProcessor = (track, processor) => {
  track.pipe(processor).pipe(track.processorDestination);
  message.success("pipe processor success!");
};


$("#openVirtualBackground").click(async e => {
  e.preventDefault();
  denoiser = denoiser || (() => {
    let denoiser = new VirtualBackgroundExtension();
    AgoraRTC.registerExtensions([denoiser]);
    return denoiser;
  })();

  processor = processor || (await (async () => {
    let processor = denoiser.createProcessor();
    processor.eventBus.on("PERFORMANCE_WARNING", () => {
      console.warn("Performance warning!!!!!!!!!!!!!!!!!");
    });
    try {
      await processor.init("./agora-extension-virtual-background/wasms");
      $("#success-alert-processor-init").removeClass("hide").addClass("show");
      setTimeout(() => {
        $("#success-alert-processor-init").removeClass("show").addClass("hide");
      }, 3000);
    } catch (error) {
      console.error(error);
      processor = null;
    }
    return processor;
  })());

  pipeProcessor(localTracks.videoTrack, processor);

  $("#openVirtualBackground").attr("disabled", true);
});


$("#enableVirtualBackground").click(async e => {
  e.preventDefault();
  $("#enableVirtualBackgroundr").disable = true;
  if (processorIsDisable) {
    try {
      await processor.enable();
      $("#enableVirtualBackground").text("Disable VirtualBackground");
      message.success("enable VirtualBackground success!");
      processorIsDisable = false;
    } catch (e) {
      console.error("enable VirtualBackground failure", e);
    } finally {
      $("#enableVirtualBackground").disable = false;
    }
  } else {
    try {
      await processor.disable();
      $("#enableVirtualBackground").text("Enable VirtualBackground");
      message.success("disable VirtualBackground success!");
      processorIsDisable = true;
    } catch (e) {
      console.error("disable VirtualBackground failure", e);
    } finally {
      $("#enableVirtualBackground").disable = false;
    }
  }
});


$("#pills-tab").change(function () {
  showChoseType(this.value)
})

$("#vb-require").click(async e => {
  e.preventDefault();
  if (processorIsDisable) {
    let msg = "can not set options before processor enabled"
    message.error(msg);
    throw new Error(msg);
  }
  let curType = $("#pills-tab").val();
  let option = {};
  switch (curType) {
    case "blur":
      option = {
        type: 'blur',
        blurDegree: Number(optionState.currentBlurDegree)
      };
      break;
    case "color":
      option = {
        type: 'color',
        color: optionState.currentColor
      };
      break;
    case "image":
      option = {
        type: 'img',
        source: await loadImage(optionState.currentImageUrl)
      };
      break;
  }
  processor.setOptions(option);
  $("#vb-option-tip").text(`type: ${curType} , options: ${JSON.stringify(option)}`);
});



$(".vb-blur-level").change(function (e) {
  tempSelected = "blur";
  optionState.currentBlurDegree = Number(this.value);
})

$("#vb-color-input").blur(e => {
  tempSelected = "color";
  optionState.currentColor = e.currentTarget.value;
});

$("#vb-image-url").change(e => {
  tempSelected = "image";
  optionState.currentImageUrl = `https://${e.currentTarget.value}`;
});

$('a[data-toggle="pill"]').on("shown.bs.tab", e => {
  tempSelected = e.target.dataset.v;
  if (tempSelected === "image") {
    optionState.currentImageUrl = "https://" + $("#vb-image-url").val();
  }
});
