import { loadStoredUser } from './load-stored-user';

const bootScripts = [loadStoredUser];

export const executeBootScripts = () => bootScripts.forEach(bootScript => bootScript());
