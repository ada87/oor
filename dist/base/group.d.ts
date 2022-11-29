declare type Calc = {};
declare type GroupByQuery = {
    filed: string;
    distint?: boolean;
    calc?: Calc;
    order?: string;
    by?: string;
};
export declare const groupBy: (groupQuery: GroupByQuery) => void;
export {};
