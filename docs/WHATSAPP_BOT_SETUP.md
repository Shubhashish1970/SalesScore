# WhatsApp Bot Integration

The Sales Scorecard app supports opening via a JWT token from your WhatsApp Bot.

## URL Format

```
https://salesscore-c34f3.web.app/?token=<JWT>
```

The WhatsApp Bot should send this link when the user requests their scorecard.

## JWT Payload Structure

The JWT payload must include:

| Claim      | Type   | Required | Description                                                    |
|------------|--------|----------|----------------------------------------------------------------|
| `mobile`   | string | Yes*     | User's mobile number (10 digits)                               |
| `phone`    | string | Alt      | Alternative to `mobile`                                        |
| `sub`      | string | Alt      | Alternative to `mobile` (subject)                              |
| `role`     | string | Yes      | `TM` \| `RM` \| `ZM` \| `BU` (or territory \| region \| zone)   |
| `areaCode` | string | Yes**    | Territory/area code (alphanumeric, max 30 chars). Use `area_code` as alt. |

\* At least one of `mobile`, `phone`, or `sub` is required.

\** Required for direct users (TM/RM/ZM/BU). Optional for HO (Head Office) users.

### Example JWT Payload

```json
{
  "mobile": "9876512345",
  "role": "TM",
  "areaCode": "721",
  "iat": 1707897600,
  "exp": 1707984000
}
```

## GitHub Secret (JWT Signing)

If your WhatsApp Bot signs JWTs with a secret, store it as a GitHub secret for CI/CD or future server-side verification:

### Step 1: Add GitHub Secret

1. Go to your repo: **https://github.com/Shubhashish1970/SalesScore**
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `JWT_SECRET` (or `WHATSAPP_BOT_JWT_SECRET`)
5. Value: Paste your JWT signing secret (the key your bot uses to sign tokens)
6. Click **Add secret**

### Step 2: Use in Workflow (Optional)

If you add server-side JWT verification later, reference it in `.github/workflows/deploy-firebase.yml`:

```yaml
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## Current Behavior

- **Client-side only**: The app decodes the JWT payload in the browser (no verification).
- **Token in URL**: When the user clicks the WhatsApp link, the token is passed as `?token=...`.
- **URL access**: `?mobile=...&role=TM&areaCode=721` (areaCode required for direct users).

## WhatsApp Bot Flow

1. User sends a message to the bot (e.g. "My scorecard").
2. Bot fetches user's mobile, role, and areaCode from your backend.
3. Bot creates a JWT: `{ mobile: "...", role: "TM", areaCode: "721", exp: ... }` signed with your secret.
4. Bot sends: `https://salesscore-c34f3.web.app/?token=<signed_jwt>`
5. User clicks → app decodes token → fetches scorecard for that mobile/role/areaCode.
