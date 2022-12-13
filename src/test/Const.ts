import { MagicSuffix, SUFFIX, WhereItem, FieldType } from '../base/types';
import { SqlWhere } from '../base/sql'
import _ from 'lodash';
// import { Assert } from '@japa/assert'


type Support = {
    string: boolean,
    number: boolean,
    date: boolean,
    boolean: boolean
}

/**
 * Where Coverage Tester
*/
export const SUFFIX_COVER_TEST: Record<MagicSuffix, Support> = {

    'Min': { string: true, number: true, date: true, boolean: true },
    'MinThan': { string: true, number: true, date: true, boolean: false },
    'Max': { string: true, number: true, date: true, boolean: true },
    'MaxThan': { string: true, number: true, date: true, boolean: false },

    'MinH': { string: false, number: false, date: true, boolean: false },
    'MinD': { string: false, number: false, date: true, boolean: false },
    'MinM': { string: false, number: false, date: true, boolean: false },
    'MaxH': { string: false, number: false, date: true, boolean: false },
    'MaxD': { string: false, number: false, date: true, boolean: false },
    'MaxM': { string: false, number: false, date: true, boolean: false },

    'Like': { string: true, number: false, date: false, boolean: false },
    'Likel': { string: true, number: false, date: false, boolean: false },
    'Liker': { string: true, number: false, date: false, boolean: false },

    'Bt': { string: false, number: true, date: true, boolean: false },
    'BtD': { string: false, number: false, date: true, boolean: false },
    'BtY': { string: false, number: false, date: true, boolean: false },
    'BtM': { string: false, number: false, date: true, boolean: false },

    'Not': { string: true, number: true, date: true, boolean: true },

    'IsNull': { string: true, number: true, date: true, boolean: true },
    'NotNull': { string: true, number: true, date: true, boolean: true },

    'IsDistinct': { string: true, number: true, date: false, boolean: false },
    'NotDistinct': { string: true, number: true, date: false, boolean: false },

    '>': { string: true, number: true, date: true, boolean: true },
    '>=': { string: true, number: true, date: true, boolean: false },
    '<': { string: true, number: true, date: true, boolean: true },
    '<=': { string: true, number: true, date: true, boolean: false },
    '=': { string: true, number: true, date: true, boolean: true },
    '!=': { string: true, number: true, date: true, boolean: true },
    '<>': { string: true, number: true, date: true, boolean: true },

    // 'In': { string: true, number: true, date: false, boolean: false },
}

const randomBt = (type: FieldType): string => {
    if (type == 'date') {
        return '2022-11-11,20221212'
    }
    return '4,6';
}

const randomValue = (type: FieldType, suffix: MagicSuffix): boolean | number | string | Date => {

    if (suffix == 'Bt') return randomBt(type)
    switch (type) {
        case 'number':
            return _.random(1000);
        case 'boolean':
            return _.sample([true, false]) as boolean;
        case 'date':
            return new Date(_.random(1660000000000, 1670374864438))
        case 'string':
            return _.sample(['a', 'b', 'c', 'd']) as string;


    }

}
const TYPES: FieldType[] = ['string', 'number', 'date', 'boolean'];

class TestError extends Error { };

const validateItem = (where: SqlWhere, type: FieldType, suffix: MagicSuffix, isSupport: boolean) => {
    let value = randomValue(type, suffix);
    let item: WhereItem = { column: 'field', fn: suffix, type, value }
    // console.log(`${suffix} ${type} : ${value}`, isSupport)

    try {
        let [sql, param] = where([item]);
        console.log(sql, param, isSupport)
        if (isSupport && sql.length) {
            console.log(`${suffix} ${type} : ${value} Support`)
            console.log(sql, param)
        } else {
            throw new TestError(`
---------------Support Not Suppored-----------------

${JSON.stringify(item)} >>>>>>

${sql} -- ${JSON.stringify(param)} 

---------------Support Not Suppored-----------------
                    `)
        }

    } catch (e) {

        if (e instanceof TestError) throw (e);
        if (isSupport) {
            throw new TestError(`
---------------Not Suppored Support-----------------

${JSON.stringify(item)} >>>>>>

---------------Not Suppored Support-----------------
`)
        } else {
            console.log(`${suffix} ${type} Not Support`)
            // console.log(e)
        }
    }
}


export const isCoverOrCoverError = (where: SqlWhere) => {

    // validateItem(where, 'boolean', 'Like', false)
    // return
    for (let suffix of SUFFIX) {
        for (let type of TYPES) {
            const isSupport = SUFFIX_COVER_TEST[suffix][type];
            validateItem(where, type, suffix, isSupport)
        }

    }

}