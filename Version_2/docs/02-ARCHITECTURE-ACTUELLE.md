# Architecture Actuelle - Version 2

## 📁 Structure des fichiers

```
Version_2/
├── public/
│   ├── LOGO_CAPITAL_OF_FUSION.png
│   ├── background.png
│   ├── background-video.mp4
│   └── models/
│       └── mon-modele.glb
│
├── src/
│   ├── components/
│   │   ├── Scene3D.tsx              # Scène 3D principale (635 lignes)
│   │   ├── Logo.tsx                 # Logo central
│   │   ├── VideoBackground.tsx      # Vidéo locale MP4
│   │   ├── YouTubeBackground.tsx    # Vidéo YouTube avec cycle
│   │   └── PlanetsOptionsPanel.tsx   # Panneau de contrôle avec toggles
│   │
│   ├── contexts/
│   │   ├── YouTubeVisibilityContext.tsx  # État partagé YouTube
│   │   └── PlanetsOptionsContext.tsx     # État partagé des options (grayscale, blend, orbits)
│   │
│   ├── lib/
│   │   ├── physics.ts           # Config orbites + physique
│   │   ├── content.ts           # Contenu textuel (à remplacer par API)
│   │   └── sphereNames.ts       # Noms des sphères
│   │
│   ├── pages/
│   │   ├── Landing.tsx          # Page d'accueil
│   │   └── Home.tsx             # Page planètes (/planets)
│   │
│   ├── App.tsx                  # Routeur + layout global
│   └── index.css                # Styles globaux
│
└── docs/                        # Cette documentation
```

## 🎬 Couches de rendu (z-index)

```
┌────────────────────────────────────────────┐
│  z-index: 10000  │  Logo Capital of Fusion │  ← Toujours visible
├────────────────────────────────────────────┤
│  z-index: 9999   │  Canvas Three.js        │  ← Planètes 3D
├────────────────────────────────────────────┤
│  z-index: 50     │  Panneau options        │  ← UI (bas gauche)
├────────────────────────────────────────────┤
│  z-index: 50     │  Bouton mute            │  ← UI (bas droit)
├────────────────────────────────────────────┤
│  z-index: 0      │  YouTube (cyclique)     │  ← Apparaît/disparaît
├────────────────────────────────────────────┤
│  z-index: -2     │  background-video.mp4   │  ← Fond par défaut
└────────────────────────────────────────────┘
```

## 🔄 Flux de données

```
                    ┌─────────────────────┐
                    │  YouTubeVisibility   │
                    │     Context          │
                    └──────────┬───────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ YouTubeBackground│  │     Home.tsx    │  │ VideoBackground │
│  setIsVisible()  │  │  isYouTubeVisible│ │  visibility     │
└─────────────────┘  └─────────────────┘  └─────────────────┘

                    ┌─────────────────────┐
                    │  PlanetsOptions     │
                    │     Context         │
                    └──────────┬───────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ YouTubeBackground│  │     Home.tsx    │  │    Scene3D      │
│  grayscaleEnabled│  │ videoBlendEnabled│ │  orbitsVisible  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 📍 Routes

| Route | Composant | Description |
|-------|-----------|-------------|
| `/` | `Landing.tsx` | Page d'accueil avec bouton "Enter" |
| `/planets` | `Home.tsx` | Animation 3D des planètes |

## 🎯 Composants clés

### Scene3D.tsx
- Gère toute la scène Three.js (vanilla, pas React Three Fiber)
- Crée les différents types de sphères : `wire`, `glass`, `chrome`, `network`, `star`, `glb`
- Gère la physique : orbites rectangulaires, répulsion souris, collisions
- Gère les interactions : clic pour zoom, double-clic pour reset

### YouTubeBackground.tsx
- Vidéo YouTube en arrière-plan
- Cycle automatique sur `/planets` : 3s visible, 5s caché
- Filtre noir et blanc sur `/planets` (toggle via contexte)
- Bouton mute global

### PlanetsOptionsPanel.tsx
- Panneau de contrôle avec 3 boutons toggle
- Visible uniquement sur `/planets` et `/planets1`
- Contrôle les options via `PlanetsOptionsContext`

### PlanetsOptionsContext.tsx
- Gère l'état des 3 options :
  - `grayscaleEnabled` : Filtre noir et blanc sur YouTube
  - `videoBlendEnabled` : Mélange entre YouTube et background video
  - `orbitsVisible` : Visibilité des trajectoires des planètes

### physics.ts
- Configuration des 8 orbites (positions, vitesses, phases)
- Constantes physiques (forces, rayons)
- Fonction `getSquarePosition()` pour trajectoires rectangulaires

