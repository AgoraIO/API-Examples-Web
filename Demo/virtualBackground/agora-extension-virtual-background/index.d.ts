/// <reference types="node" />

import { EventEmitter } from 'events';
import { Extension } from 'agora-rte-extension';
import type { IBaseProcessor } from 'agora-rte-extension';
import type { IExtension } from 'agora-rte-extension';
import { IProcessorContext } from 'agora-rte-extension';
import { VideoProcessor } from 'agora-rte-extension';

export declare type IVirtualBackgroundExtension = IExtension<IVirtualBackgroundProcessor>;

export declare interface IVirtualBackgroundProcessor extends IBaseProcessor {
    init(wasmDir: string): Promise<void>;
    setOptions(options: VirtualBackgroundEffectOptions): void;
}

/**
 * @public
 *
 * 插件实例的属性。用于 {@link setOptions} 方法。
 */
/** @en
 * Options of the virtual background plugin. Used when calling {@link setOptions}.
 */
export declare type VirtualBackgroundEffectOptions = {
    /**
     * 设置背景类型。
     *
     * "color": 纯色
     * "img": 图片
     * "blur": 虚化
     */
    /** @en
     * Sets the background type.
     *
     * "color": pure color
     * "img": image
     * "blur": blurring
     */
    type: string;
    /**
     * 设置背景颜色，值为有效的CSS颜色。
     *
     */
    /** @en
     * Sets the background color, the value should be a CSS supported color.
     */
    color?: string;
    /**
     * 设置自定义背景图。
     *
     * 如果出现 "texture bound to texture unit 2 is not renderable. It might be non-power-of-2 or have incompatible texture filtering (maybe)?" 报错，请检查图片的分辨率相乘后是否是 2 的倍数。
     */
    /** @en
     * Sets the background image.
     *
     * If the error "texture bound to texture unit 2 is not renderable. It might be non-power-of-2 or have incompatible texture filtering (maybe)?" appears, please check whether the product of the picture's width and height is a multiple of 2.
     */
    source?: HTMLImageElement;
    /**
     * 设置背景模糊程度。
     *
     * 1: 轻度
     * 2: 中度
     * 3: 重度
     */
    /** @en
     * Sets background blurring degree.
     *
     * 1: low
     * 2: medium
     * 3: high
     */
    blurDegree?: Number;
};

declare class VirtualBackgroundExtension extends Extension<VirtualBackgroundProcessor> implements IVirtualBackgroundExtension {
    constructor();
    protected _createProcessor(): VirtualBackgroundProcessor;
}
export default VirtualBackgroundExtension;

declare class VirtualBackgroundProcessor extends VideoProcessor implements IVirtualBackgroundProcessor {
    name: string;
    private width;
    private height;
    private maskWidth;
    private maskHeight;
    private wasm;
    private webai;
    private original_track;
    private processed_track;
    private video;
    private canvasSegm;
    private canvas;
    private ctx2d;
    private canvasWA;
    private ctxWA;
    private colorCanvas;
    private ctxColor;
    private bgColor;
    private bgImage;
    private forDEBUG;
    eventBus: EventEmitter;
    private analyzer;
    private initialized;
    private static ortSession;
    private opencv;
    private regl;
    private cancelable;
    private videoTexture;
    private maskTexture;
    private bgTexture;
    private blurBuffers;
    private blurUpBuffers;
    private drawScreen;
    private drawVideo;
    private drawBlurDown;
    private drawBlurUp;
    private drawMix;
    private readonly OUTPUT_NAME;
    private isBlurMode;
    private preMaskImage;
    private maskImage;
    private BlurRound;
    private seg_count;
    private seg_time;
    constructor();
    init(wasmDir: string): Promise<void>;
    setOptions(options: VirtualBackgroundEffectOptions): void;
    protected onEnableChange(enabled: boolean): void;
    protected onTrack(inputTrack: MediaStreamTrack, context: IProcessorContext): void;
    private segmentation;
}

export { }
