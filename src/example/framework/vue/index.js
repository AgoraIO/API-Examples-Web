AgoraRTC.onAutoplayFailed = () => {
  alert("click to start autoplay!");
};

$(function () {

  Vue.component('stream-player', {
    template: `
    <div class="player" ref="videoRef">
      <div class="card-text" class="player-name" v-if="uid">uid:{{uid}}</div>
    </div>`,
    props: {
      videoTrack: {
        type: Object,
        default: null
      },
      // local stream player not need play audioTrack
      audioTrack: {
        type: Object,
        default: null
      },
      uid: {
        type: [String, Number],
        default: ''
      },
      options: {
        type: Object,
        default: {}
      },
    },
    data() {
      return {
      }
    },
    mounted() {

    },
    watch: {
      videoTrack: {
        handler(newVideoTrack, oldVideoTrack) {
          if (newVideoTrack) {
            newVideoTrack?.play(this.$refs.videoRef, this.options)
          }
        },
        immediate: true,
      },
      audioTrack: {
        handler(newAudioTrack) {
          if (newAudioTrack) {
            newAudioTrack.play()
          }
        }
      }
    },
  })

  Vue.component('cam-select', {
    template: `<select class="form-select cam-list" v-model="curValue" required="">
      <option v-for="(item,index) in options" :key="index" :value="item.value">{{item.label}}</option>
  </select>`,
    props: {
      videoTrack: {
        default: null,
        type: Object
      }
    },
    data() {
      return {
        options: [{
          label: "Default",
          value: "default",
          deviceId: ""
        }],
        curValue: "default"
      }
    },
    mounted() {
      this.listen()
    },
    watch: {
      videoTrack: {
        async handler(videoTrack) {
          if (videoTrack) {
            await this.init()
            const label = videoTrack.getTrackLabel();
            this.curValue = this.options.find(item => item.label === label).value
          }
        },
        immediate: true
      },
      async curValue(value) {
        const target = this.options.find(item => item.label === value);
        if (this.videoTrack && target) {
          // switch device of local audio track.
          await this.videoTrack.setDevice(target.deviceId);
        }
      }
    },
    methods: {
      async init() {
        // get cameras
        const cams = await AgoraRTC.getCameras();
        this.options = cams.map(item => ({
          value: item.label,
          label: item.label,
          deviceId: item.deviceId
        }))
      },
      listen() {
        AgoraRTC.onCameraChanged = async changedDevice => {
          await this.init()
          if (this.videoTrack) {
            if (changedDevice.state === "ACTIVE") {
              // When plugging in a device, switch to a device that is newly plugged in.
              await this.videoTrack.setDevice(changedDevice.device.deviceId);
            } else if (changedDevice.device.label === this.videoTrack.getTrackLabel()) {
              // Switch to an existing device when the current device is unplugged.
              this.options[0] && await this.videoTrack.setDevice(this.options[0].deviceId);
            }
            // get new label from track 
            const label = this.videoTrack.getTrackLabel();
            this.curValue = this.options.find(item => item.label === label).value
          }
        };
      },
    }
  })

  Vue.component('mic-select', {
    template: `<select class="form-select mic-list" v-model="curValue">
    <option v-for="(item,index) in options" :key="index" :value="item.value">{{item.label}}</option>
  </select>`,
    props: {
      audioTrack: {
        default: null,
        type: Object
      }
    },
    data() {
      return {
        options: [{
          label: "Default",
          value: "default"
        }],
        curValue: "default"
      }
    },
    mounted() {
      this.listen()
    },
    watch: {
      audioTrack: {
        async handler(audioTrack) {
          if (audioTrack) {
            await this.init()
            const label = audioTrack.getTrackLabel();
            this.curValue = this.options.find(item => item.label === label).value
          }
        },
        immediate: true,
      },
      async curValue(value) {
        const target = this.options.find(item => item.label === value);
        if (this.audioTrack && target) {
          // switch device of local audio track.
          await this.audioTrack.setDevice(target.deviceId);
        }
      }
    },
    methods: {
      async init() {
        // get cameras
        const list = await AgoraRTC.getMicrophones();
        this.options = list.map(item => ({
          value: item.label,
          label: item.label,
          deviceId: item.deviceId
        }))
      },
      listen() {
        AgoraRTC.onMicrophoneChanged = async changedDevice => {
          await this.init()
          if (this.audioTrack) {
            // When plugging in a device, switch to a device that is newly plugged in.
            if (changedDevice.state === "ACTIVE") {
              await this.audioTrack.setDevice(changedDevice.device.deviceId);
              // Switch to an existing device when the current device is unplugged.
            } else if (changedDevice.device.label === localTracks.audioTrack.getTrackLabel()) {
              this.options[0] && await this.audioTrack.setDevice(this.options[0].deviceId);
            }
            // get new label from track 
            const label = this.audioTrack.getTrackLabel();
            this.curValue = this.options.find(item => item.label === label).value
          }
        };
      },
    }
  })

  new Vue({
    el: '#vue-wrapper',
    data() {
      return {
        stepCreateDisabled: false,
        stepJoinDisabled: true,
        stepPublishDisabled: true,
        stepSubscribeDisabled: true,
        stepLeaveDisabled: true,
        mirrorCheckDisabled: true,
        client: null,
        options: Object.assign({},
          getOptionsFromLocal(), {
          uid: ""
        }),
        audioTrack: null,
        videoTrack: null,
        localMirror: true,
        remoteUid: "",
        remoteUsers: {},
        audioChecked: true,
        videoChecked: true,
        micList: [{
          value: "default",
          label: "Default"
        }],
        camList: [{
          value: "default",
          label: "Default"
        }],
      }
    },
    methods: {
      stepCreate() {
        this.createClient()
        addSuccessIcon("#step-create")
        message.success("Create client success!");
        this.stepCreateDisabled = true
        this.stepJoinDisabled = false
      },
      async stepJoin() {
        try {
          this.options.channel = $("#channel").val();
          this.options.uid = Number($("#uid").val());
          this.options.token = await agoraGetAppData(this.options);
          await this.join()
          setOptionsToLocal(this.options)
          addSuccessIcon("#step-join")
          message.success("Join channel success!");
          this.stepJoinDisabled = true
          this.stepPublishDisabled = false
          this.stepSubscribeDisabled = false
          this.stepLeaveDisabled = false
          this.mirrorCheckDisabled = false
        } catch (error) {
          message.error(error.message)
          console.error(error);
        }
      },
      async stepPublish() {
        await this.createTrackAndPublish()
        addSuccessIcon("#step-publish")
        message.success("Create tracks and publish success!");
        this.stepPublishDisabled = true
        this.mirrorCheckDisabled = true
      },
      stepSubscribe() {
        const user = this.remoteUsers[this.remoteUid]
        if (!user) {
          return message.error(`User:${this.remoteUid} not found!`)
        }
        if (this.audioChecked) {
          this.subscribe(user, "audio");
        }
        if (this.videoChecked) {
          this.subscribe(user, "video");
        }
        addSuccessIcon("#step-subscribe")
        message.success("Subscribe and Play success!");
      },
      async stepLeave() {
        await this.leave()
        message.success("Leave channel success!");
        removeAllIcons()
        this.stepJoinDisabled = false
        this.stepLeaveDisabled = true
        this.stepPublishDisabled = true
        this.stepSubscribeDisabled = true
        this.mirrorCheckDisabled = true
        this.stepCreateDisabled = false
        this.remoteUid = ""
      },
      async createTrackAndPublish() {
        // create local audio and video tracks
        const tracks = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack({
            encoderConfig: "music_standard"
          }),
          AgoraRTC.createCameraVideoTrack()
        ])
        this.audioTrack = tracks[0]
        this.videoTrack = tracks[1]

        // publish local tracks to channel
        await this.client.publish(tracks);
      },
      createClient() {
        // create Agora client
        this.client = AgoraRTC.createClient({
          mode: "rtc",
          codec: "vp8"
        });
      },
      async join() {
        this.client.on("user-published", this.handleUserPublished);
        this.client.on("user-unpublished", this.handleUserUnpublished);

        // start Proxy if needed
        const mode = Number(this.options.proxyMode)
        if (mode != 0 && !isNaN(mode)) {
          this.client.startProxyServer(mode);
        }
        this.options.uid = await this.client.join(this.options.appid, this.options.channel, this.options.token || null, this.options.uid || null)
      },
      async leave() {
        if (this.videoTrack) {
          this.videoTrack.close()
          this.videoTrack = null
        }
        if (this.audioTrack) {
          this.audioTrack.close()
          this.audioTrack = null
        }
        // Remove remote users and player views.
        this.remoteUsers = {};
        // leave the channel
        await this.client.leave();
      },
      handleUserPublished(user, mediaType) {
        this.remoteUid = user.uid
        let remoteUsers = {
          ...this.remoteUsers,
          [user.uid]: user
        }
        this.remoteUsers = remoteUsers
      },
      handleUserUnpublished(user, mediaType) {
        if (mediaType === "video") {
          this.$delete(this.remoteUsers, user.uid)
        }
      },
      async subscribe(user, mediaType) {
        // subscribe to a remote user
        await this.client.subscribe(user, mediaType);
        console.log("subscribe success");
      }
    }
  })
})
