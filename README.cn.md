# Agora RTC Web SDK 4.x 示例项目

_[English](README.md) | 简体中文_

## 简介

此仓库包含基于 Agora RTC Web SDK 4.x 的示例项目。

<hr>

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
| 基础示例      | [/src/example/basic](/src/example/basic)        |
| 进阶示例      | [/src/example/advanced](/src/example/advanced) |
| 插件示例      | [/src/example/plugin](/src/example/plugin)            |
| 其他示例      | [/src/example/others](/src/example/others)            |
| vue框架示例   | [/src/example/framework/vue](/src/example/framework/vue)        |
| react框架示例 | [/src/example/framework/react](/src/example/framework/react)  |


### 如何运行示例项目

#### 前提条件

- 你必须使用 SDK 支持的浏览器运行示例项目。 关于支持的浏览器列表参考 [浏览器兼容性和已知问题](https://doc.shengwang.cn/doc/rtc/javascript/overview/browser-compatibility)。

#### 运行步骤

1. 在项目根路径运行下面的命令安装依赖项。

   ```shell
   npm install
   ```

2. 运行下面的命令启动示例项目。

   ```shell
   npm run dev
   ```

3. 在浏览器打开 [http://localhost:3001/index.html](http://localhost:3001/index.html)

4. 在示例项目设置页面上，输入 App ID 和 App Certificate，然后点击设置按钮。
   - 关于 App ID 和 App Certificate 的获取方法参考 [开始使用 Agora 平台](https://docs.agora.io/cn/Agora%20Platform/get_appid_token)。

## 参考

- [Web SDK 4.x 产品概述](https://doc.shengwang.cn/doc/rtc/javascript/overview/product-overview)
- [Web SDK 4.x API 参考](https://doc.shengwang.cn/api-ref/rtc/javascript/overview)
- [基于本仓库部署的在线 demo](https://webdemo.agora.io/)

## 反馈

如果你有任何问题或建议，可以通过 issue 的形式反馈。

## 相关资源

- 你可以先参阅 [常见问题](https://doc.shengwang.cn/faq/list?category=integration-issues&platform=javascript&product=rtc)
- 如果你想了解更多官方示例，可以参考 [官方 SDK 示例](https://github.com/AgoraIO)
- 如果你想了解声网 SDK 在复杂场景下的应用，可以参考 [官方场景案例](https://github.com/AgoraIO-usecase)
- 如果你想了解声网的一些社区开发者维护的项目，可以查看 [社区](https://github.com/AgoraIO-Community)
- 若遇到问题需要开发者帮助，你可以到 [开发者社区](https://rtcdeveloper.com/) 提问
- 如果需要售后技术支持, 你可以在 [Agora Dashboard](https://console.shengwang.cn/overview) 提交工单

## 许可证

示例项目遵守 MIT 许可证。
