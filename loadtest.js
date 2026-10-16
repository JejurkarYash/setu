
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1,
  iterations: 10,

  thresholds: {
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },

  cloud: {
    name: 'Setu - Mock Provider Baseline',
  },
};

export default function () {
  const res = http.post(
    'http://localhost:8081/v1/chat/completions',
    JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: 'Reply with OK.' },
      ],
      stream: false,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-mock-openai-key-for-testing',
      },
    }
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response contains choices': (r) => {
      try {
        return JSON.parse(r.body).choices?.length > 0;
      } catch {
        return false;
      }
    },
  });
}

