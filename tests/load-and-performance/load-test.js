import http from 'k6/http';
import { check, fail, group } from 'k6';

const FIRA_BE_BASE = 'http://fira-be:80';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};
const USER_CREDENTIALS = [
  {
    username: 'user01',
    password: 'jVpNxHFy',
  },
  {
    username: 'user02',
    password: 'xBcVjkZy',
  },
];

function responseToStr(res) {
  return JSON.stringify({
    status: res.status,
    data: !!res.body ? res.json() : undefined,
  });
}

export const options = {
  vus: 2,
  iterations: 30,
};

export default function() {
  const results = {};

  group('login', function() {
    const payload = JSON.stringify(USER_CREDENTIALS[__VU - 1]);

    const res = http.post(`${FIRA_BE_BASE}/auth/v1/login`, payload, { headers: DEFAULT_HEADERS });
    if (
      !check(res, {
        'status was 200': r => r.status == 200,
      })
    ) {
      fail(`status code of login was wrong. res: ${responseToStr(res)}`);
    }

    results.login = { accessToken: res.json().accessToken };
  });

  group('preload', function() {
    const headers = Object.assign({}, DEFAULT_HEADERS, {
      authorization: `Bearer ${results.login.accessToken}`,
    });

    const res = http.post(`${FIRA_BE_BASE}/judgements/v1/preload`, null, { headers });
    if (
      !check(res, {
        'status was 201': r => r.status == 201,
      })
    ) {
      fail(`status code of preload was wrong. res: ${responseToStr(res)}`);
    }

    const judgements = res.json().judgements;
    if (
      !check(judgements, {
        'at least one judgement was returned': j => j.length > 0,
      })
    ) {
      fail('no judgements were returned');
    }

    results.preload = { judgements };
  });

  group('judge', function() {
    const headers = Object.assign({}, DEFAULT_HEADERS, {
      authorization: `Bearer ${results.login.accessToken}`,
    });
    const payload = JSON.stringify({
      relevanceLevel: '0_NOT_RELEVANT',
      relevancePositions: [0],
      durationUsedToJudgeMs: 0,
    });

    const res = http.put(
      http.url`${FIRA_BE_BASE}/judgements/v1/${results.preload.judgements[0].id}`,
      payload,
      { headers },
    );
    if (
      !check(res, {
        'status was 200': r => r.status == 200,
      })
    ) {
      fail(`status code of PUT judgements was wrong. res: ${responseToStr(res)}`);
    }
  });
}
