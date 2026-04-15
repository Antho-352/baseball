# Problème TheSportsDB - KBO/NPB

## Constat (2026-04-14)

**TheSportsDB ne contient PAS de données KBO/NPB accessibles via l'API gratuite.**

Test effectué :
```bash
curl "https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=Korean%20Baseball%20Organization"
→ {"teams":null}
```

## Impact sur le projet

### Données manquantes pour KBO/NPB

Sans source de données fiable pour KBO/NPB, on ne peut pas récupérer :
- Scores des matchs
- Classements
- Stats joueurs
- Calendrier

**Conséquence** : Impossible de créer les pages KBO/NPB avec données temps réel en V1.

## Solutions alternatives

### Option 1 : Scraping sites officiels (complexe mais fiable)

**KBO** :
- Site : https://www.koreabaseball.com/
- Données : scores, classements, stats (en coréen)
- Difficulté : ★★★★☆ (HTML parsing + traduction)

**NPB** :
- Site : https://npb.jp/eng/
- Données : scores, classements (version anglaise existe)
- Difficulté : ★★★☆☆ (HTML parsing)

**Avantages** :
- ✅ Source officielle (fiabilité maximale)
- ✅ Gratuit

**Inconvénients** :
- ❌ Fragilité (si le HTML change, le scraper casse)
- ❌ Maintenance (vérifier régulièrement que ça marche)
- ❌ Légalité floue (respect des ToS à vérifier)

### Option 2 : API payante spécialisée

**The Odds API** (https://the-odds-api.com/)
- Coverage : MLB + KBO + NPB
- Prix : 100$/mois (500 requêtes/mois)
- Données : scores, cotes, pas de stats détaillées

**SportsData.io** (https://sportsdata.io/)
- Coverage : MLB seulement (pas KBO/NPB)

**RapidAPI Baseball** (https://rapidapi.com/...)
- Plusieurs fournisseurs, qualité variable
- Prix : 10-50$/mois

### Option 3 : MVP sans KBO/NPB (recommandé V1)

**Stratégie** : Lancer avec **MLB uniquement** en V1.

**Avantages** :
- ✅ Données fiables (MLB Stats API gratuite)
- ✅ Pas de complexité scraping
- ✅ Focus qualité sur une ligue
- ✅ Audience principale francophone = MLB (plus connue)

**Ajout KBO/NPB en V2** :
- Une fois le site lancé et trafic validé
- Budget dispo pour API payante OU temps pour scraper

## Recommandation

### Phase 1 : MVP MLB-only (maintenant)

**Contenu** :
- Homepage : focus MLB
- Pages équipes : 30 équipes MLB
- Pages joueurs : 200 stars MLB
- Pronostics : matchs MLB
- News : actualités MLB (+ sections KBO/NPB avec articles manuels uniquement)

**URLs** :
- `/` → Homepage MLB-centric
- `/mlb/` → Hub MLB
- `/kbo/` → Page statique "Bientôt disponible" avec newsletter signup
- `/npb/` → Page statique "Bientôt disponible" avec newsletter signup

**Avantage marketing** : "Prochainement : KBO et NPB" = anticipation audience

### Phase 2 : Ajout KBO/NPB (V2)

**Trigger pour lancer** :
- Trafic > 5k visiteurs/mois sur MLB
- Budget API disponible (100$/mois)
- OU temps disponible pour scraper fiable

**Options à tester V2** :
1. The Odds API (100$/mois) → test 1 mois
2. Scraping NPB.jp (+ facile car version EN existe)
3. Scraping KBO.com (+ complexe, nécessite traduction)

## ✅ Solution retenue : API-Sports Baseball

**Date décision** : 2026-04-14

**API** : https://api-sports.io/documentation/baseball/v1

**Clé API** : `7ff379015c6a79e0adf959`

---

## ⚠️ Problème d'authentification (2026-04-15)

### Symptômes

Erreur sur tous les endpoints baseball :
```json
{
  "errors": {
    "token": "Error/Missing application key..."
  }
}
```

### User confirme

"Apparement c'est la bonne API puisque il est indiqué que tu as consommé 2% de mon usage quotidien."

→ La clé fonctionne mais probablement pas activée pour le sport "baseball".

### Hypothèse principale

API-Sports est multi-sports (football, basketball, baseball, etc.). Chaque sport nécessite peut-être une souscription séparée.

**Action requise** : Vérifier dashboard API-Sports pour activer baseball.

---

## 🛠️ Implémentation terminée

Code providers prêt (voir `/backend/src/services/data-provider/`) :

- ✅ `APISportsProvider` (MLB + KBO + NPB)
- ✅ `MLBStatsProvider` (MLB Stats API gratuite)
- ✅ `HybridProvider` (combine les deux avec fallback auto)
- ✅ Cache, mappers, types complets

**Usage** :
```typescript
const provider = createDataProvider('hybrid');
const games = await provider.getGamesWithFallback('mlb', new Date());
```

**Si API-Sports KBO/NPB fonctionne** → change 0 ligne de code, juste update les league IDs.

**Si API-Sports bloqué** → fallback MLB Stats fonctionne déjà pour MLB.

---

## 📋 Prochaines actions

1. **User** : Vérifier dashboard API-Sports (sports activés)
2. **User** : Tester endpoint football pour confirmer clé valide
3. **Décision** :
   - **Si baseball activable rapidement** → attendre résolution, lancer avec 3 ligues
   - **Si baseball payant/bloqué** → lancer MVP MLB-only, KBO/NPB en V2

Voir détails complets dans `/docs/API-SPORTS-STATUS.md`.
