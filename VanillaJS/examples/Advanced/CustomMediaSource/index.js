$(function () {
  'use strict'

  var isJoined = false
  var isPublished = false

  function setJoined(joined) {
    isJoined = joined
    if(!joined) {
      remoteStreams = {}
    }
  }

  function setPublished(published) {
    // no change
    if(published === isPublished) {
      return
    }
    isPublished = published
    if(published) {
      $("#local-video .card-state").removeClass("unpublish-state").addClass("publish-state")
    } else {
      $("#local-video .card-state").removeClass("publish-state").addClass("unpublish-state")
    }
  }

  /**
   * A class defining the properties of the config parameter in the createClient method.
   * Note:
   *    Ensure that you do not leave mode and codec as empty.
   *    Ensure that you set these properties before calling Client.join.
   *  You could find more detail here. https://docs.agora.io/en/Video/API%20Reference/web/interfaces/agorartc.clientconfig.html
  **/
  var client = AgoraRTC.createClient({
    mode: "live",
    codec: "vp8"
  })
  var localStream, localUid
  // key value map of remote streams
  var remoteStreams = {}
  var cameraStream, videoStream, canvasStream

  // prepare camera/mic devices
  client.getCameras(function(cameras) {
    $("#camera-list").html(cameras.map(function(camera) {return '<option value="' + camera.deviceId + '">' + camera.label + '</option>'}))
  })
  client.getRecordingDevices(function(microphones) {
    $("#mic-list").html(microphones.map(function(mic) {return '<option value="' + mic.deviceId + '">' + mic.label + '</option>'}))
  })

  function onChangeClientConfig() {
    if(isJoined){
      return alert("change codec is allowed before join channel only")
    }

    var mode = $('#mode-picker').val()
    var codec = $('#codec-picker').val()
    console.log("switch to codec: " + codec + ", mode: " + mode)
    client = AgoraRTC.createClient({
      mode: mode,
      codec: codec
    })
  }

  // listen to video encoder configuration change
  $('#codec-picker').on("change", onChangeClientConfig)
  $('#mode-picker').on("change", onChangeClientConfig)

  function onVideoEncoderConfigurationChange() {
    if(!localStream) {
      // do not proceed if local stream is not yet available
      return
    }

    var resolution = $("#resolution-picker").val()
    var fps = $("#fps-picker").val()

    console.log("video encoder configuration update: " + resolution + ", " + fps + "fps")

    //https://docs.agora.io/cn/Voice/API%20Reference/web/interfaces/agorartc.stream.html#agorartc.stream.html#setvideoencoderconfiguration
    localStream.setVideoEncoderConfiguration({
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
  $('#resolution-picker').on("change", onVideoEncoderConfigurationChange)
  $('#fps-picker').on("change", onVideoEncoderConfigurationChange)

  function getSelectedSource(callback) {
    var sourceType = $('#source-picker').val()

    if(sourceType === "camera") {
      var cameraId = $("#camera-list").val()
      var microphoneId = $("#mic-list").val()
      var resolution = $("#resolution-picker").val()
      navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: {exact: microphoneId}
        },
        video: {
          width: { ideal: parseInt(resolution.split("x")[0]) },
          height: { ideal: parseInt(resolution.split("x")[1]) },
          deviceId: {exact: cameraId}
        }
      }).then(function(mediaStream) {
        cameraStream = mediaStream
        callback(null, sourceType, cameraStream)
      }).catch(function(err) { 
        showError(err.name + ": " + err.message)
        callback(err, sourceType)
      })
    } else if(sourceType === "video") {
      var videoDom = $("#source-mp4 video")[0]
      videoStream = videoDom.captureStream(60)
      callback(null, sourceType, videoStream)
    } else if(sourceType === "canvas") {
      var canvasDom = $("#source-canvas canvas")[0]
      canvasStream = canvasDom.captureStream(30)
      callback(null, sourceType, canvasStream)
    }
  }

  // listen to source change
  $('#source-picker').on("change", function(){
    var sourceType = $('#source-picker').val()
    if(sourceType === "camera") {
      $("#source-extra-options").addClass("hidden")
      $("#source-cam-options").removeClass("hidden")
    } else {
      $("#source-extra-options").removeClass("hidden")
      $("#source-cam-options").addClass("hidden")
      if(sourceType === "video") {
        $("#source-mp4").removeClass("hidden")
        $("#source-canvas").addClass("hidden")
      } else {
        $("#source-mp4").addClass("hidden")
        $("#source-canvas").removeClass("hidden")
      }
    }

    if(!localStream) {
      // do not proceed if local stream is not yet available
      return
    }

    // update source in local stream
    getSelectedSource(function(err, sourceType, stream) {
      var videoDom = $("#source-mp4 video")[0]
      if(sourceType === "video") {
        videoDom.play()
      } else {
        videoDom.pause()
      }
      localStream.replaceTrack(stream.getVideoTracks()[0])
      localStream.replaceTrack(stream.getAudioTracks()[0])
    })
  })

  // click on join button
  $('#join-btn').on("click", function onJoin(e) {
    e.preventDefault()

    if(isJoined) {
      alert("already joined")
      return
    }

    var appID = $("#appid-field").val()
    var token = $("#token-field").val()
    var channelName = $("#channel-field").val()
    var uid = $("#uid-field").val()
   
    if(!appID || !channelName) {
      alert("appID and channelName are mandatory")
      return
    }

    var mode = $('#mode-picker').val()
    var codec = $('#codec-picker').val()
    client = AgoraRTC.createClient({
      mode: mode,
      codec: codec
    })

    // init client
    client.init(appID, () => {
      console.log('init success')
  

      client.on("stream-added", function onStreamAdded(e){
        client.subscribe(e.stream)
      })

      client.on("stream-subscribed", function onStreamSubscribed(e){
        var stream = e.stream
        var uid = stream.getId()
        var html = 
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

        // store remote stream in map
        remoteStreams[uid] = stream

        // click on remote video camera toggle
        $('.remote-video .cam-toggle').on("click", function onToggleRemoteVideoMute(e){
          var jthis = $(this)
          var uid = jthis.parent().attr("data-uid")
          var stream = remoteStreams[uid]
          if(!stream) {
            return alert("remote stream " + uid + "not exists")
          }

          var pressed = jthis.attr("aria-pressed") === "true"
          jthis.removeClass("camera-on camera-off").addClass(!pressed ? "camera-off" : "camera-on")
          
          if(pressed) {
            stream.unmuteVideo()
          } else {
            stream.muteVideo()
          }
        })

        // click on remote audio mic toggle
        $('.remote-video .mic-toggle').on("click", function onToggleRemoteAudioMute(e){
          var jthis = $(this)
          var uid = jthis.parent().attr("data-uid")
          var stream = remoteStreams[uid]
          if(!stream) {
            return alert("remote stream " + uid + "not exists")
          }

          var pressed = jthis.attr("aria-pressed") === "true"
          jthis.removeClass("mic-on mic-off").addClass(!pressed ? "mic-off" : "mic-on")
          
          if(pressed) {
            stream.unmuteAudio()
          } else {
            stream.muteAudio()
          }
        })

        stream.on('player-status-change', (evt) => {
          console.log('remote player ' + uid + ' status change', evt)
        })
        stream.play("remote-video-container-" + uid)
      })

      client.on("stream-removed", function onStreamRemoved(e) {
        var stream = e.stream
        var uid = stream.getId()
        $("#remote-" + uid).remove()
        // clear stream from map
        delete remoteStreams[uid]
      })

      client.on("peer-leave", function onStreamRemoved(e) {
        var uid = e.uid
        $("#remote-" + uid).remove()
        // clear stream from map
        delete remoteStreams[uid]
      })

      /**
      * Joins an AgoraRTC Channel
      * This method joins an AgoraRTC channel.
      * Parameters
      * tokenOrKey: string | null
      *    Low security requirements: Pass null as the parameter value.
      *    High security requirements: Pass the string of the Token or Channel Key as the parameter value. See Use Security Keys for details.
      *  channel: string
      *    A string that provides a unique channel name for the Agora session. The length must be within 64 bytes. Supported character scopes:
      *    26 lowercase English letters a-z
      *    26 uppercase English letters A-Z
      *    10 numbers 0-9
      *    Space
      *    "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", "{", "}", "|", "~", ","
      *  uid: number | null
      *    The user ID, an integer. Ensure this ID is unique. If you set the uid to null, the server assigns one and returns it in the onSuccess callback.
      *   Note:
      *      All users in the same channel should have the same type (number) of uid.
      *      If you use a number as the user ID, it should be a 32-bit unsigned integer with a value ranging from 0 to (232-1).
      **/
      client.join(token ? token : null, channelName, uid ? uid : null, function(uid) {
        localUid = uid
        console.log('join channel: ' + channelName + ' success, uid: ' + uid)
        setJoined(true)

        // update local uid
        $("#local-video .uid-label").text("Uid: " + localUid)

        getSelectedSource(function(err, sourceType, stream){
          localStream = AgoraRTC.createStream({
            streamID: localUid,
            audio: true,
            video: true,
            audioSource: stream.getAudioTracks()[0],
            videoSource: stream.getVideoTracks()[0],
            mirror: false
          })

          localStream.on('player-status-change', (evt) => {
            console.log('player status change', evt)
          })


          var resolution = $("#resolution-picker").val()
          var fps = $("#fps-picker").val()
          //https://docs.agora.io/cn/Voice/API%20Reference/web/interfaces/agorartc.stream.html#agorartc.stream.html#setvideoencoderconfiguration
          localStream.setVideoEncoderConfiguration({
            resolution: {
                width: parseInt(resolution.split("x")[0]),
                height: parseInt(resolution.split("x")[1])
            },
            frameRate: {
                min: parseInt(fps),
                max: 30
            }
          })

          // init local stream
          localStream.init(function() {
            console.log('init local stream success')
            // play stream with html element id "local_stream"
            localStream.play('local-video-container', {fit: 'cover'})
          }, function(err) {
            showError(err)
          })
        })
      }, function(err) {
        showError(err)
      })
    }, function(err) {
      showError(err)
    })
  })

  // click on leave button
  $('#leave-btn').on("click", function onLeave(e) {
    e.preventDefault()

    if(!isJoined) {
      alert("Not Joined")
      return
    }

    // leave channel
    client.leave(function() {
      // close stream
      localStream.close()
      // stop stream
      localStream.stop()

      // set unpublished
      setPublished(false)
      
      // remove all remote doms
      $(".remote-video").remove()

      localStream = null
      console.log('client leaves channel success')
      setJoined(false)
    }, function(err) {
      showError(err)
    })
  })

  // click on publish button
  $('#publish-btn').on("click", function onPublish(e) {
    e.preventDefault()

    if(!isJoined) {
      alert("not joined")
      return
    }

    if(!localStream) {
      return alert("local stream not exists")
    }

    client.on("stream-published", function onStreamPublished(){
      console.log("publish success")
      setPublished(true)
      client.off("stream-published", onStreamPublished)
    })

    client.publish(localStream, function(err) {
      showError(err)
    })
  })

  // click on unpublish button
  $('#unpublish-btn').on("click", function onPublish(e) {
    e.preventDefault()

    if(!isJoined) {
      alert("not joined")
      return
    }

    if(!isPublished) {
      return alert("not published")
    }

    client.on("stream-unpublished", function onStreamUnpublished(){
      console.log("unpublish success")
      client.off("stream-unpublished", onStreamUnpublished)
      setPublished(false)
    })

    client.unpublish(localStream, function(err) {
      showError(err)
    })
  })

  // click on local video camera toggle
  $('#local-video .cam-toggle').on("click", function onToggleLocalCam(e){
    if(!localStream) {
      return alert("local stream not exists")
    }

    var jthis = $(this)
    var pressed = jthis.attr("aria-pressed") === "true"
    jthis.removeClass("camera-on camera-off").addClass(!pressed ? "camera-off" : "camera-on")
    
    if(pressed) {
      localStream.unmuteVideo()
    } else {
      localStream.muteVideo()
    }
  })

  // click on local audio mic toggle
  $('#local-video .mic-toggle').on("click", function onToggleLocalMic(e){
    if(!localStream) {
      return alert("local stream not exists")
    }
    var jthis = $(this)
    var pressed = jthis.attr("aria-pressed") === "true"
    jthis.removeClass("mic-on mic-off").addClass(!pressed ? "mic-off" : "mic-on")

    if(pressed) {
      localStream.unmuteAudio()
    } else {
      localStream.muteAudio()
    }
  })
  
})
