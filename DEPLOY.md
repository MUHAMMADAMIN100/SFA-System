# Деплой: Frontend → Vercel, Backend + PostgreSQL → Railway

## Что уже подготовлено в репозитории

**Backend (`backend/`):**
- `requirements.txt` — добавлены `gunicorn`, `psycopg2-binary`, `dj-database-url`, `whitenoise`, `python-dotenv`.
- `config/settings.py` — всё читается из переменных окружения (`SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DATABASE_URL`, CORS, медиа). SQLite — только локальный fallback.
- `Procfile` — старт: миграции → collectstatic → gunicorn.
- `runtime.txt` — Python 3.12.
- `whitenoise` — раздаёт статику Django admin / DRF.
- `.env.example` — список переменных. Локально копируется в `backend/.env`.

**Frontend (`frontend/`):**
- `vercel.json` — SPA-rewrite (React Router не ломается при refresh).
- API-адрес берётся из `VITE_API_URL` (env-переменная Vercel).

---

## Часть A. Railway (PostgreSQL + backend)

### A1. Создать проект и базу
1. Railway → **New Project** → **Deploy PostgreSQL** (или добавь Postgres в существующий проект через **+ New → Database → PostgreSQL**).

### A2. Сервис backend из GitHub
1. **+ New → GitHub Repo → `MUHAMMADAMIN100/SFA-System`**.
2. Settings сервиса → **Root Directory = `backend`** (уже сделано ✅).
3. Build/Start Railway возьмёт из `Procfile` и `requirements.txt` автоматически (Nixpacks).

### A3. Подключить базу к backend
В сервисе backend → **Variables** → **+ New Variable → Add Reference** → выбери Postgres → переменная **`DATABASE_URL`**. (Так backend получит адрес БД по внутренней сети Railway.)

### A4. Переменные окружения backend (Variables)
Добавь (Raw Editor удобнее):
```
SECRET_KEY=<длинная случайная строка>
DEBUG=False
CORS_ALLOWED_ORIGINS=https://<твой-проект>.vercel.app
CSRF_TRUSTED_ORIGINS=https://<твой-проект>.vercel.app
MEDIA_ROOT=/app/media
```
- `SECRET_KEY` сгенерируй: `python -c "import secrets; print(secrets.token_urlsafe(64))"`.
- `ALLOWED_HOSTS` указывать **не нужно** — домен Railway добавляется автоматически.
- Домен Vercel впишешь после Части B (пока можно оставить заглушку и обновить позже).

### A5. Постоянное хранилище для фото (Volume)
Иначе фото накладных удалятся при каждом редеплое!
1. Сервис backend → **Settings → Volumes → + Add Volume**.
2. **Mount path = `/app/media`** (совпадает с `MEDIA_ROOT`).

### A6. Публичный домен
Сервис backend → **Settings → Networking → Generate Domain**. Получишь вид
`https://sfa-system-production.up.railway.app`. Это база API.

### A7. Проверка
- Открой `https://<railway-домен>/api/docs/` — должен открыться Swagger.
- Миграции применяются автоматически при старте (`Procfile`).

### A8. Тестовые данные / админ (один раз)
Сервис backend → вкладка **Console** (или Railway CLI `railway run`):
```
python manage.py seed          # admin/admin123, manager1/manager123
# или свой суперпользователь:
python manage.py createsuperuser
```

---

## Часть B. Vercel (frontend)

### B1. Импорт
1. Vercel → **Add New → Project** → импортируй `MUHAMMADAMIN100/SFA-System`.
2. **Root Directory = `frontend`**.
3. Framework Preset — **Vite** (определится сам). Build `npm run build`, Output `dist`.

### B2. Переменная окружения
**Settings → Environment Variables:**
```
VITE_API_URL = https://<railway-домен>/api
```
(именно с `/api` на конце; без слэша в самом конце).

### B3. Deploy
Нажми **Deploy**. Получишь домен `https://<проект>.vercel.app`.

---

## Часть C. Связать домены (CORS)

1. Вернись в Railway → Variables backend, впиши реальный домен Vercel в
   `CORS_ALLOWED_ORIGINS` и `CSRF_TRUSTED_ORIGINS` (без слэша в конце), сохрани — Railway передеплоит.
2. Если меняешь `VITE_API_URL` на Vercel — нужен **Redeploy** фронта (env вшивается в сборку).

### Проверка
Открой домен Vercel → залогинься (`admin/admin123` после `seed`) → создай визит с фото → проверь, что фото открывается и аналитика считается.

---

## Частые проблемы
- **CORS-ошибка в консоли браузера** → домен Vercel не совпадает с `CORS_ALLOWED_ORIGINS` (лишний слэш / http вместо https).
- **400 Bad Request / DisallowedHost** → не передаётся `RAILWAY_PUBLIC_DOMAIN` (редко) — добавь домен в `ALLOWED_HOSTS` вручную.
- **Фото пропадают после редеплоя** → не примонтирован Volume на `/app/media` или `MEDIA_ROOT` не совпадает с mount path.
- **Login в Django admin даёт CSRF 403** → добавь домен Railway в `CSRF_TRUSTED_ORIGINS`.
- **502 при старте** → смотри логи: чаще всего не задан `SECRET_KEY` или БД не подключена (`DATABASE_URL`).
