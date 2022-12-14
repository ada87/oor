import { MagicSuffix, SUFFIX, WhereItem, FieldType, Support } from '../base/types';
import { SqlWhere } from '../base/sql'
import _ from 'lodash';
// import { Assert } from '@japa/assert'



/**
 * Where Coverage Tester
*/

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


export const isCoverOrCoverError = (where: SqlWhere, SUPPORTS: Record<MagicSuffix, Support>) => {

    // validateItem(where, 'boolean', 'Like', false)
    // return
    for (let suffix of SUFFIX) {
        for (let type of TYPES) {
            const isSupport = SUPPORTS[suffix][type];
            validateItem(where, type, suffix, isSupport)
        }

    }

}