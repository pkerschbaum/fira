import * as fs from 'fs';
import * as path from 'path';
import * as d3 from 'd3';
import * as csvParse from 'csv-parse';

import * as config from '../config';
import { AppLogger } from '../commons/app-logger.service';
import { isEmpty } from '../util/strings';
import { ImportStatus } from '../typings/enums';
import { JudgementMode } from '../../../commons';
import { AdminService } from '../admin/admin.service';
import { IdentityManagementService } from '../identity-management/identity-management.service';

const COLUMN_USER_ID = 'user_id';
const COLUMN_DOCUMENT_ID = 'doc_id';
const COLUMN_DOCUMENT_TEXT = 'doc_text';
const COLUMN_QUERY_ID = 'query_id';
const COLUMN_QUERY_TEXT = 'query_text';
const COLUMN_PRIORITY = 'priority';
const COLUMN_ANNO_TARGET_USER = 'annotation_target_per_user';
const COLUMN_ANNO_TARGET_JUDGE_PAIR = 'annotation_target_per_judgement_pair';
const COLUMN_JUDGEMENT_MODE = 'judgement_mode';
const COLUMN_ROTATE_DOCUMENT_TEXT = 'rotate_document_text';
const COLUMN_ANNO_TARGET_TO_REQUIRE_FEEDBACK = 'annotation_target_to_require_feedback';

export async function importInitialData({
  logger,
  imService,
  adminService,
}: {
  logger: AppLogger;
  imService: IdentityManagementService;
  adminService: AdminService;
}) {
  logger.log(
    'determining if initial import of data (i.e., import of users, queries, etc.) is necessary...',
  );

  /* --- USERS --- */

  await importAsset<{ id: string }>({
    logger,
    assetType: 'users',
    getCountFn: imService.getCountOfUsers,
    tsvSkipFn: (entry) => !entry[COLUMN_USER_ID] || isEmpty(entry[COLUMN_USER_ID]),
    tsvMapFn: (entry) => ({ id: entry[COLUMN_USER_ID] }),
    importFn: async (assetsParsed) => {
      const { accessToken } = await imService.login(
        config.keycloak.adminCredentials.username,
        config.keycloak.adminCredentials.password,
      );

      const importedUsers = await imService.importUsers(accessToken, assetsParsed);
      await writeFileToDisk('users', d3.tsvFormat(importedUsers));
      return importedUsers;
    },
  });

  /* --- DOCUMENTS --- */

  await importAsset<{ id: string; text: string }>({
    logger,
    assetType: 'documents',
    getCountFn: adminService.getCountOfDocuments,
    tsvSkipFn: isDocumentIdMissing,
    tsvMapFn: (entry) => ({
      id: entry[COLUMN_DOCUMENT_ID].trim(),
      text: entry[COLUMN_DOCUMENT_TEXT],
    }),
    importFn: adminService.importDocuments,
  });

  /* --- QUERIES --- */

  await importAsset<{ id: string; text: string }>({
    logger,
    assetType: 'queries',
    getCountFn: adminService.getCountOfQueries,
    tsvSkipFn: isQueryIdMissing,
    tsvMapFn: (entry) => ({
      id: entry[COLUMN_QUERY_ID].trim(),
      text: entry[COLUMN_QUERY_TEXT],
    }),
    importFn: adminService.importQueries,
  });

  /* --- JUDGEMENT-PAIRS --- */

  await importAsset<{ queryId: string; documentId: string; priority: number }>({
    logger,
    assetType: 'judgement-pairs',
    getCountFn: adminService.getCountOfJudgPairs,
    tsvSkipFn: (entry) => isDocumentIdMissing(entry) || isQueryIdMissing(entry),
    tsvMapFn: (entry) => ({
      queryId: entry[COLUMN_QUERY_ID].trim(),
      documentId: entry[COLUMN_DOCUMENT_ID].trim(),
      priority: Number(entry[COLUMN_PRIORITY]),
    }),
    importFn: adminService.importJudgementPairs,
  });

  /* --- CONFIG --- */

  await importAsset<{
    annotationTargetPerUser: number;
    annotationTargetPerJudgPair: number;
    judgementMode: JudgementMode;
    rotateDocumentText: boolean;
    annotationTargetToRequireFeedback: number;
  }>({
    logger,
    assetType: 'config',
    getCountFn: adminService.getCountOfConfig,
    tsvSkipFn: () => false, // don't skip anything
    tsvMapFn: (entry) => {
      const judgementModeStr = entry[COLUMN_JUDGEMENT_MODE];
      if (!Object.values(JudgementMode).includes(judgementModeStr)) {
        throw new Error(`${COLUMN_JUDGEMENT_MODE} has an invalid value`);
      }

      return {
        annotationTargetPerUser: Number(entry[COLUMN_ANNO_TARGET_USER]),
        annotationTargetPerJudgPair: Number(entry[COLUMN_ANNO_TARGET_JUDGE_PAIR]),
        judgementMode: judgementModeStr,
        rotateDocumentText: entry[COLUMN_ROTATE_DOCUMENT_TEXT] === 'true',
        annotationTargetToRequireFeedback: Number(entry[COLUMN_ANNO_TARGET_TO_REQUIRE_FEEDBACK]),
      };
    },
    importFn: (configs) => adminService.updateConfig(configs[0]),
  });
}

type ObjectLiteral = {
  [key: string]: any;
};

type ImportResult = { status: ImportStatus };

function isDocumentIdMissing(entry: ObjectLiteral) {
  return !entry[COLUMN_DOCUMENT_ID] || isEmpty(entry[COLUMN_DOCUMENT_ID]!);
}

function isQueryIdMissing(entry: ObjectLiteral) {
  return !entry[COLUMN_QUERY_ID] || isEmpty(entry[COLUMN_QUERY_ID]!);
}

async function importAsset<T>({
  logger,
  assetType,
  getCountFn,
  tsvSkipFn,
  tsvMapFn,
  importFn,
}: {
  logger: AppLogger;
  assetType: string;
  getCountFn: () => Promise<number>;
  tsvSkipFn: (obj: ObjectLiteral) => boolean;
  tsvMapFn: (obj: ObjectLiteral) => T;
  importFn: (assetsParsed: T[]) => Promise<ImportResult[] | void>;
}) {
  const countOfAssets = await getCountFn();
  if (countOfAssets > 0) {
    logger.log(`count of ${assetType} > 0 --> skip import of ${assetType}`);
    return;
  }

  logger.log(`count of ${assetType} == 0 --> import ${assetType}...`);
  const assetFileContent = await readFileFromDisk(assetType);
  const assetsParsed = (await tsvParse(assetFileContent, tsvSkipFn, tsvMapFn)) as T[];

  const assetsImportResult = await importFn(assetsParsed);
  if (assetsImportResult) {
    abortOnFailedImport(logger, assetsImportResult);
  }

  logger.log(`import of ${assetType} successful!`);
}

async function readFileFromDisk(fileName: string) {
  return await fs.promises.readFile(
    path.resolve(__dirname, '../../../../data', `${fileName}.tsv`),
    {
      encoding: 'utf8',
    },
  );
}

async function writeFileToDisk(fileName: string, content: string) {
  const writePath = path.resolve(__dirname, '../../../../data/out');
  await fs.promises.mkdir(writePath, { recursive: true });
  return await fs.promises.writeFile(path.resolve(writePath, `${fileName}.tsv`), content, {
    encoding: 'utf8',
  });
}

async function tsvParse(
  tsv: string,
  skipFn: (obj: ObjectLiteral) => boolean,
  mapFn: (obj: ObjectLiteral) => ObjectLiteral,
) {
  const recordsStream = csvParse(tsv, { delimiter: '\t', quote: null, columns: true });
  const results = [];
  for await (const record of recordsStream) {
    results.push(record);
  }
  return results.filter((entry) => !skipFn(entry)).map(mapFn);
}

function abortOnFailedImport(logger: AppLogger, importResults: ImportResult[]) {
  const failedImports = importResults.filter(
    (importResult) => importResult.status === ImportStatus.ERROR,
  );
  if (failedImports.length > 0) {
    const exampleFailedImport = failedImports[0];
    logger.error(
      `at least one import failed --> aborting... number of failed imports=${failedImports.length}, ` +
        `data of first failed import was: ${JSON.stringify(exampleFailedImport)}`,
    );
    process.exit(1);
  }
}
