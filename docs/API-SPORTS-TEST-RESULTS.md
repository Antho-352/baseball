# API-Sports Baseball - Résultats Tests

**Date** : 2026-04-15
**Clé API** : `71f3790156a79e0df95992a4e9c65409`
**Plan** : Free

---

## ✅ Clé API validée

La clé fonctionne et accède aux endpoints baseball.

---

## 🎯 League IDs confirmés

| Ligue | ID API-Sports | Saisons disponibles |
|-------|---------------|---------------------|
| **MLB** | `1` | 2022-2024 (free), current season (paid) |
| **KBO** | `5` | 2022-2024 (free), 2026 current (paid) |
| **NPB** | `2` | 2022-2024 (free), 2025 current (paid) |

---

## ⚠️ **LIMITATION CRITIQUE : Free Plan**

### Restriction découverte

```json
{
  "errors": {
    "plan": "Free plans do not have access to this season, try from 2022 to 2024."
  }
}
```

### Données accessibles (Free Plan)

| Type de donnée | Free Plan | Paid Plan |
|----------------|-----------|-----------|
| **Scores live** | ❌ Saisons 2022-2024 uniquement | ✅ Saison actuelle |
| **Classements** | ✅ Saisons 2022-2024 | ✅ Saison actuelle + historique |
| **Cotes** | ❌ Probablement bloquées | ✅ Temps réel |
| **H2H** | ✅ 2022-2024 | ✅ Toutes saisons |
| **Fenêtre temporelle** | Données historiques figées | Rolling window (aujourd'hui ± 3 jours) |

### Impact sur le projet

**Site de baseball live = IMPOSSIBLE avec Free Plan**

Raisons :
1. Pas de scores de la saison actuelle (2026 pour KBO, 2025/2026 pour MLB/NPB)
2. Pas de classements live
3. Pas de cotes bookmakers
4. Uniquement données historiques (2022-2024)

---

## 💰 Pricing API-Sports (à vérifier)

D'après la structure habituelle API-Sports :

| Plan | Prix/mois estimé | Accès |
|------|------------------|-------|
| Free | 0€ | Données historiques 2022-2024 uniquement |
| Basic | ~20-40€ | Saison actuelle, limite requêtes/jour |
| Pro | ~60-100€ | Saison actuelle, limite augmentée |
| Ultra | ~150€+ | Illimité |

**Action requise** : Vérifier pricing exact sur https://dashboard.api-sports.io/

---

## 📊 Qualité des données (tests 2024)

### Standings 2024 (✅ Accessible free plan)

```bash
curl -H "x-apisports-key: KEY" \
  "https://v1.baseball.api-sports.io/standings?league=1&season=2024"
```

**Résultat** : 9 équipes retournées (probablement divisions)

**Structure** :
- Position, groupe (American/National League)
- Statistiques : Played, Wins, Losses, Win %
- Points pour/contre
- Form (derniers matchs)

**Qualité** : ✅ Complète pour classements

### Games 2024 (❌ Bloqué par date sur free plan)

Tentative de récupérer matchs historiques :
```
Error: "Free plans do not have access to this date, try from 2026-04-14 to 2026-04-16."
```

**Interprétation** : Free plan = fenêtre de 3 jours autour de la date actuelle, mais SEULEMENT pour saisons historiques 2022-2024.

**Problème** : On ne peut pas accéder aux matchs historiques ET on ne peut pas accéder à la saison actuelle.

**Conclusion** : Free plan = inutilisable pour notre use case.

---

## 🔄 Comparaison avec MLB Stats API (gratuite)

| Fonctionnalité | API-Sports Free | MLB Stats API (gratuite) |
|----------------|-----------------|---------------------------|
| **Scores MLB live** | ❌ | ✅ |
| **Classement MLB** | ❌ (2024 seulement) | ✅ |
| **Stats joueurs MLB** | ❓ Non testé | ✅ Très complètes |
| **Scores KBO** | ❌ | ❌ |
| **Scores NPB** | ❌ | ❌ |
| **Cotes bookmakers** | ❌ | ❌ |
| **H2H MLB** | ❌ (2024 seulement) | ✅ Via historique matchs |
| **Coût** | 0€ mais inutilisable | 0€ et pleinement fonctionnelle |

**Verdict** : MLB Stats API gratuite > API-Sports Free Plan pour MLB.

---

## 🎯 Décision architecturale

### Option A - Upgrade API-Sports Plan Payant

**Coût estimé** : 40-100€/mois (à confirmer)

**Avantages** :
- ✅ Une seule API pour MLB + KBO + NPB
- ✅ Cotes bookmakers intégrées
- ✅ Structure JSON unifiée

**Inconvénients** :
- ❌ Coût mensuel récurrent
- ❌ Lock-in vendor (si API-Sports augmente prix ou coupe service)
- ❌ Stats MLB moins riches que MLB Stats API officielle

**Recommandé si** : Budget disponible ET besoin impératif KBO/NPB dès V1.

---

### Option B - Hybrid : MLB Stats API + Scraping KBO/NPB (V2)

**Coût** : 0€

**Architecture** :
1. **V1 (maintenant)** :
   - MLB uniquement via MLB Stats API (gratuite, complète)
   - Pages `/kbo/` `/npb/` → "Coming soon"
   - Cotes via flux affiliation directs (Betclic, Unibet)

2. **V2 (après validation audience)** :
   - KBO/NPB via scraping sites officiels OU upgrade API-Sports si rentable
   - Decision basée sur trafic réel

**Avantages** :
- ✅ 0€ investissement initial
- ✅ Validation produit avant coûts récurrents
- ✅ MLB = 80% de l'audience francophone
- ✅ Code DataProvider déjà prêt pour intégration future

**Inconvénients** :
- ❌ Pas de KBO/NPB en V1
- ❌ Cotes nécessitent intégration flux affiliation séparés

**Recommandé si** : Budget serré OU validation marché d'abord.

---

### Option C - Hybrid : API-Sports Paid + MLB Stats API (complémentaire)

**Coût** : 40-100€/mois

**Architecture** :
- API-Sports (payant) → Scores/classements KBO/NPB + cotes
- MLB Stats API (gratuit) → Stats avancées MLB
- `HybridProvider` combine les deux

**Avantages** :
- ✅ 3 ligues dès V1
- ✅ Meilleure qualité stats MLB (officielle)
- ✅ Cotes intégrées

**Inconvénients** :
- ❌ Coût mensuel
- ❌ Complexité (2 APIs à maintenir)

**Recommandé si** : Budget OK ET besoin KBO/NPB critique.

---

## 📋 Actions immédiates

### 1. Vérifier pricing exact API-Sports

- Dashboard : https://dashboard.api-sports.io/
- Vérifier plans disponibles pour baseball
- Confirmer coût mensuel
- Vérifier limites de requêtes/jour

### 2. Décision user

**Question** : Quel budget mensuel maximum pour les APIs ?

- **0€** → Option B (MVP MLB-only, KBO/NPB V2)
- **50-100€/mois OK** → Option C (API-Sports paid + MLB Stats)
- **Budget flexible** → Option A (API-Sports paid uniquement)

### 3. Si Option B retenue (recommandée)

Timeline :
- **Semaine 1-2** : Setup backend + frontend Astro
- **Semaine 3** : Intégration MLB Stats API (déjà testé, fonctionne)
- **Semaine 4** : CMS + génération pronostics
- **Semaine 5** : Design + polish
- **Semaine 6** : Launch V1 (MLB-only)
- **Post-launch** : Évaluation ROI → décision KBO/NPB V2

### 4. Si Option C/A retenue

- Upgrade API-Sports plan (via dashboard)
- Update code : `provider.updateLeagueMapping('kbo', '5')`
- Update code : `provider.updateLeagueMapping('npb', '2')`
- Tests complets KBO/NPB data quality
- Timeline identique mais 3 ligues dès V1

---

## 🛠️ Code déjà prêt

Tous les providers implémentés :

```
✅ APISportsProvider (MLB/KBO/NPB)
✅ MLBStatsProvider (MLB gratuit)
✅ HybridProvider (combine + fallback)
✅ Cache, mappers, types complets
```

**Impact décision** :
- Option B → Utiliser `MLBStatsProvider` uniquement en V1
- Option C/A → Utiliser `HybridProvider` avec API-Sports payant

**Changement de code nécessaire** : 0 ligne (juste config league IDs).

---

## 📝 Résumé exécutif

**Statut API-Sports** : ✅ Fonctionne MAIS free plan inutilisable (données historiques uniquement).

**League IDs** : MLB=1, KBO=5, NPB=2

**Recommandation** : Option B (MVP MLB-only) sauf si budget API confirmé immédiatement.

**Next step** : User décide budget API → lance développement selon option choisie.
