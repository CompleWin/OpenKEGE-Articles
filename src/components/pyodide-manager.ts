type RunHandlers = {
  onReady: () => void
  onStdout: (text: string) => void
  onStderr: (text: string) => void
  onDone: () => void
  onError: (message: string) => void
}

type ActiveRequest = {
  id: number
  handlers: RunHandlers
}

let worker: Worker | null = null
let activeRequest: ActiveRequest | null = null
let requestCounter = 0

function createWorker(): Worker {
  const w = new Worker('/pyodide-worker.js')

  w.onmessage = (event: MessageEvent) => {
    const { id, type, text, error } = event.data
    if (!activeRequest || activeRequest.id !== id) return

    if (type === 'ready') {
      activeRequest.handlers.onReady()
    } else if (type === 'stdout') {
      activeRequest.handlers.onStdout(text)
    } else if (type === 'stderr') {
      activeRequest.handlers.onStderr(text)
    } else if (type === 'done') {
      activeRequest.handlers.onDone()
      activeRequest = null
    } else if (type === 'error') {
      activeRequest.handlers.onError(error)
      activeRequest = null
    }
  }

  return w
}

function ensureWorker(): Worker {
  if (!worker) worker = createWorker()
  return worker
}

export function runPython(code: string, handlers: RunHandlers): () => void {
  if (activeRequest) {
    const previous = activeRequest
    activeRequest = null
    previous.handlers.onError('Запуск прерван другим редактором')
    if (worker) {
      worker.terminate()
      worker = null
    }
  }

  const w = ensureWorker()
  const id = ++requestCounter
  activeRequest = { id, handlers }
  w.postMessage({ id, type: 'run', code })

  return () => {
    if (activeRequest?.id !== id) return
    activeRequest = null
    handlers.onError('Выполнение остановлено')
    if (worker) {
      worker.terminate()
      worker = null
    }
  }
}

export function isPyodideReady(): boolean {
  return worker !== null && activeRequest === null
}
