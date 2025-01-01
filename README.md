# ProjetExpress

## Description

ProjetExpress est une application web de commerce électronique construite avec Express.js pour le backend et Angular pour le frontend. L'application permet aux utilisateurs de parcourir des produits, de les ajouter à leur panier, de passer des commandes et de gérer leur compte.

## Prérequis

- Node.js (version 14 ou supérieure)
- npm (version 6 ou supérieure)
- Angular CLI (version 12 ou supérieure)

## Installation

### Backend

1. Clonez le dépôt :
    ```bash
    git clone https://github.com/Yassine-Bouazzaoui/YShopApp.git
    cd YshopApp
    ```

2. Installez les dépendances :
    ```bash
    npm install
    ```

3. Configurez la base de données Prisma :
    ```bash
    npx prisma migrate dev --name init
    ```

4. Démarrez le serveur Express :
    ```bash
    npm start
    ```

### Frontend

1. Allez dans le répertoire du frontend :
    ```bash
    cd my-angular-app
    ```

2. Installez les dépendances :
    ```bash
    npm install
    ```

3. Démarrez l'application Angular :
    ```bash
    ng serve
    ```

## Utilisation

### Pages Principales

- **Home** : Page d'accueil de l'application.
- **Products** : Page de liste des produits disponibles.
- **My Account** : Page de gestion du compte utilisateur.
- **My Cart** : Page de gestion du panier et de passage de commande.
- **About** : Page d'informations sur l'application.

### Fonctionnalités

- **Parcourir les produits** : Les utilisateurs peuvent parcourir les produits disponibles sur la page Products.
- **Ajouter au panier** : Les utilisateurs peuvent ajouter des produits à leur panier.
- **Passer une commande** : Les utilisateurs peuvent passer une commande en fournissant des informations de livraison et de paiement.
- **Gérer le compte** : Les utilisateurs peuvent mettre à jour leurs informations de compte sur la page My Account.

## API

### Endpoints

- **GET /products** : Récupère la liste des produits.
- **GET /cart?userId={userId}** : Récupère les articles du panier pour un utilisateur spécifique.
- **POST /order** : Crée une nouvelle commande.
- **GET /orders?userId={userId}** : Récupère les commandes pour un utilisateur spécifique.
- **PUT /account** : Met à jour les informations de compte de l'utilisateur.

### Exemple de requête pour mettre à jour le compte utilisateur

```javascript
document.getElementById('accountForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const updatedName = document.getElementById('editName').value;
    const updatedEmail = document.getElementById('editEmail').value;

    try {
        const response = await fetch(`http://localhost:3000/account`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, name: updatedName, email: updatedEmail }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        document.getElementById('accountName').textContent = result.user.name;
        document.getElementById('accountEmail').textContent = result.user.email;
        document.getElementById('editAccountForm').style.display = 'none';
    } catch (error) {
        console.error('Error updating account information:', error);
    }
});