import { Extension, VideoProcessor, Ticker, IProcessorContext } from 'agora-rte-extension'

class SimpleVideoExtension extends Extension<SimpleVideoProcessor> {
  protected _createProcessor(): SimpleVideoProcessor {
    return new SimpleVideoProcessor();
  }

}

class SimpleVideoProcessor extends VideoProcessor {
  public name: string = "SimpleVideoProcessor";
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ticker: Ticker;
  private videoElement: HTMLVideoElement;
  private canvasTrack: MediaStreamTrack;

  public constructor() {
    super();

    this.canvas = document.createElement('canvas');
    this.canvas.width = 640;
    this.canvas.height = 480;
    this.ctx = this.canvas.getContext('2d')!;
    this.videoElement = document.createElement('video');
    this.videoElement.muted = true;
    const outputStream = this.canvas.captureStream(30);
    this.canvasTrack = outputStream.getVideoTracks()[0];

    this.ticker = new Ticker("RAF", 1000 / 30);
    this.ticker.add(this.process);
  }

  private process = () => {
    if (this.inputTrack) {
      this.ctx.drawImage(this.videoElement, 0, 0);
      this.ctx.fillStyle = "red";
      this.ctx.fillRect(0, 0, 100, 100);
    }
  }

  protected onEnableChange(enabled: boolean): void | Promise<void> {
    if (!this.context) {
      return;
    }

    if (enabled) {
      this.ticker.start();
      this.output(this.canvasTrack, this.context);
    } else {
      this.ticker.stop();
      if (this.inputTrack) {
        this.output(this.inputTrack, this.context);
      }
    }
  }

  protected onTrack(track: MediaStreamTrack, ctx: IProcessorContext): void | Promise<void> {
    this.videoElement.srcObject = new MediaStream([track]);
    this.videoElement.play();
    this.videoElement.onplaying = () => {
      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;
    }

    if (this.enabled) {
      this.ticker.start();
      this.output(this.canvasTrack, ctx);
    } else {
      this.ticker.stop();
      this.output(track, ctx);
    }
  }

  protected onUnpiped(): void {
    this.ticker.stop();
  }
}

export { SimpleVideoExtension }