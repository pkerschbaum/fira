import { httpClient } from '../http/http.client';
import { createLogger } from '../logger/logger';
import { store } from '../store/store';

const logger = createLogger('admin.service');

interface ImportUser {
  id: string;
}

export const adminService = {
  importUsers: async (users: ImportUser[]) => {
    logger.info(`executing import users...`, { users });

    const importUsersResponse = await httpClient.importUsers(
      store.getState().user!.accessToken.val,
      {
        users,
      },
    );
    logger.info(`import users succeeded!`, { loginResponse: importUsersResponse });
    return importUsersResponse;
  },
};
