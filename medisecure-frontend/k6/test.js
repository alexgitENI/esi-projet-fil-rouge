import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Montée à 50 users
    { duration: '2m', target: 50 },  // Maintien 50 users
    { duration: '30s', target: 0 },  // Descente
  ],
};

export default function () {
  http.get('http://localhost:5173/login');
  sleep(1);
}