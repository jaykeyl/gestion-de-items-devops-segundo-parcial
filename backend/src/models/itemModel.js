const pool = require("../config/database");

class ItemModel {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
    `;

    try {
      await pool.query(query);
      console.log("✅ Tabla items verificada/creada");
    } catch (error) {
      console.error("❌ Error creando tabla:", error);
      throw error;
    }
  }

  static async getAll() {
    const query = "SELECT * FROM items ORDER BY created_at DESC";
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = "SELECT * FROM items WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(data) {
    const query = `
      INSERT INTO items (name, description)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [data.name, data.description];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, data) {
    const query = `
      UPDATE items
      SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const values = [data.name, data.description, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = "DELETE FROM items WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = ItemModel;
