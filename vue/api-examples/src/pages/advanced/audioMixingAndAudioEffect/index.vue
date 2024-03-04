<template>
  <div class="padding-20">
    <JoinForm ref="formRef"></JoinForm>
    <div class="btn-wrapper mt-10">
      <el-button :style="{ marginLeft: '10px' }" type="primary" :disabled="joined" @click="join">Join</el-button>
      <el-button type="primary" :disabled="!joined" @click="leave">Leave</el-button>
    </div>
    <div class="mt-10">
      <div :style="{ width: '500px' }">
        <FileInput @change="onFileChange"></FileInput>
      </div>
      <div class="mt-10">
        <el-button type="primary" @click="startLocalAudioMixing" :disabled="!joined || !file">Start Local Audio
          Mixing</el-button>
      </div>
    </div>
    <div class="mt-10">
      <Space>
        <Button type="primary" @click="startAudioMixing" :disabled="!joined">Start Preset Audio Mixing</Button>
        <Button type="primary" @click="stopAudioMixing" :disabled="!joined">Stop Audio Mixing</Button>
        <!-- <Button type="primary" onClick={()=> playAudioEffect(1, DEFAULT_AUDIO_EFFECT_OPTIONS)} disabled={!joined}>Play
          Audio Effect</Button> -->
      </Space>
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
import heroicAdventureMp3 from "./assets/HeroicAdventure.mp3"
import audioMp3 from "./assets/audio.mp3"

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
const audioMixingTrack = ref(null)
const formRef = ref()
const file = ref(null)
const audioMixing = ref({
  state: "IDLE",
  // "IDLE" | "LOADING | "PLAYING" | "PAUSE"
  duration: 0
})


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


const onFileChange = (files) => {
  if (files?.length) {
    file.value = files[0]
  }
}

const startAudioMixing = async (file) => {
  if (audioMixing.value.state === "PLAYING" || audioMixing.value.state === "LOADING") return;
  const options = {};
  if (file) {
    options.source = file;
  } else {
    options.source = heroicAdventureMp3
  }
  try {
    audioMixing.value = { ...audioMixing.value, state: "LOADING" }
    if (audioMixingTrack.value) {
      await client.unpublish(audioMixingTrack.value);
    }
    // start audio mixing with local file or the preset file
    const track = await AgoraRTC.createBufferSourceAudioTrack(options);
    audioMixingTrack.value = track;
    track.play();
    track.startProcessAudioBuffer({
      loop: true
    });
    audioMixing.value = {
      ...audioMixing.value,
      state: "PLAYING",
      duration: track.duration
    }
  } catch (e) {
    console.error(e);
    message.error(e.message)
    audioMixing.value = { ...audioMixing.value, state: "IDLE" }
  }
}

const stopAudioMixing = () => {
  if (audioMixing.value.state === "IDLE" || audioMixing.value.state === "LOADING") return;
  audioMixing.value = { ...audioMixing.value, state: "IDLE" }
  audioMixingTrack.value.stopProcessAudioBuffer()
  audioMixingTrack.value.stop();
}

// use buffer source audio track to play effect.
const playAudioEffect = (cycle, options) => {
  // if the published track will not be used, you had better unpublish it
  // if (audioEffectTrack) {
  //   await client.unpublish(audioEffectTrack);
  // }
  // const track = await AgoraRTC.createBufferSourceAudioTrack(options);
  // setAudioEffectTrack(track)
  // await client.publish(track);
  track.play();
  track.startProcessAudioBuffer({
    cycle
  });
}

const startLocalAudioMixing = () => {
  if (!file) {
    message.warn("please choose a audio file!");
    return;
  }
  startAudioMixing(file);
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

