export const SITE_TITLE = 'OpenKEGE Articles';
export const SITE_DESCRIPTION = 'Welcome to my website!';
export const ARTICLES = 'Все статьи';
export const ABOUT = 'Где я?'

export const CATEGORIES = ['Python', 'Задания', 'Экзамен', 'Всякая всячина'] as const;

export type Category = typeof CATEGORIES[number];
