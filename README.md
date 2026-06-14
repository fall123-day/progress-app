# 进度追踪

项目进度管理工具 - 追踪你的每一个目标。

## 功能

- 📊 进度条显示，支持滑块和数字输入调节百分比
- 🎨 8种颜色标记
- 🔍 搜索和筛选
- 🌙 6种主题（亮色/暖色/冷色/薄荷/玫瑰/暗色）
- 📱 PWA 支持，可添加到主屏幕
- 💾 数据本地持久化

## 使用

### 浏览器预览
直接打开 `www/index.html`

### 添加到主屏幕（PWA）
1. 用手机浏览器打开页面
2. 点击"安装"按钮或使用浏览器菜单中的"添加到主屏幕"

### 构建 Android APK
```bash
npm install
npx cap add android
npx cap sync
npx cap open android
```
然后在 Android Studio 中 Build → Build APK

## 技术栈

- HTML + CSS + JavaScript
- Capacitor (跨平台打包)
- PWA (渐进式 Web 应用)
