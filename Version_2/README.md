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
│   │   ├── Scene3D.tsx              # Composant Three.js avec bulles
│   │   ├── YouTubeBackground.tsx   # Vidéo YouTube avec contrôles
│   │   ├── VideoBackground.tsx     # Vidéo locale MP4
│   │   ├── PlanetsOptionsPanel.tsx # Panneau de contrôle avec toggles
│   │   ├── Logo.tsx                # Logo central
│   │   └── PageTransition.tsx       # Wrapper pour transitions
│   ├── contexts/
│   │   ├── YouTubeVisibilityContext.tsx # État partagé YouTube
│   │   └── PlanetsOptionsContext.tsx   # État partagé des options
│   ├── pages/
│   │   ├── Home.tsx          # Page principale avec bulles
│   │   ├── About.tsx         # Page à propos
│   │   └── Projects.tsx      # Page projets
│   ├── lib/
│   │   ├── physics.ts        # Constantes et logique physique
│   │   └── content.ts        # Contenu textuel
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
- **Vidéo YouTube en arrière-plan** : Avec cycle automatique et filtres
- **Panneau de contrôle** : Boutons toggle pour personnaliser l'expérience

## 🎮 Interactions

- **Clic sur bulle** : Zoom de la caméra vers la bulle
- **Double-clic** : Reset de la caméra
- **Souris** : Répulsion des bulles
- **Navigation** : Menu en haut pour changer de page

## 🎛️ Panneau de contrôle (page `/planets`)

Sur la page des planètes, un panneau de contrôle apparaît en bas à gauche avec 3 boutons toggle :

- **Noir & Blanc** : Active/désactive le filtre grayscale sur la vidéo YouTube
- **Mélange Vidéos** : Active/désactive le mélange entre la vidéo YouTube et la vidéo background locale
- **Trajectoires** : Active/désactive l'affichage des trajectoires des planètes (plus visibles quand activé)


