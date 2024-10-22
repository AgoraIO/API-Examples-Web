import { Extension } from 'agora-rte-extension';
import { IBaseProcessor } from 'agora-rte-extension';
import { IExtension } from 'agora-rte-extension';
import { IProcessorContext } from 'agora-rte-extension';
import { VideoProcessor } from 'agora-rte-extension';

export declare type IVideoCompositingExtension = IExtension<IVideoTrackCompositor>;

export declare interface IVideoTrackCompositor extends IBaseProcessor {
    /**
     * Create input endpoint.
     *
     * "option": Display options of this layer
     *
     * @return An instance of IBaseProcessor interface
     */
    createInputEndpoint(option: LayerOption): IBaseProcessor;
    /**
     * Create an image layer.
     *
     * "url": Image source
     * "option": Display options of this layer
     *
     * @return A HTMLImageElement Object
     */
    addImage(url: string, option: LayerOption): HTMLImageElement;
    /**
     * Remove an image layer.
     *
     * "imgElement": A HTMLImageElement Object
     */
    removeImage(imgElement: HTMLImageElement): void;
    /**
     * Sets the background media.
     *
     * "width": Width of output video
     * "height": Height of output video
     * "fps": Framerate of output video
     */
    setOutputOptions(width: number, height: number, fps?: number): void;
    /**
     * Start compositing.
     */
    start(): Promise<void>;
    /**
     * Stop compositing.
     */
    stop(): Promise<void>;
}

export declare type LayerOption = {
    /**
     * x location of content box.
     */
    x: number;
    y: number;
    /**
     * Width of content box.
     */
    width: number;
    /**
     * Height of content box.
     */
    height: number;
    /**
     * How an element responds to the height and width of its content box.
     *
     * "contain": increases or decreases the size of the video to fill the box whilst preserving its aspect-ratio
     * "cover": the video will fill the height and width of its box, once again maintaining its aspect ratio but often cropping the video.
     * "fill": stretches the video to fit the content box, regardless of its aspect-ratio.
     */
    fit?: 'contain' | 'cover' | 'fill';
};

declare class VideoCompositingExtension extends Extension<VideoTrackCompositor> implements IVideoCompositingExtension {
    constructor();
    protected _createProcessor(): VideoTrackCompositor;
}
export default VideoCompositingExtension;

declare class VideoTrackCompositor extends VideoProcessor implements IVideoTrackCompositor {
    name: 'VideoTrackCompositor';
    private _canvas2d;
    private _ctx2d;
    private _backgroundImage;
    private _intervalId;
    private _layers;
    private _canvasTrack;
    private _options;
    private _medias;
    private _width;
    private _height;
    private _fps;
    constructor();
    private draw;
    addLayer(track: MediaStreamTrack, option: LayerOption): void;
    removeLayer(track: MediaStreamTrack): void;
    setOutputOptions(width: number, height: number, fps?: number): void;
    addImage(url: string, option: LayerOption): HTMLImageElement;
    removeImage(imgElement: HTMLImageElement): void;
    setBackground(backgroundImage: HTMLImageElement): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    createInputEndpoint(option: LayerOption): IBaseProcessor;
    protected onTrack(track: MediaStreamTrack, context: IProcessorContext): Promise<void>;
    protected onUnpiped?(context?: IProcessorContext): void;
    private getStats;
}

export { }
