<template>
  <span>
    <el-input type="file" :accept="accept" @change="onChange"></el-input>
  </span>
</template>




<script setup>
import { ref } from "vue"

const props = defineProps({
  accept: {
    type: String,
    default: "audio/*"
  },
})

const emit = defineEmits(['change'])


const onChange = (e) => {
  console.log('onChange e', e)
  emit('change', 13)
}

</script>
