import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 }, // montée progressive à 10 utilisateurs
    { duration: '1m', target: 10 },  // maintien
    { duration: '30s', target: 0 },  // descente
  ],
};

export default function () {
  const res = http.get('http://api:8000/api/items');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
