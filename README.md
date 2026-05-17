# OpenKEGE Articles

Проект предоставляет собой написанный на astro сайт с минимальным числом функций. 
Только чтение, и небольшой интерактив в виде квиза и live кодинг сегментов.

## Структура проекта

```text
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

## Формат написания статей

Все необходимые заголовки статей
```html
---
title: 'title string'
description: 'description string'
pubDate: 'Month Day Year' // example 'May 17 2026'
updatedDate: 'Month Day Year' (optional)
heroImage: 'path to image' (optional) // example '../../assets/my-very-first-article.jpg' 
category: 'category string'
author: 'author string' (optional)
---
```
Список доступных категорий лежит в файле `consts.ts` в корне `src`

Для ссылок на внешние источники используются стандартные md ссылки `[text](link)`. 
Для ссылок на другие статьи нужно использовать компонент `<Link link='article/{articleName}/' name='{name}'/>`

### Quiz

Есть два варианта использования: 
####  1 Вариант
Если надо в вопросе написать строчку кода, и чтобы этот код красиво отображался, то испольуем вот такой синтаксис.
```html
<Quiz
  client:load
  options={['"null"', '"object"', '"undefined"', 'TypeError']}
  correct={1}
  explanations={{
    0: 'Не совсем — typeof возвращает не само значение, а его тип строкой.',
    1: 'Верно! Это известный баг JavaScript с первой версии языка. typeof null возвращает "object" — исправить уже не могут, чтобы не сломать миллионы сайтов.',
    2: 'Нет — undefined и null это разные значения с разными типами.',
    3: 'Нет, ошибки не будет — typeof работает с любым значением.'
  }}
>
  Что вернет <code>[].length</code>?
</Quiz>
```

#### 2 Вариант
Передает вопрос как проп
```html
<Quiz
  client:load
  question="Что такое замыкание?"
  options={['1', '2', '3']}
  correct={0}
/>
```

### Python code

```html
<PythonEditor
  client:only="react"
  timeoutMs={msTimeout} // по умолчанию 5000
  initialCode={`# Задача 1 ЕГЭ: сумма цифр числа
n = 1234
result = 0
while n > 0:
    result += n % 10
    n //= 10
print(result)`}
/>
```