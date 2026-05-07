# Voice Chat AI — démo concrète

Démo d'un assistant vocal 100 % navigateur basé sur **Gemini Nano** (API Chrome built-in `LanguageModel`), augmenté d'une recherche web optionnelle via **Brave Search** (avec **Wikipedia** en fallback gratuit).

La page reprend la boucle vocale de [`chrome-ai.html`](../chrome-ai.html) (carte *Voice Chat*) mais l'enrichit d'une UI dédiée (avatar SVG animé qui écoute / réfléchit / parle) et d'un agent capable d'aller chercher l'information sur le web quand le LLM n'a pas la réponse en local.

## Pile

| Étage | Techno |
| --- | --- |
| Speech-to-Text | `webkitSpeechRecognition` (Web Speech API) |
| LLM | `LanguageModel` (Gemini Nano, Chrome built-in) |
| Text-to-Speech | `speechSynthesis` (Web Speech API) |
| Recherche web (optionnelle) | Brave Search API → Wikipedia (fallback) |

> ⚠️ La transcription `webkitSpeechRecognition` et certaines voix `speechSynthesis` passent par les serveurs Google / Microsoft selon le navigateur. Seul l'étage LLM (Gemini Nano) est garanti 100 % local. Pour du STT offline, utiliser la card Whisper de [`transformers.html`](../transformers.html).

## Lancer la démo

```bash
# 1) (optionnel) lancer le proxy CORS si tu veux activer Brave Search
node demo/cors-proxy.js

# 2) servir la page (depuis la racine du repo)
python3 -m http.server 8080
# puis http://localhost:8080/demo/voice-chat-ai.html
```

Sans clé Brave configurée, l'assistant utilise Wikipedia en fallback — aucun proxy ni clé n'est requis pour ce mode.

## Configurer Brave Search (optionnel)

1. Créer un compte sur <https://api.search.brave.com/app/dashboard> (2 000 requêtes / mois gratuites).
2. Lancer le proxy CORS local : `node demo/cors-proxy.js` (Brave ne supporte pas CORS depuis le navigateur, le proxy forward la clé `X-Subscription-Token` vers `api.search.brave.com`).
3. Cliquer sur ⚙️ dans la page, coller la clé `BSA…`, *Tester* puis *Enregistrer*. La clé est stockée en `localStorage`.

## `cors-proxy.js`

Mini proxy HTTP local (zéro dépendance, ~70 lignes de Node natif) qui n'autorise qu'un seul hôte cible : `api.search.brave.com`. Il forward les headers d'authentification et ajoute les headers CORS pour permettre l'appel depuis la page.

```bash
node demo/cors-proxy.js
# ✅ CORS proxy lancé sur http://localhost:8787
```

## Prérequis Chrome

Mêmes prérequis que [`chrome-ai.html`](../chrome-ai.html) : Chrome ≥ 138 (ou Canary), avec les flags **Prompt API for Gemini Nano** activés dans `chrome://flags`. Voir le [README racine](../README.md#prérequis-chrome-pour-chrome-aihtml) pour les détails.
