<template>
  <el-dropdown :style="{ ...style }" trigger="click">
    <el-button type="primary" class="btn-setting">
      ADVANCED SETTINGS<el-icon class="el-icon--right"><arrow-down /></el-icon>
    </el-button>
    <template #dropdown>
      <div class="content">
        <MicrophoneSelect :audioTrack="audioTrack"></MicrophoneSelect>
        <CameraSelect :videoTrack="videoTrack" :style="{ marginTop: '5px' }"></CameraSelect>
        <CodecSelect :style="{ marginTop: '5px' }" @change="(val)=>$emit('codecChange',val)"></CodecSelect>
        <VideoProfileSelect :style="{ marginTop: '5px' }" @change="(val)=>$emit('profileChange', val)"></VideoProfileSelect>
      </div>
    </template>
  </el-dropdown>
</template>


<script setup>
import { ref } from "vue"

const props = defineProps({
  videoTrack: {
    type: Object,
    default: null
  },
  audioTrack: {
    type: Object,
    default: null
  },
  style: {
    type: Object,
    default: {}
  }
})

defineEmits(['codecChange', 'profileChange'])




</script>


<style scoped>
.btn-setting {
  width: 400px;
}

.content {
  padding: 10px;
  width: 400px;
}
</style>
