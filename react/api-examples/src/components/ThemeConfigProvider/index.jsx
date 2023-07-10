import { useState } from 'react';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
const ThemeConfigProvider = ({
  children,
  locale
}) => {
  return <ConfigProvider locale={locale == 'zh' ? zhCN : enUS} theme={{
    token: {
      colorPrimary: '#099DFD',
      colorSuccess: '#06C633',
      colorWarning: '#FAAD15',
      colorError: '#FD3636',
      colorInfo: '#099DFD',
      colorTextBase: '#586376'
    }
  }}>
    {children}
  </ConfigProvider>;
};
export default ThemeConfigProvider;