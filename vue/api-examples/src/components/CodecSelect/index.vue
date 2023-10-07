<template>
  <div class="code-select" :style="style">
    <span>Codec:</span>
    <el-radio-group v-model="value" class="ml-4" :style="{ marginLeft: '10px' }">
      <el-radio label="vp8" size="large">vp8</el-radio>
      <el-radio label="vp9" size="large">vp9</el-radio>
      <el-radio label="h264" size="large">h264</el-radio>
    </el-radio-group>
  </div>
</template>



<script setup>
import { ref } from 'vue'

const props = defineProps({
  style: {
    type: Object,
    default: {}
  },
  defaultValue: {
    type: String,
    default: 'vp8'
  },
})

const { defaultValue } = props

const value = ref(defaultValue)




</script>



<style scoped>
.code-select {
  display: flex;
  align-items: center;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
}
</style>
