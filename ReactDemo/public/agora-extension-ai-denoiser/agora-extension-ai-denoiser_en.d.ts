import { AudioExtension } from 'agora-rte-extension';
import { AudioProcessor } from 'agora-rte-extension';
import type { IAudioExtension } from 'agora-rte-extension';
import type { IAudioProcessor } from 'agora-rte-extension';
import { IAudioProcessorContext } from 'agora-rte-extension';
import type { IBaseProcessor } from 'agora-rte-extension';

export declare class AIDenoiserExtension extends AudioExtension<AIDenoiserProcessor> implements IAIDenoiserExtension {
    BUILD: string;
    VERSION: string;
    protected parameters: {
        AI_DENOISER_PARAMETERS: {};
        ADJUST_3A_FROM_PLUGINS: boolean;
    };
    onloaderror?: (e: Error) => void;
    constructor(options: AIDenoiserExtensionOptions);
    protected _createProcessor(): AIDenoiserProcessor;
    isAvailable(): boolean;
}

/**
 * parameters of AI denoiser extension.
 */
export declare interface AIDenoiserExtensionOptions {
    /**
     * the path of wasm files which are provided in `/external` directory.
     */
    assetsPath: string;
}

declare class AIDenoiserProcessor extends AudioProcessor implements IAIDenoiserProcessor {
    name: string;
    private engineLoaded;
    private workletNode?;
    private audioContext?;
    private stats;
    private statsAppendCount;
    private readonly constraintsRequest?;
    ondump?: (blob: Blob, name: string) => void;
    ondumpend?: () => void;
    onoverload?: () => void;
    constructor();
    protected onPiped(context: IAudioProcessorContext): void;
    setNsParams(nsParams: any): void;
    setAgcParams(agcParams: any): void;
    onTrack(track: MediaStreamTrack): void;
    onNode(node: AudioNode, context: IAudioProcessorContext): void;
    private initializeNode;
    protected onEnableChange(): Promise<void>;
    dump(): void;
    private handleAudioNodeStatsEvent;
    private handleAudioNodeDumpEvent;
    private _dumpCallback;
    private getStats;
}

/**
 * class of AI denoiser extension.
 */
export declare interface IAIDenoiserExtension extends IAudioExtension<IAIDenoiserProcessor> {
    /**
     * Create an instance of IAIDenoiserProcessor.
     */
    createProcessor(): IAIDenoiserProcessor;
    /**
     * The build information about current AI denoiser extention, for confirm the version.
     */
    BUILD: string;
    /**
     * The version of the Agora Web SDK..
     */
    VERSION: string;
    /**
     * loading wasm failed callback.
     * @event
     */
    onloaderror?: (e: Error) => void;
}

/**
 * class of AI denoiser processor, for processing audio track.
 */
export declare interface IAIDenoiserProcessor extends IAudioProcessor {
    /**
     * The name of this processor.
     */
    readonly name: string;
    /**
     * The ID of this processor.
     */
    readonly ID: string;
    /**
     * The type of processor, identify it is to process audio or video.
     */
    get kind(): 'video' | 'audio';
    /**
     * The enabled state of processor.
     */
    get enabled(): boolean;
    /**
     * Pipe the next processor or audio/video destination.
     * @param processor The next processor or audio/video destination.
     */
    pipe(processor: IBaseProcessor): IBaseProcessor;
    /**
     * Unpipe this processor to the next one.
     */
    unpipe(): void;
    /**
     * Disable this processor, make the input of this processor as the output.
     */
    disable(): void | Promise<void>;
    /**
     * Enable the current processor.
     */
    enable(): void | Promise<void>;
    /**
     * dumping audio datas from denoiser process for analysing questions about denoiser.
     * call this function will trigger 9 times `ondump` callback, return 90 seconds audio data.
     */
    dump(): void;
    /**
     * dumping audio data callback.
     * this callback return the following parameters:
     * @param blob audio data file.
     * @param name audio data file name.
     * @event
     */
    ondump?: (blob: Blob, name: string) => void;
    /**
     * dumping audio data ended callback.
     * @event
     */
    ondumpend?: () => void;
    /**
     * @internal
     * adjust internal parameters of NS module.
     *
     * @param nsParams parameters which will be set for NS module.
     */
    setNsParams(nsParams: any): void;
    /**
     * @internal
     * Adjust internal parameters of AGC module.
     *
     * @param nsParams Parameters which will be set for AGC module.
     */
    setAgcParams(agcParams: any): void;
}

export { }
