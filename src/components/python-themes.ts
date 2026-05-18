import type { PrismTheme } from 'prism-react-renderer'

export const pycharmLight: PrismTheme = {
  plain: {
    color: 'rgb(15 18 25)',
    backgroundColor: 'transparent',
  },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#8C8C8C', fontStyle: 'italic' } },
    { types: ['string', 'triple-quoted-string', 'attr-value'], style: { color: '#067D17' } },
    { types: ['number'], style: { color: '#1750EB' } },
    // @ts-ignore
    { types: ['keyword', 'boolean'], style: { color: '#CC7832', fontWeight: 600 } },
    { types: ['builtin'], style: { color: '#8757AD' } },
    { types: ['function', 'function-variable'], style: { color: '#00627A' } },
    { types: ['class-name'], style: { color: '#0033B3' } },
    { types: ['operator', 'punctuation'], style: { color: 'rgb(15 18 25)' } },
    { types: ['variable', 'attr-name'], style: { color: 'rgb(15 18 25)' } },
    { types: ['decorator', 'decorator-name', 'annotation'], style: { color: '#9E880D' } },
  ],
}

export const idle: PrismTheme = {
  plain: {
    color: 'rgb(15 18 25)',
    backgroundColor: 'transparent',
  },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#DD0000', fontStyle: 'italic' } },
    { types: ['string', 'triple-quoted-string', 'attr-value'], style: { color: '#00AA00' } },
    { types: ['number'], style: { color: 'rgb(15 18 25)' } },
    // @ts-ignore
    { types: ['keyword', 'boolean'], style: { color: '#ff7700', fontWeight: 600 } },
    { types: ['builtin'], style: { color: '#900090' } },
    { types: ['function', 'function-variable'], style: { color: '#0000FF' } },
    { types: ['class-name'], style: { color: '#0000FF' } },
    { types: ['operator', 'punctuation'], style: { color: 'rgb(15 18 25)' } },
    { types: ['variable', 'attr-name'], style: { color: 'rgb(15 18 25)' } },
    { types: ['decorator', 'decorator-name', 'annotation'], style: { color: '#900090' } },
  ],
}

export const themes = {
  'pycharm-light': pycharmLight,
  'idle': idle,
} as const

export type ThemeName = keyof typeof themes

export const themeLabels: Record<ThemeName, string> = {
  'pycharm-light': 'PyCharm',
  'idle': 'IDLE',
}