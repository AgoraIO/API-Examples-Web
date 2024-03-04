# Sample projects for Agora RTC Web SDK 4.x

_English | [简体中文](README.cn.md)_

## Overview

This repository contains sample projects using the Agora RTC Web SDK 4.x.


<hr>

The Web SDK 4.x refactors the Web SDK 3.x. Based on the features of 3.x, 4.x fully optimizes the internal architecture of the SDK and provides more flexible and easy-to-use APIs.

Compared to the Web SDK 3.x, the Web SDK 4.x has the following advantages:

- Uses promises for asynchronous operations, which improves the robustness and readability of your code.
- Supports TypeScript.
- Replaces the Stream object with Track objects for separate and flexible control over audio and video.
- Improves the channel event notification mechanism, making it easier for you to deal with reconnection.
- Provides more accurate and comprehensive error codes for troubleshooting.

## Projects using jQuery and Bootstrap

| Feature             | Sample project location                     |
| ------------------- | -------------------------------- |
| Basic Examples      | [/src/example/basic](/src/example/basic)        |
| Advanced Examples      | [/src/example/advanced](/src/example/advanced) |
| Plugin Examples      | [/src/example/plugin](/src/example/plugin)            |
| Other Examples     | [/src/example/others](/src/example/others)            |
| Vue Framework Example   | [/src/example/framework/vue](/src/example/framework/vue)        |
| React Framework Example | [/src/example/framework/react](/src/example/framework/react)  |


### How to run the sample projects

#### Prerequisites

You need a supported browser to run the sample projects. See [Product Overview](https://docs.agora.io/en/Interactive%20Broadcast/product_live?platform=Web#compatibility) for a list of supported browsers.

#### Steps to run

1. In the project root path run the following command to install dependencies.

   ```shell
   npm install
   ```

2. Use the following command to run the sample project.

   ```shell
   npm run dev
   ```

3. Open link [http://localhost:3001/index.html](http://localhost:3001/index.html) in browser. 

4. In the demo setting page, enter your App ID and App Certificate, then click SetUp button.
   - See [Get Started with Agora](https://docs.agora.io/en/Agora%20Platform/get_appid_token) to learn how to get an App ID and App Certificate.

## Reference

- [Web SDK 4.x Product Overview](https://docs.agora.io/en/Interactive%20Broadcast/product_live?platform=Web)
- [Web SDK 4.x API Reference](https://docs.agora.io/en/Interactive%20Broadcast/API%20Reference/web_ng/index.html)
- [Online demo deployed from this repo](https://webdemo.agora.io/)

## Feedback

If you have any problems or suggestions regarding the sample projects, feel free to file an issue.

## Related resources

- Check our [FAQ](https://docs.agora.io/en/faq) to see if your issue has been recorded.
- Dive into [Agora SDK Samples](https://github.com/AgoraIO) to see more tutorials
- Take a look at [Agora Use Case](https://github.com/AgoraIO-usecase) for more complicated real use case
- Repositories managed by developer communities can be found at [Agora Community](https://github.com/AgoraIO-Community)
- If you encounter problems during integration, feel free to ask questions in [Stack Overflow](https://stackoverflow.com/questions/tagged/agora.io)

## License

The sample projects are under the MIT license. 
