import { Button, Space, message } from "antd"
import { useRef } from "react"
import { useLocation } from "react-router-dom"

export const getDefaultLanguage = () => {
  const language = navigator.language || 'en'
  if (language == 'zh-CN') {
    return 'zh'
  }
  return 'en'
}


export const showJoinedMessage = (options = {}) => {
  if (options.token) {
    message.success("Congratulations! Joined room successfully.")
  } else {
    const href = window.location.href.split('?')[0]
    const finHref = `${href}?appId=${options.appId}&channel=${options.channel}`
    message.success(<span>Congratulations! You can invite others join this channel by click <a href={finHref} target="_blank">here</a></span>, 8)
  }
}


export const getColor = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r},${g},${b})`
}



export const downloadImageData = (data) => {
  //create canvas，set the canvas's width and height as data(imageData object)'s width and height.
  const canvas = document.createElement("canvas");
  canvas.width = data.width;
  canvas.height = data.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  //put imageData object value into canvas
  ctx.putImageData(data, 0, 0);
  //convert the canvas picture to base64 format.
  const dataURL = canvas.toDataURL();
  //create a hyperlink, and set the value as previous 'dataURL' value, so that we can download as capture.png file.
  const link = document.createElement("a");
  link.download = "capture.png";
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  link.remove();
  canvas.remove();
}


export const loadImage = async (url) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      const msg = 'image url is empty'
      reject(new Error(msg))
    }
    const image = new Image();
    image.src = url;
    image.style = "display:none;width:100px;height:100px;";
    image.crossOrigin = "anonymous";
    image.onload = () => {
      resolve(image)
    };
    document.body.appendChild(image);
  })

}
