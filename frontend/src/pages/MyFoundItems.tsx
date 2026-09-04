import { useEffect, useState } from "react";
import api from "../services/api";

interface Item {
  id: string;
  title: string;
  location: string;
  foundAt: string;
  status: string;
  category: {
    name: string;
  };
}

export default function MyFoundItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState("");

  async function loadItems() {
    try {
      const response = await api.get("/found-items/my", {
        params: {
          page: 1,
          limit: 50,
        },
      });

      setItems(response.data.items || []);
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Unable to load your found items",
      );
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function deleteItem(id: string) {
    if (!window.confirm("Delete this found item?")) {
      return;
    }

    try {
      await api.delete(`/found-items/${id}`);
      loadItems();
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to delete item");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">MY ACCOUNT</p>
          <h1>My Found Items</h1>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="items-grid">
        {items.length === 0 ? (
          <div className="empty-state">
            <h3>You haven't reported any found items.</h3>
          </div>
        ) : (
          items.map((item) => (
            <div className="item-card" key={item.id}>
              <span className="status-badge">{item.status}</span>

              <h3>{item.title}</h3>

              <p>
                <strong>Category:</strong> {item.category?.name}
              </p>

              <p>
                <strong>Location:</strong> {item.location}
              </p>

              <button
                className="danger-button"
                onClick={() => deleteItem(item.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
