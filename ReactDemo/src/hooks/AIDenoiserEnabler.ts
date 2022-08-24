import AgoraRTC, {ILocalAudioTrack,IRemoteAudioTrack} from "agora-rtc-sdk-ng";
import {AIDenoiserExtension} from "agora-extension-ai-denoiser"



export default function AIDenoiserEnabler()
:
{
    enabler: Function,
    controler: Function,
}
{
    //let enabledAIDenoiserExtentionFlag = true; // by default, enabled AI Denoiser Extension.

    // Create AIDenoiserExtension instance, please make sure this instance is a singleton, assetsPath is the path of wasm and wasmjs.
    const denoiser = new AIDenoiserExtension({assetsPath:'./agora-extension-ai-denoiser/external'});

    // Register AI denoiser extension into AgoraRTC.
    AgoraRTC.registerExtensions([denoiser]);

    // listen the loaderror callback to handle loading module failed.
    denoiser.onloaderror = (e) => {
        // if loading denoiser is failed, disable the function of denoiser. For example, set your button disbled.
        console.log(e);
    }

    const processor = denoiser.createProcessor();

    // If you want to enable the processor by default.
    processor.enable();


    // Optional, listen the processor`s overlaod callback to catch overload message
    processor.onoverload = async () => {
        console.log("overload!!!");
        await processor.disable();
    }

    async function enabler(audioTrack: ILocalAudioTrack | IRemoteAudioTrack): Promise<void>{
        audioTrack.pipe(processor).pipe(audioTrack.processorDestination);

        await processor.enable();
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

        enabler,
        controler,
    };

}