
function decodeTimeSignature(s) {
  return s.split("/").map((x) => parseInt(x));
}

export default class Metronome {
  constructor(WasmClass, config) {
    this.WasmClass = WasmClass;
    this.inst = null;
    this.timer = null;
    this.cursor = 0;
    this.onTick = config.onTick;
    this.resetTicker = config.resetTicker;
    this.setTimeSig(config.timeSig);
    this.setTempo(config.tempo);
  }

  showTicker() {
    this.resetTicker(this.numBeats);
  }

  isRunning() {
    return this.timer !== null;
  }

  // @TODO: validate timeSignature
  setTimeSig(timeSig) {
    if (timeSig == undefined) {
      return false;
    } else if (Array.isArray(timeSig)) {
      if (this.numBeats == timeSig[0] && this.noteLength == timeSig[1]) {
        return false;
      } else {
        this.numBeats = timeSig[0];
        this.noteLength = timeSig[1];
        return true;
      }
    } else if (typeof timeSig == "string") {
      const ts = decodeTimeSignature(timeSig);
      this.numBeats = ts[0];
      this.noteLength = ts[1];
      return true;
    } else {
      return false;
    }
  }

  setTempo(tempo) {
    if (tempo) {
      this.tempo = Math.min(parseInt(tempo), 400);
    }
  }

  start(timeSig, tempo) {
    if (!this.isRunning()) {
      if (this.setTimeSig(timeSig)) {
        this.resetTicker(this.numBeats);
      }
      this.setTempo(tempo);
      let inst = null;
      // The `WasmMetronome` code initializes an instance of
      // `AudioContext`. Hence it can be initialized only upon some
      // event triggered by user action.
      if (this.inst == null) {
        inst = new this.WasmClass();
      } else {
        // Awkward assignment code due to the chaining API provided by
        // `WasmMetronome`
        inst = this.inst.reset();
      }
      this.inst = inst
        .set_tempo(this.tempo)
        .set_time_signature(this.numBeats, this.noteLength)
        .set_on_ended(() => {
          this.cursor = this.cursor == this.numBeats ? 1 : this.cursor + 1;
          this.onTick(this.cursor);
        });
      // @NOTE: The cursor is reset to 0 here, before starting instead
      // of in the `stop` method because even after the metronome is
      // stopped, it will continue playing until the end of the bar is
      // reached. That means the `on_ended` callback function may be
      // called after calling `stop`.
      this.cursor = 0;
      this.timer = setInterval(() => this.inst.schedule(), this.inst.beat_interval);
    } else {
      console.log("Metronome is already running...Ignoring");
    }
  }

  stop() {
    if (this.isRunning()) {
      clearInterval(this.timer);
      this.timer = null;
    } else {
      console.log("Metronome is already stopped...Ignoring");
    }
  }

  getStats() {
    const stats = this.inst.stats;
    return {
      barCount: stats.bar_count,
      duration: stats.duration,
    };
  }
}
