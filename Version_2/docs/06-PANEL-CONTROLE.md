# Panneau de Contrôle - Options Interactives

## 📋 Vue d'ensemble

Le panneau de contrôle permet aux utilisateurs de personnaliser leur expérience sur la page `/planets` avec trois options toggle.

## 🎛️ Options disponibles

### 1. Noir & Blanc
- **Fichier concerné** : `src/components/YouTubeBackground.tsx`
- **Fonctionnalité** : Active/désactive le filtre grayscale sur la vidéo YouTube
- **État par défaut** : `true` (activé)
- **Effet** : Applique `filter: grayscale(100%)` sur l'iframe YouTube

### 2. Mélange Vidéos
- **Fichier concerné** : `src/pages/Home.tsx`
- **Fonctionnalité** : Active/désactive le mélange entre la vidéo YouTube et la vidéo background locale
- **État par défaut** : `false` (désactivé)
- **Effet** : 
  - Quand activé : Les deux vidéos sont visibles simultanément (YouTube à 100%, background à 50% d'opacité)
  - Quand désactivé : La vidéo background est cachée quand YouTube est visible

### 3. Trajectoires
- **Fichier concerné** : `src/components/Scene3D.tsx`
- **Fonctionnalité** : Active/désactive l'affichage des trajectoires des planètes
- **État par défaut** : `false` (désactivé)
- **Effet** :
  - Quand activé : Trajectoires visibles avec opacité 0.8 et épaisseur 2
  - Quand désactivé : Trajectoires visibles avec opacité 0.3 et épaisseur 1

## 🏗️ Architecture

### Contexte React
Le contexte `PlanetsOptionsContext` centralise la gestion des états :

```typescript
interface PlanetsOptionsContextType {
  grayscaleEnabled: boolean;
  setGrayscaleEnabled: (enabled: boolean) => void;
  videoBlendEnabled: boolean;
  setVideoBlendEnabled: (enabled: boolean) => void;
  orbitsVisible: boolean;
  setOrbitsVisible: (visible: boolean) => void;
}
```

### Composants utilisant le contexte

1. **PlanetsOptionsPanel.tsx** : Affiche les boutons et met à jour les états
2. **YouTubeBackground.tsx** : Lit `grayscaleEnabled` pour appliquer le filtre
3. **Home.tsx** : Lit `videoBlendEnabled` pour gérer le mélange vidéo
4. **Scene3D.tsx** : Lit `orbitsVisible` pour afficher/masquer les trajectoires

## 📍 Position et visibilité

- **Position** : Fixe en bas à gauche (`bottom-8 left-8`)
- **Z-index** : `50` (au-dessus des vidéos, sous les planètes)
- **Visibilité** : Uniquement sur les routes `/planets` et `/planets1`
- **Style** : Fond semi-transparent avec backdrop blur, bordures subtiles

## 🎨 Design

Le panneau utilise un design cohérent avec le reste de l'interface :
- Fond : `bg-black/50` avec `backdrop-blur-sm`
- Bordures : `border-white/20`
- Boutons actifs : `bg-white/20 border-white/40`
- Boutons inactifs : `bg-white/6 border-white/12`
- Icône de validation : `✓` pour les options activées

## 🔄 Mise à jour en temps réel

Toutes les modifications sont appliquées immédiatement grâce à React Context :
- Les changements d'état déclenchent des re-renders
- Les composants consommateurs réagissent instantanément
- Aucun rechargement de page nécessaire

