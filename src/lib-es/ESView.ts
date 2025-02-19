// import { BaseView } from './BaseView';
// import { querys, flatQuerys } from './executor';

// import type { TObject } from '@sinclair/typebox';
// import type { SearchHit, } from '@elastic/elasticsearch/lib/api/types';
// import type { ESQuery } from './define';
// import type { Static } from '@sinclair/typebox';

// export class View<T extends TObject> extends BaseView<T, SearchHit<Static<S>>> {
//     protected _EXECUTOR: ESQuery<Static<S>, SearchHit<Static<S>>> = querys;
// }

// export class FlatView<T extends TObject> extends BaseView<T, Static<S>> {
//     protected _EXECUTOR: ESQuery<Static<S>, Static<S>> = flatQuerys;
// }