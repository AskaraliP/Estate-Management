# Deploy the Django API to Vercel

The frontend and API are separate Vercel projects. Keep the existing Render
service running until the Vercel API is deployed and verified.

## Create the API project

1. Import this repository into Vercel as a new project.
2. Set **Root Directory** to `backend` and enable **Include source files outside
   the Root Directory** only if Vercel requests it.
3. Vercel detects `manage.py` and uses `backend.wsgi.application`.
4. Configure the environment variables below for Production, then deploy.

| Variable | Value |
| --- | --- |
| `DJANGO_SECRET_KEY` | A new, strong secret value |
| `DJANGO_DEBUG` | `false` |
| `DATABASE_URL` | External PostgreSQL connection URL for a persistent database |
| `CORS_ALLOWED_ORIGINS` | `https://estate-management-six.vercel.app` |
| `RAZORPAY_KEY_ID` | Existing test key ID, if payment testing is needed |
| `RAZORPAY_KEY_SECRET` | Matching test key secret, if payment testing is needed |

Do not use SQLite for the deployed API: Vercel Functions do not provide
persistent local storage. If reusing Render PostgreSQL, use its external
connection URL, not Render's internal-only URL. Keep database credentials
private.

Apply database migrations to the persistent database before switching the
frontend to the new API. Set `DATABASE_URL` in the environment where you run
this command to the same external PostgreSQL URL configured in Vercel. Do not
run the migration without it, or Django will use the local SQLite database.

```powershell
cd backend
$env:DATABASE_URL = "<external PostgreSQL connection URL>"
python manage.py migrate --noinput
```

## Connect the frontend

After the API project deploys, set `VITE_API_BASE_URL` in the existing frontend
Vercel project to the API's production URL followed by `/api/`, for example:

```text
https://your-api-project.vercel.app/api/
```

Redeploy the frontend after changing the variable. Verify login and dashboard
data before disabling the Render API.
