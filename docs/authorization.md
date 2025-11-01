# 🧩 Matrice d’autorisations

Ce document décrit les autorisations d’accès aux différentes fonctionnalités du projet selon les rôles et contextes d’utilisation.  
Il sert de référence pour la logique de sécurité dans le back-end et la visibilité des actions côté front-end.

---

## 🔖 Légende

| Symbole | Signification |
|----------|----------------|
| ✅ | Autorisé |
| 🚫 | Interdit |
| 🟠 | Conditionnel (ex. si propriétaire, membre, auteur…) |

---

## 👥 Rôles et contextes

| Rôle | Description | Contexte possible | 
|-----------------|--------------|--------------|
| **Utilisateur** | Personne ayant uniquement le rôle ROLE_USER | propriétaire d'un projet |
| **Manager** | Personne ayant le rôle ROLE_MANAGER | membre d'un projet, assigné à une tâche |

---

## 📊 Matrice d'autorisations

| **Action** | **Utilisateur** | **Manager**  |
|-------------|-----------------|--------------|
|  Créer un compte utilisateur       | ✅ | ✅ | 
|  S'identifier        | ✅ | ✅ | 
|  Créer un projet    | 🚫 | ✅ | 
|  Modifier un projet   | 🚫 | 🟠 (si propriétaire du projet) | 
|  Lire un projet       | 🟠 (si membre du projet) | ✅ | 
|  Supprimer un projet        | 🚫 | 🟠 (si propriétaire du projet) | 
|  Ajouter un membre au projet    | 🚫 | ✅ | 
|  Retirer un membre au projet    | 🚫 | ✅ | 
|  Créer une tâche   | 🚫 | 🟠 (si propriétaire du projet auquel appartient la tâche) | 
|  Modifier une tâche   | 🟠 (si assigné à la tâche et peut uniquement modifier l'attribut "state") | 🟠 (si propriétaire du projet auquel appartient la tâche) | 
|  Supprimer une tâche   | 🚫 | 🟠 (si propriétaire du projet auquel appartient la tâche) | 
| Lire une tâche | 🟠 (si assigné à la tâche) | ✅ | 
| Créer un tag | 🚫 | 🟠 (si propriétaire du projet auquel appartient le tag) | 
| Modifier un tag | 🚫 | 🟠 (si propriétaire du projet auquel appartient le tag) | 
| Supprimer un tag | 🚫 | 🟠 (si propriétaire du projet auquel appartient le tag) | 
| Lire un tag | 🟠 (si membre du projet auquel appartient le tag) | 🟠 (si propriétaire du projet auquel appartient le tag) | 
| Associer/dissocier un tag à une tâche | 🚫 | 🟠 (si propriétaire du projet auquel appartient le tag) | 

---

## 🧠 Notes

- Le rôles **Manager** hérite des autorisations inférieures.  
- Cette matrice doit rester synchronisée avec le middleware d’accès (`middlewares/access.js`)
---

## 🛠️ Maintenance

> TO DO tests unitaires ou d’intégration pour vérifier la conformité des permissions avec cette matrice.

---

📅 **Dernière mise à jour :** 02/11/2025
