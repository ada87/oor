import _ from "lodash";

type Calc = {

}

type GroupByQuery = {

    filed: string,
    distint?: boolean,
    calc?: Calc;

    order?: string;
    by?: string;

}

export const groupBy = (groupQuery: GroupByQuery) => {

    let fields = [];
    if (groupQuery.distint) {
        fields.push(`DISTINCT(${groupQuery.filed}}) AS ${groupQuery.filed}`)
    } else {
        fields.push(groupQuery.filed);
    }

    if (groupQuery.calc) {

        if (_.isArray(groupQuery.calc)) {

        } else {

        }
    } else {
        fields.push(`COUNT(${groupQuery.filed} AS total) `);
    }



    // const SQL = `G`

}