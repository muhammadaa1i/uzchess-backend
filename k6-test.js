import http from 'k6/http';
import {check} from 'k6';

const TOTAL_REQUESTS = 30000;

export const options = {
    vus: 100, // concurrent users
    iterations: TOTAL_REQUESTS,
};

export default function () {
    const payload = JSON.stringify({
        fullName: `Author ${__ITER}`,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzNDAzMjg3LCJleHAiOjE3ODM0MDY4ODd9.f5yAIOrkVGx2-VK2EbI6gT7GrI37X2QdGfqNCGjwkSM',
        },
    };

    const res = http.post(
        'http://localhost:8000/authors/create',
        payload,
        params,
    );

    check(res, {
        'status is 200 or 201': (r) =>
            r.status === 200 || r.status === 201,
    });
}
