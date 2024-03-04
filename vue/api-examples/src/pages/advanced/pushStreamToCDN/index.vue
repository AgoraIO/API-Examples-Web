<template>
  <div class="padding-20">
    <JoinForm ref="formRef"></JoinForm>
    <div class="btn-wrapper mt-10">
      <el-button type="primary" :disabled="joined" @click="join">Join as host</el-button>
      <el-button type="primary" :disabled="!joined" @click="leave">Leave</el-button>
    </div>
    <div class="mt-10">
      <span>liveStreaming URL:</span>
      <el-input :style="{ width: '500px', marginLeft: '10px' }" type="url" placeholder="enter live streaming url"
        v-model="cdnUrl"></el-input>
    </div>
    <div class="mt-10">
      <el-button type="primary" @click="startLiveStreaming" :disabled="!joined || liveStreamingStarted">start live
        streaming</el-button>
      <el-button type="primary" @click="stopLiveStreaming" :disabled="!joined || !liveStreamingStarted">stop live
        streaming</el-button>
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
  mode: "live",
  codec: "vp8"
});


const route = useRoute()
const { query } = route
const joined = ref(false)
const remoteUsers = ref({})
const audioTrack = ref(null)
const videoTrack = ref(null)
const formRef = ref()
const cdnUrl = ref('')
const liveStreamingStarted = ref(false)


let role = 'host'
let options = {}

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

const join = async () => {
  try {
    // Add event listeners to the client.
    client.on("user-published", handleUserPublished)
    client.on("user-unpublished", handleUserUnpublished);

    role = 'host'
    client.setClientRole(role);

    options = formRef.value.getValue()
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



const liveTranscoding = async () => {
  // Set the order of local and remote hosts according to your preferences
  const transcodingUsers = [options.uid, ...Object.keys(remoteUsers)].map((uid, index) => {
    // Set the size according to your idea
    const width = 600;
    const height = 700;
    return {
      // Set the location coordinates according to your ideas
      x: 30 * (index % 2) + index * width + 10,
      y: 10,
      width,
      height,
      zOrder: 0,
      alpha: 1.0,
      // The uid below should be consistent with the uid entered in AgoraRTCClient.join
      // uid must be an integer number
      uid: Number(uid)
    };
  });

  //  configuration of pushing stream to cdn
  const liveTranscodingConfig = {
    width: 1280,
    height: 720,
    videoBitrate: 400,
    videoFrameRate: 15,
    audioSampleRate: 32000,
    audioBitrate: 48,
    audioChannels: 1,
    videoGop: 30,
    videoCodecProfile: 100,
    userCount: 2,
    // userConfigExtraInfo: {},
    backgroundColor: 0x0000EE,
    watermark: {
      url: "https://agoraio-community.github.io/AgoraWebSDK-NG/img/logo.png",
      x: 20,
      y: 20,
      width: 200,
      height: 200
    },
    backgroundImage: {
      url: "https://agoraio-community.github.io/AgoraWebSDK-NG/img/sd_rtn.jpg",
      x: 100,
      y: 100,
      width: 1080,
      height: 520
    },
    transcodingUsers
  };

  try {
    // To monitor errors in the middle of the push, please refer to the API documentation for the list of error codes
    client.on("live-streaming-error", async (url, err) => {
      console.error("url", url, "live streaming error!", err.code);
      ElMessage.error(`live streaming error! ${err.code}`)
    });
    // set live streaming transcode configuration,
    await client.setLiveTranscoding(liveTranscodingConfig);
    // then start live streaming.
    await client.startLiveStreaming(cdnUrl.value, true);
  } catch (error) {
    console.error('live streaming error:', error.message);
    ElMessage.error(`live streaming error! ${error.message}`)
  }

}

const startLiveStreaming = async () => {
  if (!cdnUrl.value) {
    ElMessage.error('Please enter live streaming url')
    return
  }
  await liveTranscoding()
  liveStreamingStarted.value = true
}

const stopLiveStreaming = async () => {
  await client.stopLiveStreaming(cdnUrl.value)
  console.log("stop live streaming success");
  liveStreamingStarted.value = false
}

</script>

