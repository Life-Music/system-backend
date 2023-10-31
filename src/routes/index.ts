import { RouterOptions } from '@src/global';
import { router } from './api/v1';
import { RequestHandler, Router } from 'express';

const createNestedRouter = (
  routerInstance: Router,
  router: RouterOptions,
  path: string = '',
  middleware?: Array<RequestHandler>,
) => {
  if (router.method && router.controller) {
    routerInstance[router.method](
      `${path}${router.path}`,
      ...(middleware ?? []),
      ...(router.middleware ?? []),
      (req, res, next) => {
        const handler = router.request?.(req);
        if (handler)
          return handler(req, res, next);
        return next();
      },
      router.controller,
    );
  }
  router.children?.forEach((childRouter) => {
    createNestedRouter(routerInstance, childRouter, path + router.path, router.middleware);
  });
};

const apiRouter = Router();
createNestedRouter(apiRouter, router);

export default apiRouter;