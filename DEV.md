# CarPo Wraps — Premium Car Wrap Website

Це Next.js сайт для компанії з автомобільного врапінгу та PPF (Paint Protection Film).

**Повна документація проекту:** читай `PROJECT.md` — там все: структура, компоненти, R2 CDN, підводні камені.

## Коротко про проект

- Головна сторінка: `src/app/page.tsx` → Header + ScrollAnimation + PPFSection
- Дві scroll-driven canvas-анімації з відеокадрів (JPEG sequences)
- Кадри хостяться на Cloudflare R2: `pub-2bbcc9d1a232445d9e20eec38de3a44e.r2.dev`
- Всі числові константи анімацій: `src/lib/constants.ts`
- GitHub: `https://github.com/vidklyk/carwrap.git`

## Запуск

```bash
# Робоча директорія: carwrap/carwrap/ (корінь Next.js проекту)
npm install
npm run dev   # http://localhost:3000
```

## Ключові файли

| Файл | Що робить |
|---|---|
| `src/components/ScrollAnimation.tsx` | Перша анімація — врапінг авто, scroll → canvas кадри |
| `src/components/PPFScrollAnimation.tsx` | Друга анімація — PPF плівка, scroll → canvas кадри |
| `src/components/PPFSection.tsx` | Секція PPF: анімація + логотипи брендів + варіанти плівки |
| `src/components/Header.tsx` | Фіксований хедер, прозорий над анімацією |
| `src/lib/constants.ts` | TOTAL_FRAMES, SCROLL_HEIGHT, PPF_* константи |
