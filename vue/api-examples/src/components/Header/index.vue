<template>
  <header className="agora-header">
    <router-link to="/" class="router">
      <img :src="IconHome" alt="" />
    </router-link>
    <span className='title'>{{ title }}</span>
    <span className='login'>{{ t('login') }}</span>
    <span className='language'>
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">
          <span>{{ languageLabel }}</span>
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh">中文</el-dropdown-item>
            <el-dropdown-item command="en">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </span>
    <a className="logo" href="https://github.com/AgoraIO/API-Examples-Web/tree/main/Demo">
      <svg height="32" viewBox="0 0 16 16" version="1.1" width="32" aria-hidden="true">
        <path fillRule="evenodd" fill='#fff'
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z">
        </path>
      </svg>
    </a>
  </header>
</template>

<script setup>
import { ref, computed, watchEffect, watch } from "vue"
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { finalItems } from "../../utils/data"
import IconHome from "assets/home.png"

const route = useRoute()

const props = defineProps({
  language: String
})


const emit = defineEmits(['languageChange'])
const { t } = useI18n()


const title = computed(() => {
  let result = 'Agora WebSDK Demos'
  const path = route.path
  if (path && path != '/') {
    Object.entries(finalItems).forEach(([key, item]) => {
      item.data.forEach(data => {
        if (data.to == path) {
          result = t(data.title)
        }
      })
    })
  }
  return result
})


const languageLabel = computed(() => props.language == 'zh' ? '中文' : 'English')


const handleCommand = (val) => {
  emit('languageChange', val)
}


</script>


<style scoped>
.agora-header {
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 40px;
  background-color: #52575c;
  color: white;
  cursor: pointer;
}

.router {
  width: 25px;
  height: 25px;
  margin-right: 15px;
}

.agora-header img {
  width: 25px;
  height: 25px;

}

.agora-header .title {
  flex: 1 1 auto;
}

.agora-header .login {
  flex: 0 0 auto;
  margin-right: 20px;
}


.agora-header .language {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.agora-header .logo {
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.el-tooltip__trigger {
  color: white;
}
</style>
