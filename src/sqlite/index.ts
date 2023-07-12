import _ from 'lodash';
import { insert, update, del, select, count, byField, orderBy, limit } from './basic/builder';
import { where, fixWhere } from '../mysql/basic/where'
import { executor } from './basic/executor'
import { getFieldType } from '../base/QueryBuilder';
import { BaseView } from '../base/BaseView';
import { BaseTable } from '../base/BaseTable';
import { Settings, setup as _setup } from '../base/Util'
// Export Some useful global apis/types.
import { verbose } from 'sqlite3';
import { _query } from './basic/toPromise'


import type { Static, TObject } from '@sinclair/typebox';
import type { DB_TYPE } from '../base/types';
import type { SqlBuilder, SqlExecutor } from '../base/sql';
import type { TableOptions } from '../base/BaseView';
import type { Database } from 'sqlite3';

export { UType } from '../base/Util';
export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';
export type { Static } from '@sinclair/typebox';


const SQLITE: SqlBuilder = { select, count, insert, delete: del, update, where, orderBy, limit, byField, }

const SelectField = (field: string, schema: any) => {
    const type = getFieldType(schema)
    if (type == 'boolean') {
        if (schema.column) return `IF(\`${schema.column}\`= 1, TRUE, FALSE) AS \`${field}\``;
        return `IF(\`${field}\`= 1, TRUE, FALSE) AS \`${field}\``;
    }
    if (schema.column) return `\`${schema.column}\` AS \`${field}\``;
    return '`' + field + '`';
}


export class View<T extends TObject> extends BaseView<T, Database> {
    protected _DB_TYPE: DB_TYPE = 'sqlite';
    protected _BUILDER: SqlBuilder = SQLITE;
    protected _EXECUTOR: SqlExecutor<T> = executor;

    protected init(schema: T, options?: TableOptions) {
        let fields_query = [];
        let fields_get = [];
        _.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            let select = SelectField(field, properties);
            fields_get.push(select);
            if (properties.ignore === true) return;
            fields_query.push(select);
        });
        this._CONFIG.fields_query = fields_query.join(',');
        this._CONFIG.fields_get = fields_get.join(',')
        const WHERE = [];
        if (this._CONFIG.mark) {
            let column = _.keys(this._CONFIG.mark)[0];
            WHERE.push({ field: column, value: this._CONFIG.mark[column], condition: '!=' });
        }
        if (options && options.globalCondition && options.globalCondition.length) {
            options.globalCondition.map(item => {
                let schema = this._CONFIG.FIELD_MAP.get(this._C2F.get(item.column))
                if (schema) {
                    WHERE.push({ ...item, type: getFieldType(schema) })
                } else {
                    console.error(item)
                }
            })
        }
        this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.FIELD_MAP, WHERE);
    }

    /**
     * same arguments as mysql.query()
     * */
    // all(sql, ...args: any[]): Promise<T[]> {
    //     // this.getClient().all
    //     // this.getClient().exec
    //     // this.getClient().get
    //     // this.getClient().run
    //     return _query(this.getClient(), sql, args)
    // }
}

export class Table<T extends TObject> extends BaseTable<T, Database> {
    protected _DB_TYPE: DB_TYPE = 'sqlite';
    protected _BUILDER: SqlBuilder = SQLITE;
    protected _EXECUTOR: SqlExecutor<Static<T>> = executor;
    protected init(schema: T, options?: TableOptions) {
        let fields_query = [];
        let fields_get = [];
        _.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            let select = SelectField(field, properties);
            fields_get.push(select);
            if (properties.ignore === true) return;
            fields_query.push(select);
        });
        this._CONFIG.fields_query = fields_query.join(',');
        this._CONFIG.fields_get = fields_get.join(',')
        const WHERE = [];
        if (this._CONFIG.mark) {
            let column = _.keys(this._CONFIG.mark)[0];
            WHERE.push({ field: column, value: this._CONFIG.mark[column], condition: '!=' });
        }
        if (options && options.globalCondition && options.globalCondition.length) {
            options.globalCondition.map(item => {
                let schema = this._CONFIG.FIELD_MAP.get(this._C2F.get(item.column))
                if (schema) {
                    WHERE.push({ ...item, type: getFieldType(schema) })
                } else {
                    console.error(item)
                }
            })
        }
        this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.FIELD_MAP, WHERE);
    }

    async add(object) {
        const result = await super.add(object)
        return await this.getById(result['id'] as any)

    }

    /**
     * same arguments as mysql.query()
     * */
    exec(sql, ...args: any[]): Promise<T[]> {
        return _query(this.getClient(), sql, args);
    }
}

export type SqliteSettings = Omit<Settings, 'provider'> & {
    provider: string | (() => Database)
};

export const setup = async (settings: SqliteSettings): Promise<Database> => {
    let db: Database;
    if (_.isFunction(settings.provider)) {
        db = settings.provider();
    } else {
        const sql = verbose();
        db = new sql.Database(settings.provider);
        await db.serialize();
    }
    _setup({ ...settings, provider: ['sqlite', () => db], })
    return db;
}