# AWS Deployment — Code Changes Required

Your current code is set up for **Vercel (frontend) + Railway (backend)**. To move to **S3/CloudFront (frontend) + EC2 (backend) + API Gateway**, these code changes are needed.

---

## Proposed Changes

### Backend (Express.js on EC2)

---

#### [MODIFY] [app.js](file:///d:/Chaitrali/CureLink3/backend/app.js)

**1. Update CORS origins** — Replace Vercel domains with your CloudFront + S3 domains:

```diff
 const allowedOrigins = [
   "http://localhost:3000",
-  "https://cure-link-1.vercel.app"
+  "https://cure-link-1.vercel.app",           // keep for now if needed
+  process.env.CLOUDFRONT_URL,                  // e.g. https://d1234abcdef.cloudfront.net
+  process.env.S3_WEBSITE_URL                   // e.g. http://curelink-frontend.s3-website.ap-south-1.amazonaws.com
 ];
```

Also update the dynamic check to accept CloudFront domains:
```diff
-    if (origin.endsWith(".vercel.app")) {
+    if (origin.endsWith(".vercel.app") || origin.endsWith(".cloudfront.net") || origin.endsWith(".amazonaws.com")) {
```

**2. Add a health check endpoint** — Required for EC2 monitoring, CloudWatch, and API Gateway:

```js
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
```

---

#### [MODIFY] [server.js](file:///d:/Chaitrali/CureLink3/backend/server.js)

Make the port default to `5000` if `PORT` env var is missing (EC2 doesn't auto-set PORT like Railway does):

```diff
-app.listen(process.env.PORT, () => {
-  console.log(`Server running on port ${process.env.PORT}`)
+const PORT = process.env.PORT || 5000;
+app.listen(PORT, () => {
+  console.log(`Server running on port ${PORT}`)
```

---

#### [MODIFY] [.env](file:///d:/Chaitrali/CureLink3/backend/.env)

Add new environment variables (you'll fill with actual values after creating AWS resources):

```diff
 PORT=5000
 MONGO_URI=mongodb+srv://TEST:pass1@cluster0.1wzsqew.mongodb.net/
 JWT_SECRET=5b87ea8f...
+CLOUDFRONT_URL=https://YOUR_CLOUDFRONT_DISTRIBUTION.cloudfront.net
+S3_WEBSITE_URL=http://YOUR_BUCKET.s3-website.ap-south-1.amazonaws.com
+NODE_ENV=production
```

> [!IMPORTANT]
> The `MONGO_URI` and `JWT_SECRET` will be set as environment variables directly on EC2 (not committed to git). Your [.env](file:///d:/Chaitrali/CureLink3/backend/.env) file should NOT be pushed to a public repo.

---

### Frontend (React on S3 + CloudFront)

---

#### [MODIFY] [.env](file:///d:/Chaitrali/CureLink3/frontend/.env)

Change API URL from Railway to your API Gateway or EC2 endpoint:

```diff
-VITE_API_URL=https://curelink-1-production.up.railway.app
+VITE_API_URL=https://YOUR_API_GATEWAY_ID.execute-api.ap-south-1.amazonaws.com/prod
```

> [!NOTE]
> If using API Gateway ↔ EC2 proxy: use the API Gateway URL above.
> If hitting EC2 directly: use `http://EC2_PUBLIC_IP:5000` (not recommended for production — no HTTPS).

---

#### [MODIFY] [vite.config.js](file:///d:/Chaitrali/CureLink3/frontend/vite.config.js)

No code change needed, but you **must run `npm run build`** to generate the `dist/` folder. The contents of `dist/` are what you upload to S3.

---

### New Files

---

#### [NEW] [ecosystem.config.cjs](file:///d:/Chaitrali/CureLink3/backend/ecosystem.config.cjs)

PM2 process manager config — keeps your backend alive on EC2 even after SSH disconnect or crash:

```js
module.exports = {
  apps: [{
    name: "curelink-backend",
    script: "server.js",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    }
  }]
};
```

---

## Summary of All Code Changes

| File | Change | Why |
|------|--------|-----|
| [backend/app.js](file:///d:/Chaitrali/CureLink3/backend/app.js) | Add CloudFront/S3 to CORS origins + health check endpoint | CloudFront domain replaces Vercel domain |
| [backend/server.js](file:///d:/Chaitrali/CureLink3/backend/server.js) | Default PORT fallback to 5000 | EC2 doesn't auto-inject PORT |
| [backend/.env](file:///d:/Chaitrali/CureLink3/backend/.env) | Add `CLOUDFRONT_URL`, `S3_WEBSITE_URL`, `NODE_ENV` | New AWS domain config |
| [frontend/.env](file:///d:/Chaitrali/CureLink3/frontend/.env) | Change `VITE_API_URL` to API Gateway URL | Backend is on EC2 now, not Railway |
| `backend/ecosystem.config.cjs` | **NEW** — PM2 config | Keep backend running on EC2 |

> [!CAUTION]
> **Cookie auth across domains**: You're using `httpOnly` + `secure` + `sameSite: "none"` cookies. This works when both frontend (CloudFront) and backend (API Gateway) use **HTTPS**. If you skip API Gateway and expose EC2 directly over HTTP, cookies will be blocked by browsers. **API Gateway with HTTPS is essential for your auth to work.**

---

## Things That DON'T Need Code Changes

| Component | Reason |
|-----------|--------|
| **MongoDB Atlas** | Already using Atlas (`mongodb+srv://`). Same URI works from EC2 — just whitelist EC2's IP in Atlas Network Access |
| **Firebase auth** | Firebase config is client-side, works from any domain. Just add your CloudFront domain to Firebase Console → Authorized Domains |
| **Axios instance** | Already reads from `VITE_API_URL` env var — no code change needed |
| **JWT / bcrypt logic** | No change needed |
| **All controllers & models** | No change needed |

---

## Verification Plan

### Manual Verification (done by you after deployment)

1. **Build frontend**: Run `cd frontend && npm run build` — verify `dist/` folder is created with [index.html](file:///d:/Chaitrali/CureLink3/frontend/index.html)
2. **Test health check**: After deploying backend to EC2, run `curl http://EC2_IP:5000/health` — should return `{"status":"ok"}`
3. **Test CORS**: Open frontend on CloudFront URL → login → check browser console for CORS errors
4. **Test cookie auth**: Login as patient → navigate to dashboard → refresh page → should stay logged in (cookie persists)
5. **Test API Gateway**: `curl https://YOUR_API_GATEWAY.execute-api.../prod/api/auth/login` — should proxy to EC2

> [!NOTE]
> There are no existing automated tests in this project. The verification is all manual — test each user flow (patient login, doctor dashboard, admin panel) after deployment.
