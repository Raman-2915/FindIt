import { type FormEvent, useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Item {
  id: string;
  title: string;
  location: string;
  foundAt: string;
  status: string;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function FoundItems() {
  const { user } = useAuth();

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [foundLocation, setFoundLocation] = useState("");
  const [foundAt, setFoundAt] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCategories() {
    try {
      const response = await api.get("/categories");

      setCategories(response.data.categories || response.data || []);
    } catch {
      // Ignore.
    }
  }

  async function loadItems() {
    try {
      setError("");

      const response = await api.get("/found-items", {
        params: {
          page,
          limit: 10,
          ...(categoryId && { categoryId }),
          ...(location && { location }),
        },
      });

      setItems(response.data.items || []);

      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to load found items");
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadItems();
  }, [page, categoryId, location]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      await api.post("/found-items", {
        categoryId: newCategoryId,
        title,
        description,
        location: foundLocation,
        foundAt,
      });

      setMessage("Found item reported successfully.");

      setTitle("");
      setDescription("");
      setFoundLocation("");
      setFoundAt("");
      setNewCategoryId("");

      setShowForm(false);

      loadItems();
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to report found item");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">FINDIT</p>
          <h1>Found Items</h1>
          <p>Browse items reported as found.</p>
        </div>

        {user && (
          <button
            className="primary-button"
            onClick={() => setShowForm(!showForm)}
          >
            + Report Found Item
          </button>
        )}
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="form-card" onSubmit={handleCreate}>
          <h2>Report Found Item</h2>

          <label>Category</label>

          <select
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
            required
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <label>Title</label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Blue Dell Laptop"
            required
          />

          <label>Description</label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the item"
            required
          />

          <label>Location</label>

          <input
            value={foundLocation}
            onChange={(e) => setFoundLocation(e.target.value)}
            placeholder="Where did you find it?"
            required
          />

          <label>Found At</label>

          <input
            type="datetime-local"
            value={foundAt}
            onChange={(e) => setFoundAt(e.target.value)}
            required
          />

          <button className="primary-button">Submit Found Item</button>
        </form>
      )}

      <div className="filters">
        <select
          value={categoryId}
          onChange={(e) => {
            setPage(1);
            setCategoryId(e.target.value);
          }}
        >
          <option value="">All categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Search location"
          value={location}
          onChange={(e) => {
            setPage(1);
            setLocation(e.target.value);
          }}
        />
      </div>

      <div className="items-grid">
        {items.length === 0 ? (
          <div className="empty-state">
            <div>📦</div>
            <h3>No found items</h3>
            <p>Try changing your filters.</p>
          </div>
        ) : (
          items.map((item) => (
            <div className="item-card" key={item.id}>
              <div className="item-icon">📦</div>

              <span className="status-badge">{item.status}</span>

              <h3>{item.title}</h3>

              <p>
                <strong>Category:</strong> {item.category?.name}
              </p>

              <p>
                <strong>Location:</strong> {item.location}
              </p>

              <p>
                <strong>Found:</strong>{" "}
                {new Date(item.foundAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
