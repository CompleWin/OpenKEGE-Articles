// Web Worker для выполнения Python через Pyodide.
// Кладётся в public/ — Astro отдаёт его как /pyodide-worker.js.
//
// Зачем: Pyodide крутится в фоновом потоке. Главный поток остаётся
// отзывчивым, можно нажать «Стоп», поставить таймаут на выполнение,
// и UI не зависает на while True.

const PYODIDE_VERSION = '0.26.4'
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

importScripts(`${PYODIDE_CDN}pyodide.js`)

let pyodideReady = null

async function getPyodide() {
  if (pyodideReady) return pyodideReady
  pyodideReady = (async () => {
    const pyodide = await loadPyodide({ indexURL: PYODIDE_CDN })
    return pyodide
  })()
  return pyodideReady
}

self.onmessage = async (event) => {
  const { id, type, code } = event.data

  if (type === 'init') {
    try {
      await getPyodide()
      self.postMessage({ id, type: 'ready' })
    } catch (err) {
      self.postMessage({ id, type: 'error', error: String(err) })
    }
    return
  }

  if (type === 'run') {
    try {
      const pyodide = await getPyodide()

      // Перехватываем stdout/stderr — отправляем построчно
      pyodide.setStdout({
        batched: (text) => {
          self.postMessage({ id, type: 'stdout', text })
        },
      })
      pyodide.setStderr({
        batched: (text) => {
          self.postMessage({ id, type: 'stderr', text })
        },
      })

      try {
        await pyodide.runPythonAsync(code)
        self.postMessage({ id, type: 'done' })
      } catch (err) {
        const msg = err.message || String(err)
        const lines = msg.split('\n').filter((l) => l.trim())
        const errorLine = lines[lines.length - 1] || msg
        self.postMessage({ id, type: 'error', error: errorLine })
      }
    } catch (err) {
      self.postMessage({ id, type: 'error', error: String(err) })
    }
  }
}
