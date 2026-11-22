// Neemt microfoon-audio, zet om naar 16 kHz mono PCM16 en stuurt blokjes van ~50 ms door.
class MicProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000;
    this.pos = 0;
    this.buf = new Int16Array(800);
    this.n = 0;
    this.carry = [];
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    const data = this.carry.length ? Float32Array.from([...this.carry, ...ch]) : ch;
    let i = this.pos;
    while (i < data.length) {
      const s = Math.max(-1, Math.min(1, data[Math.floor(i)]));
      this.buf[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.n === this.buf.length) {
        this.port.postMessage(this.buf.buffer.slice(0));
        this.n = 0;
      }
      i += this.ratio;
    }
    this.pos = i - data.length;
    this.carry = [];
    return true;
  }
}
registerProcessor('mic-processor', MicProcessor);
