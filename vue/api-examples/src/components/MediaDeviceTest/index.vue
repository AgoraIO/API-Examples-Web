<template>
  <el-dialog v-model="visible" title="Media Device Test" width="600px" :before-close="handleClose">
    <MicrophoneSelect :audioTrack="audioTrack"></MicrophoneSelect>
    <el-progress :percentage="volume" :show-text="false"
      :style="{ marginTop: '10px', marginBottom: '10px' }"></el-progress>
    <CameraSelect :videoTrack="videoTrack"></CameraSelect>
    <AgoraVideoPlayer :style="{ marginTop: '10px' }" :audioTrack="audioTrack" :videoTrack="videoTrack" width="240px"
      height="180px"></AgoraVideoPlayer>
  </el-dialog>
</template>



<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue"

const visible = ref(false)
const volume = ref(0)
let intervalId = null

const props = defineProps({
  audioTrack: {
    type: Object,
    default: null
  },
  videoTrack: {
    type: Object,
    default: null
  }
})

defineExpose({
  show: () => {
    visible.value = true
  },
  hide: () => {
    visible.value = false
  }
})


watch(() => props.audioTrack, (track, oldTrack, onCleanup) => {
  if (track) {
    intervalId = setInterval(() => {
      const val = track.getVolumeLevel() * 100
      volume.value = val
    }, 300)
  }
  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
  })
})

const handleClose = () => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  visible.value = false
}

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

</script>
