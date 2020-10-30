const routesConfig = {
  HOME: {
    path: 'home',
    routes: {
      START: {
        path: 'start',
      },
    },
  },
} as const;

function createRoute(...pathParts: string[]) {
  return `/${pathParts.join('/')}`;
}

export const routes = {
  home: {
    base: createRoute(routesConfig.HOME.path),
    start: createRoute(routesConfig.HOME.path, routesConfig.HOME.routes.START.path),
  },
};
