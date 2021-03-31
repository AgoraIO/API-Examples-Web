---
id: setup
title: Integrate the SDK
sidebar_label: Integrate the SDK
---
This article introduces how to prepare your development environment and integrate the Agora Web SDK NG into your project.

## Prerequisites
Before using the Agora Web SDK NG, you need to:

- Get a valid Agora account. ([Sign up](https://sso.agora.io/en/signup?_ga=2.63500074.482805615.1577072824-849535803.1560925029) for free.)
- Create a project in [Agora Console](https://console.agora.io/) and choose **APP ID** for authentication.
- Prepare a camera and a microphone.
- If your network includes a firewall, open the ports specified in [Firewall Requirements](https://docs.agora.io/en/Agora%20Platform/firewall?platform=All%20Platforms).

> In the testing stage, you can use APP ID for authentication and pass the appId to your project. In the production stage, you need to change the authentication mechanism from "APP ID" to "APP ID + App Certificate + Token" for increased security. For more information about Agora's authentication mechanisms, see [Set up Authentication](https://docs.agora.io/en/Agora%20Platform/token?platform=All%20Platforms).

## Integrate the SDK
Choose either of the following methods to integrate the Agora Web SDK NG into your project.

### Method 1: Through npm
This method requires npm, see [Install npm](https://www.npmjs.com.cn/getting-started/installing-node/) for details.

1. Run the following command to install the SDK.
```shell
npm install agora-rtc-sdk-ng --save
```

2. Import the following module into the Javascript code in your project.
```js
import AgoraRTC from "agora-rtc-sdk-ng"

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
```

If you use Typescript, you can also import the typed objects from the SDK by adding the following code.
```typescript
import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng"

const client: IAgoraRTCClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
```

### Method 2: Through the CDN
Add the following code to the line before `<style>` in your project.

```html
<script src="https://download.agora.io/sdk/web/AgoraRTC_N-4.1.0.js"></script>
```

### Method 3: Through the Agora website

1. Click [here](https://github.com/AgoraIO-Community/AgoraWebSDK-NG/releases) to get the latest Agora Web SDK NG release.

2. Copy the `AgoraRTCSDK_N.js` file to the directory where your project files reside.

3. Add the following code to the line before the `<style>` tag in your project.

```html
<script src="./AgoraRTC_N-4.1.0.js"></script>
```

> - When you use method 2 or 3, the SDK fully exports an `AgoraRTC` object. You can visit the `AgoraRTC` object to operate the Agora Web SDK NG.
> - In our demo, we include the Agora Web SDK NG from a CDN source for simplicity.

Congratulations! You have successfully set up the project. Next, we'll call the core APIs of the Agora Web SDK NG to implement basic audio and video real-time communications.