export type SaveFunction = (data: Uint8Array) => Promise<boolean>;

let saveFn: SaveFunction = null;

export const save = async (data: Uint8Array) => {
    if (save == null) {
        console.error('SQL.JS Save Function is not set yet!')
        return false;
    }
    return await saveFn(data)
}

export const setSaveFunction = (fn: SaveFunction) => saveFn = fn


