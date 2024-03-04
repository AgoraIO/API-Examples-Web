<template>
  <div class="camera-dropdown" :style="style">
    Camera:
    <el-dropdown :style="{ marginLeft: '10px' }">
      <el-button type="primary">
        {{ label }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="item in items" :key="item.id" @click="click(item.id)">
            <span :class="{ active: item.label == label }">{{ item.label }}</span></el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>


<script setup>
import AgoraRTC from "agora-rtc-sdk-ng"
import {  onMounted, ref, unref, watch, isRef } from 'vue';

const items = ref([])
const label = ref('')

const props = defineProps({
  style: {
    type: Object,
    default: {}
  },
  videoTrack: {
    type: Object,
    default: null
  }
})


const videoTrack = ref(props.videoTrack)

onMounted(async () => {
  const devices = await AgoraRTC.getCameras()
  items.value = devices.map(item => ({ label: item.label, id: item.deviceId }))
  if (videoTrack.value) {
    label.value = videoTrack.value?.getTrackLabel()
  }
})

watch(() => props.videoTrack, (track) => {
  label.value = track?.getTrackLabel()
  videoTrack.value = track
})


AgoraRTC.onCameraChanged = async changedDevice => {
  const devices = await AgoraRTC.getCameras()
  items.value = devices.map(item => ({ label: item.label, id: item.deviceId }))
  if (changedDevice.state === "ACTIVE") {
    await videoTrack.value?.setDevice(changedDevice.device.deviceId);
    label.value = videoTrack.value?.getTrackLabel()
  } else if (changedDevice.device.label === label.value) {
    if (devices[0]) {
      await videoTrack.value?.setDevice(devices[0].deviceId);
      label.value = videoTrack.value?.getTrackLabel()
    }
  }
}

const click = async (id) => {
  if (videoTrack.value) {
    await videoTrack.value?.setDevice(id);
    label.value = videoTrack.value?.getTrackLabel()
  }
}


</script>



<style>
.camera-dropdown {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
}
</style>
