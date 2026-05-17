export const SITE_TITLE = 'OpenKEGE Articles';
export const SITE_DESCRIPTION = 'Статьи по ЕГЭ информатика';
export const ARTICLES = 'Все статьи';
export const ABOUT = 'Где я?'
export const TELEGRAM_CHANNEL = 'https://t.me/openkege';
export const TELEGRAM_ME = 'https://t.me/nikolayivakhnenko';
export const GITHUB_REPO = 'https://github.com/CompleWin/OpenKEGE-Articles';

export const CATEGORIES = ['Python', 'Задания', 'Экзамен', 'Всякая всячина'] as const;

export type Category = typeof CATEGORIES[number];
