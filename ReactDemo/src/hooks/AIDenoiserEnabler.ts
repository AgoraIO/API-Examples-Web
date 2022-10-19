import {ILocalAudioTrack,IRemoteAudioTrack} from "agora-rtc-sdk-ng";
import {AIDenoiserExtension, IAIDenoiserProcessor} from "agora-extension-ai-denoiser"

import DenoiserExtentionSingleton from "./DenoiserExtention"


export default function AIDenoiserEnabler()
:
{
    denoiser: AIDenoiserExtension,
    processor: IAIDenoiserProcessor,
    enabler: Function,
    controler: Function,
}
{
    const denoiser = DenoiserExtentionSingleton.getInstance().extentionInstance;
    const processor = denoiser.createProcessor();

    async function enabler(audioTrack: ILocalAudioTrack | IRemoteAudioTrack): Promise<void>{
        audioTrack.pipe(processor).pipe(audioTrack.processorDestination);

        await processor.enable();

        console.log("processor.enabled:" + processor.enabled);
    }

    //Control the denoiser function enabled or disabled.
    async function controler(flag: boolean) {
        if(flag){
            if(!processor.enabled)
                await processor.enable();
        }else{
            if(processor.enabled)
                await processor.disable();
        }
    }


    return {
        denoiser,
        processor,
        enabler,
        controler,
    };

}