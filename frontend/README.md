# Frontend - Slicing Structure

**SiDoku Frontend React.js Slicing**

---

## 📁 Folder Structure

```
frontend/
├── src/
│   ├── assets/           # Folder untuk images, icons, fonts
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components
│   ├── layouts/          # Layout wrapper components
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css         # Tailwind CSS
│
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .gitignore
```

---

## 🚀 Setup

```bash
npm install
npm run dev
```

---

## 📝 Folder Guide

| Folder | Purpose | Content |
|--------|---------|---------|
| `src/assets/` | Static files | images, icons, fonts |
| `src/components/` | Reusable components | Button, Card, Header, etc |
| `src/pages/` | Page components | Home, Products, Dashboard, etc |
| `src/layouts/` | Layout wrappers | MainLayout, AuthLayout, etc |

---

## 💡 Development

1. Buat components di `src/components/`
2. Buat pages di `src/pages/`
3. Buat layouts di `src/layouts/`
4. Import assets dari `src/assets/`
5. Update `App.jsx` dengan routing dan struktur

---

## 🎨 Styling

Gunakan Tailwind CSS di `index.css` yang sudah dikonfigurasi.

```jsx
<div className="bg-blue-600 text-white px-4 py-2 rounded">
  Styled with Tailwind
</div>
```

---

**Slicing Only - Ready for Development** 🚀
