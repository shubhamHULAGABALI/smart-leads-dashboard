# Smart Leads — API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

All responses follow this shape:
```json
{
  "success": true,
  "message": "...",
  "data": {},
  "meta": {}   // pagination responses only
}
```

---

## Authentication

### POST /auth/register
Create a new user account.

**Body**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123",
  "role": "sales"   // "sales" | "admin" (optional, default "sales")
}
```

**Response 201**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJ...",
    "user": { "id": "...", "name": "Rahul Sharma", "email": "...", "role": "sales" }
  }
}
```

---

### POST /auth/login
Authenticate an existing user.

**Body**
```json
{
  "email": "rahul@example.com",
  "password": "password123"
}
```

**Response 200** — same shape as register.

**Error 401** — Invalid email or password.

---

### GET /auth/me  🔒
Return the currently authenticated user.

**Response 200**
```json
{
  "success": true,
  "data": { "id": "...", "name": "...", "email": "...", "role": "sales" }
}
```

---

## Leads

### GET /leads  🔒
Fetch a paginated list of leads.

**Query Parameters**

| Param    | Type   | Default  | Description                                  |
|----------|--------|----------|----------------------------------------------|
| status   | string | —        | Filter by status: new / contacted / qualified / lost |
| source   | string | —        | Filter by source: website / instagram / referral |
| search   | string | —        | Search by name or email (regex, case-insensitive) |
| sort     | string | latest   | Sort order: latest / oldest                  |
| page     | number | 1        | Page number                                  |
| limit    | number | 10       | Records per page (max 100)                   |

**Response 200**
```json
{
  "success": true,
  "data": [ { "_id": "...", "name": "...", "email": "...", "status": "new", "source": "website", "createdAt": "..." } ],
  "meta": {
    "total": 48,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

> **RBAC**: Admin sees all leads. Sales users see only leads they created.

---

### GET /leads/stats  🔒
Return lead counts by status.

**Response 200**
```json
{
  "success": true,
  "data": { "total": 48, "new": 12, "contacted": 15, "qualified": 14, "lost": 7 }
}
```

---

### GET /leads/export  🔒
Download filtered leads as CSV. Accepts same query params as GET /leads (no pagination).

**Response** — `text/csv` file download.

---

### GET /leads/:id  🔒
Fetch a single lead.

**Response 200** — Lead object. **404** if not found or not owned by sales user.

---

### POST /leads  🔒
Create a new lead.

**Body**
```json
{
  "name": "Priya Mehta",
  "email": "priya@example.com",
  "status": "new",
  "source": "instagram"
}
```

**Response 201** — Created lead object.

---

### PUT /leads/:id  🔒
Update an existing lead.

**Body** — Any subset of: `name`, `email`, `status`, `source`.

**Response 200** — Updated lead object.  
**403** — Sales user trying to edit another user's lead.

---

### DELETE /leads/:id  🔒
Delete a lead.

**Response 200** — `{ "success": true, "message": "Lead deleted", "data": null }`.  
**403** — Sales user trying to delete another user's lead.

---

## Error Codes

| Code | Meaning                  |
|------|--------------------------|
| 400  | Bad request / cast error |
| 401  | Unauthenticated          |
| 403  | Forbidden (RBAC)         |
| 404  | Resource not found       |
| 409  | Duplicate record         |
| 422  | Validation failed        |
| 500  | Internal server error    |
