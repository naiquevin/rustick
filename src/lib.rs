use wasm_bindgen::prelude::*;
use web_sys::{js_sys::Function, AudioContext};

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    // // Multiple arguments too!
    // #[wasm_bindgen(js_namespace = console, js_name = log)]
    // fn log_specific(a: u8, b: f32);
}

#[derive(Debug)]
pub enum MetronomeError {
    Uninitialized(String),
    WebAudio(JsValue),
}

impl Into<JsValue> for MetronomeError {
    fn into(self) -> JsValue {
        match self {
            Self::Uninitialized(s) => JsValue::from_str(&format!("Param '{s}' uninitialized")),
            Self::WebAudio(jv) => jv,
        }
    }
}

#[derive(Default, Clone, Copy)]
#[wasm_bindgen]
pub struct Stats {
    pub bar_count: i32,
    pub total_bar_count: i32,
    pub duration: f64,
    pub total_duration: f64,
}

impl Stats {

    fn inc_bar(&mut self) {
        self.bar_count += 1;
        self.total_bar_count += 1;
    }

    fn record_time(&mut self, time: f64) {
        self.duration += time;
        self.total_duration += time;
    }

    fn reset(&mut self) {
        self.bar_count = 0;
        self.duration = 0.0;
    }

    #[allow(unused)]
    fn reset_all(&mut self) {
        self.reset();
        self.total_bar_count = 0;
        self.total_duration = 0.0;
    }
}

#[allow(unused)]
#[wasm_bindgen]
pub struct Metronome {
    ctx: AudioContext,
    min_schedule_ahead: f64,
    // Parameters
    num_beats: Option<u8>,
    note_len: Option<u8>,
    bpm: Option<u16>,
    // Computed once
    pub beat_interval: Option<f64>,
    schedule_ahead_interval: Option<f64>,
    // State
    scheduler: Option<i32>,
    scheduled_upto: f64,
    pub stats: Stats,
    // Hooks/Callbacks
    on_ended: Option<Function>
}

#[wasm_bindgen]
impl Metronome {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Result<Metronome, JsValue> {
        let ctx = AudioContext::new()?;
        Ok(Self {
            ctx,
            min_schedule_ahead: 0.2,
            num_beats: None,
            note_len: None,
            bpm: None,
            beat_interval: None,
            schedule_ahead_interval: None,
            scheduler: None,
            scheduled_upto: 0.0,
            stats: Stats::default(),
            on_ended: None,
        })
    }

    #[wasm_bindgen]
    pub fn set_tempo(mut self, bpm: u16) -> Self {
        self.bpm.replace(bpm);
        let beat_interval = 60_f64 / bpm as f64;
        self.beat_interval = Some(beat_interval);
        self.schedule_ahead_interval = Some(f64::max(self.min_schedule_ahead, beat_interval));
        self
    }

    #[wasm_bindgen]
    pub fn set_time_signature(mut self, num_beats: u8, note_len: u8) -> Self {
        self.num_beats.replace(num_beats);
        self.note_len.replace(note_len);
        self
    }

    pub fn set_on_ended(mut self, f: Function) -> Self {
        self.on_ended = Some(f);
        self
    }

    #[wasm_bindgen]
    pub fn reset(mut self) -> Self {
        self.scheduled_upto = self.ctx.current_time();
        self.stats.reset();
        self
    }

    /// Schedule clicks for the next bar
    #[wasm_bindgen]
    pub fn schedule(&mut self) -> Result<(), MetronomeError> {
        let schedule_ahead_interval =
            self.schedule_ahead_interval
            .ok_or(MetronomeError::Uninitialized(
                "schedule_ahead_interval".to_string(),
            ))?;
        if self.ctx.current_time() + schedule_ahead_interval > self.scheduled_upto {
            let num_beats = self
                .num_beats
                .ok_or(MetronomeError::Uninitialized("num_beats".to_string()))?;
            let beat_interval = self
                .beat_interval
                .ok_or(MetronomeError::Uninitialized("beat_interval".to_string()))?;
            for i in 0..num_beats {
                let osc = self
                    .ctx
                    .create_oscillator()
                    .map_err(MetronomeError::WebAudio)?;
                let envelope = self.ctx.create_gain().map_err(MetronomeError::WebAudio)?;
                // Frequency will affect the pitch/tone (more processing will
                // be done on it further to make it sound like a metronome
                // click)
                let freq = match i {
                    0 => 1000.0,
                    _ => 800.0,
                };
                osc.frequency().set_value(freq);
                // volume?
                envelope.gain().set_value(1.0);

                let play_time = self.scheduled_upto + beat_interval;

                // Following 2 lines are used to make gradual change to the
                // gain/volume. It also affects the way the click sounds
                envelope
                    .gain()
                    .exponential_ramp_to_value_at_time(1.0, play_time + 0.001)
                    .map_err(MetronomeError::WebAudio)?;
                envelope
                    .gain()
                    .exponential_ramp_to_value_at_time(0.001, play_time + 0.02)
                    .map_err(MetronomeError::WebAudio)?;

                // Oscillator is a child class of AudioScheduledSourceNode,
                // which further is a child class of AudioNode. Calling
                // connect on this instance connects the output of oscillator
                // to the input of the node passed to it, in this case
                // envelope.
                osc.connect_with_audio_node(&envelope)
                    .map_err(MetronomeError::WebAudio)?;

                // Connect the output of oscillator as the input to the
                // AudioDestinationNode (final audio destination)
                envelope
                    .connect_with_audio_node(&self.ctx.destination())
                    .map_err(MetronomeError::WebAudio)?;

                osc.set_onended(self.on_ended.as_ref());

                osc.start_with_when(play_time + 0.0)
                    .map_err(MetronomeError::WebAudio)?;
                osc.stop_with_when(play_time + 0.03)
                    .map_err(MetronomeError::WebAudio)?;

                // Record timing stats
                self.stats.record_time(play_time - self.scheduled_upto);

                // Advance the self.scheduled_upto pointer
                self.scheduled_upto = play_time;
            }
            self.stats.inc_bar();
        }
        Ok(())
    }
}



