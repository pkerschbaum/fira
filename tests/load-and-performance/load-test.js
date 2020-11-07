import http from "k6/http";
import { check, fail, group } from "k6";

const FIRA_BE_BASE = "http://fira_appsvc:80/fira-trec/api";
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};
const USER_CREDENTIALS = [
  {
    username: "user01",
    password: "", // set password
  },
  {
    username: "user02",
    password: "", // set password
  },
  {
    username: "user03",
    password: "", // set password
  },
];

function responseToStr(res) {
  let data;
  if (!!res.body) {
    try {
      data = res.json();
    } catch (e) {
      data = res.body;
    }
  }
  return JSON.stringify({
    status: res.status,
    data,
  });
}

export const options = {
  vus: USER_CREDENTIALS.length,
  iterations: USER_CREDENTIALS.length * 30,
};

export default function () {
  const results = {};

  group("login", function () {
    const payload = JSON.stringify(
      USER_CREDENTIALS[(__VU - 1) % USER_CREDENTIALS.length]
    );

    const res = http.post(`${FIRA_BE_BASE}/auth/v1/login`, payload, {
      headers: DEFAULT_HEADERS,
    });
    if (
      !check(res, {
        "status was 200": (r) => r.status == 200,
      })
    ) {
      fail(`status code of login was wrong. res: ${responseToStr(res)}`);
    }

    results.login = { accessToken: res.json().accessToken };
  });

  group("preload", function () {
    const headers = Object.assign({}, DEFAULT_HEADERS, {
      authorization: `Bearer ${results.login.accessToken}`,
    });

    const res = http.post(`${FIRA_BE_BASE}/judgements/v1/preload`, null, {
      headers,
    });
    if (
      !check(res, {
        "status was 201": (r) => r.status == 201,
      })
    ) {
      fail(`status code of preload was wrong. res: ${responseToStr(res)}`);
    }

    const judgements = res.json().judgements;
    if (
      !check(judgements, {
        "3 judgements were returned": (j) => j.length === 3,
      })
    ) {
      fail(
        `invalid count of judgements were returned! count of returned judgements = ${judgements.length}`
      );
    }

    results.preload = { judgements };
  });

  group("judge", function () {
    const headers = Object.assign({}, DEFAULT_HEADERS, {
      authorization: `Bearer ${results.login.accessToken}`,
    });
    const payload = JSON.stringify({
      relevanceLevel: "0_NOT_RELEVANT",
      relevancePositions: [0],
      durationUsedToJudgeMs: 0,
    });

    for (let i = 0; i < 2 && i < results.preload.judgements.length; i++) {
      const res = http.put(
        http.url`${FIRA_BE_BASE}/judgements/v1/${results.preload.judgements[i].id}`,
        payload,
        { headers }
      );
      if (
        !check(res, {
          "status was 200": (r) => r.status == 200,
        })
      ) {
        fail(
          `status code of PUT judgements was wrong. res: ${responseToStr(res)}`
        );
      }
    }
  });
}
