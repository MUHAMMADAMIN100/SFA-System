# SFA Frontend (React + Vite)

Единое SPA: мобильный интерфейс менеджера и десктоп-панель администратора.
Стек: **React 18 + TypeScript (strict) + Vite**, роутинг — **react-router-dom v6**,
архитектура **Feature-Sliced Design**, стили — **SCSS Modules**, графики —
**recharts**, анимации — **framer-motion**, запросы — **axios** (JWT-интерсептор),
сжатие фото — **browser-image-compression**.

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
```

Адрес API — в `import.meta.env.VITE_API_URL` (см. `.env`, по умолчанию
`http://localhost:8000/api`). Бэкенд должен быть запущен на :8000.

## Скрипты

| Команда | Назначение |
|---|---|
| `npm run dev` | dev-сервер Vite (http://localhost:5173) |
| `npm run build` | `tsc --noEmit && vite build` → `dist/` |
| `npm run preview` | предпросмотр прод-сборки (http://localhost:5173) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npx playwright test` | сквозные e2e (Playwright), скриншоты → `e2e/screenshots/` |

E2e перед запуском сами сбрасывают тестовые данные через
`backend/manage.py seed_e2e` (Playwright `globalSetup`), поэтому достаточно
поднять оба сервера и выполнить `npx playwright test`.

## Структура (FSD)

```
src/
  app/        router (react-router), layouts, провайдеры, глобальные стили
  pages/      экраны под роуты (login, manager-visit, admin-dashboard, …)
  widgets/    admin-sidebar, analytics-dashboard, таблицы лент/KPI
  features/   auth (login + RequireRole), create-visit, visit-photo, analytics-filters
  entities/   visit, store, product, user, analytics — типы + api
  shared/     api (axios + JWT refresh), ui (ui-kit), lib, config, styles
```
