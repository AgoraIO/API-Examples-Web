// TODO:no need 
import { RtcProvider } from "@/utils/context"

const RtcConfigure = () => {
  const client = createClient({ codec: 'vp8', mode: 'live' })


  return <RtcProvider></RtcProvider>
}


export default RtcConfigure
