import { AudioExtension } from 'agora-rte-extension';
import { AudioProcessor } from 'agora-rte-extension';
import type { IAudioExtension } from 'agora-rte-extension';
import type { IAudioProcessor } from 'agora-rte-extension';

/** @public */
export declare class AIDenoiserExtension extends AudioExtension<AIDenoiserProcessor> implements IAIDenoiserExtension {
    static setLogLevel(level: number): void;
    /**
     * @deprecated will be removed in recent releases, please use processor.on("pipeerror", ...) instead
     */
    onloaderror?: () => void | Promise<void>;
    constructor(options: AIDenoiserExtensionOptions);
    checkCompatibility(): boolean;
}

/** @public */
export declare type AIDenoiserExtensionOptions = {
    assetsPath: string;
    fetchOptions?: RequestInit;
};

/** @public */
export declare class AIDenoiserProcessor extends AudioProcessor implements IAIDenoiserProcessor {
    readonly name: string;
    /**
     * @deprecated will be removed in recent releases, please use processor.on("dump", ...) instead
     */
    ondump?: (blob: Blob, name: string) => void | Promise<void>;
    /**
     * @deprecated will be removed in recent releases, please use processor.on("dumpend", ...) instead
     */
    ondumpend?: () => void | Promise<void>;
    /**
     * @deprecated will be removed in recent releases, please use processor.on("overload", ...) instead
     */
    onoverload?: (elapsedTime?: number) => void | Promise<void>;
    setMode(mode: AIDenoiserProcessorMode): Promise<void>;
    setLevel(level: AIDenoiserProcessorLevel): Promise<void>;
    setLatency(latency: AIDenoiserProcessorLatency): Promise<void>;
    dump(): Promise<void>;
    destroy(): Promise<void>;
}

/** @public */
export declare type AIDenoiserProcessorDumpCallback = (blob: Blob, name: string) => void | Promise<void>;

/** @public */
export declare type AIDenoiserProcessorDumpEndCallback = () => void | Promise<void>;

/** @public */
export declare type AIDenoiserProcessorLatency = "LOW" | "FULL";

/** @public */
export declare type AIDenoiserProcessorLevel = "SOFT" | "AGGRESSIVE";

/** @public */
export declare type AIDenoiserProcessorMode = "NSNG" | "STATIONARY_NS";

/** @public */
export declare type AIDenoiserProcessorOverloadCallback = () => void | Promise<void>;

/** @public */
export declare type AIDenoiserProcessorPipeErrorCallback = (error: Error) => void | Promise<void>;

/** @public */
export declare interface IAIDenoiserExtension extends IAudioExtension<IAIDenoiserProcessor> {
    /**
     * @deprecated will be removed in recent releases, please use processor.on("pipeerror", ...) instead
     */
    onloaderror?: () => void | Promise<void>;
    checkCompatibility(): boolean;
}

/** @public */
export declare interface IAIDenoiserProcessor extends IAudioProcessor {
    setMode(mode: AIDenoiserProcessorMode): Promise<void>;
    setLevel(level: AIDenoiserProcessorLevel): Promise<void>;
    setLatency(latency: AIDenoiserProcessorLatency): Promise<void>;
    dump(): Promise<void>;
    destroy(): Promise<void>;
    /**
     * @deprecated will be removed in recent releases, please use processor.on("overload", ...) instead
     */
    onoverload?: (elapsedTime?: number) => void | Promise<void>;
    /**
     * @deprecated will be removed in recent releases, please use processor.on("dump", ...) instead
     */
    ondump?: (blob: Blob, name: string) => void | Promise<void>;
    /**
     * @deprecated will be removed in recent releases, please use processor.on("dumpend", ...) instead
     */
    ondumpend?: () => void | Promise<void>;
    once(event: "pipeerror", listener: AIDenoiserProcessorPipeErrorCallback): void;
    on(event: "pipeerror", listener: AIDenoiserProcessorPipeErrorCallback): void;
    off(event: "pipeerror", listener: AIDenoiserProcessorPipeErrorCallback): void;
    getListeners(event: "pipeerror"): Array<Function>;
    removeAllListeners(event: "pipeerror"): void;
    once(event: "overload", listener: AIDenoiserProcessorOverloadCallback): void;
    on(event: "overload", listener: AIDenoiserProcessorOverloadCallback): void;
    off(event: "overload", listener: AIDenoiserProcessorOverloadCallback): void;
    getListeners(event: "overload"): Array<Function>;
    removeAllListeners(event: "overload"): void;
    once(event: "dump", listener: AIDenoiserProcessorDumpCallback): void;
    on(event: "dump", listener: AIDenoiserProcessorDumpCallback): void;
    off(event: "dump", listener: AIDenoiserProcessorDumpCallback): void;
    getListeners(event: "dump"): Array<Function>;
    removeAllListeners(event: "dump"): void;
    once(event: "dumpend", listener: AIDenoiserProcessorDumpEndCallback): void;
    on(event: "dumpend", listener: AIDenoiserProcessorDumpEndCallback): void;
    off(event: "dumpend", listener: AIDenoiserProcessorDumpEndCallback): void;
    getListeners(event: "dumpend"): Array<Function>;
    removeAllListeners(event: "dumpend"): void;
}

/** @public */
export declare function recursiveMerge(target: unknown, source: unknown): unknown;

/** @public */
export declare let store: {
    parameters: {
        AI_DENOISER_PARAMETERS: {
            enabled?: boolean;
            constraints?: MediaTrackConstraints;
            config?: Record<string, Record<string, number>>;
        };
        ADJUST_3A_FROM_PLUGINS: boolean;
        MEDIA_DEVICE_CONSTRAINTS: MediaStreamConstraints | string;
    };
};

export { }
