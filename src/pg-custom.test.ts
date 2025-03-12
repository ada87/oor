import { test } from 'tsest';
import { Table, View, PG, setSQLTimer, setSQLLogger } from './pg'
import { UserSchema } from './core/Schema.test'

import type { TObject } from '@sinclair/typebox';

class TestTable<S extends TObject> extends Table<S> {
    async testMethod() {
        console.log('this is a inherit method for custom table . ')
        return true;
    }
}

// setSQLLogger(console.log)
setSQLTimer(console.log)

class TestView<S extends TObject> extends View<S> {
    async testMethod() {
        const user = await this.getById(199);
        console.log(user)
        console.log('this is a inherit method for custom view . ')
        return true;
    }
}



test('test custom table', async () => {
    // console.log('fdafdsafdsafadsfs')
    // assert.equal(1, 1)
    // USER.init()
    const USER = PG.Table('user', UserSchema, {}, TestTable)
    // await USER.testMethod()
    // const user = await USER.getById(3)
    // console.log(user)
    const callBaseViewMethod = await USER.query({})
    console.log(callBaseViewMethod)
    const callBaseTableMethod = await USER.update({ name: 'test', id: 444 })
    console.log(callBaseTableMethod)
    // USER.insert({ name: 'test' })

    USER.testMethod()
})

test('test custom view', async () => {
    const USER = PG.View('user', UserSchema, {}, TestView)
    // const user = await USER.getById(3)
    // console.log(user)

    const callBaseMethod = await USER.query({})
    console.log(callBaseMethod)
    const callBaseViewMethod = await USER.query({})
    console.log(callBaseViewMethod)
    // can not call base table method
    // const callBaseTableMethod = await USER.update({ name: 'test', id: 444 })
    // console.log(callBaseTableMethod)

    USER.testMethod()
})

