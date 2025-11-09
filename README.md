# 📘 TaskFlow API

API permettant l'authentification des utilisateurs avec JWT et la gestion de projets, de tâches et de tags.  
Développée avec **Node.js**, **Express** et **MongoDB**.

---

## 🚀 Prérequis

- [Node.js](https://nodejs.org/) (version 20 ou supérieure)
- [MongoDB](https://www.mongodb.com/) (local ou via un service cloud comme Atlas)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

---

## ⚙️ Installation

1. **Cloner le projet**
   ```bash
   git clone https://github.com/allecomte/api-task-flow.git
   cd api-task-flow
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Créer un fichier d’environnement**
   À la racine du projet, crée un fichier `.env` contenant les variables suivantes :
   ```env
   PORT
   JWT_SECRET 
   DB_USER
   DB_PASSWORD 
   DB_NAME
   ```

4. **(Optionnel) Initialiser la base de données avec des données de test**
   ```bash
   npm run seed
   ```

---

## 🏃‍♀️ Démarrer le serveur

Lancer l’API en mode développement :
```bash
npm start
```

Le serveur sera accessible par défaut sur :
```
http://localhost:3000
```

---

## 🧪 Lancer les tests

Le projet utilise **Jest** et **Supertest** pour les tests unitaires et d’intégration.

Exécuter tous les tests :
```bash
npm test
```

Générer un rapport de couverture :
```bash
npm run test-coverage
```

Les tests s’exécutent sur une base MongoDB en mémoire grâce à `mongodb-memory-server`.

---

## 📚 Documentation Swagger

Une documentation est disponible via Swagger UI pour consulter et tester les routes disponibles :

```
http://localhost:3000/api-docs
```

---

## 🧱 Structure du projet

```
api-task-flow/
├── docs/                   # Documentation 
├── scripts/
│   └── seed.js             # Script d’initialisation des données
├── src/
│   ├── controllers/        # Logique métier
│   ├── middlewares/        # Middlewares d'authentification, d'accès et de validation
│   ├── models/             # Schémas Mongoose
│   ├── routes/             # Routes Express
│   ├── schemas/            # Schémas Joi
│   ├── services/           # Logique métier réutilisable
│   ├── utils/              # Fonctions génériques
│   ├── config.js           # Configuration DB
│   ├── server.js           # Point d’entrée de l’application
│   ├── swagger.js          # Configuration Swagger UI
├── tests/                  # Tests Jest / Supertest
├── .env                    # Fichier contenant les variables d’environnement
├── jest.config.js          # Configuration Jest
├── package.json
└── README.md
```

---

## 🔐 Sécurité et limitations

- Les routes d’authentification utilisent un **rate limiter** via `express-rate-limit`.
- Les mots de passe sont hachés avec **bcryptjs**.
- Les tokens d’authentification sont signés avec **jsonwebtoken**.

---

## 🧩 Technologies principales

| Outil / Lib | Utilité |
|--------------|----------|
| **Express** | Framework backend |
| **Mongoose** | ORM MongoDB |
| **Joi / express-validator** | Validation des entrées |
| **bcryptjs** | Hachage des mots de passe |
| **jsonwebtoken (JWT)** | Authentification |
| **Swagger UI** | Documentation des routes |
| **Jest / Supertest** | Tests unitaires et E2E |
| **express-rate-limit** | Limitation des requêtes |

