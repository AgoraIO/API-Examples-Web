$(function() {
  const rtc = new RTC()
  rtc.getDevicesList(getCameras, getMicrophones)

  // prepare camera devices
  function getCameras(cameras) {
    $("#camera-list").html(cameras.map((camera) => { return '<option value="' + camera.deviceId + '">' + camera.label + '</option>' }))
  }

  // prepare mic devices
  function getMicrophones(microphones) {
    $("#mic-list").html(microphones.map((mic) => { return '<option value="' + mic.deviceId + '">' + mic.label + '</option>' }))
  }

  function onChangeClientConfig() {
    if (rtc.getJoined()) {
      return alert("change codec is allowed before join channel only")
    }
    const mode = $('#mode-picker').val()
    const codec = $('#codec-picker').val()
    rtc.generateClient({ mode, codec })
  }

  function addView(uid) {
    const html = 
    '<div id="remote-' + uid + '" class="col-md-4 remote-video">' +
      '<div id="remote-video-' + uid + '" class="card mb-4 shadow-sm">' +
        '<div class="bd-placeholder-img card-img-top align-items-center justify-content-center d-flex position-relative"aria-label="Placeholder: Thumbnail">' +
          '<div id="remote-video-container-' + uid + '" class="video-element position-absolute"></div>' +
          '<text>Remote Video</text>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="d-flex justify-content-between align-items-center">' +
            '<div class="btn-group" data-uid="' + uid + '" >' +
              '<button class="btn btn-lg text-primary cam-toggle camera-on icon" style="background-color:transparent;" data-toggle="button" aria-pressed="false" autocomplete="off">' +
              '</button>' +
              '<button class="btn btn-lg text-primary mic-toggle mic-on icon" style="background-color:transparent;" data-toggle="button" aria-pressed="false" autocomplete="off">' +
              '</button>' +
            '</div>' +
            '<small class="text-muted uid-label">Uid: ' + uid + '</small>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
    $('.videos .row').append(html)
  }

  function removeView(uid) {
    $("#remote-" + uid).remove()
  }

  function onVideoEncoderConfigurationChange() {
    if (!rtc.getLocalStream()) {
      return
    }
    const resolution = $("#resolution-picker").val()
    const fps = $("#fps-picker").val()

    console.log("video encoder configuration update: " + resolution + ", " + fps + "fps")
    rtc.getLocalStream().setVideoEncoderConfiguration({
      resolution: {
        width: parseInt(resolution.split("x")[0]),
        height: parseInt(resolution.split("x")[1])
      },
      frameRate: {
        min: parseInt(fps),
        max: 30
      }
    })
  }


  // listen to video encoder configuration change
  $("#codec-picker").on("change", onChangeClientConfig)
  $("#mode-picker").on("change", onChangeClientConfig)

  $("#camera-list").on("change", () => {
    const cameraId = $("camera-list").val()
    rtc.setCameraId(cameraId)
  })
  $("#mic-list").on("change", () => {
    const micId = $("#mic-list").val()
    rtc.setMicId(micId)
  })

  $('#resolution-picker').on("change", onVideoEncoderConfigurationChange)
  $('#fps-picker').on("change", onVideoEncoderConfigurationChange)

  // click on share button
  $("#share-btn").on("click", (e) => {
    e.preventDefault()
  
    if (rtc.getJoined()) {
      alert("already joined")
      return
    }

    const appID = $("#appid-field").val()
    const token = $("#token-field").val()
    const channelName = $("#channel-field").val()
    const uid = $("#uid-field").val()

    if(!appID || !channelName) {
      alert("appID and channelName are mandatory")
      return
    }

    const mode = $('#mode-picker').val()
    const codec = $('#codec-picker').val()

    rtc
      .generateClient({ mode, codec })
      .on("error", (evt) => {
        console.error(evt)
      })
      .on("stream-added", (evt) => {
        const remoteStream = evt.stream
        const remoteStreamId = remoteStream.getId()
        if (remoteStreamId !== rtc.getUid()) {
          rtc.getClient().subscribe(remoteStream, () => {
            if (evt.stream.getId() !== rtc.getUid())
            console.error("stream subscribe failed: ", err)
          })
        }
        console.log('stream-added remote-uid: ', remoteStreamId)
      })
      .on("stream-subscribed", (evt) => {
        const remoteStream = evt.stream
        const remoteStreamId = remoteStream.getId()
        rtc.addRemoteStreams(remoteStream)
        addView(remoteStreamId)
        remoteStream.play(`remote-video-container-${ remoteStreamId }`, { fit: "cover" })
        console.log('stream-subscribed remote-uid: ', remoteStreamId)
      })
      .on("stream-removed", (evt) => {
        const remoteStream = evt.stream
        const remoteStreamId = remoteStream.getId()
        rtc.removeRemoteStreams(remoteStreamId)
        removeView(remoteStreamId)
        remoteStream.close()
        console.log('stream-removed', remoteStreamId)
      })
      .on("peer-leave", (evt) => {
        const remoteStream = evt.stream
        const remoteStreamId = remoteStream.getId()
        rtc.removeRemoteStreams(remoteStreamId)
        removeView(remoteStreamId)
        remoteStream.close()
        console.log('peer-leave', remoteStreamId)
      })
      .initClient(appID,
        console.log.bind(null, "init success"),
        console.error.bind(null)
      )
      .join(channelName, token, uid,
        () => {
          console.log("join success")
          $("#local-video .uid-label").text("Uid: " + rtc.getUid())
        },
        console.error.bind(null)  
      )
      .createStream({ screen: true })
      .initStream(
        () => {
          console.log("init local stream success")
          rtc.getLocalStream().play('local-video-container', { fit: 'cover' })
        },
        console.error.bind(null)
      )
  })

  // click on publish button
  $("#publish-btn").on("click", (e) => {
    e.preventDefault()
    if (!rtc.getClient()) {
      alert("Please Join First")
      return
    }
    if (rtc.getPublished()) {
      alert("Your already published")
      return
    }
    rtc.publish(
      console.log.bind(null, "publish success"),
      console.error.bind(null, "publish failed")
    )
  })

  // click on unpublish button
  $("#unpublish-btn").on("click", (e) => {
    e.preventDefault()
    if (!rtc.getClient()) {
      alert("Please Join First")
      return
    }
    if (!rtc.getPublished()) {
      alert("Your did not publish")
      return
    }
    rtc.unpublish(
      console.log.bind(null, "unpublish success"),
      console.error.bind(null, "unpublish failed")
    )
  })

  // click on leave button
  $("#leave-btn").on("click", (e) => {
    e.preventDefault()
    if (!rtc.getClient()) {
      alert('Please Join First!')
      return
    }
    if (!rtc.getJoined()) {
      alert("You are not in channel")
      return
    }
    rtc.leave(
      () => {
        $(".remote-video").remove()
        console.log("client leaves channel success")
      },
      console.error.bind(null, "channel leave failed")
    )
  })
})
