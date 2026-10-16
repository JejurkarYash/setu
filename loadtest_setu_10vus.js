
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    setu_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '60s',
    },
  },

  thresholds: {
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },

  cloud: {
    name: 'Setu - 10 VU Load Test',
  },
};

export default function () {
  const response = http.post(
    'http://localhost:8080/v1/chat/completions',
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
        'Authorization': `Bearer setu_1488319bec89242401213666c488172873fe016734e7f22db5930ddc659eedbd`,
      },
    }
  );

  check(response, {
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

