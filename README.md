# PHP CRUD

Простой учебный проект: frontend на React (Vite), backend на PHP (REST API), база данных MySQL.

## Структура

- frontend — клиентская часть
- api — PHP-эндпоинты
- db_trade_crud.sql — дамп структуры и тестовых данных БД

## Что нужно для запуска

- Node.js 18+
- npm
- PHP 8+
- MySQL 8+

## 1) Настройка переменных окружения

Скопируйте примеры env-файлов:

- из api/.env.example в api/.env
- из frontend/.env.example в frontend/.env

Проверьте значения в api/.env:

- DB_HOST
- DB_USER
- DB_PASS
- DB_NAME
- CORS_ALLOW_ORIGIN

Проверьте значение в frontend/.env:

- VITE_API_BASE_URL

Важно: VITE_API_BASE_URL должен указывать на корень API, например:

- http://localhost/api

## 2) Создание базы данных

Создайте БД с именем TradeDB и импортируйте файл db_trade_crud.sql.

## 3) Запуск API

(Apache/OpenServer/XAMPP):

- Папка api должна открываться по URL вида http://localhost/api
- Проверьте запрос в браузере:
  http://localhost/api/departments.php

## 4) Запуск frontend

1. Перейдите в папку frontend
2. Установите зависимости:
   npm install
3. Запустите dev-сервер:
   npm run dev
4. Откройте URL из консоли (обычно http://localhost:5173)

## 5) Проверка

- Откройте разделы Отделы, Товары, Продажи, Отчет
- Убедитесь, что CRUD-операции выполняются и данные приходят из API
