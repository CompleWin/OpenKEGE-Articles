---
title: "All, any и примеры задач"
category: "Python"
pubDate: 'May 05 2026'
description: "Разбираем встроенные функции all и any на задачах ЕГЭ"
tags: ['python']
---

Функции `all()` и `any()` часто встречаются в задании 17...

```python
nums = [x for x in range(1, 100) if all(x % d != 0 for d in range(2, x))]
```
$$
Формула простого числа: p > 1 и \forall d \in [2, p-1]: p \mod d \neq 0
$$