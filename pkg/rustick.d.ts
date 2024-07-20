/* tslint:disable */
/* eslint-disable */
/**
*/
export class Metronome {
  free(): void;
/**
*/
  constructor();
/**
* @param {number} bpm
* @returns {Metronome}
*/
  set_tempo(bpm: number): Metronome;
/**
* @param {number} num_beats
* @param {number} note_len
* @returns {Metronome}
*/
  set_time_signature(num_beats: number, note_len: number): Metronome;
/**
* @param {Function} f
* @returns {Metronome}
*/
  set_on_ended(f: Function): Metronome;
/**
* @returns {Metronome}
*/
  reset(): Metronome;
/**
* Schedule clicks for the next bar
*/
  schedule(): void;
/**
*/
  beat_interval?: number;
/**
*/
  stats: Stats;
}
/**
*/
export class Stats {
  free(): void;
/**
*/
  bar_count: number;
/**
*/
  duration: number;
/**
*/
  total_bar_count: number;
/**
*/
  total_duration: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_stats_free: (a: number) => void;
  readonly __wbg_get_stats_bar_count: (a: number) => number;
  readonly __wbg_set_stats_bar_count: (a: number, b: number) => void;
  readonly __wbg_get_stats_total_bar_count: (a: number) => number;
  readonly __wbg_set_stats_total_bar_count: (a: number, b: number) => void;
  readonly __wbg_get_stats_duration: (a: number) => number;
  readonly __wbg_set_stats_duration: (a: number, b: number) => void;
  readonly __wbg_get_stats_total_duration: (a: number) => number;
  readonly __wbg_set_stats_total_duration: (a: number, b: number) => void;
  readonly __wbg_metronome_free: (a: number) => void;
  readonly __wbg_get_metronome_beat_interval: (a: number, b: number) => void;
  readonly __wbg_set_metronome_beat_interval: (a: number, b: number, c: number) => void;
  readonly __wbg_get_metronome_stats: (a: number) => number;
  readonly __wbg_set_metronome_stats: (a: number, b: number) => void;
  readonly metronome_new: (a: number) => void;
  readonly metronome_set_tempo: (a: number, b: number) => number;
  readonly metronome_set_time_signature: (a: number, b: number, c: number) => number;
  readonly metronome_set_on_ended: (a: number, b: number) => number;
  readonly metronome_reset: (a: number) => number;
  readonly metronome_schedule: (a: number, b: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
