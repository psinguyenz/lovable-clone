/* export a string or an array of string and TreeItem itself (a deeply nested array) */
export type TreeItem = string | [string, ...TreeItem[]];