import { ObjectLiteral } from '../util/types.util';

const routesConfig = {
  LOGIN: {
    path: 'login',
  },
  ADMIN: {
    path: 'admin',
  },
  ANNOTATION: {
    path: 'annotation',
    routes: {
      ANNOTATION: { path: 'annotate' },
      HISTORY: { path: 'history' },
      EDIT: { path: 'edit' },
      INFO: { path: 'info' },
      FEEDBACK: { path: 'feedback' },
      FINISHED: { path: 'finished' },
      EVERYTHING_ANNOTATED: { path: 'everything-annotated' },
    },
  },
} as const;

function createRoute(...pathParts: string[]) {
  return `/${pathParts.join('/')}`;
}

export const routes = {
  LOGIN: {
    base: createRoute(routesConfig.LOGIN.path),
  },
  ADMIN: {
    base: createRoute(routesConfig.ADMIN.path),
  },
  ANNOTATION: {
    base: createRoute(routesConfig.ANNOTATION.path),
    annotate: createRoute(
      routesConfig.ANNOTATION.path,
      routesConfig.ANNOTATION.routes.ANNOTATION.path,
    ),
    history: (queryParams?: { skip: number }) =>
      createRoute(routesConfig.ANNOTATION.path, routesConfig.ANNOTATION.routes.HISTORY.path) +
      (queryParams === undefined ? '' : `?${queryParamsToString(queryParams)}`),
    edit: (judgementId: string | number) =>
      createRoute(
        routesConfig.ANNOTATION.path,
        routesConfig.ANNOTATION.routes.EDIT.path,
        `${judgementId}`,
      ),
    info: createRoute(routesConfig.ANNOTATION.path, routesConfig.ANNOTATION.routes.INFO.path),
    feedback: createRoute(
      routesConfig.ANNOTATION.path,
      routesConfig.ANNOTATION.routes.FEEDBACK.path,
    ),
    finished: createRoute(
      routesConfig.ANNOTATION.path,
      routesConfig.ANNOTATION.routes.FINISHED.path,
    ),
    everythingAnnotated: createRoute(
      routesConfig.ANNOTATION.path,
      routesConfig.ANNOTATION.routes.EVERYTHING_ANNOTATED.path,
    ),
  },
} as const;

function queryParamsToString(queryParams: ObjectLiteral): string {
  const params = [];
  for (const key of Object.keys(queryParams)) {
    params.push(`${key}=${queryParams[key]}`);
  }
  return params.join('&');
}
