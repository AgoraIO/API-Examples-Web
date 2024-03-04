<template>
  <div class="padding-20">
    <JoinForm ref="formRef"></JoinForm>
    <div class="btn-wrapper mt-10">
      <el-button :style="{ marginLeft: '10px' }" type="primary" :disabled="joined" @click="join">Join</el-button>
      <el-button type="primary" :disabled="!joined" @click="leave">Leave</el-button>
      <el-button type="primary" @click="muteAudio" :disabled="!joined">
        {{ audioTrackMuted ? "Unmute Audio OriginMediaStreamTrack" : "Mute Audio OriginMediaStreamTrack" }}</el-button>
      <el-button type="primary" @click="muteVideo" :disabled="!joined">
        {{ videoTrackMuted ? "Unmute Video OriginMediaStreamTrack" : "Mute Video OriginMediaStreamTrack" }}</el-button>
    </div>
    <div v-if="joined" class="mt-10">
      <div class="text">Local User</div>
      <AgoraVideoPlayer :isLocal="true" :audioTrack="audioTrack" :videoTrack="videoTrack"></AgoraVideoPlayer>
    </div>
    <div v-if="Object.keys(remoteUsers).length">
      <div class="text">Remote Users</div>
      <AgoraVideoPlayer v-for="item in remoteUsers" :key="item.uid" :videoTrack="item.videoTrack"
        :audioTrack="item.audioTrack" :text="item.uid">
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
const audioTrackMuted = ref(false)
const videoTrackMuted = ref(false)


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

const muteAudio = async () => {
  audioTrack.value._originMediaStreamTrack.enabled = audioTrackMuted.value
  audioTrackMuted.value = !audioTrackMuted.value
}


const muteVideo = async () => {
  videoTrack.value._originMediaStreamTrack.enabled = videoTrackMuted.value
  videoTrackMuted.value = !videoTrackMuted.value
}


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



const join = async () => {
  try {
    // Add event listeners to the client.
    client.on("user-published", handleUserPublished)
    client.on("user-unpublished", handleUserUnpublished);

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

