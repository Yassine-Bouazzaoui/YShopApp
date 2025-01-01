const express = require('express');
const app = express();
const port = 3000;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

async function createUsersAndCarts() {
    try {
        // Lire le fichier users.json
        const data = await fs.readFile(path.join(__dirname, '..', 'JSON', 'users.json'), 'utf8');
        const { users } = JSON.parse(data);

        // Créer des utilisateurs à partir des données JSON
        const createdUsers = [];
        for (const user of users) {
            // Hacher le mot de passe avant de l'enregistrer
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Créer l'utilisateur avec le mot de passe haché
            const createdUser = await prisma.user.create({
                data: {
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    password: hashedPassword, // Utiliser le mot de passe haché
                },
            });
            createdUsers.push(createdUser);
        }

        console.log('Users created:', createdUsers);

        // Créer des paniers pour chaque utilisateur (sans produits)
        const createdCarts = [];
        for (const user of createdUsers) {
            const cart = await prisma.cart.create({
                data: {
                    userId: user.id,
                },
            });
            createdCarts.push(cart);
        }

        console.log('Carts created for users:', createdCarts);

    } catch (error) {
        console.error('Error creating users and carts:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createUsersAndCarts();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
