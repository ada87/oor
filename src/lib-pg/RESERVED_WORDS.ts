// https://www.postgresql.org/docs/current/sql-keywords-appendix.html
const PG = [
    "all", "analyse", "analyze", "and", "any", "asc", "asymmetric", "both", "case", "cast", "check", "collate", "column", "constraint", "current_catalog", "current_date", "current_role", "current_time", "current_timestamp", "current_user", "default", "deferrable", "desc", "distinct", "do", "else", "end", "false", "foreign", "in", "initially", "lateral", "leading", "localtime", "localtimestamp", "not", "null", "only", "or", "placing", "primary", "references", "select", "session_user", "some", "symmetric", "system_user", "table", "then", "trailing",
    // "sex",
    "true", "unique", "user", "using", "variadic", "when"];


// const FIELDS_MAP = new Map<string, string>();
export const RESERVED_WORDS = new Set<string>(PG);
// export { FIELDS_MAP }
