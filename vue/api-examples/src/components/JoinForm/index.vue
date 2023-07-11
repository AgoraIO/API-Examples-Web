<template>
  <el-row :gutter="16" ref={ref}>
    <el-col :span="6">
      <div class="title">APP ID</div>
      <el-input type="text" placeholder="Enter the appid" v-model="appId"></el-input>
      <div class="footer">You find your APP ID in the <a href="https://console.agora.io/projects">Agora Console</a>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="title">Token(optional)</div>
      <el-input type="text" placeholder="Enter the app token" v-model="token" />
      <div class="footer">To create a temporary token, <a href="https://console.agora.io/projects">edit your project
        </a>
        in Agora Console.</div>
    </el-col>
    <el-col :span="6">
      <div class="title">Channel Name</div>
      <el-input type="text" placeholder="Enter the channel name" v-model="channel" />
      <div class="footer">You create a channel when you create a temporary token. You guessed it, in <a
          href="https://console.agora.io/projects">Agora Console</a></div>
    </el-col>
    <el-col :span="6">
      <div class="title">User ID(optional)</div>
      <el-input type="text" placeholder="Enter the user ID (number)" v-model="uid" :formatter="(value) => `${value}`"
        :parser="(value) => value.replace(/[^0-9]/g, '')"></el-input>
    </el-col>
  </el-row>
</template>


<script setup>
import { ref } from "vue"

const appId = ref("")
const token = ref("")
const channel = ref("")
const uid = ref("")


defineExpose({
  getValue: () => ({
    appId: appId.value,
    token: token.value,
    channel: channel.value,
    uid: uid.value ? Number(uid.value) : null
  }),
  setValue: (data) => {
    if (data.appId) {
      appId.value = data.appId
    }
    if (data.token) {
      token.value = data.token
    }
    if (data.channel) {
      channel.value = data.channel
    }
    if (data.uid) {
      uid.value = data.uid
    }
  }
})

</script>


<style scoped>
.title {
  margin-bottom: 5px;
}

.footer {
  margin-top: 5px;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

input[type="number"] {
  appearance: "textfield";
}
</style>
