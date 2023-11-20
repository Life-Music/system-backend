import { Client } from '@elastic/elasticsearch';
import EnvVars from '@src/constants/EnvVars';

const elasticSearch = new Client({
  node: EnvVars.ElasticSearch.Endpoint,
  auth: {
    username: EnvVars.ElasticSearch.Username,
    password: EnvVars.ElasticSearch.Password,
  },
});
export default elasticSearch;