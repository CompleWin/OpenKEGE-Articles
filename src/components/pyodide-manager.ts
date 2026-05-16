// Менеджер единого Pyodide-воркера для всей страницы.
// Все PythonEditor используют один и тот же воркер — Pyodide грузится
// один раз, даже если редакторов несколько.
//
// При «Стоп» или таймауте воркер убивается через terminate() и пересоздаётся.
// Остальные редакторы получают событие отмены и могут показать ошибку.

type RunHandlers = {
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
    // Игнорируем сообщения от устаревших запросов
    if (!activeRequest || activeRequest.id !== id) return

    if (type === 'stdout') {
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

/**
 * Запустить код Python. Возвращает функцию отмены.
 * Если уже идёт другой запуск — он будет принудительно остановлен.
 */
export function runPython(code: string, handlers: RunHandlers): () => void {
  // Если уже что-то выполняется — отменяем
  if (activeRequest) {
    const previous = activeRequest
    activeRequest = null
    previous.handlers.onError('Запуск прерван другим редактором')
    // Убиваем воркер, чтобы остановить выполнение в нём
    if (worker) {
      worker.terminate()
      worker = null
    }
  }

  const w = ensureWorker()
  const id = ++requestCounter
  activeRequest = { id, handlers }
  w.postMessage({ id, type: 'run', code })

  // Возвращаем функцию отмены
  return () => {
    if (activeRequest?.id !== id) return // Уже завершилось
    activeRequest = null
    handlers.onError('Выполнение остановлено')
    // Hard kill — единственный способ прервать зависший Python
    if (worker) {
      worker.terminate()
      worker = null
    }
  }
}

/**
 * Проверить, прогрет ли уже Pyodide.
 * Полезно для UI: если да — не показываем «Загружаю Python...».
 */
export function isPyodideReady(): boolean {
  return worker !== null && activeRequest === null
}
