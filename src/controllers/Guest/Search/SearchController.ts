import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import elasticSearch from '@src/services/ElasticSearch';
import { Request, RequestHandler } from 'express';

class SearchController extends BaseController {
  public searchAlbum: RequestHandler = async (req: Request, res) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      q: string,
    };

    const userId = req.userInfo?.id;

    const query: any = {
      'bool': {
        'must': [
          {
            'match': {
              name: fields.q,
            },
          },
        ],
      },
    };

    if (userId) query.bool.must.push({
      'match': {
        userId: userId.toString(),
      },
    });

    const result = await elasticSearch.search({
      index: 'album',
      'sort': [
        {
          '_score': {
            'order': 'desc',
          },
        },
      ],
      'fields': [
        {
          'field': '*',
        },
      ],
      query,
    });

    const albums = result.hits.hits;

    return res.json(
      this.success(albums),
    );
  };

  public searchCategory: RequestHandler = async (req: Request, res) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      q: string,
    };
    const result = await elasticSearch.search({
      index: 'category',
      'sort': [
        {
          '_score': {
            'order': 'desc',
          },
        },
      ],
      'fields': [
        {
          'field': '*',
        },
      ],
      'query': {
        'bool': {
          'must': [
            {
              'bool': {
                'should': [
                  {
                    'match': {
                      name: fields.q,
                    },
                  },
                ],
                'minimum_should_match': 1,
              },
            },
          ],
        },
      },
    });

    const albums = result.hits.hits;

    return res.json(
      this.success(albums),
    );
  };
}

const controllers = new SearchController();

const searchAlbum = controllers.searchAlbum;
const searchCategory = controllers.searchCategory;

export {
  searchAlbum,
  searchCategory,
};