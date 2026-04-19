# Logos Bookmakers ANJ

Placer les logos officiels des opérateurs dans ce dossier.

## Logos requis

### Betclic
- **Fichier**: `betclic.png`
- **Source**: https://www.betclic.fr (récupérer le logo depuis les assets du site)
- **Format**: PNG transparent, 200x200px minimum

### Unibet
- **Fichier**: `unibet.png`
- **Source**: https://www.unibet.fr
- **Format**: PNG transparent, 200x200px minimum

### Winamax
- **Fichier**: `winamax.png`
- **Source**: https://www.winamax.fr
- **Format**: PNG transparent, 200x200px minimum

### PMU
- **Fichier**: `pmu.png`
- **Source**: https://www.pmu.fr
- **Format**: PNG transparent, 200x200px minimum

### ParionsSport
- **Fichier**: `parionssport.png`
- **Source**: https://www.parionssport.fdj.fr
- **Format**: PNG transparent, 200x200px minimum

## Fallback
- **Fichier**: `default.png`
- Logo générique utilisé si un logo spécifique n'est pas trouvé

## Usage dans le code

```typescript
import { getBookmakerLogo } from '@lib/constants/logos';

const logoUrl = getBookmakerLogo('betclic'); // /logos/bookmakers/betclic.png
```

## Note légale

Les logos des bookmakers sont la propriété de leurs opérateurs respectifs.
Ils doivent être utilisés conformément aux conditions des programmes d'affiliation.
