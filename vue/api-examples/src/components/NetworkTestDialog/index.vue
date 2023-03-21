<template>
  <el-dialog title="Network Test" v-model="open" width="650px" :before-close="hide">
    <div class="title">Uplink</div>
    <div class="sub-title" :style="{ marginTop: '0.5em' }">Network Quality: {{ uplinkNetworkQuality }}</div>
    <div :style="{ marginTop: '0.5em' }" class="text">Local Audio Stats</div>
    <div>{{ localAudioStats }}</div>
    <div :style="{ marginTop: '0.5em' }" class="text">Local Video Stats</div>
    <div>{{ localVideoStats }}</div>
    <div :style="{ marginTop: '0.5em' }" class="title">Downlink</div>
    <div class="sub-title" :style="{ marginTop: '0.5em' }">Network Quality: {{ downlinkNetworkQuality }}</div>
    <div :style="{ marginTop: '0.5em' }" class="text">Remote Audio Stats</div>
    <div>{{ remoteAudioStats }}</div>
    <div :style="{ marginTop: '0.5em' }" class="text">Remote Video Stats</div>
    <div>{{ remoteVideoStats }}</div>
  </el-dialog>
</template>


<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue"
import { ElMessage } from 'element-plus'
import AgoraRTC from "agora-rtc-sdk-ng"

const open = ref(false)
const uplinkNetworkQuality = ref('')
const localAudioStats = ref('')
const localVideoStats = ref('')
const downlinkNetworkQuality = ref('')
const remoteAudioStats = ref('')
const remoteVideoStats = ref('')

let upClientUid = ''


const uplinkClient = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});

const downlinkClient = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8"
});

const props = defineProps({
  options: {
    type: Object,
    default: () => { }
  }
})



const show = async () => {
  await doNetworkTest()
  open.value = true
}

const hide = () => {
  open.value = false
  unListenEvents()
  uplinkClient?.leave();
  downlinkClient?.leave();
}

defineExpose({
  show,
  hide
})

const listenEvents = () => {
  uplinkClient.on("network-quality", handleUplinkNetworkQuality)
  downlinkClient.on("network-quality", handleDownlinkNetworkQuality)
  downlinkClient.on("user-published", handleUserPublished);
}

const unListenEvents = () => {
  uplinkClient.off("network-quality", handleUplinkNetworkQuality)
  downlinkClient.off("network-quality", handleDownlinkNetworkQuality)
  downlinkClient.off("user-published", handleUserPublished);
}

onMounted(async () => {
  listenEvents()
})


onUnmounted(() => {
  unListenEvents()
})

const handleUplinkNetworkQuality = (quality) => {
  uplinkNetworkQuality.value = quality.uplinkNetworkQuality
  localAudioStats.value = JSON.stringify(uplinkClient.getLocalAudioStats())
  localVideoStats.value = JSON.stringify(uplinkClient.getLocalVideoStats())
}

const handleDownlinkNetworkQuality = (quality) => {
  downlinkNetworkQuality.value = quality.downlinkNetworkQuality
  remoteAudioStats.value = JSON.stringify(downlinkClient.getRemoteAudioStats()[upClientUid])
  remoteVideoStats.value = JSON.stringify(downlinkClient.getRemoteVideoStats()[upClientUid])
}

const handleUserPublished = async (user, mediaType) => {
  await downlinkClient.subscribe(user, mediaType);
}



const doNetworkTest = async () => {
  const { options } = props
  if (!options.appId) {
    const msg = "appId is required"
    ElMessage.error(msg)
    console.error(msg)
    hide()
    return
  }
  if (!options.channel) {
    const msg = "channel is required"
    ElMessage.error(msg)
    console.error(msg)
    hide()
    return
  }
  const tracks = await Promise.all([
    AgoraRTC.createMicrophoneAudioTrack(),
    AgoraRTC.createCameraVideoTrack()
  ]);

  upClientUid = await uplinkClient.join(options.appId, options.channel, options.token || null, null);
  await downlinkClient.join(options.appId, options.channel, options.token || null, null);
  downlinkClient.on("user-published", async (user, mediaType) => {
    await downlinkClient.subscribe(user, mediaType);
  })

  await uplinkClient.publish(tracks);
}

</script>


<style scoped>
.title {
  height: 26px;
  line-height: 26px;
  font-size: 20px;
  font-weight: bold;
}

.sub-title {
  height: 24px;
  line-height: 24px;
  font-size: 18px;
  font-weight: bold;
}

.text {
  height: 22px;
  line-height: 22px;
  font-size: 16px;
  font-weight: bold;
}
</style>
