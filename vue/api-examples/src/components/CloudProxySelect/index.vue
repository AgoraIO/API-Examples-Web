<template>
  <el-dropdown>
    <el-button type="primary">
      Cloud Proxy<el-icon class="el-icon--right"><arrow-down /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="item in modes" :key="item.key" @click="click(item.key)">
          <span :class="{ active: item.key == key }">{{ item.label }}</span></el-dropdown-item>
      </el-dropdown-menu>
    </template>
</el-dropdown>
</template>


<script setup>
import { ref } from 'vue'

const modes = [{
  label: "Close: Disable Cloud Proxy",
  key: "0",
}, {
  label: "UDP Mode: Enable Cloud Proxy via UDP protocol",
  key: "3",
}, {
  label: "TCP Mode: Enable Cloud Proxy via TCP/TLS port 443",
  key: "5",
}];

const emit = defineEmits(['change'])
const key = ref('0')



const click = (val) => {
  key.value = val
  emit('change', val)
}

</script>
