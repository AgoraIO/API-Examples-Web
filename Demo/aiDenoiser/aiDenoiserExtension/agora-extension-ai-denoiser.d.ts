import { AudioExtension } from 'agora-rte-extension';
import { AudioProcessor } from 'agora-rte-extension';
import type { IAudioExtension } from 'agora-rte-extension';
import type { IAudioProcessor } from 'agora-rte-extension';
import { IAudioProcessorContext } from 'agora-rte-extension';

declare interface AGCParameters {
    targetLevelDbfs: number;
    compressionGainDb: number;
    maxCompressionGainDb: number;
    limiterEnable: number;
}

export declare class AIDenoiserExtension extends AudioExtension<AIDenoiserProcessor> implements IAIDenoiserExtension {
    private moduleAdded;
    private BUILD;
    private VERSION;
    protected parameters: {
        AI_DENOISER_PARAMETERS: {};
        ADJUST_3A_FROM_PLUGINS: boolean;
    };
    onloaderror?: (e: Error) => {};
    constructor(options: AIDenoiserExtensionOptions);
    protected _createProcessor(): AIDenoiserProcessor;
}

export declare interface AIDenoiserExtensionOptions {
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
    setNsParams(nsParams: NSParameters): void;
    setAgcParams(agcParams: AGCParameters): void;
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

export declare interface IAIDenoiserExtension extends IAudioExtension<IAIDenoiserProcessor> {
    createProcessor(): IAIDenoiserProcessor;
}

export declare interface IAIDenoiserProcessor extends IAudioProcessor {
    dump(): void;
    ondump?: (blob: Blob, name: string) => void;
    ondumpend?: () => void;
}

declare interface NSParameters {
    attackFactor: number;
    releaseFactor: number;
    upperBound: number;
    upperMask: number;
    lowerBound: number;
    lowerMask: number;
    triangle1: number;
    triangle2: number;
    triangle3: number;
    thresholdAI: number;
    thresholdStastical: number;
    enhFactorAI: number;
    enhFactorStastical: number;
    strategy: number;
    noiseOverEstimate: number;
    statisticalBound: number;
    gainBoostVal: number;
    finalLowerMask: number;
    noisePowFloor: number;
}

export { }
