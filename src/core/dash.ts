export const keys = (obj: object): Array<string> => {
    if (obj == null || typeof obj !== 'object') {
        return [];
    }
    return Object.keys(obj);
};

export const unset = (obj: any, path: string | Array<string>) => {
    if (obj == null) return true;
    if (typeof path === 'string') {
        path = path.split('.');
    }
    if (!Array.isArray(path) || path.length === 0) {
        return true;
    }
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
        if (current == null || typeof current !== 'object') {
            return true;
        }
        current = current[path[i]];
    }
    if (current != null && typeof current === 'object') {
        return delete current[path[path.length - 1]];
    }
    return true;
};

export const trim = (str: any): string => {
    if (str == null) return '';
    if (typeof str !== 'string') str = String(str);
    return str.trim();
};

export const isArray = (obj: any): obj is Array<any> => {
    if (obj == null) return false;
    return Array.isArray(obj);
};

export const isString = (obj: any): obj is string => {
    if (obj == null) return false;
    return typeof obj === 'string' || obj instanceof String;
};

export const isNumber = (obj: any): obj is number => {
    if (obj == null) return false;
    return typeof obj === 'number' || obj instanceof Number;
};

export const isFunction = (obj: any): obj is Function => {
    if (obj == null) return false;
    return typeof obj === 'function';
};

export const has = (obj: any, path: string | Array<string>): boolean => {
    if (obj == null) return false;
    if (typeof path === 'string') {
        path = path.split('.');
    }
    if (!Array.isArray(path) || path.length === 0) {
        return false;
    }
    let current = obj;
    for (let i = 0; i < path.length; i++) {
        if (current == null || typeof current !== 'object' || !current.hasOwnProperty(path[i])) {
            return false;
        }
        current = current[path[i]];
    }
    return true;
};

export const toLower = (str: any): string => {
    if (str == null) return '';
    if (typeof str !== 'string') str = String(str);
    return str.toLowerCase();
};

export const findIndex = (arr: Array<any>, fn: (value: any, index: number, obj: Array<any>) => boolean): number => {
    if (!Array.isArray(arr)) return -1;
    if (typeof fn !== 'function') return -1;
    return arr.findIndex(fn);
};

export const cloneDeep = <T extends object>(obj: T): T => {
    if (obj == null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => cloneDeep(item)) as any;
    }
    const clonedObj: any = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = cloneDeep(obj[key] as any);
        }
    }
    return clonedObj;
};

export default {
    keys,
    unset,
    trim,
    isArray,
    isString,
    isNumber,
    isFunction,
    has,
    toLower,
    findIndex,
    cloneDeep
}