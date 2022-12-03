# OOR

NodeJs ORM 工具包 , 目前仅支持 `Postgresql` （***加粗说明 ： 个人业余项目，谨慎使用***）。 

特点：

1. 小巧与简单，代码加总也就几百行，内部优化，无多余计算，接近原生SQL。
2. 代码即定义，可导出 TypeScript 类型。
3. 相比其它框架， 写起来极省代码行数。
4. 内置常用列定义
5. 支持查询魔法，分页查询


## 使用方法


```bash
npm install --save oor pg                           # for PostgreSql
# npm install --save oor mysql2                     # (Coming) for MySql 
# npm install --save oor @elastic/elasticsearch     # (Coming) for ElasticSearch 
```


1. 提供数据库

```typescript
import { setup } from 'oor';
import { Client } from 'pg';
const pg = new Client({})
setup({ provider: () => pg })
```


2. 定义 ORM

```typescript
// Line 1 : import oor
import { Table, UType, Static } from 'oor';

// Line 2 : Build a Schema
//          Schema can be used for validate、check, @see @sinclair/typebox
//          Some web framework support this schema, like fastify 
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
export type User = Static<typeof UserSchema>;

// Line 4 : Build a Table, it's ok for all
export const User = new Table('user', UserSchema);
```

3. 是的，仅需要一个定义，已经全部完成 可以CRUD 了


```typescript
// 查询所有 Feedback
const result = await FeedBack.all();
console.log(result);

// INSERT
const feedback:FeedBack = {
    title: 'I Have a feedback',
    contact: 'a@b.c',
    content: 't6 is amsome',
    product: 'orm'
}
const result = await FeedBack.insert(feedback);
console.log(result)

// UPDATE
const id = 4;
await FeedBack.update({...feedback,id});
console.log(result == 1)

// GET BY ID
const result = await FeedBack.getById(id);
console.log(result)

// DELETE
const result = await FeedBack.deleteById(2);
console.log(result == 1)



// 执行自定义SQL语句
const result = await FeedBack.sql(`SELECT XXX 
FROM YYY 
WHERE ZZZ = $1 
ORDER BY $2 $3`,['value','id','DESC']);
console.log(result);
```


## 常用列定义


| 定义     | 支持类型   | 说明                                                               | 默认         |
| -------- | ---------- | ------------------------------------------------------------------ | ------------ |
| ignore   | 全部       | SELECT XXX FROM ,字段不出现在 XXX 内                               | false        |
| column   | 全部       | 数据库列名与字段名称不同时，设置 column为数据库列名                | 与字段名相同 |
| isCreate | UType.Date | isCreate = true 时，创建时自动赋值为服务器日志，修改时会过滤此字段 | false        |
| isModify | UType.Date | isModify = true 时，每次修改都会更新此字段                         | false        |


## 查询魔法

### 分页、排序

1. `async query(query?: QuerySchema): Promise<Static<T>[]>` ： 不需要分页
2. `async queryPager(query?: QuerySchema): Promise<{ total: number, list: Static<T>[] }>` ： 需要分页，会多返回一个 total


| 定义     | 类型   | 说明                                                                       | 默认                               |
| -------- | ------ | -------------------------------------------------------------------------- | ---------------------------------- |
| start_   | number | OFFSET 位置                                                                | 0                                  |
| count_   | number | LIMIT 数量                                                                 | 可在 全局/指定表/方法 三层配置默认 |
| order_   | string | ORDER 字段仅 order&by 都有效时生效                                         |                                    |
| by_      | 'asc'  | 'desc'                                                                     | BY 方法，仅 order&by 都有效时生效  |
| total_   | number | 如果传此值，将直接返回，不再执行查询 COUNT 语句 <br/> 可用于二次查询时优化 |                                    |
| keyword_ | string | 传 keyword_ 可在非 ignore的 String 类型上加 LIKE                           |                                    |


### 魔法后辍

先看个示例：

```typescript
FeedBack.query({
    start_: 0,
    count_: 20,
    order_: 'id',
    by_: 'desc',
    idMin: 200,                             // id > 200
    idNot: 300,                             // id != 300
    createDateMin : '2022-01-01',           // createDate > 2022-01-01
    createDateMax : new Date('2022-02-01'), // createDate < 2022-02-01
    titleLike: 'title',                     // title like %title%
    product: 'oor'                          // product = oor (No Suffix, No Magic )
})
```

如代码所示， `属性` + `后辍` =  `自动转换成条件` ， 无法转换的将被忽略 。

目前支持的后辍有：

```typescript
export type MagicSuffix = 'Min' | 'Mint' | 'Max' | 'Maxt'   // commom  > , >= , <  ,  <=
    | 'MinH' | 'MinD' | 'MinM' | 'MaxH' | 'MaxD' | 'MaxM'   // Only Date Hour / Day / Month
    | 'Like' | 'Likel' | 'Liker';                           // Only String  like leftlike rightlike
```



## 表定义

`UType.Table(schema,options?:TableOptions)` 方法可定义一个表，参数1为列声明，可选参数2可用于表的一些特殊定义。

* key : 为该数据表的 Primary Key , 默认为 `"id"` ,若不是 `"id"` ,必须传一个定义