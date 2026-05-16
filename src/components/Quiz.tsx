import { useState, type ReactNode } from 'react'

export interface QuizProps {
  question?: ReactNode
  children?: ReactNode
  options: string[]
  correct: number
  explanations?: Record<number, string>
  explanation?: string
}

export function Quiz({
  question,
  children,
  options,
  correct,
  explanations,
  explanation,
}: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
  }

  const handleReset = () => {
    setSelected(null)
  }

  const feedbackText =
    selected !== null
      ? explanations?.[selected] ??
        (selected === correct
          ? explanation ?? 'Верно!'
          : explanation ?? 'Попробуй ещё раз.')
      : ''

  const isCorrect = selected === correct

  const getOptionClasses = (idx: number): string => {
    const base =
      'flex items-center justify-between w-full px-4 py-3 text-left text-base border rounded-lg transition-all font-mono'

    if (selected === null) {
      return `${base} bg-white border-[color:var(--color-soft)] hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-soft)]/30 cursor-pointer text-[color:var(--color-ink)]`
    }

    if (idx === correct) {
      return `${base} bg-green-50 border-green-500 text-green-900`
    }

    if (idx === selected) {
      return `${base} bg-red-50 border-red-500 text-red-900`
    }

    return `${base} bg-white border-[color:var(--color-soft)] opacity-40 text-[color:var(--color-ink)]`
  }

  return (
    <div className="not-prose my-8 p-6 bg-[color:var(--color-soft)]/40 border border-[color:var(--color-soft)] rounded-xl">
      <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[color:var(--color-muted)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>Квиз</span>
      </div>

      <h3 className="text-xl font-bold mb-4 text-[color:var(--color-ink)] leading-tight">
        {question ?? children}
      </h3>

      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Варианты ответа">
        {options.map((option, idx) => (
          <button
            key={idx}
            role="radio"
            aria-checked={selected === idx}
            disabled={selected !== null}
            onClick={() => handleSelect(idx)}
            className={getOptionClasses(idx)}
          >
            <span>{option}</span>
            {selected !== null && idx === correct && (
              <span className="font-bold ml-2" aria-hidden="true">
                ✓
              </span>
            )}
            {selected !== null && idx === selected && idx !== correct && (
              <span className="font-bold ml-2" aria-hidden="true">
                ✗
              </span>
            )}
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="mt-4">
          <div
            className={`p-4 rounded-lg text-base leading-relaxed border ${
              isCorrect
                ? 'bg-green-50 text-green-900 border-green-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            {feedbackText}
          </div>
        </div>
      )}
    </div>
  )
}
