# Post AI API Reference

Base URL: `https://post-ai.g-a-l-a-c-t-i-c.com`

All requests require an `Authorization: Bearer <API_KEY>` header.

---

## Query

### POST /query

Execute a parameterized SQL query. Returns all matching rows.

```bash
curl -X POST https://post-ai.g-a-l-a-c-t-i-c.com/query \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT id, balance_cents FROM accounts WHERE org_id = $1",
    "params": ["org_abc"]
  }'
```

**Response:**

```json
{
  "rows": [
    { "id": "acc_123", "balance_cents": 1500000 },
    { "id": "acc_456", "balance_cents": 320050 }
  ],
  "rowCount": 2
}
```

### POST /query/one

Execute a query and return exactly one row. Returns `null` if no rows match.

```bash
curl -X POST https://post-ai.g-a-l-a-c-t-i-c.com/query/one \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT id, balance_cents FROM accounts WHERE id = $1",
    "params": ["acc_123"]
  }'
```

**Response:**

```json
{
  "row": { "id": "acc_123", "balance_cents": 1500000 }
}
```

---

## Transactions

### POST /transaction

Execute multiple SQL statements atomically. All statements succeed or all roll back.

```bash
curl -X POST https://post-ai.g-a-l-a-c-t-i-c.com/transaction \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "statements": [
      {
        "sql": "INSERT INTO ledger (account_id, amount_cents, type) VALUES ($1, $2, $3)",
        "params": ["acc_123", 150000, "credit"]
      },
      {
        "sql": "UPDATE accounts SET balance_cents = balance_cents + $1 WHERE id = $2",
        "params": [150000, "acc_123"]
      }
    ]
  }'
```

**Response:**

```json
{
  "success": true,
  "results": [
    { "rowCount": 1 },
    { "rowCount": 1 }
  ],
  "transaction_id": "txn_8f3a2b1c"
}
```

On failure, all statements are rolled back and the response includes the error:

```json
{
  "success": false,
  "error": "duplicate key value violates unique constraint \"ledger_pkey\""
}
```

---

## Migrations

### POST /migrations/apply

Apply all pending migrations in order.

```bash
curl -X POST https://post-ai.g-a-l-a-c-t-i-c.com/migrations/apply \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "applied": 2,
  "migrations": [
    "001_create_accounts.sql",
    "002_create_ledger.sql"
  ],
  "message": "Applied 2 migration(s)"
}
```

### GET /migrations/status

List applied and pending migrations.

```bash
curl https://post-ai.g-a-l-a-c-t-i-c.com/migrations/status \
  -H "Authorization: Bearer $API_KEY"
```

**Response:**

```json
{
  "applied": [
    {
      "name": "001_create_accounts.sql",
      "applied_at": "2026-03-20T10:30:00Z"
    }
  ],
  "pending": [
    {
      "name": "002_create_ledger.sql"
    }
  ]
}
```

---

## Audit Trail

### GET /audit/:entityType/:entityId

Retrieve the full audit history for an entity.

```bash
curl https://post-ai.g-a-l-a-c-t-i-c.com/audit/account/acc_123 \
  -H "Authorization: Bearer $API_KEY"
```

**Response:**

```json
{
  "entries": [
    {
      "id": "aud_001",
      "entity_type": "account",
      "entity_id": "acc_123",
      "action": "INSERT",
      "timestamp": "2026-03-20T10:30:00Z",
      "changes": { "balance_cents": 0, "org_id": "org_abc" },
      "hash": "a1b2c3d4e5f6...",
      "previous_hash": null
    },
    {
      "id": "aud_002",
      "entity_type": "account",
      "entity_id": "acc_123",
      "action": "UPDATE",
      "timestamp": "2026-03-20T11:00:00Z",
      "changes": { "balance_cents": { "from": 0, "to": 150000 } },
      "hash": "f6e5d4c3b2a1...",
      "previous_hash": "a1b2c3d4e5f6..."
    }
  ]
}
```

Each entry's `hash` is computed as:

```
SHA-256(previous_hash + entity_type + entity_id + action + timestamp + JSON(changes))
```

### GET /audit/verify/:entityType/:entityId

Verify the SHA-256 chain integrity for an entity's audit trail.

```bash
curl https://post-ai.g-a-l-a-c-t-i-c.com/audit/verify/account/acc_123 \
  -H "Authorization: Bearer $API_KEY"
```

**Response (valid):**

```json
{
  "valid": true,
  "count": 15,
  "message": "All 15 entries verified. Chain integrity intact."
}
```

**Response (broken):**

```json
{
  "valid": false,
  "count": 15,
  "broken_at": 8,
  "message": "Hash mismatch at entry 8. Expected abc123..., got def456..."
}
```

---

## Health

### GET /health

Check API and database connectivity.

```bash
curl https://post-ai.g-a-l-a-c-t-i-c.com/health
```

**Response:**

```json
{
  "status": "ok",
  "database": "connected",
  "version": "PostgreSQL 16.2",
  "hyperdrive": true,
  "uptime": "14d 3h 22m"
}
```

---

## Money Type

Post AI uses **BIGINT cents** for all monetary values. This eliminates floating-point precision errors that plague financial applications.

### Rules

1. **Store money as integer cents.** `$15.00` is stored as `1500`. `$0.10` is stored as `10`.
2. **Never use FLOAT, DOUBLE, or NUMERIC with decimals** for money columns.
3. **Format for display only at the application layer.** The database stores raw cents.

### Why not FLOAT?

```
-- With floats (WRONG):
SELECT 0.1 + 0.2;
-- Returns: 0.30000000000000004

-- With BIGINT cents (CORRECT):
SELECT 10 + 20;
-- Returns: 30  (= $0.30)
```

### Schema Example

```sql
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  balance_cents BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ledger (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL REFERENCES accounts(id),
  amount_cents BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Conversion Helper

```
Display:  amount_cents / 100  → $15.00
Store:    dollars * 100       → 1500
```

Always perform arithmetic on integer cents. Only convert to decimal for display.
