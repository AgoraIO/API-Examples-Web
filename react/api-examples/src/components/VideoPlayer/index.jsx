import { useRef, useState, useLayoutEffect, forwardRef, useImperativeHandle } from "react";
const clientWidth = document.body.clientWidth;
const isInMobile = clientWidth < 576;
const DEFAULT_WIDTH = isInMobile ? "320px" : "480px";
const DEFAULT_HEIGHT = isInMobile ? "240px" : "320px";
const AgoraVideoPlayer = forwardRef((props, ref) => {
  const {
    videoTrack,
    audioTrack,
    config,
    text,
    width: defaultWidth = DEFAULT_WIDTH,
    height: defaultHeight = DEFAULT_HEIGHT,
    style = {},
    onClick = () => {},
  } = props;

  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);
  const vidDiv = useRef(null);

  useImperativeHandle(ref, () => ({
    setOptions({
      width,
      height
    }) {
      height && setHeight(height);
      width && setWidth(width);
    }
  }));

  useLayoutEffect(() => {
    if (vidDiv.current !== null) {
      videoTrack?.play(vidDiv.current, config);
    }
    return () => {
      videoTrack?.stop();
    };
  }, [videoTrack]);

  useLayoutEffect(() => {
    audioTrack?.play();
    return () => {
      audioTrack?.stop();
    };
  }, [audioTrack]);

  return <div style={style}>
    {text ? <div style={{
      marginTop: "10px",
      marginBottom: "10px"
    }}>{text}</div> : null}
    <div ref={vidDiv} style={{
      width,
      height
    }} onClick={onClick} />
  </div>;
});

export default AgoraVideoPlayer;
