/**
 *
 *
 * @export
 * @class RTC
 */
export class RTC {
  #client = null

  #joined = false

  #published = false

  #localStream = null

  #remoteStreams = []

  #clientSpec = {
    mode: "live",
    codec: "vp8"
  }

  #uid = ''

  #cameraId = ''

  #microphoneId = ''

  constructor() {
    this.generateClient()
  }

  #initCameras(next) {
    this.#client.getCameras((cameras) => {
      this.#cameraId = cameras[0].deviceId
      next(cameras)
    })
  }

  #initMicrophones(next) {
    this.#client.getRecordingDevices((microphones) => {
      this.#microphoneId = microphones[0].deviceId
      next(microphones)
    })
  }

  getDevicesList(getCameras, getMicrophones) {
    this.#initCameras(getCameras)
    this.#initMicrophones(getMicrophones)
    return this
  }

  generateClient(clientSpec) {
    this.#clientSpec = clientSpec ?? this.#clientSpec
    this.#client = AgoraRTC.createClient(this.#clientSpec)
    return this
  }

  join(appID, channelName, token , uid, joinedSucceed, streamInitSucceed) {
    this.#client.init(appID, () => {
      this.#client.join(token ? token: null, channelName, uid ? uid: null,  (uid) => {
        this.#uid = uid
        joinedSucceed(uid)
        this.setJoined(true)
        this.#localStream = AgoraRTC.createStream({
          streamID: uid,
          audio: false,
          video: false,
          screen: true,
          microphoneId: this.#microphoneId,
          cameraId: this.#cameraId
        })
        this.#localStream.init(() => {
          streamInitSucceed(this.#localStream)
        })
      })
    })
    return this
  }

  on(eventName, handler) {
    this.#client.on(eventName, handler)
    return this
  }

  off(eventName, handler) {
    this.#client.off(eventName, handler)
    return this
  }

  addRemoteStreams(remoteStream) {
    this.#remoteStreams.push(remoteStream)
  }

  removeRemoteStreams(remoteStreamId) {
    this.#remoteStreams = this.#remoteStreams.filter((stream) => stream.getId() !== remoteStreamId)
  }

  publish(succeed, fail) {
    const eventName = 'stream-published'
    const handlePublish = () => {
      this.off(eventName, handlePublish)
      this.setPublished(true)
      succeed()
    }
    this.on(eventName, handlePublish)
    this.#client.publish(this.#localStream, (err) => {
      fail(err)
    })
  }

  unpublish(succeed, fail) {
    const eventName = 'stream-unpublished'
    const handleUnPublish = () => {
      this.off(eventName, handleUnPublish)
      this.setPublished(false)
      succeed()
    }
    this.on(eventName, handleUnPublish)
    this.#client.unpublish(this.#localStream, (err) => {
      fail(err)
    })
  }

  leave(succeed, fail) {
    this.#client.leave(() => {
      this.#localStream.close()
      this.#localStream.stop()
      console.log('client leaves channel success')
      this.setPublished(false)
      this.#localStream = null
      this.setJoined(false)
      succeed()
    }, (err) => {
      fail(err)
    })
  }

  getJoined() {
    return this.#joined
  }

  setJoined(joined) {
    this.#joined = joined
    if (!this.#joined) {
      this.#remoteStreams = []
    }
  }

  setPublished(published) {
    this.#published = published
  }

  getClient() {
    return this.#client
  }

  getUid() {
    return this.#uid
  }

  getPublished() {
    return this.#published
  }

  getLocalStream() {
    return this.#localStream
  }

  setCameraId(id) {
    this.#cameraId = id
  }

  setMicId(id) {
    this.#microphoneId = id
  }
}
