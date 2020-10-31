// domain
export * from './src/domain/commons';
export * from './src/domain/constants';
import * as http from './src/domain/http';
import { routes } from './src/domain/routes';

// util
import * as arrays from './src/util/arrays.util';
import * as errors from './src/util/errors.util';
import * as functions from './src/util/functions.util';
import * as httpUtils from './src/util/http.util';
import * as numbers from './src/util/numbers.util';
import * as objects from './src/util/objects.util';
import * as strings from './src/util/strings.util';
import * as promises from './src/util/promises.util';
export * from './src/util/id-generator.util';
export * from './src/util/types.util';

// schema
import * as adminSchema from './src/rest/admin.schema';
import * as authSchema from './src/rest/auth.schema';
import * as feedbackSchema from './src/rest/feedback.schema';
import * as judgementsSchema from './src/rest/judgements.schema';
import * as mgmtSchema from './src/rest/mgmt.schema';

export {
  // domain
  http,
  routes,
  // util
  arrays,
  errors,
  functions,
  httpUtils,
  numbers,
  objects,
  strings,
  promises,
  // schema
  adminSchema,
  authSchema,
  feedbackSchema,
  judgementsSchema,
  mgmtSchema,
};
