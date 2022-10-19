import AgoraRTC from "agora-rtc-sdk-ng";
import {AIDenoiserExtension} from "agora-extension-ai-denoiser"

export default class DenoiserExtentionSingleton{

    private static instance : DenoiserExtentionSingleton;

    private _extentionInstance!: AIDenoiserExtension;

    public get extentionInstance() {
        return this._extentionInstance;
    }

    private constructor(){
        this.initializeExtention();
    }

    public static getInstance(): DenoiserExtentionSingleton {

        if(!DenoiserExtentionSingleton.instance)
        {
            DenoiserExtentionSingleton.instance = new DenoiserExtentionSingleton();
        }
            
        return this.instance; 
    }

    private initializeExtention(): void{
        // Create AIDenoiserExtension instance, please make sure this instance is a singleton, assetsPath is the path of wasm and wasmjs.
        let denoiser = new AIDenoiserExtension({assetsPath:'./agora-extension-ai-denoiser/external'});
        
        // Register AI denoiser extension into AgoraRTC.
        AgoraRTC.registerExtensions([denoiser]);
        
        // listen the loaderror callback to handle loading module failed.
        denoiser.onloaderror = (e) => {
            // if loading denoiser is failed, disable the function of denoiser. For example, set your button disbled.
            console.log(e);
        }

        this._extentionInstance = denoiser;
    }
}