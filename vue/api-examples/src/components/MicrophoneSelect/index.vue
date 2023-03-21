<template>
  <div class="microphone-dropdown" :style="style">
    Microphone:
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
import { onMounted, ref, unref, watch, isRef } from 'vue';

const items = ref([])
const label = ref('')

const props = defineProps({
  style: {
    type: Object,
    default: {}
  },
  audioTrack: {
    type: Object,
    default: null
  }
})

const audioTrack = ref(props.audioTrack)

onMounted(async () => {
  const devices = await AgoraRTC.getMicrophones()
  items.value = devices.map(item => ({ label: item.label, id: item.deviceId }))
  if (audioTrack.value) {
    label.value = audioTrack.value?.getTrackLabel()
  }
})

watch(() => props.audioTrack, (track) => {
  label.value = track?.getTrackLabel()
  audioTrack.value = track
})


AgoraRTC.onMicrophoneChanged = async changedDevice => {
  const devices = await AgoraRTC.getMicrophones()
  items.value = devices.map(item => ({ label: item.label, id: item.deviceId }))
  if (changedDevice.state === "ACTIVE") {
    await audioTrack.value?.setDevice(changedDevice.device.deviceId);
    label.value = audioTrack.value?.getTrackLabel()
  } else if (changedDevice.device.label === label.value) {
    if (devices[0]) {
      await audioTrack.value?.setDevice(devices[0].deviceId);
      label.value = audioTrack.value?.getTrackLabel()
    }
  }
}

const click = async (id) => {
  if (audioTrack.value) {
    await audioTrack.value?.setDevice(id);
    label.value = audioTrack.value?.getTrackLabel()
  }
}


</script>



<style>
.microphone-dropdown {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
}
</style>
