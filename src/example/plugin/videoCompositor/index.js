const vcExtension = new VideoCompositingExtension();
AgoraRTC.registerExtensions([vcExtension]);

let vcProcessor = null;
let sourceVideoTrack1 = null;
let screenShareTrack = null;
var localTracks = {
  videoTrack: null,
  audioTrack: null
};

// create Agora client
var client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});

var remoteUsers = {};
// Agora client options
var options = getOptionsFromLocal()

const cityPic = "./assets/city.jpg";
const spacePic = "./assets/space.jpg";


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



async function join() {
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // start Proxy if needed
  const mode = Number(options.proxyMode)
  if (mode != 0 && !isNaN(mode)) {
    client.startProxyServer(mode);
  }

  vcProcessor = vcExtension.createProcessor();
  // Create screen share track as background
  screenShareTrack = await AgoraRTC.createScreenVideoTrack({
    encoderConfig: {
      frameRate: 15
    }
  });
  const screenShareEndpoint = vcProcessor.createInputEndpoint({
    x: 0,
    y: 0,
    width: 1280,
    height: 720,
    fit: 'cover'
  });
  screenShareTrack.pipe(screenShareEndpoint).pipe(screenShareTrack.processorDestination);


  // Add 2 images
  vcProcessor.addImage(cityPic, {
    x: 960,
    y: 0,
    width: 320,
    height: 180,
    fit: 'cover'
  });
  vcProcessor.addImage(spacePic, {
    x: 0,
    y: 540,
    width: 320,
    height: 180,
    fit: 'cover'
  });

  // Create source track 1
  sourceVideoTrack1 = await AgoraRTC.createCameraVideoTrack({
    encoderConfig: '720p_1'
  });

  // 3. Add source tracks to compositor
  const endpoint1 = vcProcessor.createInputEndpoint({
    x: 0,
    y: 0,
    width: 320,
    height: 180,
    fit: 'cover'
  });
  sourceVideoTrack1.pipe(endpoint1).pipe(sourceVideoTrack1.processorDestination);


  // 4. Set background and size, create custom video track with canvas
  vcProcessor.setOutputOptions(1280, 720, 15);
  await vcProcessor.start();


  const canvas = document.createElement('canvas');
  canvas.getContext('2d');
  localTracks.videoTrack = AgoraRTC.createCustomVideoTrack({
    mediaStreamTrack: canvas.captureStream().getVideoTracks()[0]
  });
  localTracks.videoTrack.pipe(vcProcessor).pipe(localTracks.videoTrack.processorDestination);
  localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

  // join the channel
  options.uid = await client.join(options.appid, options.channel, options.token || null, options.uid || null);
  // create local audio and video tracks


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

  sourceVideoTrack1?.unpipe();
  sourceVideoTrack1?.close();
  sourceVideoTrack1 = null;
  screenShareTrack?.unpipe();
  screenShareTrack.close();
  screenShareTrack = null;

  // remove remote users and player views
  remoteUsers = {};
  $("#remote-playerlist").html("");

  // leave the channel
  await client.leave();

  $("#local-player-name").text("");
  $("#leave").attr("disabled", true);
  $("#join").attr("disabled", false);
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
    user.videoTrack.play(`player-${uid}`, {
      fit: "contain"
    });
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

//download imageData picture.
async function downloadImageData(data) {
  //create canvas，set the canvas's width and height as data(imageData object)'s width and height.
  const canvas = document.createElement("canvas");
  canvas.width = data.width;
  canvas.height = data.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  //put imageData object value into canvas
  ctx.putImageData(data, 0, 0);
  //convert the canvas picture to base64 format.
  const dataURL = canvas.toDataURL();
  //create a hyperlink, and set the value as previous 'dataURL' value, so that we can download as capture.png file.
  const link = document.createElement("a");
  link.download = "capture.png";
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  link.remove();
  canvas.remove();
}
