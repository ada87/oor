import { MagicSuffix, SUFFIX } from '../base/types';
import { SqlWhere } from '../base/sql'
import _ from 'lodash';
import { assert } from '@japa/assert'

type Support = {
    string: boolean,
    number: boolean,
    date: boolean,
    boolean: boolean
}

/**
 * Where Coverage Tester
*/
export const SUFFIX_COVER_TEST: Record<MagicSuffix, Support> = {

    'Min': { string: true, number: true, date: true, boolean: true },
    'MinThan': { string: true, number: true, date: true, boolean: false },
    'Max': { string: true, number: true, date: true, boolean: true },
    'MaxThan': { string: true, number: true, date: true, boolean: false },

    'MinH': { string: false, number: false, date: true, boolean: false },
    'MinD': { string: false, number: false, date: true, boolean: false },
    'MinM': { string: false, number: false, date: true, boolean: false },
    'MaxH': { string: false, number: false, date: true, boolean: false },
    'MaxD': { string: false, number: false, date: true, boolean: false },
    'MaxM': { string: false, number: false, date: true, boolean: false },

    'Like': { string: true, number: false, date: false, boolean: false },
    'Likel': { string: true, number: false, date: false, boolean: false },
    'Liker': { string: true, number: false, date: false, boolean: false },

    'Bt': { string: false, number: true, date: true, boolean: false },
    'BtD': { string: false, number: false, date: true, boolean: false },
    'BtY': { string: false, number: false, date: true, boolean: false },
    'BtM': { string: false, number: false, date: true, boolean: false },

    'Not': { string: true, number: true, date: false, boolean: true },

    'IsNull': { string: true, number: true, date: true, boolean: true },
    'NotNull': { string: true, number: true, date: true, boolean: true },

    'IsDistinct': { string: true, number: true, date: false, boolean: false },
    'NotDistinct': { string: true, number: true, date: false, boolean: false },

    '>': { string: true, number: true, date: true, boolean: true },
    '>=': { string: true, number: true, date: true, boolean: true },
    '<': { string: true, number: true, date: true, boolean: true },
    '<=': { string: true, number: true, date: true, boolean: true },
    '=': { string: true, number: true, date: true, boolean: true },
    '!=': { string: true, number: true, date: true, boolean: true },
    '<>': { string: true, number: true, date: true, boolean: true },

}



export const isCoverOrCoverError = (where: SqlWhere) => {
    for (let suffix of SUFFIX) {
        for (let type of ['string', 'number', 'date', 'boolean']) {
            const isSupport = SUFFIX_COVER_TEST[suffix][type];
            // console.log('suffix - ' + type, isSupport);

            // assert({})
            // where(type:'')
        }

        // assert()

        // console.log(_.has(SUFFIX_COVER_TEST, suffix));
    }

}