import ThemeConfigProvider from "./components/ThemeConfigProvider";
import RouteContainer from "./router";
import Header from "./components/Header";
import { getDefaultLanguage } from "./utils/utils"
import { useEffect, useState } from "react"
import i18n from "./utils/i18n"


function App() {
  const [locale, setLocale] = useState(getDefaultLanguage())
  useEffect(() => {
    if (locale == 'zh') {
      i18n.changeLanguage('zh');
    } else {
      i18n.changeLanguage('en');
    }
  }, [locale])

  return (
    <ThemeConfigProvider locale={locale}>
      <Header setLocale={setLocale} locale={locale}></Header>
      <RouteContainer>
      </RouteContainer>
    </ThemeConfigProvider>
  )
}

export default App
