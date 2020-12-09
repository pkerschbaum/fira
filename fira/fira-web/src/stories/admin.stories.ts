import { createLogger } from '../commons/logger';
import { adminClient } from '../http/admin.client';
import { adminSchema } from '@fira-commons';

const logger = createLogger('admin.service');

export const adminStories = {
  exportJudgements: async () => {
    logger.info(`executing export of judgements...`);

    const response = await adminClient.exportJudgements();
    saveTsv('judgements.tsv', response);

    logger.info(`export of judgements succeeded!`, { response });
  },

  exportFeedback: async () => {
    logger.info(`executing export of feedback...`);

    const response = await adminClient.exportFeedback();
    saveTsv('feedback.tsv', response);

    logger.info(`export of feedback succeeded!`, { response });
  },

  updateConfig: async (config: adminSchema.UpdateConfig) => {
    logger.info(`executing update of config...`);

    await adminClient.updateConfig(config);

    logger.info(`update of config succeeded!`);
  },

  getStatistics: async () => {
    logger.info(`executing retrieval of statistics...`);

    const response = await adminClient.loadStatistics();

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
