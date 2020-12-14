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

  function layoutRTMPStreams(uids) {
    var itemWidth = 640, itemHeight = 360
    if(uids.length <= 4 && uids.length > 1) {
      itemWidth = 320
      itemHeight = 180
    }

    var transcodingUsers = []
    var noCols = 640 / itemWidth
    var noRows = 360 / itemHeight
    var idx = 0
    for(var row = 0; row < noRows; row++) {
      for(var col = 0; col < noCols; col++) {
        if(idx < uids.length) {
          transcodingUsers.push({
            x: col * itemWidth,
            y: row * itemHeight,
            width: itemWidth,
            height: itemHeight,
            zOrder: 0,
            alpha: 1.0,
           // The uid must be identical to the uid used in Client.join.
            uid: uids[idx++],
          })
        }
      }
    }
    return transcodingUsers
  }

  function updateTranscoding() {
    var transcoding = $("#rtmp-transcoding-check").val() === "on"
    if(transcoding) {
      var uids = []
      uids.push(localUid)
      Object.keys(remoteStreams).forEach(function(uid){uids.push(uid)})
      var transcodingUsers = layoutRTMPStreams(uids)

      var options = {
        // Width of the video (px). The default value is 640.
        width: 640,
        // Height of the video (px). The default value is 360.
        height: 360,
        // Bitrate of the video (Kbps). The default value is 400.
        videoBitrate: 400,
        // Frame rate of the video (fps). The default value is 15. Agora adjusts all values over 30 to 30.
        videoFramerate: 15,
        audioSampleRate: AgoraRTC.AUDIO_SAMPLE_RATE_48000,
        audioBitrate: 48,
        audioChannels: 1,
        videoGop: 30,
        // Video codec profile. Choose to set as Baseline (66), Main (77), or High (100). If you set this parameter to other values, Agora adjusts it to the default value of 100.
        videoCodecProfile: AgoraRTC.VIDEO_CODEC_PROFILE_HIGH,
        userCount: transcodingUsers.length,
        userConfigExtraInfo: {},
        backgroundColor: 0x000000,
        // Adds a PNG watermark image to the video. You can add more than one watermark image at the same time.
        images: [],
        // Sets the output layout for each user.
        transcodingUsers: transcodingUsers,
      };
      client.setLiveTranscoding(options)
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
        // update live transcoding if needed
        updateTranscoding()

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

        // update live transcoding if needed
        updateTranscoding()
      })

      client.on("peer-leave", function onStreamRemoved(e) {
        var uid = e.uid
        $("#remote-" + uid).remove()
        // clear stream from map
        delete remoteStreams[uid]

        // update live transcoding if needed
        updateTranscoding()
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

        var cameraId = $("#camera-list").val()
        var microphoneId = $("#mic-list").val()

        localStream = AgoraRTC.createStream({
          streamID: localUid,
          audio: !!microphoneId,
          video: !!cameraId,
          screen: false,
          microphoneId: microphoneId,
          cameraId: cameraId
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
  
  // click on start live 
  $('#rtmp-start-btn').on("click", function onStartLive(e) {
    var rtmpUrl = $("#rtml-url-field").val()
    var transcoding = $("#rtmp-transcoding-check").val() === "on"
    try {
      transcoding && updateTranscoding()
      client.startLiveStreaming(rtmpUrl, transcoding)
    } catch(e) {
      alert(e.reason)
    }
  })

  // click on stop live 
  $('#rtmp-stop-btn').on("click", function onStartLive(e) {
    try {
      client.stopLiveStreaming()
    } catch(e) {
      alert(e.reason)
    }
  })
})
