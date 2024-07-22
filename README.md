# Rustick

A basic, browser-based metronome implemented using Rust, Wasm (and
Javascript).

Built for experimentation only; Use judiciously.

## Try it out

https://naiquevin.github.io/rustick/

## Run locally

You will need the [Rust
toolchain](https://www.rust-lang.org/tools/install) to run the code
locally.

Install wasm-pack as follows,

```bash
cargo install wasm-pack
```

Build wasm pkg

``` bash
wasm-pack build --target web
```

Serve files in the current directory using an http server of your
choice. For e.g.

``` bash
python -m http.server
```

Open http://localhost:8000 (or whichever port the http server listens
on) in the browser.

## References

- https://webassembly.org/
- https://rustwasm.github.io/docs/book/
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- https://grantjam.es/creating-a-simple-metronome-using-javascript-and-the-web-audio-api/

## LICENSE

MIT (See [LICENSE](LICENSE)).
