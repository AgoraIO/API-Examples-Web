import { AudioExtension } from 'agora-rte-extension';
import { AudioProcessor } from 'agora-rte-extension';
import type { IAudioExtension } from 'agora-rte-extension';
import type { IAudioProcessor } from 'agora-rte-extension';
import type { IAudioProcessorContext } from 'agora-rte-extension';

/** @public */
export declare class AIDenoiserExtension extends AudioExtension<AIDenoiserProcessor> implements IAIDenoiserExtension {
    /**
     * @deprecated use processor.on('loaderror', ...) instead
     */
    onloaderror?: (error: Error) => void;



    constructor(options: AIDenoiserExtensionOptions);
    checkCompatibility(): boolean;
    protected _createProcessor(): AIDenoiserProcessor;
}

/** @public */
export declare interface AIDenoiserExtensionOptions {
    /** @public*/
    assetsPath: string;
}

/** @public */
export declare class AIDenoiserProcessor extends AudioProcessor implements IAIDenoiserProcessor {
    readonly name: string;
    /**
     * @deprecated use processor.on('dump', ...) instead
     */
    ondump?: (blob: Blob, name: string) => void;
    /**
     * @deprecated use processor.on('dumpend', ...) instead
     */
    ondumpend?: () => void;
    /**
     * @deprecated use processor.on('overload', ...) instead
     */
    onoverload?: (elapsedTime: number) => void;






    /** @public */
    dump(): void;
    /** @public */
    setMode(mode: AIDenoiserProcessorMode): Promise<void>;
    /** @public */
    setLevel(level: AIDenoiserProcessorLevel): Promise<void>;











}

/** @public */
export declare enum AIDenoiserProcessorLevel {
    SOFT = "SOFT",
    AGGRESSIVE = "AGGRESSIVE"
}

/** @public */
export declare enum AIDenoiserProcessorMode {
    STATIONARY_NS = "STATIONARY_NS",
    NSNG = "NSNG"
}

/** @public */
export declare interface IAIDenoiserExtension extends IAudioExtension<IAIDenoiserProcessor> {
    createProcessor(): IAIDenoiserProcessor;
    onloaderror?: (error: Error) => void;
}

/** @public*/
export declare interface IAIDenoiserProcessor extends IAudioProcessor {
    readonly name: string;
    readonly ID: string;
    get kind(): "video" | "audio";
    get enabled(): boolean;
    pipe(processor: IAudioProcessor): IAudioProcessor;
    unpipe(): void;
    disable(): void | Promise<void>;
    enable(): void | Promise<void>;
    setMode(mode: AIDenoiserProcessorMode): Promise<void>;
    setLevel(level: AIDenoiserProcessorLevel): Promise<void>;
    dump(): void;
    /**
     * @deprecated use processor.on('dump', ...) instead
     */
    ondump?: (blob: Blob, name: string) => void;
    /**
     * @deprecated use processor.on('dumpend', ...) instead
     */
    ondumpend?: () => void;
    /**
     * @deprecated use processor.on('overload', ...) instead
     */
    onoverload?: (elapsedTime: number) => void;
    on(event: "loaderror", listener: (error: Error) => void): void;
    on(event: "dump", listener: (blob: Blob, name: string) => void): void;
    on(event: "dumpend", listener: () => void): void;
    on(event: "overload", listener: (elapsedTime: number) => void): void;
}

export { }
