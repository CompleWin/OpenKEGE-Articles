import { useState, useEffect, useCallback } from 'react'

export interface LiveEditorProps {
  initialCode: string
  debounceMs?: number
  minHeight?: number
}

type LogEntry = { type: 'log' | 'error' | 'warn'; text: string }

export function LiveEditor({
  initialCode,
  debounceMs = 300,
  minHeight = 160,
}: LiveEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  const runCode = useCallback((src: string) => {
    const captured: LogEntry[] = []

    const formatArg = (arg: unknown): string => {
      if (typeof arg === 'string') return arg
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2)
        } catch {
          return String(arg)
        }
      }
      return String(arg)
    }

    const sandboxConsole = {
      log: (...args: unknown[]) =>
        captured.push({ type: 'log', text: args.map(formatArg).join(' ') }),
      error: (...args: unknown[]) =>
        captured.push({ type: 'error', text: args.map(formatArg).join(' ') }),
      warn: (...args: unknown[]) =>
        captured.push({ type: 'warn', text: args.map(formatArg).join(' ') }),
      info: (...args: unknown[]) =>
        captured.push({ type: 'log', text: args.map(formatArg).join(' ') }),
    }

    try {
      const fn = new Function('console', src)
      fn(sandboxConsole)
      setLogs(captured)
      setError(null)
    } catch (err) {
      const e = err as Error
      setError(`${e.name}: ${e.message}`)
      setLogs(captured)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => runCode(code), debounceMs)
    return () => clearTimeout(timer)
  }, [code, debounceMs, runCode])

  return (
    <div className="not-prose my-8 p-6 bg-[color:var(--color-soft)]/40 border border-[color:var(--color-soft)] rounded-xl">
      <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-[color:var(--color-muted)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        <span>Живой редактор</span>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        style={{ minHeight }}
        className="block w-full px-4 py-3 font-mono text-sm leading-relaxed text-[color:var(--color-ink)] bg-white border border-[color:var(--color-soft)] rounded-lg resize-y focus:outline-none focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/20"
        aria-label="Редактор кода"
      />

      <div className="flex items-center gap-3 mt-3 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-muted)]">
          Вывод
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            error
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {error ? '✗ ошибка' : ''}
        </span>
      </div>

      <div className="min-h-[60px] px-4 py-3 font-mono text-sm leading-relaxed bg-white border border-[color:var(--color-soft)] rounded-lg whitespace-pre-wrap break-words">
        {error && <div className="text-red-700">{error}</div>}
        {!error && logs.length === 0 && (
          <div className="text-[color:var(--color-muted)] italic">
            (нет вывода)
          </div>
        )}
        {logs.map((entry, i) => (
          <div
            key={i}
            className={
              entry.type === 'error'
                ? 'text-red-700'
                : entry.type === 'warn'
                ? 'text-amber-700'
                : 'text-[color:var(--color-ink)]'
            }
          >
            {entry.text}
          </div>
        ))}
      </div>
    </div>
  )
}
