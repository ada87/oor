const SIGN = '\u001b[';

const CODES = {
    reset: [0, 0],

    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29],

    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],
    grey: [90, 39],

    brightRed: [91, 39],
    brightGreen: [92, 39],
    brightYellow: [93, 39],
    brightBlue: [94, 39],
    brightMagenta: [95, 39],
    brightCyan: [96, 39],
    brightWhite: [97, 39],

    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    bgGray: [100, 49],
    bgGrey: [100, 49],

    bgBrightRed: [101, 49],
    bgBrightGreen: [102, 49],
    bgBrightYellow: [103, 49],
    bgBrightBlue: [104, 49],
    bgBrightMagenta: [105, 49],
    bgBrightCyan: [106, 49],
    bgBrightWhite: [107, 49],

    // // legacy styles for colors pre v1.0.0
    // blackBG: [40, 49],
    // redBG: [41, 49],
    // greenBG: [42, 49],
    // yellowBG: [43, 49],
    // blueBG: [44, 49],
    // magentaBG: [45, 49],
    // cyanBG: [46, 49],
    // whiteBG: [47, 49],
};

const style = (msg, code: number[]) => SIGN + code[0] + 'm' + msg + SIGN + code[1] + 'm';


export const styleBold = (msg: string) => style(msg, CODES.bold);
export const styleItalic = (msg: string) => style(msg, CODES.italic);
export const styleUnderline = (msg: string) => style(msg, CODES.underline);
export const styleStrikethrough = (msg: string) => style(msg, CODES.strikethrough);

export const colorYellow = (msg: string) => style(msg, CODES.yellow);
export const colorWhite = (msg: string) => style(msg, CODES.white);
export const colorRed = (msg: string) => style(msg, CODES.red);
export const colorGreen = (msg: string) => style(msg, CODES.green);
export const colorBlue = (msg: string) => style(msg, CODES.blue);
export const colorMagenta = (msg: string) => style(msg, CODES.magenta);
export const colorGray = (msg: string) => style(msg, CODES.gray);


export const bgYellow = (msg: string) => style(msg, CODES.bgYellow);
export const bgWhite = (msg: string) => style(msg, CODES.bgWhite);
export const bgRed = (msg: string) => style(msg, CODES.bgRed);
export const bgGreen = (msg: string) => style(msg, CODES.bgGreen);
export const bgBlue = (msg: string) => style(msg, CODES.bgBlue);
export const bgMagenta = (msg: string) => style(msg, CODES.bgMagenta);
export const bgGray = (msg: string) => style(msg, CODES.bgGray);


export const space = (txt: string, size: number = 24, alginRight = true): string => {
    let diff = size - (txt || '').length;
    if (diff <= 0) return txt;
    const space = ' '.repeat(diff)
    if (alginRight) return space + txt;
    return txt + space;

}

export const colorFieldName = (fieldName) => bgYellow(colorRed(fieldName))
export const colorFieldType = (fieldType) => styleItalic(colorMagenta(fieldType))
export const colorCondition = (suffix) => colorYellow(suffix)

