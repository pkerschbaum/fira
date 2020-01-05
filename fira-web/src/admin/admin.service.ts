import { ImportUserRequest } from '../typings';
import { httpClient } from '../http/http.client';
import { createLogger } from '../logger/logger';
import { store } from '../store/store';

const logger = createLogger('admin.service');

export const adminService = {
  importUsers: async (users: ImportUserRequest[]) => {
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
