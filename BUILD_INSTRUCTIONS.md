
# Как собрать EXE файл (FoxFocus Tracker)

Поскольку ваше приложение написано на React, мы используем **Electron** для создания `.exe` файла. Это стандарт индустрии.

### Шаг 1: Установка зависимостей

Откройте терминал в папке проекта и выполните следующую команду, чтобы установить инструменты Electron:

```bash
npm install --save-dev electron electron-builder concurrently cross-env wait-on
```

### Шаг 2: Обновление package.json

Откройте ваш файл `package.json` и внесите следующие изменения:

1. Добавьте поле `"main"`:
```json
"main": "electron/main.js",
```

2. Обновите секцию `"scripts"` (добавьте эти строки):
```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "electron:dev": "concurrently -k \"cross-env BROWSER=none npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
  "electron:build": "npm run build && electron-builder"
},
```
*Примечание: Если ваш Vite запускается не на порту 5173, измените цифру в команде выше.*

3. Добавьте конфигурацию сборки `"build"` (в корне JSON объекта):
```json
"build": {
  "appId": "com.foxfocus.tracker",
  "productName": "FoxFocus Tracker",
  "copyright": "Copyright © 2024",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "electron/**/*"
  ],
  "win": {
    "target": "nsis",
    "icon": "public/icon.ico" 
  }
}
```

### Шаг 3: Настройка Vite

Убедитесь, что в вашем файле `vite.config.ts` (или `.js`) установлен базовый путь, иначе белый экран при запуске EXE:

```ts
export default defineConfig({
  base: './', // ОЧЕНЬ ВАЖНО для Electron
  plugins: [react()],
  // ... остальной конфиг
})
```

### Шаг 4: Запуск

**Для разработки (запуск окна Electron + React):**
```bash
npm run electron:dev
```

**Для создания EXE файла:**
```bash
npm run electron:build
```

После завершения, ваш `.exe` файл будет находиться в папке `release/`.

### Примечание про Python
Если вы категорически хотите использовать Python для запуска (вместо Electron), вам нужно:
1. Выполнить `npm run build`.
2. Создать Python скрипт, использующий библиотеку `pywebview`, который открывает файл `dist/index.html`.
3. Скомпилировать Python скрипт через `pyinstaller`.
Однако, Electron лучше поддерживает работу с микрофоном "из коробки".
