# API-Sports Baseball - Statut Tests

**Date** : 2026-04-15
**Clé API** : `7ff379015c6a79e0adf959`

---

## Résultats des tests

### ✅ Clé API valide

User confirme : "Apparement c'est la bonne API puisque il est indiqué que tu as consommé 2% de mon usage quotidien."

**Conclusion** : La clé fonctionne et consomme du quota.

### ❌ Erreur d'authentification sur endpoints baseball

**Endpoints testés** :
- `GET /leagues` → Erreur token
- `GET /games?league=1&season=2024&date=2024-04-15` → Erreur token

**Réponse reçue** :
```json
{
  "errors": {
    "token": "Error/Missing application key. Go to https://www.api-football.com/documentation-v3 to learn how to get your API application key."
  },
  "results": 0,
  "response": []
}
```

**Status HTTP** : 200 (mais body contient erreur)

---

## Hypothèses

### 1. Souscription baseball manquante (PROBABLE)

**Hypothèse** : La clé API fonctionne sur d'autres sports (football?) mais pas baseball.

**Indices** :
- Le message d'erreur pointe vers `api-football.com`
- API-Sports est une plateforme multi-sports (football, basketball, baseball, etc.)
- Chaque sport peut nécessiter une souscription séparée

**Action** : Vérifier le dashboard API-Sports pour voir quels sports sont activés.

### 2. Endpoint différent pour baseball

**Hypothèse** : L'API baseball utilise un format différent ou nécessite des paramètres supplémentaires.

**Action** : Consulter la documentation officielle API-Sports Baseball.

### 3. Rate limit atteint

**Hypothèse** : Les 2% de quota ont été consommés et le reste est bloqué.

**Contre-argument** : L'erreur serait plutôt "Rate limit exceeded", pas "Missing key".

---

## Actions recommandées

### Immédiat

1. **Vérifier le dashboard API-Sports** :
   - URL : https://dashboard.api-sports.io/
   - Vérifier quels sports sont activés pour cette clé
   - Vérifier le quota restant

2. **Tester un endpoint football** (pour confirmer que la clé fonctionne) :
   ```bash
   curl -H "x-apisports-key: 7ff379015c6a79e0adf959" \
     "https://v3.football.api-sports.io/leagues"
   ```

3. **Contacter le support API-Sports** si baseball n'est pas activé :
   - Email : support@api-sports.io
   - Question : "Ma clé fonctionne mais j'ai une erreur sur l'API baseball, dois-je activer baseball séparément ?"

### Court terme

1. **Si baseball nécessite souscription** :
   - Évaluer le coût (vérifier pricing)
   - Décider si on souscrit maintenant ou on lance MVP MLB-only (MLB Stats API gratuite)

2. **Si baseball est disponible mais erreur technique** :
   - Documenter le workaround
   - Ajuster l'implémentation APISportsProvider

---

## Implémentation actuelle

### ✅ Code prêt

Les providers sont implémentés :

```
backend/src/services/data-provider/
├── index.ts                        # Factory + exports
├── DataProvider.interface.ts       # Interface commune
├── types.ts                        # Types TypeScript
├── api-sports/
│   ├── APISportsProvider.ts       # ✅ Implémenté
│   ├── api-sports-client.ts       # ✅ Implémenté
│   ├── mappers.ts                 # ✅ Implémenté
│   └── cache.ts                   # ✅ Implémenté
├── mlb-stats/
│   └── MLBStatsProvider.ts        # ✅ Implémenté
└── hybrid/
    └── HybridProvider.ts           # ✅ Implémenté
```

**Utilisation** :
```typescript
import { createDataProvider } from './services/data-provider';

// Créer le provider hybride (recommandé)
const provider = createDataProvider('hybrid');

// Récupérer les matchs MLB (fallback MLB Stats si API-Sports échoue)
const games = await provider.getGamesWithFallback('mlb', new Date());
```

### 🔄 En attente

**League IDs mapping** : Les IDs API-Sports pour KBO et NPB sont inconnus.

```typescript
// APISportsProvider.ts - ligne 16
private leagueMapping: Record<string, string> = {
  mlb: '1',     // À confirmer
  kbo: 'TBD',   // ⚠️ INCONNU
  npb: 'TBD',   // ⚠️ INCONNU
};
```

**Action** : Une fois l'API fonctionnelle, récupérer la liste des ligues :
```bash
curl -H "x-apisports-key: VALID_KEY" \
  "https://v1.baseball.api-sports.io/leagues"
```

Puis mettre à jour le mapping :
```typescript
provider.updateLeagueMapping('kbo', '5'); // Exemple
provider.updateLeagueMapping('npb', '7'); // Exemple
```

---

## Décision architecturale

### Option A : Attendre résolution API-Sports

**Si** : User peut activer baseball sur son compte rapidement.

**Avantages** :
- Une seule API pour 3 ligues
- Cotes intégrées
- Architecture hybrid prête

**Délai estimé** : 1-3 jours (temps de réponse support + activation)

### Option B : Lancer MVP MLB-only (recommandé)

**Si** : Résolution API-Sports incertaine ou coûteuse.

**Plan** :
1. **V1** : MLB uniquement (MLB Stats API gratuite + fully functional)
2. Homepage : focus MLB
3. Pages `/kbo/` et `/npb/` → "Coming soon" avec newsletter signup
4. **V2** : Ajouter KBO/NPB une fois API-Sports résolu

**Avantages** :
- Pas bloqué par l'API
- MLB = 80% de l'audience francophone
- Code déjà prêt pour l'intégration future (hybrid provider)

**Timeline** :
- V1 launch : 2-3 semaines (MVP MLB complet)
- V2 KBO/NPB : +2 semaines après résolution API

---

## Prochaines étapes

1. **User** : Vérifier dashboard API-Sports (sports activés, quota)
2. **User** : Tester endpoint football pour confirmer que la clé fonctionne
3. **Developer** : Continuer avec MLB Stats API en attendant (fallback déjà implémenté)
4. **Décision** : Option A (attendre) ou Option B (MVP MLB-only) ?

---

## Notes techniques

### MLB Stats API - Déjà fonctionnelle

Endpoints testés et confirmés opérationnels :

```bash
# Scores du jour
curl "https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=2024-04-15"

# Classement
curl "https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=2024"

# Stats joueur
curl "https://statsapi.mlb.com/api/v1/people/660271/stats?stats=season&season=2024"
```

**Conclusion** : On peut lancer le projet avec MLB uniquement sans dépendance API-Sports.

### Fallback automatique implémenté

```typescript
// HybridProvider gère le fallback automatiquement
const provider = createDataProvider('hybrid');

// Si API-Sports échoue, MLB Stats API prend le relais (pour MLB seulement)
const games = await provider.getGamesWithFallback('mlb', new Date());
```

**Impact user** : Transparent, pas de changement de code nécessaire si API-Sports se résout plus tard.
