# OOR


[参考文档](https://oor.xdnote.com/)  |  [English](README.md)  | ![npm version](https://img.shields.io/npm/v/oor.svg?style=flat)


NodeJs ORM 工具包 , 目前仅支持 `Postgresql`、 `Elastic Search`

## 特点

1. 启动快，性能强 🚀。
2. 强类型 TypeScript，即是 Type，又是 Code，还是 Schema!
3. 极简 API。
4. 独特魔法后缀📍节省时间与代码行数。
5. 支持 Elastic Search, 提供与 SQL 完全一致的 API！
6. 业务性支持：分页、查询列过滤，逻辑删除，日期标识等。
7. Promise



## 安装


```bash
npm install --save oor pg                           # PostgreSql
# OR 
# npm install --save oor pg-native                  # PostgreSql native 
# npm install --save oor mysql2                     # MySql 
# npm install --save oor @elastic/elasticsearch     # ElasticSearch 
```


## 设置


```typescript
import { setup } from 'oor';
import { Pool } from 'pg';
const pg = new Pool({...})
pg.connect();
setup({ provider: () => pg })
```

## 定义

```typescript
// Line 1 : import oor
import { Table, UType, Static } from 'oor';

// Line 2 : 同时定义 Mapping 映射 / Schema / Type (Line3)
//          Schema 可以使用 @sinclair/typebox 的 API 进行操作
//          也有一些工具支持此 Schema 如 fastify/ajv 等。
//          参考：  https://www.npmjs.com/package/@sinclair/typebox
export const UserSchema = UType.Table({
    id: UType.Integer(),
    name: UType.String({ maxLength: 32 }),
    age: UType.Integer({ minimum: 0, maximum: 128 }),
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
// Fetch all Users
const result = await User.all();
console.log(result);

// Add
const addResult = await User.add({
    name: 'test',
    age: 23,
    sex: false,
    address: 'address',
    salary: 1221.2,
});
console.log('Add Result', addResult)
let userId = addResult.id;


const afterAdd = await User.getById(userId);
console.log('After Add', afterAdd)

// Update
await new Promise(r => setTimeout(r, 1234)); // 等待时间会影响到 "last_modify" 字段
let isUpdate = await User.update({ id: userId, age: 60, });    // 修改 age
console.log('Update is Success ? : ', isUpdate == 1);

const afterUpdate = await User.getById(userId);
console.log('After Update', afterUpdate);       // lastModify & age 已被修改

// Delete
let isDelete = await User.deleteById(userId);
console.log('Delete is Success ? : ', isDelete == 1);

const afterDelete = await User.getById(userId);
console.log('After Delete', afterDelete)

// 执行一个自定义SQL语句，将会调用 [pgClient].query 方法
const result = await User.exec(
    `SELECT XXX FROM YYY WHERE ZZZ = $1 ORDER BY $2 $3`, 
    ['value','id','DESC']
);
console.log(result);
```


## Elastic Search & MySql

Elastic Search has the same api with postgresql / mysql.  Here is how :


```typescript
// 使用 ES 时，将引入 'oor' 改为 'oor/es'
import { Table, setup } from 'oor/es';
import { Client } from '@elastic/elasticsearch';
setup({
    // ES 下 provider 设置参数为 ES Client 的构造参数
    provider: {
        node: 'https://localhost:9200',
        auth: { username: 'elastic', password: 'changeme' },
        tls: { ca: readFileSync('/home/ssh/pki/es_ca.crt'), rejectUnauthorized: false, }
    },
    showSQL: console.log
})

```