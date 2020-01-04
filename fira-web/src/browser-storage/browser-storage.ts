interface LocalStorageUser {
  accessToken: string;
  refreshToken: string;
}

const USER_KEY = 'user';

export const browserStorage = {
  saveUser: (user: LocalStorageUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  getUser: (): LocalStorageUser | null => {
    const currentlyStoredUser = localStorage.getItem(USER_KEY);
    if (!currentlyStoredUser) {
      return null;
    }
    return JSON.parse(currentlyStoredUser) as LocalStorageUser;
  },
};
