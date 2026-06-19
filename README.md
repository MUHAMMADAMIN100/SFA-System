# SFA — система контроля торговых представителей (молочная дистрибуция)

MVP Sales Force Automation: менеджеры с телефона оформляют отчёты по визитам
в магазины (отгрузка + просрочка + фото накладной), администратор с ПК ведёт
справочники и смотрит аналитику. Без 1С и GPS — факт визита подтверждается
временем отправки отчёта и фото подписанной бумажной накладной.

## Стек

- **Backend:** Python · Django 5 · Django REST Framework · SimpleJWT · Pillow · openpyxl · django-cors-headers. БД — SQLite (dev).
- **Frontend:** Next.js 15 (App Router) · TypeScript (strict) · Feature-Sliced Design · SCSS Modules · axios · browser-image-compression.

Один Next.js-проект обслуживает и интерфейс менеджера (мобильный веб), и
админ-панель — разделение по роутам и ролям.

## Структура

```
backend/    Django: config/ + apps/{users,catalog,visits}
frontend/   Next.js (FSD): src/{app,entities,features,widgets,shared}
```

## Запуск

### 1. Backend (порт 8000)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows (или: source .venv/Scripts/activate)
pip install -r requirements.txt
python manage.py migrate
python manage.py seed             # минимальные тестовые данные (помечены «seed»)
python manage.py runserver 127.0.0.1:8000
```

### 2. Frontend (порт 3000)

```bash
cd frontend
npm install
npm run dev                       # или: npm run build && npm run start
```

Адрес API задаётся в `frontend/.env.local` (`NEXT_PUBLIC_API_URL`, по умолчанию
`http://localhost:8000/api`). Откройте http://localhost:3000.

## Тестовые учётные записи (после `seed`)

| Роль          | Логин      | Пароль       |
|---------------|------------|--------------|
| Администратор | `admin`    | `admin123`   |
| Менеджер      | `manager1` | `manager123` |

`admin` также является суперпользователем Django (`/admin/`).

## Тесты

### Backend — pytest (28 тестов: auth, визиты, роли, аналитика, экспорт)

```bash
cd backend
.venv\Scripts\python.exe -m pytest          # отдельная тестовая БД, dev-данные не трогаются
```

Покрыто: логин (access/refresh/role), создание визита через multipart с фото и
несколькими `items` → 201 и менеджер из токена (подмена в теле игнорируется),
роли (менеджер → 403 на admin-эндпоинты, админ → 200), аналитика менеджеров и
товаров с проверкой `expired_percent` и кейса `shipped_total = 0` (процент 0 без
падения), фильтр по датам, Excel-экспорт (content-type, разбор openpyxl, строки).

Дополнительно (без сервера, через APIClient): `python scripts/verify_api.py`.

### Frontend — типы / сборка / линт

```bash
cd frontend
npx tsc --noEmit      # 0 ошибок типов
npm run lint          # ESLint без ошибок
npm run build         # next build без ошибок
```

### E2E — Playwright (сквозной сценарий против живых серверов)

```bash
# 1) поднять бэк (:8000) и фронт (:3000), затем:
cd backend && .venv\Scripts\python.exe manage.py seed_e2e   # детерминированные фикстуры
cd frontend && npx playwright install chromium              # один раз
npx playwright test                                         # скриншоты → frontend/e2e/screenshots/
```

Сценарий: вход менеджера → форма → отправка визита с фото (подтверждается
**реальный `POST /api/visits/` = 201** через `waitForResponse`, а не только тост)
→ вход админа → визит в ленте → модалка фото → KPI и аналитика с числами,
соответствующими визиту → скачивание Excel; отдельно — редирект менеджера с
`/admin`. Команда `seed_e2e` сбрасывает визиты e2e-менеджера, поэтому аналитику
можно проверять детерминированно на каждом прогоне.

## Основные эндпоинты

| Метод/путь | Доступ | Назначение |
|---|---|---|
| `POST /api/auth/login/` | все | `{access, refresh, role}` |
| `POST /api/auth/refresh/` | все | обновление токена |
| `GET/POST/PATCH/DELETE /api/stores/` | чтение — все, запись — admin | магазины |
| `GET/POST/PATCH/DELETE /api/products/` | чтение — все, запись — admin | товары (`?is_active=true`) |
| `GET/POST/PATCH/DELETE /api/managers/` | admin | менеджеры |
| `POST /api/visits/` | manager | создание визита (multipart) |
| `GET /api/visits/` | admin | лента (фильтры `date_from/date_to/manager/store`, пагинация) |
| `GET /api/visits/my/` | manager | свои визиты |
| `GET /api/analytics/managers/` | admin | KPI менеджеров за период |
| `GET /api/analytics/products/` | admin | аналитика по товарам за период |
| `GET /api/export/visits/` | admin | выгрузка визитов в xlsx |

## Заметки по реализации

- Фото накладной сжимается **на клиенте** (`browser-image-compression`, до ~2 МБ)
  перед отправкой; камера — через `<input capture="environment">`.
- Строки товаров визита передаются вложенным сериализатором; в multipart поле
  `items` приходит JSON-строкой и разбирается на бэкенде.
- Все агрегации аналитики считаются через Django ORM (`annotate`/`aggregate`).
- JWT-токены и роль хранятся в cookie: их читают и axios (клиент), и middleware
  (защита роутов на сервере). Для продакшена стоит перейти на httpOnly-cookie.
