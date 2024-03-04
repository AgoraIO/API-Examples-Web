import { createRouter, createWebHashHistory } from "vue-router"

const Home = () => import('../pages/index.vue')
//  basic
const BasicVoiceCall = () => import('../pages/basic/basicVoiceCall/index.vue')
const BasicVideoCall = () => import('../pages/basic/basicVideoCall/index.vue')
const BasicLive = () => import('../pages/basic/basicLive/index.vue')
const CloudProxy = () => import('../pages/basic/cloudProxy/index.vue')
const SelfRendering = () => import('../pages/basic/selfRendering/index.vue')
const SelfCapturing = () => import('../pages/basic/selfCapturing/index.vue')
const Screenshot = () => import('../pages/basic/screenshot/index.vue')
const Sharescreen = () => import('../pages/basic/shareTheScreen/index.vue')
// advanced
const RecordingDeviceControl = () => import('../pages/advanced/recordingDeviceControl/index.vue')
const AdjustVideoProfile = () => import('../pages/advanced/adjustVideoProfile/index.vue')
const DisplayCallStats = () => import('../pages/advanced/displayCallStats/index.vue')
const BasicMute = () => import('../pages/advanced/basicMute/index.vue')
const BasicMuteSetEnabled = () => import('../pages/advanced/basicMuteSetEnabled/index.vue')
const BasicMuteMediastreamTrackEnabled = () => import('../pages/advanced/basicMuteMediastreamTrackEnabled/index.vue')
const AudioEffect = () => import('../pages/advanced/audioMixingAndAudioEffect/index.vue')
const PushStreamCDN = () => import('../pages/advanced/pushStreamToCDN/index.vue')
const DualStream = () => import('../pages/advanced/dualStream/index.vue')
// plugin


const basicRoutes = [{
  path: '/basic-voice-call',
  component: BasicVoiceCall,
}, {
  path: '/basic-video-call',
  component: BasicVideoCall,
}, {
  path: '/basic-live',
  component: BasicLive,
}, {
  path: '/cloud-proxy',
  component: CloudProxy,
}, {
  path: '/self-rendering',
  component: SelfRendering,
},
{
  path: '/self-capturing',
  component: SelfCapturing,
},
{
  path: '/screenshot',
  component: Screenshot,
},
{
  path: '/sharescreen',
  component: Sharescreen,
},
{
  path: '/recording-device-control',
  component: RecordingDeviceControl,
}, {
  path: '/adjust-video-profile',
  component: AdjustVideoProfile,
}, {
  path: '/display-call-stats',
  component: DisplayCallStats,
}, {
  path: '/basic-mute',
  component: BasicMute,
}, {
  path: '/basic-mute-set-enabled',
  component: BasicMuteSetEnabled,
}, {
  path: '/basic-mute-mediastream-track-enabled',
  component: BasicMuteMediastreamTrackEnabled
}, {
  path: '/audio-effect',
  component: AudioEffect,
}, {
  path: '/push-stream-cdn',
  component: PushStreamCDN,
}, {
  path: '/dual-stream',
  component: DualStream,
}
]

const advancedRoutes = []

const pluginRoutes = []

const routes = [
  { path: '/', component: Home },
  ...basicRoutes,
  ...advancedRoutes,
  ...pluginRoutes,
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})








