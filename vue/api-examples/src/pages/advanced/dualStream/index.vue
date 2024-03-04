<template>
  <div class="padding-20">
    <JoinForm ref="formRef"></JoinForm>
    <div class="btn-wrapper mt-10">
      <el-button type="primary" :disabled="joined" @click="join">Join</el-button>
      <el-button type="primary" :disabled="!joined" @click="leave">Leave</el-button>
    </div>
    <div v-if="joined" class="mt-10">
      <div class="text">Click Remote User Video Player Change Stream Type</div>
      <div class="text">Local User</div>
      <AgoraVideoPlayer :isLocal="true" :audioTrack="audioTrack" :videoTrack="videoTrack"></AgoraVideoPlayer>
    </div>
    <div v-if="Object.keys(remoteUsers).length">
      <div class="text">Remote Users</div>
      <AgoraVideoPlayer v-for="item in remoteUsers" :key="item.uid" ref="videoRefs" :videoTrack="item.videoTrack"
        :audioTrack="item.audioTrack" :text="item.uid" @click.native="onVideoClick(item.uid)">
      </AgoraVideoPlayer>
    </div>
  </div>
</template>

<script setup>
import AgoraRTC from "agora-rtc-sdk-ng"
import { onMounted, onUnmounted, ref } from "vue"
import { ElMessage } from 'element-plus'
import { useRoute } from "vue-router"
import { showJoinedMessage } from "../../../utils/utils"

const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});


const route = useRoute()
const { query } = route
const joined = ref(false)
const remoteUsers = ref({})
const audioTrack = ref(null)
const videoTrack = ref(null)
const formRef = ref()
const videoRefs = ref()


// uid -> streamType
const streamTypeMap = new Map()


onMounted(async () => {
  if (query.appId && query.channel) {
    formRef.value.setValue(query)
    join()
  }
})

onUnmounted(() => {
  if (joined.value) {
    leave()
  }
})


const initTracks = async () => {
  if (audioTrack.value && videoTrack.value) {
    return
  }
  const tracks = await Promise.all([
    AgoraRTC.createMicrophoneAudioTrack(),
    AgoraRTC.createCameraVideoTrack()
  ])
  audioTrack.value = tracks[0]
  videoTrack.value = tracks[1]
}

const handleUserPublished = async (user, mediaType) => {
  await client.subscribe(user, mediaType)
  delete remoteUsers.value[user.uid]
  remoteUsers.value[user.uid] = user
}

const handleUserUnpublished = (user, mediaType) => {
  if (mediaType == 'video') {
    delete remoteUsers.value[user.uid]
  }
}


const onVideoClick = async (uid) => {
  console.log('videoRefs', videoRefs)
  uid = Number(uid)
  const ref = videoRefs.current[uid]
  try {
    let finalStreamType = 1
    // streamType 0: high stream, 1: low stream
    if (streamTypeMap.has(uid)) {
      const streamType = streamTypeMap.get(uid)
      if (streamType === 0) {
        finalStreamType = 1
      } else {
        finalStreamType = 0
      }
    } else {
      finalStreamType = 1
    }
    streamTypeMap.set(uid, finalStreamType)
    let options = finalStreamType === 0 ? {
      width: "480px",
      height: "320px",
    } : {
      width: "160px",
      height: "120px",
    }
    ref.setOptions(options)
    await client.setRemoteVideoStreamType(uid, finalStreamType);
    message.info(`${uid} change stream type to ${finalStreamType === 0 ? "High" : "Low"}`)
  } catch (e) {
    console.error(e)
    message.error(e.message)
  }
}

const join = async () => {
  try {
    // Add event listeners to the client.
    client.on("user-published", handleUserPublished)
    client.on("user-unpublished", handleUserUnpublished);

    // Customize the video profile of the low-quality stream: 160 × 120, 15 fps, 120 Kbps.
    client.setLowStreamParameter({
      width: 160,
      height: 120,
      framerate: 15,
      bitrate: 120
    });
    // Enable dual-stream mode.
    await client.enableDualStream();

    const options = formRef.value.getValue()
    // Join a channel
    options.uid = await client.join(options.appId, options.channel, options.token || null, options.uid || null)
    await initTracks()
    const tracks = [audioTrack.value, videoTrack.value]
    await client.publish(tracks)
    showJoinedMessage(options)
    joined.value = true
  } catch (error) {
    console.error(error)
    ElMessage.error(error.message)
  }
}

const leave = async () => {
  if (audioTrack.value) {
    audioTrack.value.close()
    audioTrack.value = null
  }
  if (videoTrack.value) {
    videoTrack.value.close()
    videoTrack.value = null
  }
  remoteUsers.value = {}
  await client.leave()
  joined.value = false
  ElMessage.success('leave channel success!')
}

</script>

