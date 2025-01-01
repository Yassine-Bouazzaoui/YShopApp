const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const prisma = new PrismaClient();

async function main() {
    try {
        // Lire le fichier products.json
        const data = await fs.readFile(path.join(__dirname, '..', 'JSON', 'products.json'), 'utf8');
        const { products } = JSON.parse(data); // Accéder à la clé "products"

        if (!Array.isArray(products)) {
            throw new TypeError('products is not an array');
        }

        // Créer des produits à partir des données JSON
        for (const product of products) {
            const newProduct = await prisma.product.create({
                data: {
                    title: product.title,
                    description: product.description,
                    category: product.category,
                    price: product.price,
                    thumbnail: product.thumbnail
                },
            });
            console.log(`Created product: ${newProduct.title}`);
        }
    } catch (error) {
        console.error('Error adding products:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();