import type { MagicSuffix, WhereItem, FieldType, Support } from '../base/types';

import _ from 'lodash';
import { SUFFIX } from '../base/types'
import { SqlWhere, } from '../base/sql'
import { UType } from '../base/Util';

// Line 2 : Build a Schema , 
//          Schema can be used for validate、check, @see @sinclair/typebox
//          Some FrameWork support this schema derectly , like fastify 
export const UserSchema = UType.Table({
    id: UType.Number(),
    name: UType.String({ maxLength: 32 }),
    age: UType.Number({ minimum: 0, maximum: 128 }),
    sex: UType.Boolean(),
    profile: UType.String({ ignore: true }),
    address: UType.String({ maxLength: 128 }),
    salary: UType.Number(),
    registerDate: UType.Date({ column: 'register_date', isCreate: true }),
    lastModify: UType.Date({ column: 'last_modify', isModify: true })
});


// Line 3 : Define a Type, you can avoid if not need this type.
// export type User = Static<typeof UserSchema>;
// const FIELD_MAP = new Map<string, TSchema>(_.keys(UserSchema.properties).map(field => [field, UserSchema.properties[field]]));

// console.log(FIELD_MAP)


// type Cover = Record<MagicSuffix, { support?: boolean, values: any }>

const TEXT_WHERE: { field: string, type: FieldType }[] = [
    { field: 'name', type: 'string' },
    { field: 'age', type: 'number' },
    { field: 'sex', type: 'boolean' },
    { field: 'registerDate', type: 'date' },
]



type ASSERT_ITEM = [any, boolean];

export const QueryCover = (MARTIX: Record<MagicSuffix, Support>): ASSERT_ITEM[] => {

    let ASSERTS: ASSERT_ITEM[] = [];
    TEXT_WHERE.map(item => SUFFIX.map(suffix => ASSERTS.push([{ [item.field + suffix]: randomValue(item.type, suffix) }, MARTIX[suffix][item.type]])))
    return ASSERTS

}

/**
 * Where Coverage Tester
*/

const randomBt = (type: FieldType): string => {
    if (type == 'date') {
        return '2022-11-11,20221212'
    }
    return '4,6';
}
const randomIn = (type: FieldType): string => {
    if (type == 'number') {
        return '34,67,11'
    }
    return '秦磊,苏平';
}

const randomValue = (type: FieldType, suffix: MagicSuffix): boolean | number | string | Date => {

    if (suffix == 'Bt') return randomBt(type)
    if (suffix == 'In' || suffix == 'NotIn') return randomIn(type)

    switch (type) {
        case 'number':
            return _.random(12, 66);
        case 'boolean':
            return _.sample([true, false]) as boolean;
        case 'date':
            return new Date(_.random(1660000000000, 1670374864438))
        case 'string':
            return _.sample(['秦', '苏', '赵', '高']) as string;
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