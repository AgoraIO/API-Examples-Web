<template>
  <div class="padding-20">
    <JoinForm ref="formRef"></JoinForm>
    <div class="btn-wrapper mt-10">
      <el-button :style="{ marginLeft: '10px' }" type="primary" :disabled="joined" @click="join">Join</el-button>
      <el-button type="primary" :disabled="!joined" @click="leave">Leave</el-button>
    </div>
    <div>
      <canvas ref="canvasRef" :style="{ width: '480px', height: '320px' }">Your Browser doesn't support this
        Feature</canvas>
    </div>
    <div v-if="joined" class="mt-10">
      <div class="text">Local User</div>
      <AgoraVideoPlayer :isLocal="true"  :videoTrack="customVideoTrack"></AgoraVideoPlayer>
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
import { showJoinedMessage, getColor } from "../../../utils/utils"


let client = AgoraRTC.createClient({
  mode: "rtc",
  codec: 'vp8'
});

const route = useRoute()
const { query } = route
const joined = ref(false)
const remoteUsers = ref({})
const customVideoTrack = ref(null)
const formRef = ref()
const canvasRef = ref()
let intervalId = null

const initializeCanvasCustomVideoTrack = () => {
  const ctx = canvasRef.value.getContext('2d');
  canvasRef.value.height = 320;
  canvasRef.value.width = 480;
  intervalId = setInterval(() => {
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    ctx.fillStyle = '#dddddd';
    ctx.fillRect(10, 10, 130, 130);
    var path = new Path2D();
    path.arc(75, 75, 50, 0, Math.PI * 2, true);
    path.moveTo(110, 75);
    path.arc(75, 75, 35, 0, Math.PI, false);
    path.moveTo(65, 65);
    path.arc(60, 65, 5, 0, Math.PI * 2, true);
    path.moveTo(95, 65);
    path.arc(90, 65, 5, 0, Math.PI * 2, true);
    ctx.strokeStyle = getColor();
    ctx.stroke(path);
  }, 500);
}

onMounted(async () => {
  initializeCanvasCustomVideoTrack()
  if (query.appId && query.channel) {
    formRef.value.setValue(query)
    join()
  }
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  if (joined.value) {
    leave()
  }
})

const getCanvasCustomVideoTrack = () => {
  const stream = canvasRef.value.captureStream(30);
  const [videoTrack] = stream.getVideoTracks();
  return AgoraRTC.createCustomVideoTrack({
    mediaStreamTrack: videoTrack
  });
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
    const track = getCanvasCustomVideoTrack();
    customVideoTrack.value = track
    await client.publish(track)
    showJoinedMessage(options)
    joined.value = true
  } catch (error) {
    console.error(error)
    ElMessage.error(error.message)
  }
}

const leave = async () => {
  if (customVideoTrack.value) {
    customVideoTrack.value.close()
    customVideoTrack.value = null
  }
  remoteUsers.value = {}
  await client.leave()
  joined.value = false
  ElMessage.success('leave channel success!')
}




</script>

