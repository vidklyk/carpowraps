# CarpoWraps — інструкція по проекту

Документ для розробника, який підтримуватиме або інтегруватиме проект.

## Стек

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS**
- Хостинг — **Vercel**
- Кадри скрол-анімацій — **Cloudflare R2** (віддаються з CDN)
- Іконки соцмереж — `react-icons`

## Локальний запуск

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # продакшн-збірка
npm start        # запуск зібраної версії
```

## Деплой (Vercel)

1. Підключіть репозиторій до Vercel → **New Project → Import**.
2. Налаштування (визначаються автоматично):
   - Framework Preset: **Next.js**
   - Root Directory: **`./`** (проект лежить у корені репозиторію)
   - Production Branch: **`main`**
3. Змінні середовища для **відображення** сайту **не потрібні**.

---

## ⚠️ Ассети анімацій — Cloudflare R2 (важливо)

Кадри покадрових scroll-анімацій (canvas) зберігаються **не в репозиторії, а на Cloudflare R2** і віддаються за публічними посиланнями. У git їх немає — це тисячі JPEG.

Базовий URL сховища заданий константою `CDN`:

```ts
const CDN = 'https://pub-2bbcc9d1a232445d9e20eec38de3a44e.r2.dev';
```

Зараз вона **продубльована в 7 файлах** — у кожному компоненті зі своєю анімацією:

| Файл | Папки в R2 |
|---|---|
| `src/components/ScrollAnimation.tsx`     | `frames/` + `frames_mobile/` (головний екран) |
| `src/components/PPFScrollAnimation.tsx`  | `wrap_frames/` (+ `wrap_frames_mobile/` зараз не використовується) |
| `src/components/TintSection.tsx`         | `frames_tint/` + `frames_tint_mobile/` |
| `src/components/VinylSection.tsx`        | `frames_vinyl/` + `frames_vinyl_mobile/` |
| `src/components/CeramicSection.tsx`      | `frames_ceramic/` + `frames_ceramic_mobile/` |
| `src/components/StickersSection.tsx`     | `frames_stickers/` + `frames_stickers_mobile/` |

Усього в бакеті **12 папок** (для кожної послуги — десктоп і мобайл). Кількість кадрів і множники прокрутки задані у `src/lib/constants.ts`.

### Як перенести ассети собі

1. Скопіюйте **весь бакет як є** (усі 12 папок, ті самі імена файлів) у своє сховище — Cloudflare R2 / AWS S3 / будь-який CDN або папку на хостингу.
2. Замініть значення `CDN` на ваш базовий URL у всіх 7 файлах (див. таблицю).
   - **Порада:** винесіть `CDN` в одну константу у `src/lib/constants.ts` та імпортуйте в компоненти — тоді міняти потрібно буде в одному місці.
3. Імена папок і файлів змінювати не потрібно — достатньо змінити домен у `CDN`.

Для **відображення** кадрів токени/ключі **не потрібні** (посилання публічні). Токени Cloudflare потрібні лише щоб **завантажувати** кадри в бакет (через `wrangler`).

---

## Де змінювати контент

| Що | Файл |
|---|---|
| Телефон, email, адреса, гасло, соцмережі, посилання футера | `src/components/Footer.tsx` (константи вгорі файлу) |
| Фото в блоці «Our Work» (зараз заглушки з Unsplash) | `src/components/GallerySection.tsx` (масив `GALLERY`) |
| Тексти послуг, FAQ, відгуки | відповідні компоненти у `src/components/` |
| К-сть кадрів / висота прокрутки анімацій | `src/lib/constants.ts` |

## Меню «Services»

Пункти випадаючого меню ведуть на сторінки послуг (`Header.tsx`):

```
/services/paint-protection
/services/window-tinting
/services/vinyl-wrap
/services/ceramic-coating
/services/custom-stickers
```

Самі сторінки поки **не створені** — додайте їх у `src/app/services/<slug>/page.tsx`.

## Нотатки по формах

- **Форма «Request a Quote»** (`ContactSection.tsx`) і **«Job Application»** (`Footer.tsx`) зараз працюють на фронті: валідація + екран успіху, **без бекенду**. Підключіть надсилання (email / CRM / Telegram) за потреби.
- Форма заявки вміє приймати зображення із зовнішнього конфігуратора — через подію `window` `carwrap:order-image` або ключ `sessionStorage`. Це задел на майбутній конфігуратор.
