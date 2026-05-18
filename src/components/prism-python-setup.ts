import { Prism } from 'prism-react-renderer'

const py = Prism.languages.python as Record<string, unknown> | undefined

if (py && !py.__py3BuiltinsPatched) {
  Prism.languages.insertBefore('python', 'keyword', {
    'builtin-function-py3': {
      pattern: /\b(?:print|exec)\b/,
      alias: 'builtin',
    },
  })
  py.__py3BuiltinsPatched = true

  const fstring = py['string-interpolation'] as
    | { alias?: string | string[]; inside?: unknown }
    | undefined

  if (fstring && typeof fstring === 'object' && !py.__fstringFlattened) {
    fstring.inside = undefined
    fstring.alias = 'string'
    py.__fstringFlattened = true
  }

  const decorator = py.decorator as { alias?: string | string[] } | undefined
  if (decorator && typeof decorator === 'object' && !py.__decoratorAliasFixed) {
    decorator.alias = 'annotation'
    py.__decoratorAliasFixed = true
  }

}



export {}