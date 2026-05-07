# Chrome AI & Transformers.js — Pages de test

Trois pages de test indépendantes pour comparer plusieurs approches d'IA en navigateur :

- [`chrome-ai.html`](./chrome-ai.html) — API d'IA **intégrées à Chrome** (Gemini Nano). Doc : <https://developer.chrome.com/docs/ai/get-started?hl=fr>
- [`transformers.html`](./transformers.html) — **Transformers.js** (modèles ONNX exécutés localement via WebGPU/WASM). Doc : <https://huggingface.co/docs/transformers.js/index>
- [`model-sizes.html`](./model-sizes.html) — Visualisation comparative de la **taille des modèles** (tiny in-browser vs frontier cloud), échelle logarithmique.

## `chrome-ai.html` — API Chrome built-in

| API | Objet global | Fonctionnalités testées |
| --- | --- | --- |
| Prompt | `LanguageModel` | system prompt, temperature, top-K, streaming, upload image (multimodal) |
| Summarizer | `Summarizer` | type (key-points / tldr / teaser / headline), format, longueur, streaming |
| Writer | `Writer` | ton, format, longueur, contexte, streaming |
| Rewriter | `Rewriter` | ajustement ton / longueur / format, streaming |
| Translator | `Translator` | langue source/cible, streaming |
| Language Detector | `LanguageDetector` | top 5 langues avec score de confiance |
| Proofreader | `Proofreader` | texte corrigé + liste des corrections positionnelles |
| Voice Chat | `SpeechRecognition` + `LanguageModel` + `SpeechSynthesis` | boucle conversationnelle vocale (STT → LLM → TTS), choix de voix, langue, temperature, system prompt |
| Audio Prompt | `LanguageModel` (multimodal) | enregistrement micro ou import fichier audio passé directement au modèle via `expectedInputs: [{ type: 'audio' }]` |

Chaque carte affiche un badge d'**availability** (`available` / `downloadable` / `downloading` / `unavailable`) et une barre de progression du téléchargement du modèle (`downloadprogress`). Un bloc **Diagnostic** en bas de page liste le User-Agent, la présence de chaque API globale et le quota de stockage.

> ⚠️ Voice Chat utilise les Web Speech APIs : selon le navigateur, la transcription (`SpeechRecognition`) et certaines voix de synthèse (`SpeechSynthesis`) passent par les serveurs Google / Microsoft. Seul l'étage `LanguageModel` (Gemini Nano) est garanti 100 % local. Pour du STT 100 % offline, utiliser la card Whisper de `transformers.html`.

## `transformers.html` — Transformers.js

Import direct depuis jsDelivr (`@huggingface/transformers@3.5.2`), aucun bundler. Les modèles ONNX sont téléchargés depuis le Hugging Face Hub au premier usage puis mis en cache navigateur.

| Pipeline | Modèle | Fonctionnalités testées |
| --- | --- | --- |
| Text Generation | `HuggingFaceTB/SmolLM2-360M-Instruct` | chat template, temperature, top-K, max_new_tokens, streaming via `TextStreamer` |
| Summarization | `Xenova/distilbart-cnn-6-6` | min/max length |
| Translation | `Xenova/nllb-200-distilled-600M` | codes NLLB (`fra_Latn` → `eng_Latn`, etc.) |
| Language Detection | `Xenova/xlm-roberta-base-language-detection` | top-5 langues avec score |
| Sentiment Analysis | `Xenova/distilbert-base-uncased-finetuned-sst-2-english` | scores positif/négatif |
| Zero-shot Classification | `Xenova/mobilebert-uncased-mnli` | labels arbitraires |
| Question Answering | `Xenova/distilbert-base-cased-distilled-squad` | réponse + score + span |
| Embeddings | `Xenova/all-MiniLM-L6-v2` | similarité cosinus entre deux phrases |
| Speech-to-Text | `onnx-community/whisper-base` (et variantes `tiny`, `tiny.en`, `small`) | transcription Whisper 100 % offline, micro ou fichier audio, langue, `transcribe`/`translate`, `return_timestamps` |

La barre de statut en haut de page expose des sélecteurs `device` (`auto` / `webgpu` / `wasm` / `cpu`) et `dtype` (`auto` / `fp32` / `fp16` / `q8` / `q4` / `q4f16`) appliqués à la création de chaque pipeline. Le `progress_callback` alimente la barre de progression par carte pendant le téléchargement. Le bloc **Diagnostic** affiche WebGPU + info adapter, WebAssembly, `crossOriginIsolated` (nécessaire pour les threads WASM), quota de stockage et la liste des backends disponibles.

## `model-sizes.html` — Visualisation des tailles de modèles

Page statique sans dépendance qui compare le nombre de paramètres entre :

- les modèles **tiny** chargés dans `transformers.html` et `chrome-ai.html` (Whisper, SmolLM2, distilBART, NLLB, Gemini Nano…),
- les LLM **frontier** grand public hébergés dans le cloud (GPT-4, Claude, Gemini Pro…).

Trois représentations : barres en échelle logarithmique, bulles (aire ∝ √paramètres) et ordres de grandeur. Aucun calcul ni téléchargement de modèle — c'est de la dataviz pure pour donner une intuition de l'écart d'échelle.

## Lancer les pages

Fichiers statiques, aucun build.

```bash
# Option 1 : ouvrir directement (chrome-ai.html et model-sizes.html uniquement —
#            transformers.html nécessite un serveur)
open chrome-ai.html

# Option 2 : via un serveur local (recommandé, requis pour transformers.html)
python3 -m http.server 8080
# puis http://localhost:8080/chrome-ai.html
#  ou  http://localhost:8080/transformers.html
#  ou  http://localhost:8080/model-sizes.html
```

Pour activer les threads WASM et WebGPU dans `transformers.html`, servir la page avec les headers `Cross-Origin-Opener-Policy: same-origin` et `Cross-Origin-Embedder-Policy: require-corp` (sinon ça fonctionne en mode single-thread). Le fichier `coi-serviceworker.min.js` inclus dans le repo ajoute automatiquement ces headers côté client lorsqu'on ouvre la page via un simple `python3 -m http.server`.

## Prérequis Chrome (pour `chrome-ai.html`)

- **Chrome ≥ 138** (stable) ou **Canary**
- Activer dans `chrome://flags` :
  - Prompt API for Gemini Nano
  - Prompt API for Gemini Nano — Multimodal Input (pour la card Audio Prompt)
  - Summarizer API
  - Writer / Rewriter API
  - Translation API
  - Language Detection API
  - Proofreader API
- `chrome://components` → vérifier que **Optimization Guide On Device Model** est téléchargé (bouton « Check for update » sinon)
- **Matériel** : ~22 GB d'espace disque libre, >4 GB VRAM GPU **ou** 16 GB RAM + 4 cœurs CPU
- **OS** : Windows 10+, macOS 13+, Linux, ChromeOS
- Translator et Language Detector sont **desktop uniquement**
- Voice Chat nécessite l'autorisation micro (`getUserMedia`) et un geste utilisateur (clic) pour démarrer la reconnaissance et la synthèse vocale

## Prérequis Transformers.js (pour `transformers.html`)

- Navigateur à jour avec support **WebAssembly** (obligatoire) et idéalement **WebGPU** (Chrome 113+, Edge 113+, Safari 26+)
- Connexion réseau pour le premier téléchargement des modèles (ensuite mis en cache)
- Espace de stockage navigateur : quelques centaines de Mo à ~1 Go selon les modèles chargés (Whisper `base` ~150 Mo, `small` ~480 Mo)
- Aucun flag ni configuration Chrome spécifique
- La card Whisper nécessite l'autorisation micro pour l'enregistrement direct (l'import de fichier audio fonctionne sans)

## Premier usage

Dans `chrome-ai.html` et `transformers.html`, les modèles se téléchargent à la première utilisation et la barre de progression s'affiche automatiquement. Les appels suivants sont instantanés (inférence 100 % locale, aucune requête réseau une fois les modèles en cache — sauf pour `SpeechRecognition` et certaines voix `SpeechSynthesis` du navigateur, voir la note Voice Chat plus haut).
