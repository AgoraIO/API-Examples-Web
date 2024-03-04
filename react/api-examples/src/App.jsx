import ThemeConfigProvider from "./components/ThemeConfigProvider";
import RouteContainer from "./router";
import Header from "./components/Header";
import { getDefaultLanguage } from "./utils/utils";
import { useEffect, useState } from "react";
import { App as AntiApp } from 'antd';
import i18n from "./utils/i18n";
import "./css/index.css";
function App() {
  const [locale, setLocale] = useState(getDefaultLanguage());
  useEffect(() => {
    if (locale == 'zh') {
      i18n.changeLanguage('zh');
    } else {
      i18n.changeLanguage('en');
    }
  }, [locale]);

  /** SSO */
  useEffect(() => {}, []);
  /** SSO */

  return <ThemeConfigProvider locale={locale}>
      <AntiApp>
        <Header setLocale={setLocale} locale={locale}></Header>
        <RouteContainer>
        </RouteContainer>
      </AntiApp>
    </ThemeConfigProvider>;
}
export default App;