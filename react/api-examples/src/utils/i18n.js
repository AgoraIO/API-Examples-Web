import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getDefaultLanguage } from "./utils"
import { zh, en } from "../translate"

const resources = {
  en: {
    translation: en
  },
  zh: {
    translation: zh
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: getDefaultLanguage(),
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });



export default i18n;

