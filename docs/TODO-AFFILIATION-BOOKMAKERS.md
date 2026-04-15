# TODO - Inscription Programmes Affiliation Bookmakers

## Action requise AVANT de commencer le développement

Les flux de cotes bookmakers sont **critiques** pour le fonctionnement des pages pronostics.
Sans accès aux flux, impossible de générer les pages avec cotes en temps réel.

---

## Opérateurs ANJ à contacter

### 1. Betclic Affiliation
- **URL** : https://www.betclic.fr/affiliation
- **Contact** : formulaire inscription sur le site
- **Délai réponse** : 3-7 jours ouvrés

### 2. Unibet Partners
- **URL** : https://www.unibetpartners.com/
- **Contact** : inscription via plateforme Kindred Affiliates
- **Délai réponse** : 2-5 jours ouvrés

### 3. Winamax Affiliation
- **URL** : https://www.winamax.fr/affiliation
- **Contact** : email à affiliation@winamax.fr
- **Délai réponse** : 5-10 jours ouvrés

### 4. PMU Affiliation
- **URL** : https://www.pmu.fr/affiliation
- **Contact** : formulaire sur le site
- **Délai réponse** : 7-14 jours ouvrés

---

## Informations à préparer pour l'inscription

**Obligatoires** :
- Nom du site : [À DÉFINIR - exemple : "Baseball France", "BaseballFR", "Baseball Pronostics"]
- Nom de domaine : [À ACHETER]
- Description du projet : "Site de référence français sur le baseball professionnel (MLB, KBO, NPB) proposant actualités, statistiques, et pronostics assistés par IA pour les matchs de baseball."
- Trafic estimé : "Plusieurs milliers de visiteurs mensuels visés à 1 an"
- Contenu proposé : "Articles d'actualités, statistiques en temps réel, pronostics de matchs avec analyse contextuelle"

**Optionnelles (selon opérateur)** :
- SIRET (si société) ou auto-entrepreneur
- Relevé d'Identité Bancaire (pour paiement commissions)
- Captures d'écran du site (mockups si pas encore en ligne)

---

## Livrables attendus des opérateurs

Une fois accepté dans le programme d'affiliation, tu recevras :

### 1. Flux de cotes (XML ou JSON)
- URL du flux (ex : `https://api.betclic.fr/feeds/odds.xml?key=XXXX`)
- Clé API ou token d'authentification
- Documentation de l'API (endpoints, format des données)

**Exemple de structure JSON attendue** :
```json
{
  "sport": "baseball",
  "league": "MLB",
  "game_id": "12345",
  "teams": {
    "home": "New York Yankees",
    "away": "Boston Red Sox"
  },
  "odds": {
    "home_win": 1.85,
    "away_win": 2.10
  },
  "updated_at": "2026-04-14T10:30:00Z"
}
```

### 2. Liens trackés
- Format : `https://www.betclic.fr/?ref=XXXXX`
- ID affilié unique (pour tracking des conversions)
- Deeplinks possibles (liens directs vers un match spécifique)

### 3. Conditions d'utilisation
- Fréquence de rafraîchissement autorisée (ex : max 1 requête/minute)
- Durée de cache des cotes (ex : afficher pendant max 15min)
- Mentions obligatoires (ex : "Cotes fournies par Betclic, sous réserve de modification")
- Interdictions (ex : ne pas afficher de cotes de compétiteurs sur la même page)

---

## Stratégie d'inscription

### Phase 1 : Préparation (AVANT inscription)
1. ✅ Acheter le nom de domaine
2. ✅ Créer une landing page basique (nom du projet, description, formulaire contact)
3. ✅ Configurer Cloudflare SSL (site en HTTPS obligatoire pour affiliation)
4. ❌ **NE PAS** attendre que le site complet soit en ligne (les programmes acceptent les projets en développement)

### Phase 2 : Inscription simultanée
- Contacter **tous les opérateurs en même temps** (pas d'exclusivité)
- Utiliser le **même texte de présentation** pour cohérence
- Mentionner explicitement : "Site en développement, lancement prévu dans X semaines"

### Phase 3 : Suivi
- Relancer après 7 jours si pas de réponse
- Négocier si possible : bonus de bienvenue, commission supérieure (improbable pour un nouveau site mais tenter)

---

## Template email de contact

```
Objet : Demande d'inscription - Programme d'affiliation [NOM_OPERATEUR]

Bonjour,

Je souhaite intégrer le programme d'affiliation [Betclic/Unibet/Winamax/PMU].

Projet : [NOM_DU_SITE]
Domaine : [URL_DU_SITE]

Description :
Site de référence français sur le baseball professionnel (MLB, KBO, NPB).
Nous proposons actualités, statistiques en temps réel, et pronostics assistés
par IA pour les matchs de baseball.

Audience cible : passionnés de baseball français + parieurs sportifs

Trafic estimé : plusieurs milliers de visiteurs mensuels à 1 an

Contenu prévu :
- Articles d'actualités et analyses
- Statistiques de joueurs et équipes
- Pronostics de matchs avec analyse contextuelle
- Guides de paris sportifs

Nous souhaitons afficher vos cotes en temps réel sur nos pages de pronostics
et promouvoir vos offres de paris auprès de notre audience qualifiée.

Pourriez-vous me confirmer :
1. L'accès au flux de cotes (format XML/JSON)
2. La documentation de l'API
3. Les conditions d'utilisation du flux

Coordonnées :
Nom : [TON NOM]
Email : [TON EMAIL]
Téléphone : [TON TEL]

Merci pour votre retour.

Cordialement,
[SIGNATURE]
```

---

## Checklist AVANT de coder les pages pronostics

- [ ] Nom de domaine acheté
- [ ] Landing page basique en ligne (HTTPS)
- [ ] Inscriptions envoyées aux 4 opérateurs
- [ ] Au moins 1 opérateur a confirmé l'accès au flux
- [ ] Documentation API flux de cotes récupérée
- [ ] Test manuel du flux (curl ou Postman)

**Si aucun opérateur ne donne accès** :
→ Fallback V1 : afficher uniquement les pronostics IA sans cotes
→ Ajouter manuellement les liens affiliés (sans comparaison de cotes)
→ V2 : inscrire le site une fois qu'il a du trafic (+ facile d'être accepté)

---

## Estimation délais

**Optimiste** : 1 semaine (opérateur répond vite + accepte)
**Réaliste** : 2-3 semaines (relances nécessaires)
**Pessimiste** : 1-2 mois (refus initial, renégociation après lancement site)

**Recommandation** : lancer les inscriptions **dès que le nom de domaine est acheté**, même si le site n'est pas encore développé.
