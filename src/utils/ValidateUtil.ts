import { Sort } from "./types";

const BY_SET = new Set<string>(['asc', 'desc']);

export const validateSort = (sort: Sort) => {
    if (sort == null) return false;
    if (sort.order == null || sort.by == null) return false;
    if (!BY_SET.has(sort.by)) return false;
    return true;
}