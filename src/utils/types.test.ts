import {
    test,                       // test 与 import { test } from  'node:test' 完全等效
    assert,                     // assert 不同于 node:assert ， 进行了部分消息优化，
    // 如需要使用原生断言 ，请使用 node:assert
    equal, equalAsync,          // 
    equalBatch, equalBatchAsync,
    testEqual, testEqualAsync,
    testEqualBatch, testEqualBatchAsync,
} from 'tsest';

const sum = (a: number, b: number) => a + b;
const sumAsync = async (a: number, b: number) => new Promise(r => setTimeout(r, 1000, a + b));


test('test case', () => {

    assert.equal(sum(1, 2), 3);

    equal(sum, [1, 2], 3);
    equal(sum, [2, 3], 5);

    equalBatch(sum, [
        [[1, 2], 3],
        [[2, 3], 5],
    ])                  // 批量测试

})



test('test async case', async () => {
    // 对于 异步方法，使用 equalAsync 进行测试
    await equalAsync(sumAsync, [1, 2], 3);
    await equalAsync(sumAsync, [2, 3], 5);

    await equalBatchAsync(sum, [
        [[1, 2], 3],
        [[2, 3], 5],
    ])                  // 批量测试异步方法

})



// 直接测试此方法
testEqual(sum, [1, 2], 3);      

// 直接进行批量测试
testEqualBatch(sum, [
    [[1, 2], 3],
    [[2, 3], 5],
])

// 直接测试异步方法
testEqualAsync(sumAsync, [1, 2], 3);

// 直接进行批量测试异步方法
testEqualBatchAsync(sum, [
    [[1, 2], 3],
    [[2, 3], 5],
])
























