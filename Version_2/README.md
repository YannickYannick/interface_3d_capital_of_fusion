# Version 2 - React/TypeScript avec Three.js

Projet React/TypeScript avec animations 3D interactives utilisant Three.js, React Router et Framer Motion.

## 🚀 Installation

```bash
npm install
```

## 🛠️ Développement

```bash
npm run dev
# ou
npm start
```

Ouvre [http://localhost:5173](http://localhost:5173) dans ton navigateur.

## 📦 Build pour production

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`.

## 🏗️ Structure

```
Version_2/
├── src/
│   ├── components/
│   │   ├── Scene3D.tsx       # Composant Three.js avec bulles
│   │   ├── HeroText.tsx       # Texte "CApital"
│   │   └── PageTransition.tsx # Wrapper pour transitions
│   ├── pages/
│   │   ├── Home.tsx          # Page principale avec bulles
│   │   ├── About.tsx         # Page à propos
│   │   └── Projects.tsx      # Page projets
│   ├── lib/
│   │   └── physics.ts        # Constantes et logique physique
│   ├── App.tsx               # Router principal
│   ├── main.tsx              # Point d'entrée
│   └── index.css             # Styles globaux
```

## ✨ Fonctionnalités

- **Bulles 3D interactives** : Physique avec collisions, répulsion souris, chemins carrés
- **Multi-pages** : React Router pour navigation
- **Transitions animées** : Framer Motion pour transitions entre pages
- **TypeScript** : Typage complet
- **Tailwind CSS** : Styles utilitaires

## 🎮 Interactions

- **Clic sur bulle** : Zoom de la caméra vers la bulle
- **Double-clic** : Reset de la caméra
- **Souris** : Répulsion des bulles
- **Navigation** : Menu en haut pour changer de page

