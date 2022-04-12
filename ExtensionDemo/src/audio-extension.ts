import { AudioExtension, AudioProcessor, IAudioProcessorContext } from 'agora-rte-extension'

class SimpleAudioExtension extends AudioExtension<SimpleAudioProcessor> {
  protected _createProcessor(): SimpleAudioProcessor {
    return new SimpleAudioProcessor();
  }

}

class SimpleAudioProcessor extends AudioProcessor {
  public name: string = "SimpleAudioProcessor";
  private gainNode?: GainNode;
  private oscillatorNode?: OscillatorNode;

  protected onPiped(context: IAudioProcessorContext): void {
    const audioContext = context.getAudioContext();
    const gainNode = audioContext.createGain();
    const oscillatorNode = audioContext.createOscillator();
    oscillatorNode.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillatorNode.start();
    oscillatorNode.connect(gainNode);

    this.gainNode = gainNode;
    this.oscillatorNode = oscillatorNode;
  }

  protected onUnpiped() {
    this.gainNode = undefined;
    this.oscillatorNode?.stop();
    this.oscillatorNode = undefined;

  }

  protected onEnableChange(enabled: boolean): void | Promise<void> {
    if (this.context && this.oscillatorNode && this.gainNode) {
      if (enabled) {
        this.oscillatorNode.connect(this.gainNode);
      } else {
        this.oscillatorNode.disconnect();
      }
    }
  }

  protected onNode(audioNode: AudioNode, context: IAudioProcessorContext): void | Promise<void> {
    if (this.gainNode && this.oscillatorNode) {
      audioNode.connect(this.gainNode);

      this.output(this.gainNode, context);
    }
  }
}

export { SimpleAudioExtension }