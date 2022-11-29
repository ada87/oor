"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
// Table "public.feedback"
// Column    |              Type              | Collation | Nullable |               Default
// -------------+--------------------------------+-----------+----------+--------------------------------------
// id          | integer                        |           | not null | nextval('feedback_id_seq'::regclass)
// title       | character varying(64)          |           | not null |
// content     | character varying(255)         |           | not null |
// contact     | character varying(64)          |           |          |
// create_time | timestamp(0) without time zone |          |          | CURRENT_TIMESTAMP
// product     | character varying(64)          |            |          |
// Indexes:
//  "feedback_pkey" PRIMARY KEY, btree (id)
const build = (pg, schema, table) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(pg.database)
    // const u = await pg.query(`SELECT * FROM pg_tables WHERE schemaname = $1 AND tablename = $2 `, [schema, table]);
    // const u = await pg.query('\\dt $1', [table]);
    // pg.emit()
    //     const u = await pg.query(`
    // select a.attnum,a.attname,concat_ws('',t.typname,SUBSTRING(format_type(a.atttypid,a.atttypmod) 
    // from '\(.*\)')) as type,d.description 
    // from pg_class c, pg_attribute a , pg_type t, pg_description d 
    // where  c.relname = '${table}' and a.attnum>0 and a.attrelid = c.oid and a.atttypid = t.oid and  d.objoid=a.attrelid and d.objsubid=a.attnum
    // `);
    // console.log(u.rows)
    // pg.addListener('log', function () {
    // console.log(arguments)
    // })
    // pg.on('drain', function () {
    //     console.log('drain', arguments)
    // })
    // pg.on('error', function () {
    //     console.log('error', arguments)
    // })
    // pg.on('notice', function () {
    //     console.log('notice', arguments)
    // })
    // pg.on('notification', function () {
    //     console.log('notification', arguments)
    // })
    // pg.on('end', function () {
    //     console.log('end', arguments)
    // })
    // pg.on('error',(err)=>{
    //     console.error(err)
    // })
    pg.on('notification', (msg) => {
        console.log(msg);
        // console.log(msg.channel, msg.payload) // foo
        // console.log() // bar!
    });
    yield pg.query('LISTEN foo');
    yield pg.query(`NOTIFY foo, 'bar!'`);
    // console.log(q)
    // q.submit()
    // console.log(u)
    // copyFrom(queryText: string): stream.Writable;
    // copyTo(queryText: string): stream.Readable;
    // pauseDrain(): void;
    // resumeDrain(): void;
    // escapeIdentifier(str: string): string;
    // escapeLiteral(str: string): string;
    // on(event: 'drain', listener: () => void): this;
    // on(event: 'error', listener: (err: Error) => void): this;
    // on(event: 'notice', listener: (notice: NoticeMessage) => void): this;
    // on(event: 'notification', listener: (message: Notification) => void): this;
    // // tslint:disable-next-line unified-signatures
    // on(event: 'end', listener: () => void): this;
    // pg.emit('log','fdasfda')
    // console.log(pg.eventNames())
});
exports.build = build;
// a pg_attribute
// c pg_class
// d pg_description
