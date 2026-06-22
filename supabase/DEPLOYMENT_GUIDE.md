# Procédure de Déploiement des Edge Functions sur Supabase (Coolify)

Ce document décrit étape par étape la procédure manuelle que nous avons suivie pour déployer la fonction Edge `make-server-7cbeffac` sur votre instance Supabase auto-hébergée (self-hosted) via Coolify.

---

## Prérequis

1. Avoir poussé les dernières modifications locales (le code des fonctions) sur votre dépôt GitHub.
2. Avoir accès au panneau d'administration **Coolify** de votre serveur.

---

## Étape 1 : Localiser le volume des fonctions sur le VPS

Puisque Supabase s'exécute dans des conteneurs Docker gérés par Coolify, les fichiers des fonctions doivent être placés dans le dossier physique du VPS qui est monté sur le conteneur `supabase-edge-runtime`.

1. Connectez-vous à votre terminal VPS (via l'onglet **Terminal** de votre serveur dans Coolify, ou par SSH).
2. Pour identifier le chemin exact de ce dossier sur l'hôte, exécutez la commande suivante :
   ```bash
   docker inspect supabase-edge-functions-lths9w5ozdt0l54jm4wiq5b3 --format "{{json .Mounts}}"
   ```
3. Dans la réponse, repérez la ligne correspondant à `/home/deno/functions`. Sur votre installation, le dossier source sur votre VPS est :
   `Source: /data/coolify/services/lths9w5ozdt0l54jm4wiq5b3/volumes/functions`

---

## Étape 2 : Se positionner dans le dossier des fonctions sur le VPS

Toujours dans le terminal de votre serveur VPS, placez-vous dans ce dossier :
```bash
cd /data/coolify/services/lths9w5ozdt0l54jm4wiq5b3/volumes/functions
```

---

## Étape 3 : Télécharger et extraire le code depuis GitHub

Comme le dépôt GitHub `IPPOO-TEAM/healthypage` a été rendu public, nous pouvons télécharger directement l'archive compressée du dépôt en ligne de commande :

1. **Télécharger le code source compressé (tarball)** :
   ```bash
   curl -L https://github.com/IPPOO-TEAM/healthypage/tarball/main -o repo.tar.gz
   ```
2. **Extraire l'archive** :
   ```bash
   tar -xzf repo.tar.gz
   ```
3. **Copier le dossier de la fonction Edge** vers le dossier actuel (qui est synchronisé avec le conteneur) :
   ```bash
   cp -r IPPOO-TEAM-healthypage-*/supabase/functions/make-server-7cbeffac .
   ```
4. **Nettoyer les fichiers temporaires** créés sur le VPS :
   ```bash
   rm -rf repo.tar.gz IPPOO-TEAM-healthypage-*
   ```

---

## Étape 4 : Appliquer les changements (Redémarrer le conteneur)

Pour que l'Edge Runtime de Supabase charge le nouveau code de la fonction contenant le routeur relationnel `kv_store.tsx`, il est nécessaire de redémarrer le conteneur correspondant.

Depuis le terminal de votre VPS, exécutez la commande suivante :
```bash
docker restart supabase-edge-functions-lths9w5ozdt0l54jm4wiq5b3
```
*(Vous pouvez aussi cliquer sur le bouton **Restart** à côté du conteneur `supabase-edge-runtime` dans le tableau de bord Coolify).*

---

## Étape 5 : Vérifier le déploiement

### Vérification physique des fichiers dans le conteneur
Vous pouvez ouvrir le terminal du conteneur `supabase-edge-runtime` dans Coolify et lister les fichiers pour vous assurer qu'ils sont présents :
```bash
ls -la /home/deno/functions/make-server-7cbeffac
```
**Résultat attendu** :
```
-rw-r--r-- 1 root root 74140 Jun 21 23:57 index.tsx
-rw-r--r-- 1 root root 13302 Jun 21 23:57 kv_store.tsx
```

### Vérification du statut de la fonction (Health Check)
Lancez une requête HTTP sur l'endpoint de santé public de votre fonction :
```bash
curl https://essaisupabase.ippoo-aptdc.com/functions/v1/make-server-7cbeffac/health
```
**Résultat attendu (Statut 200 OK)** :
```json
{
  "status": "ok"
}
```
Si vous obtenez cette réponse, cela signifie que la fonction s'exécute correctement et communique avec succès avec votre base de données relationnelle !
