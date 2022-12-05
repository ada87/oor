import _ from 'lodash';
import { SqlWhere } from '../base/sql';
import { WhereParam, WhereItem, WhereCondition, MagicSuffix, FieldType, } from '../base/types';
import { throwErr, isSupport, NONE_PARAM } from '../base/Util';
import dayjs, { Dayjs } from 'dayjs';

type QueryPos = { SQL: string[]; PARAM: any[], }

// 'Min', 'MinThan', 'Max', 'MaxThan',                 // commom  > , >= , <  ,  <=
// 'MinH', 'MinD', 'MinM', 'MaxH', 'MaxD', 'MaxM',     // Only Date Hour / Day / Month
// 'Like', 'Likel', 'Liker',                           // Only String  like leftlike rightlike
// 'Bt', 'BtD', 'BtY', 'BtM',                          // BETWEEN, support Number/Date ,'BtY', 'BtM', 'BtD' Only  Spport Date
// 'Not',                                              // != or <>
// 'IsNull', 'NotNull',                                // isNull or Not NULL           This Suffix will avoid value
// 'IsDistinct', 'NotDistinct',                        // isDistinct or Not Distinct   This Suffix will avoid value
// '>', '>=', '<', '<=', '=', '!=', '<>'    
const OPERATION_MAP = new Map<MagicSuffix, string>([
    ['Min', 'gt'],
    ['MinThan', 'gte'],
    ['Max', 'lt'],
    ['MaxThan', 'lte'],
    ['MinH', 'gte'],
    ['MinD', 'gte'],
    ['MinM', 'gte'],
    ['MaxH', 'lte'],
    ['MaxD', 'lte'],
    ['MaxM', 'lte'],
    ['Like', 'wildcard'],
    ['Likel', 'prefix'],
    ['Liker', 'wildcard'],
    ['Bt', 'between'],
    ['BtD', 'between'],
    ['BtY', 'between'],
    ['BtM', 'between'],
    // ['Not', 'Must Not'],
    ['IsNull', 'exist'],
    // ['NotNull', 'exist'],
    // ['IsDistinct', 'gt'],
    // ['NotDistinct', 'gt'],
    ['>', 'gt'],
    ['>=', 'gte'],
    ['<', 'lt'],
    ['<=', 'lte'],
    ['=', 'term'],
    ['!=', 'gt'],
    ['<>', 'gt'],
])


const TERMS = "{\"terms\":{\"field\":\"%s\",\"size\":%d,\"min_doc_count\":1,\"shard_min_doc_count\":0,\"show_term_doc_count_error\":false,\"order\":[{\"_count\":\"desc\"}]}}";





// private JsonArray buidMust(CommonRequest query, String timeField) {
//     JsonArray root = new JsonArray();
//     JsonObject timeCondition = new JsonObject();
//     timeCondition.addProperty("gte", query.getStartTime().getTime());
//     timeCondition.addProperty("lte", query.getEndTime().getTime());
//     timeCondition.addProperty("format", "epoch_millis");
//     JsonObject filed = new JsonObject();
//     filed.add(timeField, timeCondition);
//     JsonObject range = new JsonObject();
//     range.add("range", filed);
//     root.add(range);
//     if (query.getParam() == null || StringUtils.isEmpty(query.getParam().getQ()) || "*".equals(query.getParam().getQ().trim())) {
//         return root;
//     }
//     JsonObject param = new JsonObject();
//     String q = query.getParam().getQ().trim();
//     param.addProperty("query", q);
//     param.addProperty("analyze_wildcard", true);
//     if (query.isProfessor()) {
//         param.addProperty("minimum_should_match", "100%");
//         param.addProperty("auto_generate_phrase_queries", true);
//     }
//     JsonObject query_string = new JsonObject();
//     query_string.add("query_string", param);
//     root.add(query_string);

//     return root;
// }


// public String aggTimeField(String timeFiled, Date start, Date end) {
//     JsonObject extended_bounds = new JsonObject();
//     extended_bounds.addProperty("min", start.getTime());
//     extended_bounds.addProperty("max", end.getTime());

//     JsonObject date_histogram = new JsonObject();
//     date_histogram.add("extended_bounds", extended_bounds);
//     date_histogram.addProperty("interval", timeInterval(start, end));
//     date_histogram.addProperty("time_zone", "Asia/Shanghai");
//     date_histogram.addProperty("min_doc_count", 0);
//     date_histogram.addProperty("field", timeFiled);

//     JsonObject bucket = new JsonObject();
//     bucket.add("date_histogram", date_histogram);

//     return bucket.toString();
// }


// /**
//  * 自动计算时间区间
//  */
// private String timeInterval(Date start, Date end) {
//     long seconds = Math.abs((end.getTime() - start.getTime()) / 1000);
//     if (seconds < GROUP_NUM_CONST) {
//         return (int) seconds + "s";
//     }
//     long minutes = seconds / 60;
//     if (minutes < GROUP_NUM_CONST) {
//         return (int) (seconds / GROUP_NUM_CONST) + "s";
//     }
//     long hours = minutes / 60;
//     if (hours < GROUP_NUM_CONST) {
//         return (int) (minutes / GROUP_NUM_CONST) + "m";
//     }
//     long days = hours / 24;
//     if (days < GROUP_NUM_CONST) {
//         return (int) (hours / GROUP_NUM_CONST) + "h";
//     }
//     if (days > 366) {
//         return "1M";
//     }
//     return (int) (days / GROUP_NUM_CONST) + "d";
// }


// /**
//  * 把自定义的语句转换成ES语句
//  */
// private void parseQueryParam(List<Integer> sourceIds, JsonArray array, RequestParamItem[] items) {
//     for (RequestParamItem req : items) {
//         String operation = req.getOperation();
//         if (!OPERATION_MAP.containsKey(operation)) {
//             continue;
//         }

//         String action = OPERATION_MAP.get(operation);
//         String field = req.getField();
//         String value = req.getValue();
//         JsonObject condition = new JsonObject();
//         JsonObject fKey = new JsonObject();
//         JsonObject root = new JsonObject();

//         SourceField sf = null;
//         for (int id : sourceIds) {
//             if (sourceFieldMapCache.containsKey(id)) {
//                 if (sourceFieldMapCache.get(id).containsKey(field)) {
//                     sf = sourceFieldMapCache.get(id).get(field);
//                     break;
//                 }
//             }
//         }
//         switch (operation) {
//             case ">":
//             case "<":
//             case ">=":
//             case "<=":
//                 if (sf == null) {
//                     condition.addProperty(action, value);
//                     fKey.add(field, condition);
//                     root.add("range", fKey);
//                     break;
//                 }
//                 if ("date".equals(sf.getType())) {
//                     long time = TimeTools.parse(value).getTime();
//                     condition.addProperty(action, time);
//                     condition.addProperty("format", "epoch_millis");
//                 } else {
//                     // TODO LONG DOUBLE
//                     condition.addProperty(action, value);
//                 }

//                 fKey.add(field, condition);
//                 root.add("range", fKey);
//                 break;
//             case "between":
//                 String[] ptns = value.split(",");
//                 if(ptns.length!=2){
//                     break;
//                 }
//                 String min = ptns[0];
//                 String max = ptns[1];
//                 if (sf == null) {
//                     condition.addProperty("gte", min);
//                     condition.addProperty("lte", max);
//                     fKey.add(field, condition);
//                     root.add("range", fKey);
//                     break;
//                 }
//                 if ("date".equals(sf.getType())) {
//                     long _min = TimeTools.parse(min).getTime();
//                     long _max = TimeTools.parse(max).getTime();
//                     condition.addProperty("gte", _min);
//                     condition.addProperty("lte", _max);
//                     condition.addProperty("format", "epoch_millis");
//                 } else {
//                     // TODO LONG DOUBLE
//                     condition.addProperty("gte", min);
//                     condition.addProperty("lte", max);
//                 }
//                 fKey.add(field, condition);
//                 root.add("range", fKey);
//                 break;
//             case "like":
//                 condition.addProperty(field, "*" + value + "*");
//                 root.add(action, condition);
//                 break;
//             case "suffix_like":
//                 condition.addProperty(field, "*" + value);
//                 root.add(action, condition);
//                 break;
//             case "prefix_like":
//             case "=":
//                 condition.addProperty(field, value);
//                 root.add(action, condition);
//                 break;
//             case "exist":
//                 condition.addProperty("field", field);
//                 root.add(action, condition);
//                 break;
//             case "in":
//                 JsonArray list = new JsonArray();
//                 for (String ptn : value.split(",")) {
//                     list.add(ptn);
//                 }
//                 condition.add(field, list);
//                 root.add(action, condition);
//                 break;
//             default:
//                 continue;
//         }
//         array.add(root);
//     }

// }

// const where = () => {

// }



const ItemToWhere = (whereItem: WhereItem, pos: QueryPos, err: string[]) => {
    let item = { ...whereItem, condition: whereItem.condition ? whereItem.condition : '=', type: whereItem.type ? whereItem.type : 'string' }
    if (!isSupport(item.type, item.condition)) {
        err.push(`${item.field}/(${item.type}) not support method ${item.condition}`)
        return;
    }
    switch (item.type) {
        case 'number':
            // whereNumber(item, pos, err);
            return;
        case 'string':
            // whereText(item, pos, err);
            return;
        case 'boolean':
            // whereBoolean(item, pos, err);
            return
        case 'date':
            // whereDate(item, pos, err);
            return;
        default:
            // whereText(item, pos, err);
            return;
    }
}

const ConditionToWhere = (condition: WhereCondition, pos: QueryPos, err: string[]) => {
    for (let group of condition.items) {
        if (_.has(group, 'link')) {
            let _pos: QueryPos = {
                SQL: [],
                PARAM: [],
            }
            ConditionToWhere(group as WhereCondition, _pos, err);
            if (_pos.SQL.length) {
                // for (let param of _pos.PARAM) {
                //     pos.PARAM.push(param);
                // }
                //@ts-ignore;
                pos.SQL.push('(' + _pos.SQL.join(' ' + group.link + ' ') + ')')
            }


        } else {
            ItemToWhere(group as WhereItem, pos, err)

        }
    }
};



export const where: SqlWhere = (condition: WhereParam, startIdx?): [string, any[]] => {
    const pos: QueryPos = { SQL: [], PARAM: [], };
    let root: WhereCondition = _.isArray(condition) ? { link: 'AND', items: condition } : condition;
    let err: string[] = [];
    // ConditionToWhere(root, pos, err);
    // throwErr(err, 'Some SQL Error Occur');
    // if (pos.SQL.length == 0) return ['', []];
    // return [pos.SQL.join(" " + root.link + " "), pos.PARAM]
    return null;
}
