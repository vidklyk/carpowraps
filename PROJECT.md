# CarPo Wraps — Project Documentation

> Документ для майбутнього розробника. Тут зібрано все про проект: що зроблено, як влаштовано, які підводні камені.

---

## Огляд

Преміум сайт компанії з автомобільного врапінгу та PPF. Повністю на чорному фоні, акцент на scroll-driven анімаціях з кадровим відео.

**Репозиторій:** `https://github.com/vidklyk/carwrap.git`  
**Робоча директорія:** `carwrap/app` (Next.js проект всередині репо)

---

## Стек

| Технологія | Версія / деталі |
|---|---|
| Next.js | App Router, `'use client'` де потрібно |
| TypeScript | Strict |
| Tailwind CSS | v3, конфіг стандартний |
| Хостинг кадрів | Cloudflare R2 (CDN через pub URL) |
| Деплой | (не налаштований — тільки dev) |

---

## Структура файлів

```
app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, bg-black, шрифти
│   │   └── page.tsx            # Головна сторінка: Header + ScrollAnimation + PPFSection
│   ├── components/
│   │   ├── Header.tsx          # Фіксований хедер, стає непрозорим після першої анімації
│   │   ├── ScrollAnimation.tsx # Перша scroll-анімація (врапінг авто)
│   │   ├── PPFScrollAnimation.tsx # Друга scroll-анімація (PPF плівка)
│   │   └── PPFSection.tsx      # Обгортка: PPFScrollAnimation + Brands + FilmOptions
│   └── lib/
│       └── constants.ts        # Всі числові константи анімацій
├── public/
│   └── brands/                 # SVG логотипи брендів (5 штук)
└── PROJECT.md                  # Цей файл
```

---

## constants.ts — ключові значення

```ts
// Перша анімація (Car Wrap)
TOTAL_FRAMES = 450          // десктоп: car_clean_001..450.jpg
MOBILE_TOTAL_FRAMES = 240   // мобіль: smooth_frame_001..240.jpg
SCROLL_HEIGHT = 3600px      // висота контейнера = кількість px скролу

// Друга анімація (PPF)
PPF_TOTAL_FRAMES = 240      // wrap_clean_001..240.jpg (одні для всіх пристроїв)
PPF_SCROLL_HEIGHT = 3600px  // збільшено до 3600px щоб текст встигали читати
PPF_MOBILE_TOTAL_FRAMES = 129 // є константа, але НЕ використовується (залишена для довідки)
```

---

## Cloudflare R2 — CDN

**Bucket:** `pub-2bbcc9d1a232445d9e20eec38de3a44e.r2.dev`

| Папка | Вміст |
|---|---|
| `frames/` | 450 кадрів десктоп врапінгу: `car_clean_001.jpg` .. `car_clean_450.jpg` |
| `frames_mobile/` | 240 кадрів мобіль врапінгу: `smooth_frame_001.jpg` .. `smooth_frame_240.jpg` |
| `wrap_frames/` | 240 кадрів PPF анімації: `wrap_clean_001.jpg` .. `wrap_clean_240.jpg` |

Кадри завантажуються через `wrangler`:
```bash
wrangler r2 object put bucket/folder/file.jpg --file=./local/file.jpg
```

**Важливо:** в кадрах `wrap_frames` є вбудований водяний знак "Veo" (AI відео генератор) у нижньому правому куті зображення. Він перекривається градієнтом знизу вгору в `PPFScrollAnimation.tsx`.

---

## ScrollAnimation.tsx — перша анімація

- **Логіка:** `position: sticky` контейнер висотою `SCROLL_HEIGHT`. Canvas малює кадр відповідно до `scrollY`.
- **Рендер:** `drawImageCover` — зображення обрізається як `object-fit: cover`
- **Мобіль:** завантажує `smooth_frame_` (240 кадрів), десктоп — `car_clean_` (450 кадрів). Визначається через `navigator.userAgent`.
- **Touch lock:** власний обробник touchstart/touchmove з lerp-згладжуванням (коефіцієнт 0.18). Блокує нативний скрол всередині зони анімації. Використовує `s0Mode` на нижній межі — дозволяє свайп вгору для виходу з секції.
- **Canvas розмір:** `window.visualViewport?.height` (а не `100vh`) — критично для iOS Safari де `100vh` включає браузерний chrome.
- **Текст:** "Premium Car Wrapping / Transform Your Ride" — з'являється після завантаження першого кадру.

---

## PPFScrollAnimation.tsx — друга анімація

- **Логіка:** аналогічна ScrollAnimation, але:
  - `drawImageContain` замість `drawImageCover` — зображення вписується повністю без обрізання (letterbox)
  - Одні кадри для всіх пристроїв (`wrap_frames/`)
  - Є intro-overlay "PPF" з blur/scale ефектом при вході в секцію
  - Є 3 текстових оверлеї прив'язані до діапазонів `scrollT`

- **Оверлеї тексту:**
  ```ts
  { from: 0.05, to: 0.36, title: 'Invisible Shield' }
  { from: 0.39, to: 0.67, title: 'Scratches Disappear' }
  { from: 0.70, to: 0.98, title: 'Protection That Lasts' }
  ```
  Десктоп: ліва панель (42% ширини). Мобіль: знизу, позиція обчислюється динамічно.

- **`imgBounds` state:** обчислює де саме рендериться зображення в CSS пікселях (враховує letterbox). Використовується для:
  1. Позиціонування мобільного тексту — рівно 10px нижче нижнього краю зображення
  2. (раніше використовувалось для Veo cover)

- **Veo watermark cover:** градієнт `h-164px` знизу вгору (`rgba(0,0,0,0.95) → transparent`) — накладається на нижній край зображення де знаходиться водяний знак.

- **Touch lock:** повністю ідентичний ScrollAnimation (з `s0Mode`).

---

## PPFSection.tsx — обгортка PPF секції

Містить три компоненти:

### 1. PPFChapter
Вступний екран висотою `100vh` з великим текстом "PPF" і blur/scale анімацією при скролі. З'являється перед анімацією.

### 2. Brands (логотипи брендів)
- **Мобіль:** безкінечна стрічка (marquee, 18s linear infinite) з mask-image для м'яких країв
- **Десктоп:** статична сітка з анімацією входу (blur + translateY)
- Бренди: XPEL, SunTek, STEK, Pure PPF, Carlas

### 3. FilmCard (варіанти плівки)
- **Мобіль:** 1 колонка, `aspect-[16/9]` — всі 3 картки входять на екран
- **Десктоп:** 3 колонки, `aspect-[9/16]` — вертикальні картки
- Hover tilt ефект тільки на десктопі (`window.matchMedia('(hover: hover)')`)
- 3 варіанти: Transparent Gloss, Transparent Matte, Any Color Any Finish — кожна з CSS-only візуалізацією текстури

---

## Header.tsx

- Фіксований, прозорий поверх першої анімації
- Стає `rgba(0,0,0,0.85)` + `backdrop-blur` після того як `scrollY >= SCROLL_HEIGHT - innerHeight` (тобто після виходу з першої анімації)
- Мобільний бургер-менеджер з анімацією

---

## Відомі нюанси та підводні камені

### iOS Safari
- `100vh` ≠ реальна висота вьюпорту (включає browser chrome). **Завжди використовувати `window.visualViewport?.height`** для canvas.
- Canvas контейнер висота встановлюється через JS: `container.style.height = h + 'px'`
- Слухати `window.visualViewport.addEventListener('resize', ...)` окремо від `window.resize`

### Touch lock
- `{ passive: false }` на touchstart/touchmove — обов'язково для `e.preventDefault()` всередині зони
- `s0Mode`: на нижній межі (s≤1) НЕ робити preventDefault в touchStart — спочатку визначити напрям свайпу в touchMove. Це дозволяє виходити вгору з секції.
- ScrollY синхронізується на **кожному** RAF кадрі lerp-анімації (не тільки в кінці) — інакше буде стрибок при відпусканні пальця

### Canvas DPI
- `canvas.width = Math.round(offsetWidth * devicePixelRatio)` — фізичні пікселі
- Але для позиціонування CSS оверлеїв — використовувати `canvas.offsetWidth` (CSS пікселі)
- `imgBounds` завжди в CSS пікселях

### PPF кадри
- `drawImageContain` (не cover) — щоб весь кадр був видимий
- Кадри landscape (~1920×1080), на телефоні показуються з чорними смугами зверху та знизу (letterbox)
- Veo знаходиться в нижньому правому куті відеокадру

### Оверлеї тексту в PPF
- Діапазони `from`/`to` не повинні перекриватись — інакше два тексти покажуться одночасно (баг)
- Між діапазонами потрібен зазор мінімум 0.02

---

## Команди

```bash
# Dev сервер
cd carwrap/app
npm run dev

# Build
npm run build

# Завантажити кадри на R2
wrangler r2 object put <bucket>/<path> --file=<local>
```

---

## Що ще НЕ зроблено (заплановано)

- Секції: Our Work, Services, Car Configurator, Contact (є в навігації, але сторінок немає)
- Деплой (Vercel / Cloudflare Pages)
- SEO метадані
- Форма зворотного зв'язку

---

*Оновлено: травень 2026*
