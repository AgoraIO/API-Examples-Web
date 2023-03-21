import { createI18n } from 'vue-i18n'
import { getDefaultLanguage } from '../utils/utils'
import { en } from "./en"
import { zh } from "./zh"


const i18n = createI18n({
  locale: getDefaultLanguage(),
  allowComposition: true,
  messages: {
    en: {
      ...en
    },
    zh: {
      ...zh
    }
  }
})


export default i18n
