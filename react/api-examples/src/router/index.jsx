import { Suspense, lazy } from "react"
import { Route, Routes } from "react-router-dom";

// basic routes
const IndexPage = lazy(() => import('../pages/index'));
const BasicVoiceCall = lazy(() => import('../pages/basic/basicVoiceCall'));
const BasicVideoCall = lazy(() => import('../pages/basic/basicVideoCall'));
const BasicLive = lazy(() => import('../pages/basic/basicLive'));
const CloudProxy = lazy(() => import('../pages/basic/cloudProxy'));
const SelfRendering = lazy(() => import('../pages/basic/selfRendering'));
const SelfCapturing = lazy(() => import('../pages/basic/selfCapturing'));
const Screenshot = lazy(() => import('../pages/basic/screenshot'));
const Sharescreen = lazy(() => import('../pages/basic/shareTheScreen'));
// advanced routes
const RecordingDeviceControl = lazy(() => import('../pages/advanced/recordingDeviceControl'));
const AdjustVideoProfile = lazy(() => import('../pages/advanced/adjustVideoProfile'));
const DisplayCallStats = lazy(() => import('../pages/advanced/displayCallStats'));
const BasicMute = lazy(() => import('../pages/advanced/basicMute'));
const BasicMuteSetEnabled = lazy(() => import('../pages/advanced/basicMuteSetEnabled'));
const BasicMuteMediaStreamTrackEnabled = lazy(() => import('../pages/advanced/basicMuteMediaStreamTrackEnabled'));
const VideoBeautyEffect = lazy(() => import('../pages/advanced/videoBeautyEffect'));
const AudioMixingAndAudioEffect = lazy(() => import('../pages/advanced/audioMixingAndAudioEffect'));
const PushStreamToCDN = lazy(() => import('../pages/advanced/pushStreamToCDN'));
const DualStream = lazy(() => import('../pages/advanced/dualStream'));
const Geofencing = lazy(() => import('../pages/advanced/geoFencing'));
const JoinMultipleChannel = lazy(() => import('../pages/advanced/joinMultipleChannel'));
const CustomVideoSource = lazy(() => import('../pages/advanced/customVideoSource'));
const Beauty = lazy(() => import('../pages/advanced/beauty'));
// plugin routes
const VirtualBackground = lazy(() => import('../pages/plugin/virtualBackground'));
const AiDenoiser = lazy(() => import('../pages/plugin/aiDenoiser'));
const SpatialAudio = lazy(() => import('../pages/plugin/spatialAudio'));

const basicRoutes = [
  {
    path: '/basic-voice-call',
    element: <BasicVoiceCall></BasicVoiceCall>,
  },
  {
    path: '/basic-video-call',
    element: <BasicVideoCall></BasicVideoCall>,
  },
  {
    path: '/basic-live',
    element: <BasicLive></BasicLive>,
  },
  {
    path: '/cloud-proxy',
    element: <CloudProxy></CloudProxy>,
  },
  {
    path: '/self-rendering',
    element: <SelfRendering></SelfRendering>,
  },
  {
    path: '/self-capturing',
    element: <SelfCapturing></SelfCapturing>,
  },
  {
    path: '/screenshot',
    element: <Screenshot></Screenshot>,
  },
  {
    path: '/sharescreen',
    element: <Sharescreen></Sharescreen>,
  },
]

const advancedRoutes = [
  {
    path: '/recording-device-control',
    element: <RecordingDeviceControl></RecordingDeviceControl>,
  },
  {
    path: '/adjust-video-profile',
    element: <AdjustVideoProfile></AdjustVideoProfile>,
  },
  {
    path: '/display-call-stats',
    element: <DisplayCallStats></DisplayCallStats>,
  },
  {
    path: '/basic-mute',
    element: <BasicMute></BasicMute>,
  },
  {
    path: '/basic-mute-set-enabled',
    element: <BasicMuteSetEnabled></BasicMuteSetEnabled>,
  },
  {
    path: '/basic-mute-mediastream-track-enabled',
    element: <BasicMuteMediaStreamTrackEnabled></BasicMuteMediaStreamTrackEnabled>,
  },
  {
    path: '/video-beauty-effect',
    element: <VideoBeautyEffect></VideoBeautyEffect>,
  },
  {
    path: '/audio-effect',
    element: <AudioMixingAndAudioEffect></AudioMixingAndAudioEffect>,
  },
  {
    path: '/push-stream-cdn',
    element: <PushStreamToCDN></PushStreamToCDN>,
  },
  {
    path: '/dual-stream',
    element: <DualStream></DualStream>,
  },
  {
    path: '/geofencing',
    element: <Geofencing></Geofencing>
  },
  {
    path: '/multiple-channel',
    element: <JoinMultipleChannel></JoinMultipleChannel>,
  },
  {
    path: '/custom-video-source',
    element: <CustomVideoSource></CustomVideoSource>,
  },
  {
    path: '/beauty',
    element: <Beauty></Beauty>,
  },
]

const pluginRoutes = [
  {
    path: '/virtual-background',
    element: <VirtualBackground></VirtualBackground>,
  },
  {
    path: '/ai-denoiser',
    element: <AiDenoiser></AiDenoiser>,
  },
  {
    path: "/spatial-audio",
    element: <SpatialAudio></SpatialAudio>,
  }
]


export const routes = [
  {
    path: "/",
    element: <IndexPage></IndexPage>,
  },
  ...basicRoutes,
  ...advancedRoutes,
  ...pluginRoutes
]



export const RouteContainer = () => (
  <Routes>
    {routes.map((item) => (
      <Route key={item.path} path={item.path}
        element={
          <Suspense fallback={<div> Loading...</div>}>{item.element}</Suspense>
        }
      >
      </Route >
    ))}
  </Routes >
);



export default RouteContainer
