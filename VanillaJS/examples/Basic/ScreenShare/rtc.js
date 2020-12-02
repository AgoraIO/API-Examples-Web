/**
 *
 *
 * @export
 * @class RTC
 */
class RTC {
  client = null
  
  clientSpec = {
    mode: "live",
    codec: "vp8"
  }

  joined = false

  published = false

  localStream = null

  cameraId = ''

  microphoneId = ''

  localStreamSpec = {
    audio: false,
    video: false,
    screen: true,
  }

  remoteStreams = []

  uid = ''

  promise = Promise.resolve()

  constructor() {
    this.generateClient()
  }

  chainable(fn) {
    this.promise = this.promise.then(() => {
      return new Promise((resolve, reject) => {
        fn(resolve, reject)
      })
    })
    .catch(console.error)
    return this
  }

  initCameras(succeed) {
    return this.chainable((resolve) => {
      this.client.getCameras((cameras) => {
        this.setCameraId(cameras[0].deviceId)
        resolve(succeed(cameras))
      })
    })
  }

  initMicrophones(succeed) {
    return this.chainable((resolve) => {
      this.client.getRecordingDevices((microphones) => {
        this.setMicId(microphones[0].deviceId)
        resolve(succeed(microphones))
      })
    })
  }

  generateClient(clientSpec) {
    return this.chainable((resolve) => {
      this.clientSpec = clientSpec ?? this.clientSpec
      this.client = AgoraRTC.createClient(this.clientSpec)
      resolve()
    })
  }

  initClient(appID, succeed, fail) {
    return this.chainable((resolve, reject) => {
      this.client?.init(
        appID,
        () => { resolve(succeed()) },
        (err) => { reject(fail(err)) }
      )
    })
  }

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
  join(channelName, token, uid, succeed, fail) {
    return this.chainable((resolve, reject) => {
      this.client?.join(
        token ? token: null,
        channelName,
        uid ? uid: null,
        (uid) => { this.uid = uid; this.setJoined(true); resolve(succeed(uid)) },
        (err) => { reject(fail(err)) }
      )
    })
  }

  createStream(streamSpec) {
    return this.chainable((resolve) => {
      this.localStreamSpec = Object.assign(this.localStreamSpec, streamSpec)
      this.localStream = AgoraRTC.createStream({
        ...this.localStreamSpec,
        streamID: this.uid,
        microphoneId: this.microphoneId,
        cameraId: this.cameraId
      })
      resolve()
    })
  }

  // init local stream
  initStream(succeed, fail) {
    return this.chainable((resolve, reject) => {
      this.localStream?.init(
        () => { resolve(succeed()) },
        (err) => { reject(fail(err)) } 
      )
    })
  }

  on(eventName, handler) {
    return this.chainable((resolve) => {
      this.client.on(eventName, handler)
      resolve()
    })
  }

  off(eventName, handler) {
    return this.chainable((resolve) => {
      this.client.off(eventName, handler)
      resolve()
    })
  }

  publish(succeed, fail) {
    return this.chainable((resolve, reject) => {
      const eventName = 'stream-published'
      const handlePublish = () => {
        this.setPublished(true)
        resolve(succeed())
        // hack, can not use `this.off(eventName, handlePublish)` directly
        this.client.off(eventName, handlePublish)
      }
      // hack, can not use `this.on(eventName, handlePublish)` directly
      this.client.on(eventName, handlePublish)
      this.client.publish(this.localStream, (err) => {
        reject(fail(err))
      })
    })
  }

  unpublish(succeed, fail) {
    return this.chainable((resolve, reject) => {
      const eventName = 'stream-unpublished'
      const handleUnPublish = () => {
        this.setPublished(false)
        resolve(succeed())
        // hack, can not use `this.off(eventName, handlePublish)` directly
        this.client.off(eventName, handleUnPublish)
      }
      // hack, can not use `this.on(eventName, handlePublish)` directly
      this.client.on(eventName, handleUnPublish)
      this.client.unpublish(this.localStream, (err) => {
        reject(fail(err))
      })
    })
  }

  // leave channel
  leave(succeed, fail) {
    return this.chainable((resolve, reject) => {
      this.client.leave(() => {
        // close stream
        this.localStream.close()
        // stop stream
        this.localStream.stop()
        // set unpublished
        this.setPublished(false)
        this.localStream = null
        this.setJoined(false)
        resolve(succeed())
      }, (err) => {
        reject(fail(err))
      })
    })
  }

  getDevicesList(getCameras, getMicrophones) {
    return this.initCameras(getCameras).initMicrophones(getMicrophones)
  }

  addRemoteStreams(remoteStream) {
    this.remoteStreams.push(remoteStream)
  }

  removeRemoteStreams(remoteStreamId) {
    this.remoteStreams = this.remoteStreams.filter((stream) => stream.getId() !== remoteStreamId)
  }

  getJoined() {
    return this.joined
  }

  setJoined(joined) {
    this.joined = joined
    if (!this.joined) {
      this.remoteStreams = []
    }
  }

  getPublished() {
    return this.published
  }

  setPublished(published) {
    this.published = published
  }

  getClient() {
    return this.client
  }

  getUid() {
    return this.uid
  }

  setUid(uid) {
    this.uid = uid
  }

  getLocalStream() {
    return this.localStream
  }

  setCameraId(id) {
    this.cameraId = id
  }

  setMicId(id) {
    this.microphoneId = id
  }
}
