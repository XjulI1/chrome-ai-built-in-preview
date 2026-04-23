# Chrome AI — Test des API built-in

Page de test unique (`index.html`) pour explorer les API d'IA intégrées à Chrome (Gemini Nano et modèles associés).

Documentation officielle : <https://developer.chrome.com/docs/ai/get-started?hl=fr>

## API couvertes

| API | Objet global | Fonctionnalités testées |
| --- | --- | --- |
| Prompt | `LanguageModel` | system prompt, temperature, top-K, streaming, upload image (multimodal) |
| Summarizer | `Summarizer` | type (key-points / tldr / teaser / headline), format, longueur, streaming |
| Writer | `Writer` | ton, format, longueur, contexte, streaming |
| Rewriter | `Rewriter` | ajustement ton / longueur / format, streaming |
| Translator | `Translator` | langue source/cible, streaming |
| Language Detector | `LanguageDetector` | top 5 langues avec score de confiance |
| Proofreader | `Proofreader` | texte corrigé + liste des corrections positionnelles |

Chaque carte affiche un badge d'**availability** (`available` / `downloadable` / `downloading` / `unavailable`) et une barre de progression du téléchargement du modèle (`downloadprogress`). Un bloc **Diagnostic** en bas de page liste le User-Agent, la présence de chaque API globale et le quota de stockage.

## Lancer la page

Fichier unique, aucun build.

```bash
# Option 1 : ouvrir directement
open index.html

# Option 2 : via un serveur local (recommandé)
python3 -m http.server 8080
# puis http://localhost:8080
```

## Prérequis Chrome

- **Chrome ≥ 138** (stable) ou **Canary**
- Activer dans `chrome://flags` :
  - Prompt API for Gemini Nano
  - Summarizer API
  - Writer / Rewriter API
  - Translation API
  - Language Detection API
  - Proofreader API
- `chrome://components` → vérifier que **Optimization Guide On Device Model** est téléchargé (bouton « Check for update » sinon)
- **Matériel** : ~22 GB d'espace disque libre, >4 GB VRAM GPU **ou** 16 GB RAM + 4 cœurs CPU
- **OS** : Windows 10+, macOS 13+, Linux, ChromeOS
- Translator et Language Detector sont **desktop uniquement**

## Premier usage

Les modèles se téléchargent à la première utilisation de chaque API. La barre de progression s'affiche automatiquement pendant le téléchargement. Les appels suivants sont instantanés (inférence locale, aucune requête réseau).
