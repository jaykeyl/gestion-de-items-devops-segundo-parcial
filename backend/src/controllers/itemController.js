const ItemModel = require("../models/itemModel");

class ItemController {
  static async getAll(req, res) {
    try {
      const items = await ItemModel.getAll();
      res.json(items);
    } catch (error) {
      console.error("Error en getAll:", error);
      res.status(500).json({
        error: "Error al obtener items",
        message: error.message,
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await ItemModel.getById(id);

      if (!item) {
        return res.status(404).json({ error: "Item no encontrado" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error en getById:", error);
      res.status(500).json({
        error: "Error al obtener item",
        message: error.message,
      });
    }
  }

  static async create(req, res) {
    try {
      const { name, description } = req.body;

      if (!name || !description) {
        return res.status(400).json({
          error: "Name y description son requeridos",
        });
      }

      if (name.trim().length === 0 || description.trim().length === 0) {
        return res.status(400).json({
          error: "Name y description no pueden estar vacíos",
        });
      }

      const newItem = await ItemModel.create({
        name: name.trim(),
        description: description.trim(),
      });
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error en create:", error);
      res.status(500).json({
        error: "Error al crear item",
        message: error.message,
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      if (!name || !description) {
        return res.status(400).json({
          error: "Name y description son requeridos",
        });
      }

      if (name.trim().length === 0 || description.trim().length === 0) {
        return res.status(400).json({
          error: "Name y description no pueden estar vacíos",
        });
      }

      const updatedItem = await ItemModel.update(id, {
        name: name.trim(),
        description: description.trim(),
      });

      if (!updatedItem) {
        return res.status(404).json({ error: "Item no encontrado" });
      }

      res.json(updatedItem);
    } catch (error) {
      console.error("Error en update:", error);
      res.status(500).json({
        error: "Error al actualizar item",
        message: error.message,
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedItem = await ItemModel.delete(id);

      if (!deletedItem) {
        return res.status(404).json({ error: "Item no encontrado" });
      }

      res.json({
        message: "Item eliminado exitosamente",
        item: deletedItem,
      });
    } catch (error) {
      console.error("Error en delete:", error);
      res.status(500).json({
        error: "Error al eliminar item",
        message: error.message,
      });
    }
  }
}

module.exports = ItemController;
