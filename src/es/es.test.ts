import { Client } from '@elastic/elasticsearch'
// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/basic-config.html
const client = new Client({
    node: 'http://localhost:9200',
    auth: {
        username: 'elastic',
        password: 'changeme'
    }
})

