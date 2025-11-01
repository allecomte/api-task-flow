# 🔌 Endpoints API

| Méthode | Route | Description | Authentification |
|----------|-------|--------------|------------------|
| <span style="color:orange">POST</span> | `/api/users/register` | Créé un compte utilisateur | Non |
| <span style="color:orange">POST</span> | `/api/users/login` | Identifie un utilisateur | Non |
|
| <span style="color:green">GET</span> | `/api/projects` | Liste tous les projets | Oui |
| <span style="color:orange">POST</span> | `/api/projects` | Crée un projet | Oui |
| <span style="color:green">GET</span> | `/api/projects/:id` | Détails d’un projet | Oui |
| <span style="color:purple">PATCH</span> | `/api/projects/:id` | Modifie un projet | Oui |
| <span style="color:red">DELETE</span> | `/api/projects/:id` | Supprime un projet | Oui |
| <span style="color:orange">POST</span> | `/api/projects/:id/members` | Ajoute un membre au projet | Oui |
| <span style="color:red">DELETE</span> | `/api/projects/:id/members/:userId` | Retire un membre au projet | Oui |
|
| <span style="color:orange">POST</span> | `/api/tasks` | Crée une tâche | Oui |
| <span style="color:green">GET</span> | `/api/tasks/:id` | Détails d’une tâche | Oui |
| <span style="color:purple">PATCH</span> | `/api/tasks/:id` | Modifie une tâche | Oui |
| <span style="color:red">DELETE</span> | `/api/tasks/:id` | Supprime une tâche | Oui |
| <span style="color:orange">POST</span> | `/api/tasks/:id/tags/:tagId` | Associe/dissocie un tag d'une tâche | Oui |
|
| <span style="color:orange">POST</span> | `/api/projects/:projectId/tags` | Crée un tag | Oui |
| <span style="color:green">GET</span> | `/api/projects/:projectId/tags` | Liste les tags d'un projet | Oui |
| <span style="color:purple">PATCH</span> | `/api/tags/:id` | Modifie un tag | Oui |
| <span style="color:red">DELETE</span> | `/api/tags/:id` | Supprime un tag | Oui |

📅 **Dernière mise à jour :** 02/11/2025