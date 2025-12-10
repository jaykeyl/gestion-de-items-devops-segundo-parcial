import React, { useState, useEffect } from "react";
import { getItems, createItem, updateItem, deleteItem } from "./services/api";
import "./App.css";

function App() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getItems();
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError(
        "Error al cargar los items. Verifica que el backend esté funcionando."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (editingId) {
        await updateItem(editingId, formData);
      } else {
        await createItem(formData);
      }

      setFormData({ name: "", description: "" });
      setEditingId(null);
      fetchItems();
    } catch (error) {
      console.error("Error saving item:", error);
      setError("Error al guardar el item");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, description: item.description });
    setEditingId(item.id);
    setError("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este item?")) {
      try {
        setLoading(true);
        setError("");
        await deleteItem(id);
        fetchItems();
      } catch (error) {
        console.error("Error deleting item:", error);
        setError("Error al eliminar el item");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setError("");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1> Gestión de Items versión 2</h1>
      </header>

      <main className="container">
        {error && <div className="error-message">⚠️ {error}</div>}

        <section className="form-section">
          <h2>{editingId ? "✏️ Editar Item" : "Crear Nuevo Item"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nombre:</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ingrese el nombre"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción:</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ingrese la descripción"
                rows="4"
                disabled={loading}
              />
            </div>

            <div className="button-group">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading
                  ? "⏳ Guardando..."
                  : editingId
                  ? "Actualizar"
                  : "Crear"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                  disabled={loading}
                >
                  ❌ Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="list-section">
          <h2>Lista de Items</h2>
          {loading && !items.length ? (
            <div className="loading">⏳ Cargando...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <p>📭 No hay items registrados</p>
              <p>Crea tu primer item usando el formulario de arriba</p>
            </div>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item.id} className="item-card">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="item-meta">
                    <small>
                      Creado: {new Date(item.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="item-actions">
                    <button
                      onClick={() => handleEdit(item)}
                      className="btn-edit"
                      disabled={loading}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn-delete"
                      disabled={loading}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="App-footer">
        <p>Proyecto Docker CI/CD - Grupito Increible</p>
      </footer>
    </div>
  );
}

export default App;
