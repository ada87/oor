import { test, byCheckFunctionBatch, throwsBatch, okBatch, assert } from 'tsest'
import _ from 'lodash';
import { PG_VIEW, OK, ERROR } from '../core/Schema.test';
import { QuerySchema } from '../utils/types';
import { colorGreen, colorMagenta, colorRed, colorYellow } from '../utils/color';
const { BUILDER } = PG_VIEW;
// @ts-ignore
const STRICT = BUILDER.STRICT_QUERY as boolean;

test('Convert Query', {
    // only: true
    skip: true,
}, () => {
    const isOk = (result) => {
        const rtn = result.items.length == 1;
        if (rtn) {
            console.log(OK, result.items[0])
        } else {
            console.log(ERROR, result.items)
        }
        return rtn
    }
    // Convert TO QUERY 不会校验正确性，只进行转换操作，但会校验不存在的字段 
    byCheckFunctionBatch(BUILDER.convertQuery, [
        [{ age: 1 }, isOk],
        [{ idGt: '1' }, isOk],
        [{ registerDate: 1 }, isOk],
        [{ idGte: 1 }, isOk],
        [{ profile: 1 }, isOk],
        [{ address: 1 }, isOk],
        [{ salaryMoreThan: 1 }, isOk],
        [{ sexLike: new Date() }, isOk],
    ], BUILDER);


    if (STRICT) {
        throwsBatch(BUILDER.convertQuery, [
            [{ xxoucrerrror: 'aa' }],
            [{ age: 1, xxerror: 22 }],      // STRICT 模式时，有数据不存在时，则会
        ], BUILDER)
    } else {

        const noArg = (result) => {
            return result.items.length == 0;
        }
        byCheckFunctionBatch(BUILDER.convertQuery, [
            [{ xxoucrerrror: 'aa' }, noArg],
            [{ age: 1, xxerror: 22 }, isOk],
        ], BUILDER);
    }

});



test('convert error', {


}, () => {
    if (STRICT) {

    } else {

    }
})

// const notSupport = ()
const queryChain = (query: QuerySchema, sql?: string) => {
    const result = BUILDER.where(BUILDER.convertQuery(query));
    var isOk = false;
    if (sql) {
        isOk = _.startsWith(result[0], sql);
        if (isOk) {
            console.log(OK, colorYellow(JSON.stringify(query)), result)
        } else {
            console.log(ERROR, colorRed(JSON.stringify(query)), 'except :', colorGreen(sql), 'but :', colorMagenta(result[0]))
        }
    } else {
        // console.log(result)
        isOk = result[1].length == 1;
        if (isOk) {
            console.log(OK, colorYellow(JSON.stringify(query)), colorGreen(result[0]), colorMagenta(result[1][0]))
        } else {
            console.log(ERROR, colorRed(JSON.stringify(query)), result);

        }
    }
    return isOk;
}
const isEmpty = (query: QuerySchema) => {
    const result = BUILDER.where(BUILDER.convertQuery(query));
    const isOk = result[0] == '' && result[1].length == 0;
    if (isOk) {
        console.log(OK)
    } else {
        console.log(ERROR, colorYellow(JSON.stringify(query)), result)
    }
    return isOk
    // query: QuerySchema
}

const notSupport = (testCase) => {

    if (STRICT) {
        throwsBatch(queryChain, testCase, BUILDER);
    } else {
        okBatch(isEmpty, testCase)
    }
}

test('convert string', {
    skip: true
    // only: true,
}, () => {
    // console.log(STRICT)

    okBatch(queryChain, [
        [{ name: 'aa' }, "name ="], [{ nameNot: 'aa' }, "name !"],
        [{ nameMin: 'aa' }, "name >="], [{ nameMax: 'aa' }, "name <="],
        [{ nameLess: 'aa' }, "name <"], [{ nameLessThan: 'aa' }, "name <"], [{ nameMore: 'aa' }, "name >"], [{ nameMoreThan: 'aa' }, "name >"],
        [{ nameLt: 'aa' }, "name <"], [{ nameLte: 'aa' }, "name <="], [{ nameGt: 'aa' }, "name >"], [{ nameGte: 'aa' }, "name >="],
        [{ 'name>': 'aa' }, "name >"], [{ 'name>=': 'aa' }, "name >="], [{ 'name<': 'aa' }, "name <"], [{ 'name<=': 'aa' }, "name <="], [{ 'name=': 'aa' }, "name ="], [{ 'name!=': 'aa' }, "name !"], [{ 'name<>': 'aa' }, "name !"],
        [{ nameIsNull: true }, "name IS  NULL"], [{ nameNotNull: true }, "name IS NOT NULL"],
        [{ nameIn: 'aa' }, "name = ANY"], [{ nameNotIn: 'aa' }, "name != ANY"],

    ])
    notSupport([
        [{ nameMaxH: 'aa' }], [{ nameMaxD: 'aa' }], [{ nameMaxM: 'aa' }],
        [{ nameMinH: 'aa' }], [{ nameMinD: 'aa' }], [{ nameMinM: 'aa' }],
        [{ nameBt: 'aa,bb' }, "name between"],
        [{ nameBtD: 'aa,bb' }, "name between"], [{ nameBtY: 'aa,bb' }, "name between"], [{ nameBtM: 'aa,bb' }, "name between"],
    ])
})


test('convert int', {

    // only: true,
}, () => {

    okBatch(queryChain, [
        [{ age: 1 }, 'age ='], [{ 'age=': 1 }, 'age ='], [{ 'age!=': 1 }, 'age !='], [{ 'age<>': 1 }, 'age !='],
        [{ ageMin: 1 }, 'age >='], [{ ageMax: 1 }, 'age <='],
        [{ ageMore: 1 }, 'age >'], [{ ageMoreThan: 1 }, 'age >'], [{ ageLess: 1 }, 'age <'], [{ ageLessThan: 1 }, 'age <'],
        [{ ageGt: 1 }, 'age >'], [{ ageGte: 1 }, 'age >='], [{ ageLt: 1 }, 'age <'], [{ ageLte: 1 }, 'age <='],
        [{ ageBt: '1,2' }, 'age >= $1 AND age <='],
        [{ ageNot: 1 }, 'age !='],
        [{ ageIsNull: true }, 'age IS  NULL'], [{ ageNotNull: true }, 'age IS NOT NULL'],
        [{ 'age>': 1 }, 'age >'], [{ 'age>=': 1 }, 'age >='], [{ 'age<': 1 }, 'age <'], [{ 'age<=': 1 }, 'age <='],
        [{ ageIn: 1 }, 'age = ANY'], [{ ageNotIn: 1 }, 'age != ANY'],
    ])

    notSupport([
        [{ ageBtD: '1,2' }], [{ ageBtY: '1,2' }], [{ ageBtM: '1,2' }],
        [{ ageMinH: 1 }], [{ ageMinD: 1 }], [{ ageMinM: 1 }],
        [{ ageMaxH: 1 }], [{ ageMaxD: 1 }], [{ ageMaxM: 1 }],
    ])

})

test('convert double', {

}, () => {
    okBatch(queryChain, [
        [{ salary: 1.1032 }, 'salary ='], [{ 'salary=': 1.1032 }, 'salary ='], [{ 'salary!=': 1.1032 }, 'salary !='], [{ 'salary<>': 1.1032 }, 'salary !='],
        [{ salaryMin: 1.1032 }, 'salary >='], [{ salaryMax: 1.1032 }, 'salary <='],
        [{ salaryMore: 1.1032 }, 'salary >'], [{ salaryMoreThan: 1.1032 }, 'salary >'], [{ salaryLess: 1.1032 }, 'salary <'], [{ salaryLessThan: 1.1032 }, 'salary <'],
        [{ salaryGt: 1.1032 }, 'salary >'], [{ salaryGte: 1.1032 }, 'salary >='], [{ salaryLt: 1.1032 }, 'salary <'], [{ salaryLte: 1.1032 }, 'salary <='],
        [{ salaryNot: 1.1032 }, 'salary !='],
        [{ salaryIsNull: true }, 'salary IS  NULL'], [{ salaryNotNull: true }, 'salary IS NOT NULL'],
        [{ 'salary>': 1.1032 }, 'salary >'], [{ 'salary>=': 1.1032 }, 'salary >='], [{ 'salary<': 1.1032 }, 'salary <'], [{ 'salary<=': 1.1032 }, 'salary <='],
        [{ salaryIn: 1.1032 }, 'salary = ANY'], [{ salaryNotIn: 1.1032 }, 'salary != ANY'],
    ]);

    notSupport([
        [{ salaryBt: '1.1032,2' }], [{ salaryBtD: '1.1032,2' }], [{ salaryBtY: '1.1032,2' }], [{ salaryBtM: '1.1032,2' }],
        [{ salaryMinH: 1.1032 }], [{ salaryMinD: 1.1032 }], [{ salaryMinM: 1.1032 }],
        [{ salaryMaxH: 1.1032 }], [{ salaryMaxD: 1.1032 }], [{ salaryMaxM: 1.1032 }],
    ])
})

// test('convert date', {

//     // only: true,
// }, () => {
//     const isOk = (result) => {
//         console.log(result)
//         return result[1].length == 1;
//     }

//     const a = BUILDER.where(
//         BUILDER.convertQuery({ageGt: 1})
//     )
//     console.log(a)
// })


// test('convert boolean', {

//     // only: true,
// }, () => {
//     const isOk = (result) => {
//         console.log(result)
//         return result[1].length == 1;
//     }

//     const a = BUILDER.where(
//         BUILDER.convertQuery({ageGt: 1})
//     )
//     console.log(a)
// })
