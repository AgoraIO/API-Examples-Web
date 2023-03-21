import { Dropdown, Button, Space, Typography } from "antd"
import { DownOutlined } from '@ant-design/icons';
import { useState, useRef, useEffect, useMemo } from "react";


const modes = [{
  label: "Close: Disable Cloud Proxy",
  key: "0",
}, {
  label: "UDP Mode: Enable Cloud Proxy via UDP protocol",
  key: "3",
}, {
  label: "TCP Mode: Enable Cloud Proxy via TCP/TLS port 443",
  key: "5",
}];


const CloudProxySelect = ({ defaultValue = '0', onChange }) => {
  const [mode, setMode] = useState(defaultValue)


  const onClickItem = async ({ key }) => {
    setMode(key)
    onChange && onChange(key)
  }


  return <Dropdown.Button type="primary"
    menu={{
      items: modes,
      selectable: true,
      selectedKeys: [mode],
      onClick: onClickItem
    }}
    placement="bottom"
    icon={<DownOutlined />} >
    Cloud Proxy
  </Dropdown.Button>
}

export default CloudProxySelect
