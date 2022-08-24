import { AudioExtension } from 'agora-rte-extension';
import { AudioProcessor } from 'agora-rte-extension';
import type { IAudioExtension } from 'agora-rte-extension';
import type { IAudioProcessor } from 'agora-rte-extension';
import { IAudioProcessorContext } from 'agora-rte-extension';
import type { IBaseProcessor } from 'agora-rte-extension';

/** @ignore */
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
 * AI 降噪插件初始化参数。
 */
/**
 * @en
 * parameters of AI denoiser extension.
 */
export declare interface AIDenoiserExtensionOptions {
    /**
     * AI 降噪插件依赖的 wasm 文件的 URL 路径。
     */
    /**
     * @en
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
 * AI 降噪插件类。
 */
/**
 * @en
 * class of AI denoiser extension.
 */
export declare interface IAIDenoiserExtension extends IAudioExtension<IAIDenoiserProcessor> {
    /**
     * 创建 IAIDenoiserProcessor 实例。
     */
    /**
     * @en
     * Create an instance of IAIDenoiserProcessor.
     */
    createProcessor(): IAIDenoiserProcessor;
    /**
     * 当前使用的降噪插件的构建信息，用于确定使用的版本。
     */
    /**
     * @en
     * The build information about current AI denoiser extention, for confirm the version.
     */
    BUILD: string;
    /**
     * 当前使用的降噪插件的版本号。
     */
    /**
     * @en
     * The version of the Agora Web SDK..
     */
    VERSION: string;
    /**
     * 加载wasm失败触发的回调。
     * @event
     */
    /**
     * @en
     * loading wasm failed callback.
     * @event
     */
    onloaderror?: (e: Error) => void;
}

/**
 * AI 降噪处理器类，用于处理音频轨道。
 */
/**
 * @en
 * class of AI denoiser processor, for processing audio track.
 */
export declare interface IAIDenoiserProcessor extends IAudioProcessor {
    /**
     * 处理器的名称。
     */
    /**
     * @en
     * The name of this processor.
     */
    readonly name: string;
    /**
     * 处理器的 ID。
     */
    /**
     * @en
     * The ID of this processor.
     */
    readonly ID: string;
    /**
     * 处理器的类型，标识用于视频或者音频。
     */
    /**
     * @en
     * The type of processor, identify it is to process audio or video.
     */
    get kind(): 'video' | 'audio';
    /**
     * 标识处理器的状态。
     */
    /**
     * @en
     * The enabled state of processor.
     */
    get enabled(): boolean;
    /**
     * 连接下一个处理器或者音频/视频输出。
     * @param processor 下一个处理器或者音频/视频输出终点。
     */
    /**
     * @en
     * Pipe the next processor or audio/video destination.
     * @param processor The next processor or audio/video destination.
     */
    pipe(processor: IBaseProcessor): IBaseProcessor;
    /**
     * 取消当前处理器到下一个的连接。
     */
    /**
     * @en
     * Unpipe this processor to the next one.
     */
    unpipe(): void;
    /**
     * 禁用当前处理器，将当前处理器的输入作为输出。
     */
    /**
     * @en
     * Disable this processor, make the input of this processor as the output.
     */
    disable(): void | Promise<void>;
    /**
     * 启用当前处理器。
     */
    /**
     * @en
     * Enable the current processor.
     */
    enable(): void | Promise<void>;
    /**
     * 转储降噪处理过程中的音频数据，方便定位和分析降噪处理的问题。
     * 调用该方法会触发 9 次 ondump 回调，返回插件在该方法调用前 30 秒和后 60 秒处理的音频数据（一共 9 个文件，每个文件长度为 30 秒），然后触发 ondumpend 回调，表示 ondump 回调已成功触发 9 次并返回音频数据。
     */
    /**
     * @en
     * dumping audio datas from denoiser process for analysing questions about denoiser.
     * call this function will trigger 9 times `ondump` callback, return 90 seconds audio data.
     */
    dump(): void;
    /**
     * 转储音频数据回调。
     * 该回调返回以下参数：
     * @param blob 音频数据文件。
     * @param name 音频数据文件的名称。
     * @event
     */
    /**
     * @en
     * dumping audio data callback.
     * this callback return the following parameters:
     * @param blob audio data file.
     * @param name audio data file name.
     * @event
     */
    ondump?: (blob: Blob, name: string) => void;
    /**
     * 转储音频数据已结束回调。
     * @event
     */
    /**
     * @en
     * dumping audio data ended callback.
     * @event
     */
    ondumpend?: () => void;
    /**
     * @internal
     * 调节 NS 模块内部参数。
     *
     * @param nsParams 要为 NS 模块设置的具体参数。
     */
    /**
     * @en
     * @internal
     * adjust internal parameters of NS module.
     *
     * @param nsParams parameters which will be set for NS module.
     */
    setNsParams(nsParams: any): void;
    /**
     * @internal
     * 调节 AGC 模块内部参数。
     *
     * @param nsParams 要为 AGC 模块设置的具体参数。
     */
    /**
     * @en
     * @internal
     * Adjust internal parameters of AGC module.
     *
     * @param nsParams Parameters which will be set for AGC module.
     */
    setAgcParams(agcParams: any): void;
}

export { }
