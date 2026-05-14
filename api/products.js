
import { db } from '@vercel/postgres';

export default async function handler(req, res) {
    const client = await db.connect();

    if (req.method === 'GET') {
        const { rows } = await client.sql`SELECT * FROM products ORDER BY product_id ASC;`;
        return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
        const { name, price, stock } = req.body;
        const { rows } = await client.sql`
            INSERT INTO products (category_id, name, price, stock) 
            VALUES (1, ${name}, ${price}, ${stock}) 
            RETURNING *;
        `;
        return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        await client.sql`DELETE FROM products WHERE product_id = ${id};`;
        return res.status(200).json({ success: true });
    }
}


