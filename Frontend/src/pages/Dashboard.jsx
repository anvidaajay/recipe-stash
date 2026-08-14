import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");

  const [editingRecipe, setEditingRecipe] = useState(null);

  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [url, setUrl] = useState("");

  const [error, setError] = useState("");

  const handleLogout = () => {
    logout();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  // Get recipes from Django
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await api.get("/api/recipes/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRecipes(response.data);
      } catch (error) {
        console.error(error);
        setError("Could not load your recipes.");
      }
    };

    fetchRecipes();
  }, []);

  // Open Add Recipe modal
  const openAddModal = () => {
    setEditingRecipe(null);
    setTitle("");
    setIngredients("");
    setUrl("");
    setError("");
    setShowModal(true);
  };

  // Open Edit Recipe modal
  const openEditModal = (recipe) => {
    setEditingRecipe(recipe);
    setTitle(recipe.title);
    setIngredients(recipe.ingredients);
    setUrl(recipe.source_url);
    setError("");
    setShowModal(true);
  };

  // Add OR Edit recipe
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("access_token");

      if (editingRecipe) {
        // EDIT existing recipe
        const response = await api.patch(
          `/api/recipes/${editingRecipe.id}/`,
          {
            title: title,
            ingredients: ingredients,
            source_url: url,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRecipes(
          recipes.map((recipe) =>
            recipe.id === editingRecipe.id
              ? response.data
              : recipe
          )
        );
      } else {
        // ADD new recipe
        const response = await api.post(
          "/api/recipes/",
          {
            title: title,
            ingredients: ingredients,
            source_url: url,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRecipes([...recipes, response.data]);
      }

      setTitle("");
      setIngredients("");
      setUrl("");
      setEditingRecipe(null);
      setShowModal(false);
      setError("");

    } catch (error) {
      console.error(error);
      setError(
        editingRecipe
          ? "Could not update the recipe."
          : "Could not save the recipe."
      );
    }
  };

  // Delete recipe
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("access_token");

      await api.delete(`/api/recipes/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRecipes(
        recipes.filter((recipe) => recipe.id !== id)
      );

    } catch (error) {
      console.error(error);
      setError("Could not delete the recipe.");
    }
  };

  // Search recipes
  const filteredRecipes = recipes.filter((recipe) => {
    const searchText = search.toLowerCase();

    return (
      recipe.title.toLowerCase().includes(searchText) ||
      recipe.ingredients.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="dashboard">

      {/* NAVBAR */}
      <nav className="navbar">

        <div className="brand">
          🍳 Recipe Stash
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </nav>

      <main className="dashboard-content">

        {/* HEADER */}
        <div className="dashboard-header">

          <div>

            <h1>
              My Recipe Collection
            </h1>

            <p>
              Keep all your favorite recipes in one place.
            </p>

            <p>
              <strong>{recipes.length}</strong>{" "}
              {recipes.length === 1
                ? "recipe"
                : "recipes"}{" "}
              saved
            </p>

          </div>

          <button
            className="add-button"
            onClick={openAddModal}
          >
            + Add Recipe
          </button>

        </div>

        {/* SEARCH */}
        {recipes.length > 0 && (

          <div
            style={{
              marginBottom: "30px",
              maxWidth: "500px",
            }}
          >

            <input
              type="text"
              placeholder="🔍 Search recipes or ingredients..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "1px solid #eadfd5",
                borderRadius: "12px",
                fontSize: "15px",
                outline: "none",
                background: "white",
              }}
            />

          </div>

        )}

        {/* ERROR */}
        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {/* RECIPES */}
        {filteredRecipes.length > 0 ? (

          <div className="recipe-grid">

            {filteredRecipes.map((recipe) => (

              <div
                className="recipe-card"
                key={recipe.id}
              >

                <div className="recipe-icon">
                  🍴
                </div>

                <h2>
                  {recipe.title}
                </h2>

                <p>
                  <strong>Ingredients:</strong>
                </p>

                <p className="ingredients">
                  {recipe.ingredients}
                </p>

                <div className="card-actions">

                  <a
                    href={recipe.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="view-button"
                  >
                    View Recipe
                  </a>

                  <button
                    className="edit-button"
                    onClick={() =>
                      openEditModal(recipe)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      handleDelete(recipe.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div
            style={{
              textAlign: "center",
              padding: "70px 20px",
              background: "white",
              borderRadius: "20px",
              border: "1px solid #eadfd5",
            }}
          >

            <div
              style={{
                fontSize: "55px",
                marginBottom: "15px",
              }}
            >
              🍲
            </div>

            {search ? (
              <>
                <h2>
                  No recipes found
                </h2>

                <p style={{ color: "#777" }}>
                  Try searching for another
                  recipe or ingredient.
                </p>
              </>
            ) : (
              <>
                <h2>
                  Your recipe stash is empty
                </h2>

                <p style={{ color: "#777" }}>
                  Start building your collection
                  by adding your first recipe.
                </p>

                <button
                  className="add-button"
                  onClick={openAddModal}
                >
                  + Add Your First Recipe
                </button>
              </>
            )}

          </div>

        )}

      </main>

      {/* ADD / EDIT MODAL */}
      {showModal && (

        <div className="modal-overlay">

          <div className="modal">

            <button
              className="close-button"
              onClick={() => {
                setShowModal(false);
                setEditingRecipe(null);
              }}
            >
              ×
            </button>

            <h2>
              {editingRecipe
                ? "Edit Recipe"
                : "Add New Recipe"}
            </h2>

            <p>
              {editingRecipe
                ? "Update your recipe details."
                : "Save a recipe to your personal stash."}
            </p>

            <form onSubmit={handleSubmit}>

              <label>
                Recipe Title
              </label>

              <input
                type="text"
                placeholder="Example: Chicken Pasta"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                required
              />

              <label>
                Source URL
              </label>

              <input
                type="url"
                placeholder="https://example.com/recipe"
                value={url}
                onChange={(e) =>
                  setUrl(e.target.value)
                }
                required
              />

              <label>
                Ingredients
              </label>

              <textarea
                placeholder="Chicken, onion, garlic..."
                value={ingredients}
                onChange={(e) =>
                  setIngredients(e.target.value)
                }
                required
              />

              <button
                type="submit"
                className="save-button"
              >
                {editingRecipe
                  ? "Save Changes"
                  : "Save Recipe"}
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Dashboard;