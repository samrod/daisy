import { Router, Request, Response } from "express";
import { Method, handlers, authenticatedCollections, initAdmin } from "./utils";
import { authGuide } from "./middleware/authGuide";

initAdmin()

const router = Router();

const createRoutes = (path: string, method: Method) => {
  router[method](path, async (req: Request, res: Response) => {
    await handlers[method](req, res);
  });

  router[method](`${path}/*`, async (req: Request, res: Response) => {
    await handlers[method](req, res);
  });
};

const createAuthRoutes = (path: string, method: Method) => {
  router[method](path, async (req: Request, res: Response, next) => {
    const { collection } = req.params;
    if (authenticatedCollections.includes(collection)) {
      return authGuide(req, res, () => handlers[method](req, res));
    }
  });

  router[method](`${path}/*`, async (req: Request, res: Response, next) => {
    const { collection } = req.params;
    if (authenticatedCollections.includes(collection)) {
      return authGuide(req, res, () => handlers[method](req, res));
    }
  });
};

createRoutes('/clients/:id', 'post');
createRoutes('/clients/:id', 'delete');
createAuthRoutes('/:collection/:id', 'post');
createAuthRoutes('/:collection/:id', 'delete');

router.get('/*', (req: Request, res: Response) => {
  res.status(200).send('<h1>This endpoint is for POST/DELETE only.</h1>');
});

export default router;
