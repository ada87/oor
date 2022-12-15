import type { TObject } from '@sinclair/typebox';
import type { SearchHit, } from '@elastic/elasticsearch/lib/api/types';
import type { ESQuery } from './define';
import { Static } from '@sinclair/typebox';

import { BaseView } from './BaseView'
import { querys, flatQuerys } from './executor';

export class View<T extends TObject> extends BaseView<T, SearchHit<Static<T>>> {
    protected _EXECUTOR: ESQuery<T, SearchHit<Static<T>>> = querys;
}

export class FlatView<T extends TObject> extends BaseView<T, Static<T>> {
    protected _EXECUTOR: ESQuery<T, Static<T>> = flatQuerys;
}