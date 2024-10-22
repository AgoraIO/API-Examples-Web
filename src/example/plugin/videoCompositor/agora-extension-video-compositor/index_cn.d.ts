import { Extension } from 'agora-rte-extension';
import { IBaseProcessor } from 'agora-rte-extension';
import { IExtension } from 'agora-rte-extension';
import { IProcessorContext } from 'agora-rte-extension';
import { VideoProcessor } from 'agora-rte-extension';

export declare type IVideoCompositingExtension = IExtension<IVideoTrackCompositor>;

export declare interface IVideoTrackCompositor extends IBaseProcessor {
    /**
     * 创建输入端点。
     *
     * "option": 图层显示选项
     *
     * @return IBaseProcessor 接口实例
     */
    createInputEndpoint(option: LayerOption): IBaseProcessor;
    /**
     * 增加图像层。
     *
     * "url": 图像URL
     * "option": 图层显示选项
     *
     * @return 一个 HTMLImageElement 对象
     */
    addImage(url: string, option: LayerOption): HTMLImageElement;
    /**
     * 删除图像层。
     *
     * "imgElement": 一个 HTMLImageElement 对象
     */
    removeImage(imgElement: HTMLImageElement): void;
    /**
     * 设置输出选项。
     *
     * "width": 输出视频的宽度
     * "height": 输出视频的高度
     * "fps": 输出视频的帧率
     */
    setOutputOptions(width: number, height: number, fps?: number): void;
    /**
     * 启动合成。
     */
    start(): Promise<void>;
    /**
     * 停止合成。
     */
    stop(): Promise<void>;
}

export declare type LayerOption = {
    /**
     * 视频显示容器的水平坐标。
     */
    x: number;
    /**
     * 视频显示容器的垂直坐标。
     */
    y: number;
    /**
     * y location of content box.
     */
    width: number;
    /**
     * 视频显示高度。
     */
    height: number;
    /**
     * 视频填充方式。
     *
     * "contain": 保持画面比例显示完整内容
     * "cover": 保持画面比例，填充显示容器，必要时裁切
     * "fill": 拉伸画面以填充容器所有区域，画面比列会更改为与容器相同
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
