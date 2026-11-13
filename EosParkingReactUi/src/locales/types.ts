/** Require the same keys and array positions across locales; tests check interpolation names. */
export type LocaleShape<T> = T extends string ? string : { [K in keyof T]: LocaleShape<T[K]> };
