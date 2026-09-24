// Copies the browser runtimes Cut Studio loads at run time into public/vendor,
// so they are served as plain static files instead of passing through the
// bundler: ONNX Runtime Web (for the upscaler) and HarfBuzz (for Arabic text).
// Both load their .wasm next to their own script, which only works when the
// files sit side by side under one URL. Runs before `dev` and `build`; the
// output is git-ignored because it is rebuilt from node_modules every time.
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const groups = {
  ort: ['onnxruntime-web/dist', ['ort.webgpu.bundle.min.mjs', 'ort-wasm-simd-threaded.asyncify.mjs', 'ort-wasm-simd-threaded.asyncify.wasm', 'ort-wasm-simd-threaded.jsep.mjs', 'ort-wasm-simd-threaded.jsep.wasm']],
  harfbuzz: ['harfbuzzjs/dist', ['index.mjs', 'harfbuzz.js', 'harfbuzz.wasm']],
};

for (const [name, [from, files]] of Object.entries(groups)) {
  const target = join(root, 'public', 'vendor', name);
  mkdirSync(target, { recursive: true });
  for (const file of files) {
    const source = join(root, 'node_modules', from, file);
    if (!existsSync(source)) throw new Error(`Missing ${source}. Run npm install.`);
    const destination = join(target, file);
    if (existsSync(destination) && statSync(destination).size === statSync(source).size) continue;
    copyFileSync(source, destination);
  }
}
console.log('vendor assets ready in public/vendor');
