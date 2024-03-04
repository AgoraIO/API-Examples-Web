

<template>
  <div className='index-page'>
    <div v-for="(items, index) in finalItems" :key="index">
      <div class="title">{{ t(items.title) }}</div>
      <el-row :gutter="16">
        <el-col :span="8" v-for="(item, i) in items.data" :key="i" :style="{ marginBottom: '20px' }">
          <el-card>
            <template #header>
              {{ t(item.title) }}
            </template>
            <template #default>
              <div class="card-text"> {{ t(item.content) }}</div>
              <div class="card-footer">
                <el-button type="primary" v-if="item.to" :to="item.to" :state="{ title: item.title }"
                  @click="nav(item.to)">
                  {{ t('tryitnow') }}
                </el-button>
                <el-button type="primary" v-else>
                  <a :href="item.pathname" target="_blank">{{ t('viewthecode') }}</a>
                </el-button>
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>


<script setup>

import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { finalItems } from '../utils/data'

const { t } = useI18n()
const router = useRouter()



const nav = (to) => {
  router.push({
    path: to,
  })
}

</script>


<style scoped>
.index-page {
  overflow: hidden;
  padding: 15px;
}

.index-page .card-footer {
  text-align: end;
}

.card-text {
  height: 68px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

a {
  color: white;
  text-decoration: none;
}
</style>
