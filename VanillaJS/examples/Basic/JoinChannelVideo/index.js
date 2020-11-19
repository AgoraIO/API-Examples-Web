$(function () {
  'use strict'

  var isJoined = false

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

  // prepare camera/mic devices
  var currentCameras = []
  client.getCameras(function(cameras) {
    currentCameras = cameras
    $("#camera-list").html(cameras.map(function(camera) {return '<option value="' + camera.deviceId + '">' + camera.label + '</option>'}))
  })
  var currentMicrophones = []
  client.getRecordingDevices(function(microphones) {
    currentMicrophones = microphones
    $("#mic-list").html(microphones.map(function(mic) {return '<option value="' + mic.deviceId + '">' + mic.label + '</option>'}))
  })


  // click on join button
  $('#join-btn').on("click", function onJoin(e) {
    e.preventDefault()

    if(isJoined) {
      alert("Already Joined")
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
          '<div id="remote-' + uid + '" class="col-md-4 remote-video-wrapper">' +
            '<div id="remote-video-' + uid + '" class="card mb-4 shadow-sm">' +
              '<div class="bd-placeholder-img card-img-top align-items-center justify-content-center d-flex position-relative"aria-label="Placeholder: Thumbnail">' +
                '<div id="remote-video-container-' + uid + '" class="video-element position-absolute"></div>' +
                '<text>Remote Video</text>' +
              '</div>' +
              '<div class="card-body">' +
                '<div class="d-flex justify-content-between align-items-center">' +
                  '<div class="btn-group">' +
                    '<button class="btn btn-lg text-primary cam-toggle" style="background-color:transparent;" data-toggle="button" aria-pressed="false" autocomplete="off">' +
                        '<svg class="bi" width="16" height="16" fill="currentColor">' +
                          '<use xlink:href="../../../assets/vendor/css/bootstrap-icons.svg#camera-video-fill"/>' +
                        '</svg>' +
                    '</button>' +
                    '<button class="btn btn-lg text-primary mic-toggle" style="background-color:transparent;" data-toggle="button" aria-pressed="false" autocomplete="off">' +
                      '<svg class="bi" width="16" height="16" fill="currentColor">' +
                        '<use xlink:href="../../../assets/vendor/css/bootstrap-icons.svg#mic-fill"/>' +
                      '</svg>' +
                    '</button>' +
                  '</div>' +
                  '<small class="text-muted"></small>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>'
        $('.videos .row').append(html)

        stream.on('player-status-change', (evt) => {
          console.log('remote player ' + uid + ' status change', evt)
        })
        stream.play("remote-video-container-" + uid)
      })

      client.on("stream-removed", function onStreamRemoved(e) {
        var stream = e.stream
        var uid = stream.getId()
        $("#remote-" + uid).remove()
      })

      client.on("peer-leave", function onStreamRemoved(e) {
        var uid = e.uid
        $("#remote-" + uid).remove()
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
        isJoined = true


        var cameraId = $("#camera-list").val()
        var microphoneId = $("#mic-list").val()

        localStream = AgoraRTC.createStream({
          streamID: localUid,
          audio: !!cameraId,
          video: !!microphoneId,
          screen: false,
          microphoneId: microphoneId,
          cameraId: cameraId
        })

        localStream.on('player-status-change', (evt) => {
          console.log('player status change', evt)
        })

        // if (data.cameraResolution && data.cameraResolution != 'default') {
        //   // set local video resolution
        //   this._localStream.setVideoProfile(data.cameraResolution)
        // }

        // init local stream
        localStream.init(function() {
          console.log('init local stream success')
          // play stream with html element id "local_stream"
          localStream.play('local-video-container', {fit: 'cover'})
        }, function(err) {
          console.error(err)
        })
      }, function(err) {
        console.error(err)
      })
    }, function(err) {
      console.error(err)
    })
  })

  // click on join button
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

      // remove all remote doms
      $(".remote-video-wrapper").remove()

      localStream = null
      console.log('client leaves channel success')
      isJoined = false
    }, function(err) {
      console.log('channel leave failed')
      console.error(err)
    })
  })

  // click on publish button
  $('#publish-btn').on("click", function onPublish(e) {
    e.preventDefault()

    if(!isJoined) {
      alert("Not Joined")
      return
    }
  })

  $('#local-video .cam-toggle').on("click", function onToggleLocalCam(e){
    var jthis = $(this)
    var pressed = jthis.attr("aria-pressed") === "true"
    jthis.removeClass("text-primary text-muted").addClass(!pressed ? "text-muted" : "text-primary")
    jthis.find("use")[0].setAttribute("xlink:href", pressed ? "../../../assets/vendor/css/bootstrap-icons.svg#camera-video-fill" : "../../../assets/vendor/css/bootstrap-icons.svg#camera-video-off-fill")
  
    if(pressed) {
      localStream.muteVideo()
    } else {
      localStream.unmuteVideo()
    }
  })

  $('#local-video .mic-toggle').on("click", function onToggleLocalMic(e){
    var jthis = $(this)
    var pressed = jthis.attr("aria-pressed") === "true"
    jthis.removeClass("text-primary text-muted").addClass(!pressed ? "text-muted" : "text-primary")
    jthis.find("use")[0].setAttribute("xlink:href", pressed ? "../../../assets/vendor/css/bootstrap-icons.svg#mic-fill" : "../../../assets/vendor/css/bootstrap-icons.svg#mic-mute-fill")

    if(pressed) {
      localStream.muteAudio()
    } else {
      localStream.unmuteAudio()
    }
  })
})
