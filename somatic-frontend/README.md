# SOMATIC React Frontend

React + Vite frontend mapped to the current `Sonu826/Somatic` backend.

## 1. Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Linux/macOS:

```bash
cp .env.example .env
```

Default API:
`http://localhost:5000/api`

## 2. Implemented backend calls

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`

### Cows
- GET `/api/cows`
- POST `/api/cows`
- GET `/api/cows/:id`
- PUT `/api/cows/:id`
- DELETE `/api/cows/:id`

### Observations
- GET `/api/observations/questions`

### Tests
- POST `/api/tests/start`
- GET `/api/tests/:testId/status`
- POST `/api/tests/:testId/observations`
- POST `/api/tests/:testId/start-sensor`
- GET `/api/tests/:testId/result`

### IoT
- POST `/api/iot/sensor-data`

### Farm / Reports
Services are included:
- GET `/api/farm/health`
- GET `/api/reports/tests/:testId`

However, the current backend `src/app.js` defines these routes but does not mount them. Add:

```js
app.use('/api/farm', require('./routes/farmRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
```

before the final 404/error middleware.

## 3. Important test flow

1. Login/register.
2. Open My Cows.
3. Register a cow.
4. Open the cow and click Start milk test.
5. Frontend calls `/tests/start`.
6. Frontend fetches `/observations/questions`.
7. Answers are sent as:
   `{ answers: [{ questionId, answer: "YES"|"NO" }] }`
8. Frontend calls `/tests/:testId/start-sensor`.
9. Progress page polls `/tests/:testId/status`.
10. IoT/Bluetooth relay should POST final telemetry to `/iot/sensor-data`.
11. Once backend reaches `COMPLETED`, frontend fetches `/tests/:testId/result`.

## 4. IoT payload

The backend validator requires:

```json
{
  "testId": "TST-XXXXXXXX",
  "cowId": "MONGO_COW_ID",
  "deviceId": "DEVICE-001",
  "timestamp": "2026-09-04T10:30:00.000Z",
  "measurements": {
    "ph": 6.72,
    "temperature": 35.8,
    "conductivity": 5.41
  }
}
```

Do not send `farmerId` from the frontend. The backend derives ownership from the JWT.

## 5. Architecture

```text
src/
├── api/
│   ├── client.js
│   ├── authService.js
│   ├── cowService.js
│   ├── observationService.js
│   ├── testService.js
│   ├── iotService.js
│   ├── farmService.js
│   ├── reportService.js
│   └── healthService.js
├── components/
├── context/
│   └── AuthContext.jsx
├── pages/
└── styles/
    └── global.css
```

The frontend uses one Axios client, attaches the JWT as `Authorization: Bearer <token>`, and consumes the backend's `{ success, data }` response envelope.
