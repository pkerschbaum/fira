import { httpClient } from '../http/http.client';
import { createLogger } from '../logger/logger';
import { store } from '../store/store';
import { UpdateConfig } from '../typings/fira-be-typings';

const logger = createLogger('admin.service');

export const adminService = {
  exportJudgements: async () => {
    logger.info(`executing export of judgements...`);

    const response = await httpClient.exportJudgements(store.getState().user!.accessToken.val);
    saveTsv('judgements.tsv', response);

    logger.info(`export of judgements succeeded!`, { response });
  },

  updateConfig: async (config: UpdateConfig) => {
    logger.info(`executing update of config...`);

    await httpClient.updateConfig(store.getState().user!.accessToken.val, config);

    logger.info(`update of config succeeded!`);
  },

  getStatistics: async () => {
    logger.info(`executing retrieval of statistics...`);

    const response = await httpClient.getStatistics(store.getState().user!.accessToken.val);

    logger.info(`retrieval of statistics succeeded!`, { response });
    return response;
  },
};

function saveTsv(filename: string, data: string) {
  const blob = new Blob([data], { type: 'text/tsv' });
  const elem = window.document.createElement('a');
  elem.href = window.URL.createObjectURL(blob);
  elem.download = filename;
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
}
