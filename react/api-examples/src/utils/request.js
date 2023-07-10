const isDev = () => {
  const MODE = import.meta.env.MODE
  return MODE.includes("dev") || MODE.includes("development")
}

let BASE_URL = ""
if (isDev()) {
  BASE_URL = "https://test-toolbox.bj2.agoralab.co"
} else {
  BASE_URL = "https://toolbox.bj2.agoralab.co"
}

export const apiReportData = (data = {}) => {
  const url = `${BASE_URL}/v1/data/record`;
  const ssoData = JSON.parse(localStorage.getItem("agora_sso_data")) || {}
  const vid = ssoData?.loginId
  const body = JSON.stringify({
    src: "web",
    vid: vid,
    ...data,
  });
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  }).then((res) => res.json())
}
