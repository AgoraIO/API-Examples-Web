<template>
  <div class="page">
    <el-config-provider :locale="locale">
      <Header :language="language" @languageChange="languageChange"></Header>
      <router-view>
      </router-view>
    </el-config-provider>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getDefaultLanguage } from "./utils/utils"
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import ie8n from "./translate/index"


const language = ref(getDefaultLanguage())
const locale = computed(() => (language.value === 'zh' ? zhCn : en))

const languageChange = (lang) => {
  language.value = lang
  ie8n.global.locale = lang
}

</script>

<style scoped>
</style>
