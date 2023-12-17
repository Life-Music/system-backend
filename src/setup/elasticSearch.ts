import '@src/pre-start';
import elasticSearch from '@src/services/ElasticSearch';

elasticSearch.indices.delete({ index: 'album' })
  .then(() => {

    elasticSearch.indices.create({ index: 'album', body: {} });
  });