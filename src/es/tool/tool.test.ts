import { client, test, User } from '../../test/es';
import { User as PgUser, test as jest } from '../../test/pg';

//  http://localhost:5601
// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html

// jest('Init  :', async () => {
//     await client.indices.delete({ index: 'user' })
//     const result = await PgUser.all();
//     result.map(item => client.index({ index: 'user', op_type: 'create', document: item, }))
// }).skip()