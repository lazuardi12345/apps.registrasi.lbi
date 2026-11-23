// src/utils/registrationHelpers.js

/**
 * Infer the language category from a course/catalog title string.
 * Returns the canonical language name (e.g. 'English') or null.
 */
export const inferPpbLanguage = (courseName = '') => {
  const normalized = String(courseName || '').toLowerCase();
  const languageAliases = [
    ['English', ['english', 'inggris']],
    ['Jepang', ['jepang', 'japanese']],
    ['Korea', ['korea', 'korean']],
    ['Mandarin', ['mandarin', 'chinese', 'cina']],
    ['Prancis', ['prancis', 'french']],
    ['Jerman', ['jerman', 'german']],
    ['Arab', ['arab', 'arabic']],
    ['Italia', ['italia', 'italian']],
    ['Rusia', ['rusia', 'russian']],
  ];

  return languageAliases.find(([, aliases]) => aliases.some((alias) => normalized.includes(alias)))?.[0] || null;
};
