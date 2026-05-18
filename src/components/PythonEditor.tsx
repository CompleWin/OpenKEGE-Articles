import './prism-python-setup'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import Editor from 'react-simple-code-editor'
import { Highlight, type PrismTheme } from 'prism-react-renderer'
import { runPython } from './pyodide-manager'
import { themes, themeLabels, type ThemeName } from './python-themes'

const THEME_STORAGE_KEY = 'python-editor-theme'
const THEME_CHANGE_EVENT = 'python-editor-theme-change'

function loadStoredThemeName(): ThemeName | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && stored in themes) return stored as ThemeName
  } catch {
  }
  return null
}

export interface PythonEditorProps {
  initialCode: string
  minHeight?: number
  timeoutMs?: number
  theme?: ThemeName | PrismTheme
}

type LogEntry = { type: 'log' | 'error'; text: string }


function isInsideString(line: string, position: number): boolean {
  const before = line.slice(0, position)
  const singleQuotes = (before.match(/'/g) || []).length
  const doubleQuotes = (before.match(/"/g) || []).length
  return singleQuotes % 2 === 1 || doubleQuotes % 2 === 1
}

export function PythonEditor({
  initialCode,
  minHeight = 160,
  timeoutMs = 15000,
  theme = 'idle',
}: PythonEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'running'>('idle')

  const cancelRef = useRef<(() => void) | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const hasCustomTheme = typeof theme !== 'string'

  const [themeName, setThemeName] = useState<ThemeName>(
    typeof theme === 'string' ? theme : 'idle'
  )

  useEffect(() => {
    if (hasCustomTheme) return
    const stored = loadStoredThemeName()
    if (stored) setThemeName(stored)
  }, [hasCustomTheme])

  useEffect(() => {
    if (hasCustomTheme) return
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ThemeName>).detail
      if (detail && detail in themes) setThemeName(detail)
    }
    window.addEventListener(THEME_CHANGE_EVENT, handler)
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handler)
  }, [hasCustomTheme])

  const activeTheme: PrismTheme = hasCustomTheme
    ? (theme as PrismTheme)
    : themes[themeName]

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as ThemeName
    if (!(next in themes)) return
    setThemeName(next)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // игнорируем
    }
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: next }))
  }

  useEffect(() => {
    return () => {
      if (cancelRef.current) cancelRef.current()
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    }
  }, [])

  const runCode = useCallback(() => {
    setError(null)
    setLogs([])
    setStatus('loading')

    const capturedLogs: LogEntry[] = []

    const finish = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      cancelRef.current = null
      setStatus('idle')
    }

    cancelRef.current = runPython(code, {
      onReady: () => {
        setStatus('running')
        timeoutRef.current = window.setTimeout(() => {
          if (cancelRef.current) {
            cancelRef.current()
            setError(`Превышено время выполнения (${timeoutMs / 1000} сек).`)
          }
        }, timeoutMs)
      },
      onStdout: (text) => {
        capturedLogs.push({ type: 'log', text })
        setLogs([...capturedLogs])
      },
      onStderr: (text) => {
        capturedLogs.push({ type: 'error', text })
        setLogs([...capturedLogs])
      },
      onDone: () => {
        finish()
      },
      onError: (message) => {
        setError(message)
        finish()
      },
    })
  }, [code, timeoutMs])

  const stopCode = useCallback(() => {
    if (cancelRef.current) cancelRef.current()
  }, [])

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const active = document.activeElement
        if (active?.tagName === 'TEXTAREA' && status === 'idle') {
          e.preventDefault()
          runCode()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [runCode, status])

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey) return

    const target = e.target as HTMLTextAreaElement
    if (target.tagName !== 'TEXTAREA') return

    e.preventDefault()

    const { value, selectionStart, selectionEnd } = target
    const beforeCursor = value.slice(0, selectionStart)
    const afterCursor = value.slice(selectionEnd)

    const lineStart = beforeCursor.lastIndexOf('\n') + 1
    const currentLine = beforeCursor.slice(lineStart)
    const indentMatch = currentLine.match(/^[ \t]*/)
    let indent = indentMatch ? indentMatch[0] : ''

    const trimmed = currentLine.trimEnd()
    if (trimmed.endsWith(':') && !isInsideString(currentLine, trimmed.length - 1)) {
      indent += '    '
    }

    const insert = '\n' + indent
    const newValue = beforeCursor + insert + afterCursor
    const newCursor = selectionStart + insert.length

    setCode(newValue)

    requestAnimationFrame(() => {
      target.selectionStart = newCursor
      target.selectionEnd = newCursor
    })
  }

  const highlightCode = (codeToHighlight: string) => (
    <Highlight code={codeToHighlight} language="python" theme={activeTheme}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, i) => {
            const { key: _lineKey, ...lineProps } = getLineProps({ line })
            return (
              <div key={i} {...lineProps}>
                {line.map((token, j) => {
                  const { key: _tokenKey, ...tokenProps } = getTokenProps({ token })
                  return <span key={j} {...tokenProps} />
                })}
              </div>
            )
          })}
        </>
      )}
    </Highlight>
  )

  const isBusy = status !== 'idle'

  return (
    <div className="not-prose my-8 p-6 bg-[color:var(--color-soft)]/40 border border-[color:var(--color-soft)] rounded-xl">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[color:var(--color-muted)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Python</span>
        </div>

        <div className="flex items-center gap-3">
          {!hasCustomTheme && (
            <select
              value={themeName}
              onChange={handleThemeChange}
              aria-label="Тема подсветки"
              className="text-xs px-2 py-1 rounded-md border border-[color:var(--color-soft)] bg-white text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/20"
            >
              {(Object.keys(themes) as ThemeName[]).map((name) => (
                <option key={name} value={name}>
                  {themeLabels[name] ?? name}
                </option>
              ))}
            </select>
          )}

          {isBusy ? (
            <button
              onClick={stopCode}
              className="px-4 py-1.5 text-sm font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors cursor-pointer"
            >
              ■ Остановить
            </button>
          ) : (
            <button
              onClick={runCode}
              className="px-4 py-1.5 text-sm font-bold text-white bg-[color:var(--color-accent)] rounded-md hover:bg-[color:var(--color-accent-dark)] transition-colors cursor-pointer"
            >
              ▶ Запустить
            </button>
          )}
        </div>
      </div>

      <div
        onKeyDown={handleKeyDown}
        className="bg-white border border-[color:var(--color-soft)] rounded-lg overflow-hidden focus-within:border-[color:var(--color-accent)] focus-within:ring-2 focus-within:ring-[color:var(--color-accent)]/20"
        style={{ minHeight }}
      >
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={highlightCode}
          padding={16}
          tabSize={4}
          insertSpaces={true}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 14,
            lineHeight: 1.6,
            minHeight,
          }}
          textareaClassName="focus:outline-none"
          aria-label="Редактор Python"
        />
      </div>

      <div className="flex items-center gap-3 mt-3 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-muted)]">
          Вывод
        </span>
        {error && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800">
            ✗ ошибка
          </span>
        )}
        {!error && logs.length > 0 && status === 'idle' && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800">
            ✓ выполнено
          </span>
        )}
        <span className="text-xs text-[color:var(--color-muted)] ml-auto">
          Ctrl+Enter — запустить
        </span>
      </div>

      <div className="min-h-[60px] px-4 py-3 font-mono text-sm leading-relaxed bg-white border border-[color:var(--color-soft)] rounded-lg whitespace-pre-wrap break-words">
        {status === 'loading' && (
          <div className="text-[color:var(--color-muted)] italic">
            Загружается интерпретатор Python...
          </div>
        )}
        {status === 'running' && logs.length === 0 && (
          <div className="text-[color:var(--color-muted)] italic">
            Выполняется код...
          </div>
        )}
        {logs.map((entry, i) => (
          <div
            key={i}
            className={
              entry.type === 'error'
                ? 'text-red-700'
                : 'text-[color:var(--color-ink)]'
            }
          >
            {entry.text}
          </div>
        ))}
        {error && <div className="text-red-700 mt-1">{error}</div>}
      </div>
    </div>
  )
}
