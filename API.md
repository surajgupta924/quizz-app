# API response conventions

Successful responses contain `success: true`. Collection endpoints return `items` and, where relevant, `pagination`. Errors use:

```json
{
  "success": false,
  "message": "Human-readable explanation",
  "errors": [{ "type": "field", "value": "", "msg": "Validation message", "path": "email" }]
}
```

Status codes: `200` success, `201` created, `400` invalid OTP/state, `401` unauthenticated, `403` unauthorized/not open, `404` missing, `409` conflict, `415` upload type, `422` validation, and `429` rate limit.
