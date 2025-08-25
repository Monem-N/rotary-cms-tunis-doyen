# Rotary Club Tunis Doyen CMS

## 🇹🇳 **Système de Gestion de Contenu Trilingue pour Rotary Club Tunis Doyen**

*Un CMS moderne et accessible pour les bénévoles de Rotary Club Tunis Doyen*

---

## 🚀 **Démarrage Rapide**

### **Prérequis**
- Node.js 18+
- MongoDB (local ou MongoDB Atlas)
- Git

### **Installation**

```bash
# 1. Cloner le projet
git clone <repository-url>
cd rotary-club-tunis

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.local .env.local
# Éditer .env.local avec vos configurations

# 4. Démarrer le serveur de développement
npm run dev
```

### **Accès**
- **Admin Panel**: http://localhost:3000/admin
- **Site Web**: http://localhost:3000

---

## 🌍 **Fonctionnalités Clés**

### **🇫🇷🇸🇦🇺🇸 Trilingue (Français/Arabe/Anglais)**
- Saisie de contenu dans les trois langues
- Auto-synchronisation des brouillons (Français → Arabe)
- Interface adaptée aux locuteurs natifs
- Support RTL pour l'arabe

### **👥 Gestion des Utilisateurs**
- **Admin**: Contrôle complet du système
- **Éditeur**: Gestion du contenu
- **Bénévole**: Interface simplifiée pour la saisie

### **📅 Gestion des Événements**
- Création d'événements multilingues
- Galerie de photos avec métadonnées
- Métriques d'impact (repas servis, arbres plantés, etc.)
- Domaines d'action de Rotary International

### **📝 Articles & Actualité**
- **Articles d'actualité** : Nouvelles du club, annonces, projets
- **Blog posts** : Témoignages, partenariats, réflexions
- **SEO optimisé** : Métadonnées pour moteurs de recherche
- **Catégorisation** : Actualité, Événements, Projets, Annonces, etc.
- **Galerie d'images** : Support multilingue pour légendes
- **Articles à la une** : Mise en avant sur la page d'accueil

### **📋 Procès-Verbaux**
- Documents privés du conseil d'administration
- Téléchargement sécurisé des PDFs
- Historique complet des réunions

---

## 🛠️ **Configuration**

### **Variables d'Environnement Critiques**

```env
# Base de données (obligatoire)
DATABASE_URI="mongodb://127.0.0.1/rotary-club-tunis"

# Sécurité (obligatoire - 32+ caractères)
PAYLOAD_SECRET="votre-secret-de-64-caracteres-ici"

# Serveur (obligatoire)
PAYLOAD_PUBLIC_SERVER_URL="http://localhost:3000"
```

### **Configuration MongoDB Atlas (Production)**

```env
DATABASE_URI="mongodb+srv://app-user:password@cluster.mongodb.net/rotary_doyen?retryWrites=true&w=majority"
```

---

## 🔧 **Workflow des Bénévoles**

### **Création d'un Événement**

1. **Connectez-vous** à http://localhost:3000/admin
2. **Allez dans "Événements"** → "Créer nouveau"
3. **Remplissez en français** les informations de base
4. **Sauvegardez** - un brouillon arabe est automatiquement créé
5. **Travaillez sur la version arabe** si nécessaire
6. **Publiez** dans les deux langues

### **Création d'un Article**

1. **Connectez-vous** à http://localhost:3000/admin
2. **Allez dans "Articles"** → "Créer nouveau"
3. **Choisissez la catégorie** :
   - **Actualités** : Nouvelles du club
   - **Projets** : Présentation de projets Rotary
   - **Témoignages** : Histoires de bénévoles
   - **Partenariats** : Collaborations et alliances
   - **Annonces** : Communications importantes
4. **Remplissez le contenu** :
   - **Titre et sous-titre** (multilingue)
   - **Image principale** et **galerie**
   - **Extrait** pour les listes
   - **Contenu riche** avec éditeur
   - **Mots-clés** pour le SEO
5. **Options avancées** :
   - **Article à la une** : Affichage en page d'accueil
   - **Commentaires** : Autoriser les interactions
   - **SEO** : Métadonnées pour moteurs de recherche
6. **Publiez** : Le contenu est prêt pour le site web

### **Gestion des Photos**

- **Format**: PNG, JPEG, WebP
- **Taille**: Optimisée automatiquement pour le mobile
- **Consentement**: Case à cocher obligatoire pour le RGPD
- **Métadonnées**: Descriptions en français et arabe

---

## 📊 **Structure des Collections**

### **Événements (Events)**
- Titre (localisé)
- Date et lieu
- Description (éditeur riche)
- Galerie de photos
- Domaines d'action
- Métriques d'impact

### **Médias (Media)**
- Upload d'images
- Métadonnées EXIF supprimées (RGPD)
- Optimisation automatique WebP
- Descriptions localisées

### **Utilisateurs (Users)**
- Rôles: Admin, Éditeur, Bénévole
- Préférences de langue
- Gestion des accès

### **Articles (Articles)**
- **Champs multilingues** : Titre, sous-titre, contenu, extrait
- **Catégorisation** : 7 catégories prédéfinies pour Rotary
- **SEO optimisé** : Métadonnées et mots-clés
- **Galerie d'images** : Support multilingue pour légendes
- **Options avancées** : Articles à la une, commentaires, auteur
- **Éditeur riche** : Support RTL pour contenu arabe

### **Procès-Verbaux (Minutes)**
- Documents du conseil d'administration
- Accès restreint aux admins
- Téléchargement de PDFs signés

---

## 🔒 **Sécurité & Conformité**

### **RGPD (Règlement Général sur la Protection des Données)**
- ✅ Suppression automatique des métadonnées EXIF
- ✅ Consentement obligatoire pour les photos
- ✅ Audit logging de toutes les actions
- ✅ Export des données utilisateur

### **Sécurité**
- ✅ Authentification sécurisée
- ✅ Contrôle d'accès basé sur les rôles
- ✅ Headers de sécurité HTTP
- ✅ Secret de payload de 64 caractères

---

## 🌐 **Déploiement**

### **Développement Local**
```bash
npm run dev
```

### **Production (Vercel)**
```bash
# 1. Déployer sur Vercel
vercel

# 2. Configurer les variables d'environnement
vercel env add DATABASE_URI
vercel env add PAYLOAD_SECRET

# 3. Déployer
vercel --prod
```

### **Configuration Vercel Requise**
- **Plan**: Pro (fonctions serverless chaudes)
- **Région**: Paris (EU West) - meilleure latence pour la Tunisie
- **Variables d'environnement**: Toutes configurées

---

## 📱 **Optimisation Mobile**

### **Cibles**
- Xiaomi Redmi 9A (Android 10) - téléphone populaire en Tunisie
- Connexion 3G (Tunisiana)
- Objectif: <8 secondes de chargement

### **Optimisations**
- ✅ Images WebP automatiques
- ✅ Lazy loading des images
- ✅ Cache intelligent
- ✅ Compression GZIP

---

## 🆘 **Support & Dépannage**

### **Problèmes Courants**

#### **Erreur de connexion MongoDB**
```bash
# Vérifier la connexion
mongosh "mongodb://127.0.0.1/rotary-club-tunis"
```

#### **Brouillon arabe non créé**
- Vérifier que la langue de création est le français
- Contrôler les logs du serveur
- S'assurer que la collection Events a le hook configuré

#### **Problème d'affichage arabe**
- Vérifier l'encodage UTF-8
- Contrôler le support RTL
- Tester avec un navigateur moderne

### **Contacts de Support**
- **Technique**: [Votre email technique]
- **Contenu**: [Coordinateur Rotary Club Tunis Doyen]

---

## 📈 **Métriques de Succès**

| Métrique | Objectif | Mesure |
|----------|----------|---------|
| **Temps de publication** | Réduction de 50% | Chronométrage utilisateur |
| **Adoption bénévoles** | 100% en 2 semaines | Analytics admin |
| **Contenu en arabe** | 80% de couverture | Rapports CMS |
| **Satisfaction** | >4.5/5 | Sondage trimestriel |

---

## 🤝 **Contribution**

### **Pour les Bénévoles**
1. Tester les fonctionnalités
2. Reporter les bugs via l'interface admin
3. Suggérer des améliorations

### **Pour les Développeurs**
1. Forker le repository
2. Créer une branche feature
3. Soumettre une pull request
4. Respecter les standards de code

---

## 📄 **Licence**

Ce projet est développé spécifiquement pour Rotary Club Tunis Doyen dans le cadre de leur mission humanitaire.

**Version**: 1.0.0
**Date**: Août 2025
**Langues**: 🇫🇷 Français, 🇸🇦 Arabe, 🇺🇸 English

---

*Ce CMS a été conçu pour rendre la publication d'événements aussi simple que possible pour les bénévoles de Rotary Club Tunis Doyen, tout en maintenant les standards les plus élevés de sécurité et d'accessibilité.*

**🚀 Prêt à créer votre premier événement ?** Rendez-vous sur http://localhost:3000/admin
