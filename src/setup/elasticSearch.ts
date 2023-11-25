import elasticSearch from '@src/services/ElasticSearch';

elasticSearch.indices.create({ index: 'media', body: {} });