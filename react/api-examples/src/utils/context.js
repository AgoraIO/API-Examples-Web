// TODO:no need 
import { createContext } from "react"

const RtcContext = createContext({
  localVideoTrack: null,
  localAudioTrack: null,
  client: null
})


export const RtcProvider = RtcContext.Provider
export const RtcConsumer = RtcContext.Consumer
export default RtcContext
