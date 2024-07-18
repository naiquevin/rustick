// Note: We need to import the js bindings for internals of the wasm
// module e.g. Metronome here itself. The return value of loading the
// wasm module contains the wasm modules exports
import init, { Metronome as WasmMetronome } from "./pkg/rustick.js";
import Metronome from "./metronome.js";

const runWasm = async() => {
  const wasm = await init().catch(console.error);
  const startBtn = document.getElementById("start");
  const stopBtn = document.getElementById("stop");
  const timeSigInput = document.getElementById("time-sig");
  const tempoInput = document.getElementById("tempo");
  const met = new Metronome(WasmMetronome, {
    timeSig: timeSigInput.value,
    tempo: tempoInput.value,
    onTick: (cursor) => {
      document.querySelectorAll("#ticker li").forEach((x) => {
        x.classList.remove("active");
      });
      document.getElementById("tb-" + cursor).classList.add("active");
    },
    resetTicker: (numBeats) => {
      let html = "";
      for (let i = 0; i < numBeats; i++) {
        html += `<li id="tb-${i+1}"></li>`;
      }
      document.getElementById("ticker").innerHTML = html;
    }
  });
  met.showTicker();
  startBtn.addEventListener("click", e => {
    met.start(timeSigInput.value, tempoInput.value);
  });
  stopBtn.addEventListener("click", e => met.stop());
};

await runWasm();
