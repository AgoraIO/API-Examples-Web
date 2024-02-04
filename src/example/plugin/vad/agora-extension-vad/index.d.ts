import { AudioExtension } from 'agora-rte-extension';
import { AudioProcessor } from 'agora-rte-extension';
import type { IAudioExtension } from 'agora-rte-extension';
import type { IAudioProcessor } from 'agora-rte-extension';

/** @public */
export declare interface IVADExtension extends IAudioExtension<IVADProcessor> {
    /**
     * @deprecated will be removed in recent releases, please use processor.on("pipeerror", ...) instead
     */
    onloaderror?: () => void | Promise<void>;
    checkCompatibility(): boolean;
}

/** @public */
export declare interface IVADProcessor extends IAudioProcessor {
    dump(): Promise<void>;
    destroy(): Promise<void>;
    once(event: "pipeerror", listener: VADProcessorPipeErrorCallback): void;
    on(event: "pipeerror", listener: VADProcessorPipeErrorCallback): void;
    off(event: "pipeerror", listener: VADProcessorPipeErrorCallback): void;
    getListeners(event: "pipeerror"): Array<Function>;
    removeAllListeners(event: "pipeerror"): void;
    once(event: "overload", listener: VADProcessorOverloadCallback): void;
    on(event: "overload", listener: VADProcessorOverloadCallback): void;
    off(event: "overload", listener: VADProcessorOverloadCallback): void;
    getListeners(event: "overload"): Array<Function>;
    removeAllListeners(event: "overload"): void;
    once(event: "dump", listener: VADProcessorDumpCallback): void;
    on(event: "dump", listener: VADProcessorDumpCallback): void;
    off(event: "dump", listener: VADProcessorDumpCallback): void;
    getListeners(event: "dump"): Array<Function>;
    removeAllListeners(event: "dump"): void;
    once(event: "dumpend", listener: VADProcessorDumpEndCallback): void;
    on(event: "dumpend", listener: VADProcessorDumpEndCallback): void;
    off(event: "dumpend", listener: VADProcessorDumpEndCallback): void;
    getListeners(event: "dumpend"): Array<Function>;
    removeAllListeners(event: "dumpend"): void;
    once(event: "result", listener: VADProcessorResultCallback): void;
    on(event: "result", listener: VADProcessorResultCallback): void;
    off(event: "result", listener: VADProcessorResultCallback): void;
    getListeners(event: "result"): Array<Function>;
    removeAllListeners(event: "result"): void;
}

/** @public */
export declare class VADExtension extends AudioExtension<VADProcessor> implements IVADExtension {
    static setLogLevel(level: number): void;
    /**
     * @deprecated will be removed in recent releases, please use processor.on("pipeerror", ...) instead
     */
    onloaderror?: () => void | Promise<void>;
    constructor(options: VADExtensionOptions);
    checkCompatibility(): boolean;
}

/** @public */
export declare type VADExtensionOptions = {
    assetsPath: string;
    fetchOptions?: RequestInit;
};

/** @public */
export declare class VADProcessor extends AudioProcessor implements IVADProcessor {
    readonly name: string;
    dump(): Promise<void>;
    destroy(): Promise<void>;
}

/** @public */
export declare type VADProcessorDumpCallback = (blob: Blob, name: string) => void | Promise<void>;

/** @public */
export declare type VADProcessorDumpEndCallback = () => void | Promise<void>;

/** @public */
export declare type VADProcessorLatency = "LOW" | "FULL";

/** @public */
export declare type VADProcessorLevel = "SOFT" | "AGGRESSIVE";

/** @public */
export declare type VADProcessorMode = "NSNG" | "STATIONARY_NS";

/** @public */
export declare type VADProcessorOverloadCallback = () => void | Promise<void>;

/** @public */
export declare type VADProcessorPipeErrorCallback = (error: Error) => void | Promise<void>;

/** @public */
export declare type VADProcessorResultCallback = (result: VADResultMessageData) => void | Promise<void>;

/** @public */
export declare type VADResultMessageData = {
    voiceProb: number;
    musicProb: number;
    pitchFreq: number;
};

export { }
