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
 * AI 降噪插件初始化参数。
 */
export declare interface AIDenoiserExtensionOptions {
    /**
     * AI 降噪插件依赖的 wasm 文件的 URL 路径。
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
export declare interface IAIDenoiserExtension extends IAudioExtension<IAIDenoiserProcessor> {
    /**
     * 创建 IAIDenoiserProcessor 实例。
     */
    createProcessor(): IAIDenoiserProcessor;
    /**
     * 当前使用的降噪插件的构建信息，用于确定使用的版本。
     */
    BUILD: string;
    /**
     * 当前使用的降噪插件的版本号。
     */
    VERSION: string;
    /**
     * 加载wasm失败触发的回调。
     * @event
     */
    onloaderror?: (e: Error) => void;
}

/**
 * AI 降噪处理器类，用于处理音频轨道。
 */
export declare interface IAIDenoiserProcessor extends IAudioProcessor {
    /**
     * 处理器的名称。
     */
    readonly name: string;
    /**
     * 处理器的 ID。
     */
    readonly ID: string;
    /**
     * 处理器的类型，标识用于视频或者音频。
     */
    get kind(): 'video' | 'audio';
    /**
     * 标识处理器的状态。
     */
    get enabled(): boolean;
    /**
     * 连接下一个处理器或者音频/视频输出。
     * @param processor 下一个处理器或者音频/视频输出终点。
     */
    pipe(processor: IBaseProcessor): IBaseProcessor;
    /**
     * 取消当前处理器到下一个的连接。
     */
    unpipe(): void;
    /**
     * 禁用当前处理器，将当前处理器的输入作为输出。
     */
    disable(): void | Promise<void>;
    /**
     * 启用当前处理器。
     */
    enable(): void | Promise<void>;
    /**
     * 转储降噪处理过程中的音频数据，方便定位和分析降噪处理的问题。
     * 调用该方法会触发 9 次 ondump 回调，返回插件在该方法调用前 30 秒和后 60 秒处理的音频数据（一共 9 个文件，每个文件长度为 30 秒），然后触发 ondumpend 回调，表示 ondump 回调已成功触发 9 次并返回音频数据。
     */
    dump(): void;
    /**
     * 转储音频数据回调。
     * 该回调返回以下参数：
     * @param blob 音频数据文件。
     * @param name 音频数据文件的名称。
     * @event
     */
    ondump?: (blob: Blob, name: string) => void;
    /**
     * 转储音频数据已结束回调。
     * @event
     */
    ondumpend?: () => void;
    /**
     * @internal
     * 调节 NS 模块内部参数。
     *
     * @param nsParams 要为 NS 模块设置的具体参数。
     */
    setNsParams(nsParams: any): void;
    /**
     * @internal
     * 调节 AGC 模块内部参数。
     *
     * @param nsParams 要为 AGC 模块设置的具体参数。
     */
    setAgcParams(agcParams: any): void;
}

export { }
