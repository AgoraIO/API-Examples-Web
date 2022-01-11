# Agora Web SDK 4.x 示例项目

_[English](README.md) | 简体中文_

## 简介

此仓库包含基于 Agora RTC Web SDK 4.x 的示例项目。

Web SDK 4.x 是基于 Web SDK 3.x 开发的全量重构版本，在继承了 Web SDK 3.x 功能的基础上，优化了 SDK 的内部架构，提高了 API 的易用性。

Web SDK 4.x 具有以下优势：

- 面向开发者提供更先进的 API 架构和范式。
- 所有异步场景的 API 使用 Promise 替代 Callback，提升集成代码的质量和健壮性。
- 优化频道事件通知机制，统一频道内事件的命名和回调参数的格式，降低断线重连的处理难度。
- 提供清晰和完善的错误码，方便错误排查。
- 支持 TypeScript。

## 示例项目（使用 jQuery 和 Bootstrap）

| 功能             | 示例项目位置                     |
| ------------------- | -------------------------------- |
| 调整视频参数        | [/Demo/adjustVideoProfile](/Demo/adjustVideoProfile)        |
| 混音与音效          | [/Demo/audioMixingAndAudioEffect](/Demo/audioMixingAndAudioEffect) |
| 视频直播            | [/Demo/basicLive](/Demo/basicLive)                 |
| 启用/禁用音视频轨道 | [/Demo/basicMute](/Demo/basicMute)                 |
| 视频通话            | [/Demo/basicVideoCall](/Demo/basicVideoCall)            |
| 云代理            | [/Demo/cloudProxy](/Demo/cloudProxy)            |
| 自定义视频源            | [/Demo/customVideoSource](/Demo/customVideoSource)            |
| 显示呼叫状态        | [/Demo/displayCallStats](/Demo/displayCallStats)          |
| 双流模式            | [/Demo/dualStream](/Demo/dualStream)                |
| 地理区域限制          | [/Demo/geoFencing](/Demo/geoFencing)           |
| 加入多频道          | [/Demo/joinMultipleChannel](/Demo/joinMultipleChannel)           |
| 推流到 CDN          | [/Demo/pushStreamToCDN](/Demo/pushStreamToCDN)           |
| 控制录制设备        | [/Demo/recordingDeviceControl](/Demo/recordingDeviceControl)    |
| 自定义音视频渲染            | [/Demo/selfRendering](/Demo/selfRendering)            |
| 自定义音视频采集            | [/Demo/selfCapturing](/Demo/selfCapturing)            |
| 屏幕共享            | [/Demo/shareTheScreen](/Demo/shareTheScreen)            |
| 美颜                | [/Demo/videoBeautyEffect](/Demo/videoBeautyEffect)         |

### 如何运行示例项目

#### 前提条件

- 你必须使用 SDK 支持的浏览器运行示例项目。 关于支持的浏览器列表参考 [产品概述](https://docs.agora.io/cn/Interactive%20Broadcast/product_live?platform=Web#compatibility)。

#### 运行步骤

1. 使用 SDK 支持的浏览器打开 `Demo/index.html` 并选择一个示例项目。
2. 在示例项目页面上，输入 App ID、Token 和频道名，然后加入频道。
   - 关于 App ID 和 Token 的获取方法参考[校验用户权限](https://docs.agora.io/cn/Agora%20Platform/token)。
   - 你可以自行设定频道名。频道名支持的字符类型参考 [join 方法](https://docs.agora.io/cn/Interactive%20Broadcast/API%20Reference/web_ng/interfaces/iagorartcclient.html#join)。

## 示例项目（使用 React）

| 特性     | 示例项目位置 |
| -------- | ------------ |
| 视频通话 | [/ReactDemo](/ReactDemo)  |

### 如何运行示例项目

#### 前提条件

- 你必须使用 SDK 支持的浏览器运行示例项目。关于支持的浏览器列表参考 [产品概述](https://docs.agora.io/cn/Interactive%20Broadcast/product_live?platform=Web#compatibility)。
- [npm](https://www.npmjs.com/)

#### 运行步骤

1. 导航至 `ReactDemo` 并运行下面的命令安装依赖项。

   ```shell
   npm install
   ```

2. 运行下面的命令启动示例项目。

   ```shell
   npm run start
   ```

3. 在示例项目页面上，输入 App ID、Token 和频道名，然后加入频道。
   - 关于 App ID 和 Token 的获取方法参考[校验用户权限](https://docs.agora.io/cn/Agora%20Platform/token)。
   - 你可以自行设定频道名。频道名支持的字符类型参考 [join 方法](https://docs.agora.io/cn/Interactive%20Broadcast/API%20Reference/web_ng/interfaces/iagorartcclient.html#join)。

## 参考

- [Web SDK 4.x 产品概述](https://docs.agora.io/cn/Interactive%20Broadcast/product_live?platform=Web)
- [Web SDK 4.x API 参考](https://docs.agora.io/cn/Interactive%20Broadcast/API%20Reference/web_ng/index.html)

## 反馈

如果你有任何问题或建议，可以通过 issue 的形式反馈。

## 相关资源

- 你可以先参阅 [常见问题](https://docs.agora.io/cn/faq)
- 如果你想了解更多官方示例，可以参考 [官方 SDK 示例](https://github.com/AgoraIO)
- 如果你想了解声网 SDK 在复杂场景下的应用，可以参考 [官方场景案例](https://github.com/AgoraIO-usecase)
- 如果你想了解声网的一些社区开发者维护的项目，可以查看 [社区](https://github.com/AgoraIO-Community)
- 若遇到问题需要开发者帮助，你可以到 [开发者社区](https://rtcdeveloper.com/) 提问
- 如果需要售后技术支持, 你可以在 [Agora Dashboard](https://dashboard.agora.io) 提交工单

## 许可证

示例项目遵守 MIT 许可证。详见 [LICENSE](./LICENSE) 文件。
