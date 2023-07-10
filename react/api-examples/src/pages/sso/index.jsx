import { useEffect } from 'react';
import { Spin } from 'antd';
import "./index.css";
const SSOPage = () => {
  return <div className='sso-page'>
    <Spin className='loading' tip="Loading..." size="large"></Spin>
  </div>;
};
export default SSOPage;