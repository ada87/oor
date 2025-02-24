import { test, testIsTrueBatch, byCheckFunctionBatch, throwsBatch } from 'tsest'
import { PG_VIEW } from '../core/Schema.test';
const { BUILDER } = PG_VIEW;
// @ts-ignore
const STRICT = BUILDER.STRICT_QUERY as boolean;

test('Convert Query', {
    // only: true
}, () => {
    const isOk = (result) => {
        const rtn = result.items.length == 1;
        if (rtn) {
            console.log(result.items[0])
        } else {
            console.log(result.items)
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


test('convert condition', {
    only: true,
}, () => {
    const a = BUILDER.where(
        BUILDER.convertQuery({})
    )
    console.log(a)
})


// id: UType.Integer({ title: 'ID', column: 'id' }),
// name: UType.StringRequired({ maxLength: 32, title: '姓名', }),
// age: UType.Integer({ minimum: 0, maximum: 128, delMark: 64, title: '年龄', }),
// sex: UType.Boolean({ title: '性别', default: false, }),
// profile: UType.String({ ignore: true, title: '简介' }),
// address: UType.String({ maxLength: 128, title: '地址' }),
// salary: UType.Double({ ignore: true, title: '薪水' }),
// registerDate: UType.Date({ column: 'register_date', isCreate: true, title: '注册日期', readOnly: true }),
// lastModify: UType.Date({ column: 'last_modify', isModify: true, title: '最后修改' }),
