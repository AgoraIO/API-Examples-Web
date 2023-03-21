import { createApp } from 'vue'
import { router } from "./router"
import i18n from "./translate/index"
import App from './App.vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import 'element-plus/dist/index.css'
import './style.css'

const app = createApp(App)
app.use(i18n)
app.use(router)
app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}



app.mount('#app')


