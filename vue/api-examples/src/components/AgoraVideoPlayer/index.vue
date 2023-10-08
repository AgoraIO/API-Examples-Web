<template>
  <div :style="style">
    <div v-if="text" :style="{ marginTop: '10px', marginBottom: '10px' }">{{ text }}</div>
    <div ref="videoRef" :style="{ width, height }" />
  </div>
</template>


<script>
const DEFAULT_WIDTH = "480px"
const DEFAULT_HEIGHT = "320px"
</script>

<script setup>
import { ref, watch, onUnmounted, onMounted } from "vue"

const videoRef = ref()

const emit = defineEmits(['click'])
const props = defineProps({
  videoTrack: {
    type: Object,
    default: null
  },
  audioTrack: {
    type: Object,
    default: null
  },
  config: {
    type: Object,
    default: {}
  },
  isLocal: {
    type: Boolean,
    default: false
  },
  text: {
    type: [String, Number],
    default: ''
  },
  width: {
    type: String,
    default: DEFAULT_WIDTH
  },
  height: {
    type: String,
    default: DEFAULT_HEIGHT
  },
  style: {
    type: Object,
    default: {}
  },
})

const { videoTrack, audioTrack, config, isLocal } = props


onMounted(() => {
  videoTrack?.play(videoRef.value, config)
  if (!isLocal) {
    audioTrack?.play()
  }
})

watch(() => props.videoTrack, track => {
  if (track && videoRef.value) {
    track.play(videoRef.value)
  }
})


watch(() => props.audioTrack, (track) => {
  if (!isLocal) {
    track?.play()
  }
})



onUnmounted(() => {
  videoTrack?.close()
  audioTrack?.close()
})

</script>
