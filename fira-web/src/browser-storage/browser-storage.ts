interface LocalStorageUser {
  accessToken: string;
  refreshToken: string;
}

const USER_KEY = 'user';

export const browserStorage = {
  saveUser: (user: LocalStorageUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): LocalStorageUser | undefined => {
    const currentlyStoredUser = localStorage.getItem(USER_KEY);
    if (!currentlyStoredUser) {
      return;
    }
    return JSON.parse(currentlyStoredUser) as LocalStorageUser;
  },
};
