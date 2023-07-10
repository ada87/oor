import { BaseView } from './BaseView';
import { querys, flatQuerys } from './executor';

import type { TObject } from '@sinclair/typebox';
import type { SearchHit, } from '@elastic/elasticsearch/lib/api/types';
import type { ESQuery } from './define';
import type { Static } from '@sinclair/typebox';

export class View<T extends TObject> extends BaseView<T, SearchHit<Static<T>>> {
    protected _EXECUTOR: ESQuery<Static<T>, SearchHit<Static<T>>> = querys;
}

export class FlatView<T extends TObject> extends BaseView<T, Static<T>> {
    protected _EXECUTOR: ESQuery<Static<T>, Static<T>> = flatQuerys;
}