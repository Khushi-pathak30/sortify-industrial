# SORTIFY AI — Backend API Specification

Complete REST + realtime API contract for connecting the SORTIFY AI frontend to a Flask or FastAPI backend. The frontend is decoupled from data sources: replacing mock data with live ESP32 / AWS telemetry must not require UI changes.

- **Base URL:** `/api/v1`
- **Auth:** JWT Bearer tokens (`Authorization: Bearer <token>`)
- **Content-Type:** `application/json; charset=utf-8`
- **Timestamps:** ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ssZ`)
- **Field naming:** `camelCase` across all endpoints
- **Pagination:** `?page=1&limit=20` on list endpoints

---

## 1. Conventions

### 1.1 Success envelope
List and object endpoints return raw JSON as documented below. Mutating endpoints (`POST`, `PUT`, `DELETE`) SHOULD return:

```json
{ "success": true, "data": { } }
```

### 1.2 Error envelope
All 4xx / 5xx responses:

```json
{
  "success": false,
  "error": {
    "code": "DEVICE_OFFLINE",
    "message": "ESP32 is not connected."
  }
}
```

| Code                  | HTTP | Meaning                                  |
|-----------------------|------|------------------------------------------|
| `INVALID_CREDENTIALS` | 401  | Bad email / password / role              |
| `UNAUTHORIZED`        | 401  | Missing or expired JWT                   |
| `FORBIDDEN`           | 403  | Role lacks permission                    |
| `NOT_FOUND`           | 404  | Resource does not exist                  |
| `VALIDATION_ERROR`    | 422  | Body / query failed schema validation    |
| `DEVICE_OFFLINE`      | 503  | ESP32 / camera / AWS unreachable         |
| `INTERNAL_ERROR`      | 500  | Unhandled server error                   |

### 1.3 Pagination response
```json
{
  "items": [ ],
  "page": 1,
  "limit": 20,
  "total": 143,
  "totalPages": 8
}
```

### 1.4 Roles
`Administrator` · `Supervisor` · `Operator` · `Maintenance`

| Endpoint group           | Admin | Supervisor | Operator | Maintenance |
|--------------------------|:-----:|:----------:|:--------:|:-----------:|
| Auth                     |  ✅   |     ✅     |    ✅    |     ✅      |
| Dashboard / Analytics    |  ✅   |     ✅     |    ✅    |     ✅      |
| Live sensors / stream    |  ✅   |     ✅     |    ✅    |     ✅      |
| Reports (read / export)  |  ✅   |     ✅     |    ✅    |     ✅      |
| Settings (read)          |  ✅   |     ✅     |    ❌    |     ✅      |
| Settings (update)        |  ✅   |     ❌     |    ❌    |     ✅¹     |
| Device control           |  ✅   |     ✅     |    ❌    |     ✅      |

¹ Maintenance may update thresholds & Wi-Fi, not AWS credentials.

---

## 2. Authentication

### `POST /auth/login`
**Request**
```json
{
  "email": "admin@sortify.com",
  "password": "password",
  "role": "Administrator"
}
```
**Response `200`**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "refreshToken": "def50200f9...",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@sortify.com",
    "role": "Administrator"
  }
}
```

### `POST /auth/refresh`
```json
{ "refreshToken": "def50200f9..." }
```
Returns a new `token` + `expiresIn`.

### `POST /auth/logout`
Invalidates the current token. `204 No Content`.

### `GET /auth/me`
Returns the authenticated user object.

**JWT payload**
```json
{ "sub": 1, "email": "admin@sortify.com", "role": "Administrator", "iat": 1720000000, "exp": 1720003600 }
```

---

## 3. Dashboard

### `GET /dashboard/summary`
```json
{
  "totalWaste": 145,
  "metalWaste": 32,
  "wetWaste": 61,
  "dryWaste": 52,
  "avgMoisture": 35,
  "systemStatus": "Healthy",
  "awsStatus": "Connected",
  "esp32Status": "Online",
  "updatedAt": "2026-07-06T11:40:20Z"
}
```
`systemStatus`: `Healthy | Degraded | Offline`.

---

## 4. Live Sensors

### `GET /sensors/live`
Latest single snapshot.
```json
{
  "metal": true,
  "moisture": 35,
  "ir": true,
  "proximity": true,
  "servo": "Idle",
  "camera": "Online",
  "cloud": "Connected",
  "timestamp": "2026-07-06T11:40:20Z"
}
```
`servo`: `Idle | Sorting | Error`.

### `GET /sensors/moisture-trend?hours=24`
```json
[ { "timestamp": "2026-07-06T00:00:00Z", "moisture": 28 } ]
```

---

## 5. Waste History

### `GET /waste/history?page=1&limit=20&type=Metal&from=2026-07-01&to=2026-07-06`
Query params: `page`, `limit`, `type` (`Metal|Wet|Dry`), `from`, `to`, `status`.

```json
{
  "items": [
    {
      "id": 8421,
      "time": "10:10:01",
      "timestamp": "2026-07-06T10:10:01Z",
      "metal": true,
      "moisture": 35,
      "ir": true,
      "proximity": true,
      "type": "Metal",
      "status": "Sorted"
    }
  ],
  "page": 1, "limit": 20, "total": 143, "totalPages": 8
}
```
`status`: `Sorted | Pending | Failed`.

### `GET /waste/history/{id}`
Full record for one classification event.

---

## 6. Analytics

### `GET /analytics?range=7d`
`range`: `24h | 7d | 30d | 90d`.
```json
{
  "distribution": { "metal": 25, "wet": 42, "dry": 33 },
  "dailyCollection": [
    { "date": "2026-07-01", "weight": 145, "metal": 32, "wet": 61, "dry": 52 }
  ],
  "weeklyTrend": [
    { "day": "Mon", "weight": 120 }
  ],
  "accuracy": 96.4
}
```

---

## 7. Reports

### `GET /reports?page=1&limit=30&from=&to=`
```json
{
  "items": [
    { "date": "2026-07-06", "totalWaste": 145, "metal": 32, "wet": 61, "dry": 52, "accuracy": 96 }
  ],
  "page": 1, "limit": 30, "total": 30, "totalPages": 1
}
```

### `GET /reports/export?format=csv&from=&to=`
`format`: `csv | pdf`. Returns a binary file with `Content-Disposition: attachment`.

---

## 8. Devices

### `GET /devices/status`
```json
{
  "esp32": "Online",
  "camera": "Online",
  "metalSensor": "Active",
  "moistureSensor": "Active",
  "irSensor": "Active",
  "servo": "Idle",
  "aws": "Connected",
  "updatedAt": "2026-07-06T11:40:20Z"
}
```

### `POST /devices/{device}/restart`
`device`: `esp32 | camera`. Returns `202 Accepted`.

### `POST /devices/servo/actuate`
```json
{ "bin": "Metal" }
```
Manually triggers the servo (Admin / Maintenance only).

---

## 9. Settings

### `GET /settings`
```json
{
  "device": { "name": "SORTIFY-01", "firmware": "v1.4.2" },
  "wifi":   { "ssid": "Sortify-Net", "password": "********" },
  "aws":    { "region": "ap-south-1", "iotEndpoint": "a1b2c3.iot.aws" },
  "camera": { "resolution": "640x480", "fps": 24 },
  "thresholds": { "moisture": 40, "metal": "Detected" },
  "appearance": { "darkTheme": true }
}
```

### `PUT /settings`
Body accepts any subset of the above. Secrets (Wi-Fi password, AWS keys) are write-only — never echoed back.

**Response**
```json
{ "success": true, "data": { /* updated settings, masked */ } }
```

---

## 10. Realtime (WebSocket / SSE)

Frontend consumes realtime updates without refresh. Both transports MUST be offered so the client can fall back.

### 10.1 WebSocket
- **URL:** `wss://<host>/api/v1/ws?token=<JWT>`
- **Ping:** server sends `{"type":"ping"}` every 30 s; client replies `pong`.
- **Message envelope:**
```json
{ "type": "sensor.live", "timestamp": "2026-07-06T11:40:20Z", "data": { } }
```

| `type`                | Frequency  | `data` shape                              |
|-----------------------|------------|-------------------------------------------|
| `sensor.live`         | 2–3 s      | Same as `GET /sensors/live`               |
| `dashboard.summary`   | on change  | Same as `GET /dashboard/summary`          |
| `device.status`       | on change  | Same as `GET /devices/status`             |
| `waste.classified`    | per event  | Same as one `/waste/history` item         |
| `alert`               | on event   | `{ "level": "warning", "code": "...", "message": "..." }` |

`alert.level`: `info | warning | critical`.

### 10.2 Server-Sent Events (fallback)
- **URL:** `GET /api/v1/stream` with `Authorization: Bearer <token>`
- **Format:**
```
event: sensor.live
data: {"metal":true,"moisture":35,...}

event: alert
data: {"level":"critical","code":"DEVICE_OFFLINE","message":"ESP32 lost connection"}
```
Same event names and payloads as the WebSocket table.

---

## 11. Frontend Integration Notes

- Store JWT in memory (or `httpOnly` cookie); attach `Authorization: Bearer <token>` on every request.
- Auto-refresh via `/auth/refresh` when `expiresIn` is within 60 s.
- Central API client: base URL + interceptor for 401 → refresh → retry, and for the `{ success:false, error }` envelope → toast.
- Wrap realtime in a single `useRealtime()` hook that dispatches by `type` — components subscribe to what they render (dashboard KPIs, live sensors, alerts).
- Keep the mock data layer (`src/lib/mock-data.ts`) as the shape contract; swap the source, not the components.
- All list views MUST send `page` + `limit`; default `limit=20`, `max=100`.
- Timezone: send/receive UTC; format for display client-side.

---

## 12. Endpoint Index

| Method | Path                              | Auth | Purpose                          |
|--------|-----------------------------------|:----:|----------------------------------|
| POST   | `/auth/login`                     |  —   | Sign in                          |
| POST   | `/auth/refresh`                   |  —   | Rotate JWT                       |
| POST   | `/auth/logout`                    |  ✅  | Invalidate token                 |
| GET    | `/auth/me`                        |  ✅  | Current user                     |
| GET    | `/dashboard/summary`              |  ✅  | KPI snapshot                     |
| GET    | `/sensors/live`                   |  ✅  | Latest sensor reading            |
| GET    | `/sensors/moisture-trend`         |  ✅  | Moisture time series             |
| GET    | `/waste/history`                  |  ✅  | Paginated events                 |
| GET    | `/waste/history/{id}`             |  ✅  | Event detail                     |
| GET    | `/analytics`                      |  ✅  | Aggregates + trends              |
| GET    | `/reports`                        |  ✅  | Daily report rows                |
| GET    | `/reports/export`                 |  ✅  | CSV / PDF download               |
| GET    | `/devices/status`                 |  ✅  | Hardware health                  |
| POST   | `/devices/{device}/restart`       |  ✅  | Reboot ESP32 / camera            |
| POST   | `/devices/servo/actuate`          |  ✅  | Manual sort                      |
| GET    | `/settings`                       |  ✅  | Read config                      |
| PUT    | `/settings`                       |  ✅  | Update config                    |
| WS     | `/ws`                             |  ✅  | Realtime channel                 |
| GET    | `/stream`                         |  ✅  | SSE fallback                     |
