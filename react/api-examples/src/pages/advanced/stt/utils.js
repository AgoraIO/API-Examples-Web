import protoRoot from "./proto/index";

let gatewayAddress = "https://api.agora.io"
let taskId = ''
let tokenName = ''
let _authorization = ''

function getAuthorization(key, secret) {
  if (!key && !secret) {
    if (_authorization) {
      return _authorization
    }
  }
  const authorization = `Basic ` + btoa(`${key}:${secret}`)
  _authorization = authorization
  return authorization
}


async function acquireToken(options) {
  const { appId, channel } = options
  const url = `${gatewayAddress}/v1/projects/${appId}/rtsc/speech-to-text/builderTokens`
  const data = {
    instanceId: channel
  }
  let res = await fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": getAuthorization()
    },
    body: JSON.stringify(data)
  })
  if (res.status == 200) {
    res = await res.json()
    return res
  } else {
    // status: 504
    // please enable the realtime transcription service for this appid
    console.error(res.status, res)
    throw new Error(res)
  }
}

export async function apiStartTranscription(options, data, key, secret) {
  const { appId, channel } = options
  const { pullerUid, pullerToken, pusherUid, pusherToken, speakingLanguage, translateLanguage } = data
  const authorization = getAuthorization(key, secret)
  if (!authorization) {
    throw new Error("key or secret is empty")
  }
  const val = await acquireToken(options)
  tokenName = val.tokenName
  const url = `${gatewayAddress}/v1/projects/${appId}/rtsc/speech-to-text/tasks?builderToken=${tokenName}`
  const body = {
    "audio": {
      "subscribeSource": "AGORARTC",
      "agoraRtcConfig": {
        "channelName": channel,
        "uid": pullerUid,
        "token": pullerToken,
        "channelType": "LIVE_TYPE",
        "subscribeConfig": {
          "subscribeMode": "CHANNEL_MODE"
        },
        "maxIdleTime": 10
      }
    },
    "config": {
      "features": [
        "RECOGNIZE"
      ],
      "recognizeConfig": {
        "language": speakingLanguage,
        "model": "Model",
        "connectionTimeout": 60,
        "output": {
          "destinations": [
            "AgoraRTCDataStream"
          ],
          "agoraRTCDataStream": {
            "channelName": channel,
            "uid": pusherUid,
            "token": pusherToken
          }
        }
      }
    }
  }

  if (translateLanguage) {
    body.config.translateConfig = {
      "languages": [
        {
          "source": speakingLanguage,
          "target": [
            translateLanguage
          ]
        }
      ]
    }
  }

  let res = await fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": authorization,
    },
    body: JSON.stringify(body)
  })
  res = await res.json()
  taskId = res.taskId
}

export async function apiStopTranscription(options = {}) {
  if (!taskId) {
    return
  }
  const { appId } = options
  const url = `${gatewayAddress}/v1/projects/${appId}/rtsc/speech-to-text/tasks/${taskId}?builderToken=${tokenName}`
  await fetch(url, {
    method: 'DELETE',
    headers: {
      "Content-Type": "application/json",
      "Authorization": getAuthorization(),
    }
  })
  taskId = null
}


