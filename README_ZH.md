# OOR


[参考文档](https://oor.xdnote.com/)  |  [English](README.md)  | ![npm version](https://img.shields.io/npm/v/oor.svg?style=flat)


NodeJs ORM 工具包 , 目前仅支持 `Postgresql`

## 特点

1. 启动快，性能强 🚀。
2. 强类型 TypeScript，即是 Type，又是 Code，还是 Schema!
3. 克制且易用的 API。
4. 内置魔法后缀📍, 极省代码行数。
5. 支持分页，支持超强条件构造。
6. 支持查询列过滤，逻辑删除，日期标识等。
7. 自带插件，工具包（计划中）
8. Promise
9. NodeJS 14+


## 安装


```bash
npm install --save oor pg                           # PostgreSql
# OR 
# npm install --save oor pg-native                  # PostgreSql native 
# npm install --save oor mysql2                     # MySql 
# npm install --save oor @elastic/elasticsearch     # ElasticSearch 
```


## 设置数据源


```typescript
import { setup } from 'oor';
import { Pool } from 'pg';
const pg = new Pool({...})
pg.connect();
setup({ provider: () => pg })
```

## 定义 Mapping Object & Type & Schema

```typescript
// Line 1 : import oor
import { Table, UType, Static } from 'oor';

// Line 2 : 同时定义 Mapping 映射 / Schema / Type (Line3)
//          Schema 可以使用 @sinclair/typebox 的 API 进行操作
//          也有一些工具支持此 Schema 如 fastify/ajv 等。
//          参考：  https://www.npmjs.com/package/@sinclair/typebox
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

// Line 3 : 如果需要为个类型，可以通过 Staitc 来定义。
export type User = Static<typeof UserSchema>;

// Line 4 : 定义操作对象，大功告成
export const User = new Table('public.user', UserSchema);
```

## 使用


```typescript
// 查询所有 User
const result = await User.all();
console.log(result);

// Insert
const insertResult = await User.insert({
    name: 'test',
    age: 23,
    sex: false,
    address: 'randmo',
    salary: 1221.2,
});
console.log('Insert Result', insertResult)
let userId = insertResult.id as number;


const afterInsert = await User.getById(userId);
console.log('After Insert', afterInsert)

// Update
await new Promise(r => setTimeout(r, 1200)); // wait , notice last_update value
let isUpdate = await User.update({ id: userId, age: 60, });    // change Age
console.log('Update is Success ? : ', isUpdate == 1);

const afterUpdate = await User.getById(userId);
console.log('After Update', afterUpdate)

// Delete
let isDelete = await User.deleteById(userId);
console.log('Delete is Success ? : ', isDelete == 1);

await setTimeout(r => r, 1000); // wait , notice last_update value
const afterDelete = await User.getById(userId);
console.log('After Delete', afterDelete)

// 执行自定义SQL语句
const result = await User.sql(`SELECT XXX 
FROM YYY 
WHERE ZZZ = $1 
ORDER BY $2 $3`,['value','id','DESC']);
console.log(result);
```
