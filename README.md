# OOR

[Documention](https://oor.xdnote.com/index.en/)  |  [简体中文](README_ZH.md)  | ![npm version](https://img.shields.io/npm/v/oor.svg?style=flat)

NodeJs ORM tool library , for `Postgresql`, `ElasticSearch`, `MySql` .
<!-- Required : MySQL 8.0.19  -->
<!-- Required : SQLite 3.35.0  -->

## Features

1. High performance 🚀。
2. Code is Type, Type is Code, Code is Schema!
3. Easy API.
4. Builtin Magic Suffix📍. Save your time and code lines.
6. Support Elastic Search, Same API with SQL!
5. Common business Support : Pagition, Ignore Column, Logical Delete, Date Marker.
7. Promise only , NO callback!

## Install


```bash
npm install --save oor pg                           # for PostgreSql
# OR 
# npm install --save oor pg-native                  # PostgreSql native 
# npm install --save oor mysql2                     # MySql 
# npm install --save oor @elastic/elasticsearch     # ElasticSearch 
```


## Setup

```typescript
import { setup } from 'oor';
setup({ provider: { host:'1.2.3.4', port:5432, user:'postgres' ... } });
```


## Define

```typescript
// Line 1 : import oor
import { Table, UType, Static } from 'oor';

// Line 2 : Build a Schema
//          Schema can be used for validate、check, @see @sinclair/typebox
//          Some web framework support this schema, like fastify 
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

// Line 3 : Define a Type, you can avoid if not need this type.
export type User = Static<typeof UserSchema>;

// Line 4 : Build a Table, it's ok for all
export const User = new Table('public.user', UserSchema);
```

## Usage


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


const afterAdd= await User.getById(userId);
console.log('After Add', afterAdd)

// Update
await new Promise(r => setTimeout(r, 1234)); // WaitTime effect column "last_modify"
let isUpdate = await User.update({ id: userId, age: 60, });    // Update Age
console.log('Update is Success ? : ', isUpdate == 1);

const afterUpdate = await User.getById(userId);
console.log('After Update', afterUpdate);       // lastModify & age is updated

// Delete
let isDelete = await User.deleteById(userId);
console.log('Delete is Success ? : ', isDelete == 1);

const afterDelete = await User.getById(userId);
console.log('After Delete', afterDelete)

// Execue custom SQL Sentence.
// sql method will call (pgClient).query(...arguments)
const result = await User.exec(
    `SELECT XXX FROM YYY WHERE ZZZ = $1 ORDER BY $2 $3`, 
    ['value','id','DESC']
);
console.log(result);
```

## Elastic Search & MySql

Elastic Search has the same api with postgresql / mysql.  Here is how :


```typescript
// Change import form 'oor' to 'oor/es'  or 'oor/mysql'
import { Table, setup } from 'oor/es';
import { Client } from '@elastic/elasticsearch';
setup({
    // The provider config param use constructor of Client (ES).
    provider: {
        node: 'https://localhost:9200',
        auth: { username: 'elastic', password: 'changeme' },
        tls: { ca: readFileSync('/home/ssh/pki/es_ca.crt'), rejectUnauthorized: false, }
    },
    showSQL: console.log
})

```



