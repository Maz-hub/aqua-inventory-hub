// Apparel is the public-facing apparel inventory page for all authenticated users.
// No props — it fetches its own data on mount.
//
// State overview:
//   products                   - full list of apparel products, each with nested variants
//   loading                    - shows a loading card until the first fetch completes
//   searchTerm                 - live text filter on product name
//   selectedCategory           - category ID filter
//   selectedColor              - colour ID filter; matches if any variant has that colour
//   selectedClothingSize       - clothing size ID filter; matches if any variant has that size
//   selectedFootwearSize       - footwear size ID filter; matches if any variant has that size
//   selectedGender             - gender code filter (U/M/W/Y); matched against product.gender
//   categories / colors        - reference lists for filter dropdowns
//   clothingSizes / footwearSizes - sizes split by type from a single API call so each
//                                  filter dropdown only shows relevant sizes
//   showFilters                - toggles the filter panel on mobile
//   showDetailsModal + selectedProductForDetails - controls ApparelDetailsModal
//   showRequestModal + selectedProductForRequest - controls ApparelRequestModal
//   selectionOpen              - controls SelectionDrawer visibility
//
// fetchSizes splits the single /api/apparel/sizes/ response into two arrays using
// size_type so the clothing and footwear dropdowns stay separate.
//
// filteredProducts is derived on every render from all six active filters.
// Colour, clothing size, and footwear size filters check across a product's variants,
// so a product passes the colour filter if ANY of its variants match.
//
// Variants display:
//   Variants are grouped by gender (U, M, W, Y) and sorted by display_order within
//   each group. Gender groups with no variants are skipped entirely.
//   Each size badge shows the size value and stock count in parentheses.
//   Badges at or below minimum_stock_level get a red border and background.
//   In-stock badges use product.primary_color.hex_code at 40% opacity for the background.
//   White products get a gray border instead to keep the badge visible.
//
// "Add to Request" button:
//   Disabled (and shows "Out of Stock") when every variant has qty_stock === 0.
//   On close, ApparelRequestModal also opens the SelectionDrawer.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import ApparelDetailsModal from "../components/ApparelDetailsModal";
import ApparelRequestModal from "../components/ApparelRequestModal";

import Footer from "../components/Footer";
import Header from "../components/Header";
import SelectionDrawer from "../components/SelectionDrawer";

function Apparel() {
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedClothingSize, setSelectedClothingSize] = useState("");
  const [selectedFootwearSize, setSelectedFootwearSize] = useState("");
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [clothingSizes, setClothingSizes] = useState([]);
  const [footwearSizes, setFootwearSizes] = useState([]);
  const navigate = useNavigate();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] =
    useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedProductForRequest, setSelectedProductForRequest] = useState(null);
  const [selectedGender, setSelectedGender] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchColors();
    fetchSizes();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    api
      .get("/api/apparel/products/")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        alert("Failed to load apparel inventory");
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    api
      .get("/api/apparel/categories/")
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
      });
  };

  const fetchColors = () => {
    api
      .get("/api/apparel/colors/")
      .then((res) => {
        setColors(res.data);
      })
      .catch((err) => {
        console.error("Failed to load colors:", err);
      });
  };

  // Splits the single sizes response into two arrays so the two filter
  // dropdowns (clothing vs footwear) only show relevant options.
  const fetchSizes = () => {
    api
      .get("/api/apparel/sizes/")
      .then((res) => {
        const clothing = res.data.filter((s) => s.size_type === "clothing");
        const footwear = res.data.filter((s) => s.size_type === "footwear");
        setClothingSizes(clothing);
        setFootwearSizes(footwear);
      })
      .catch((err) => {
        console.error("Failed to load sizes:", err);
      });
  };

  // Applies all six active filters to produce the visible product grid.
  // Colour and size filters check across variants — a product passes if ANY variant matches.
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.product_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || product.category.id === parseInt(selectedCategory);

    const matchesGender = !selectedGender || (product.variants && product.variants.some(v => v.gender === selectedGender));

    // Colour filter checks whether any variant has the selected colour.
    const matchesColor =
      !selectedColor ||
      (product.variants &&
        product.variants.some((v) => v.color.id === parseInt(selectedColor)));

    // Clothing size filter checks whether any variant has the selected size.
    const matchesClothingSize =
      !selectedClothingSize ||
      (product.variants &&
        product.variants.some(
          (v) => v.size.id === parseInt(selectedClothingSize),
        ));

    // Footwear size filter checks whether any variant has the selected size.
    const matchesFootwearSize =
      !selectedFootwearSize ||
      (product.variants &&
        product.variants.some(
          (v) => v.size.id === parseInt(selectedFootwearSize),
        ));

    return (
      matchesSearch &&
      matchesCategory &&
      matchesGender &&
      matchesColor &&
      matchesClothingSize &&
      matchesFootwearSize
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header onSelectionOpen={() => setSelectionOpen(true)} />
      <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-wa-blue hover:text-wa-ocean flex items-center gap-2 cursor-pointer font-medium transition-colors"
        >
          ← Back to Home
        </button>

        <div className="flex justify-center items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-wa-navy mb-2 text-center">
              Apparel Inventory
            </h1>
            <p className="text-gray-600">
              {filteredProducts.length} products in stock
            </p>
          </div>
        </div>

        {/* Search and Filter Bar - Two Rows */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          {/* Mobile: Show Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden w-full flex items-center justify-between px-4 py-2 bg-wa-navy text-white rounded-md font-medium mb-4"
          >
            <span>Filters</span>
            <span className="text-xl">{showFilters ? "−" : "+"}</span>
          </button>

          {/* Filter Controls - Hidden on mobile unless showFilters is true */}
          <div
            className={`${showFilters ? "block" : "hidden"} md:block space-y-4`}
          >
            {/* Row 1: Search, Category, and Gender */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="md:flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form_input"
                />
              </div>

              {/* Category Filter */}
              <div className="md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form_input"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender Filter */}
              <div className="md:w-48">
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="form_input"
                >
                  <option value="">All Genders</option>
                  <option value="U">Unisex</option>
                  <option value="M">Men</option>
                  <option value="W">Women</option>
                  <option value="Y">Youth</option>
                </select>
              </div>
            </div>

            {/* Row 2: Color, Size Filters, and Clear Button */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Color Filter */}
              <div className="md:flex-1">
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="form_input"
                >
                  <option value="">All Colors</option>
                  {colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.color_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clothing Size Filter */}
              <div className="md:flex-1">
                <select
                  value={selectedClothingSize}
                  onChange={(e) => setSelectedClothingSize(e.target.value)}
                  className="form_input"
                >
                  <option value="">All Clothing Sizes</option>
                  {clothingSizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.size_value}
                    </option>
                  ))}
                </select>
              </div>

              {/* Footwear Size Filter */}
              <div className="md:flex-1">
                <select
                  value={selectedFootwearSize}
                  onChange={(e) => setSelectedFootwearSize(e.target.value)}
                  className="form_input"
                >
                  <option value="">All Footwear Sizes</option>
                  {footwearSizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.size_value}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              <div className="md:w-32">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setSelectedGender("");
                    setSelectedColor("");
                    setSelectedClothingSize("");
                    setSelectedFootwearSize("");
                  }}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600 transition-colors h-full"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg">Loading apparel...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg">
              No products found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
              >
                {/* Product Image */}
                <div className="h-48 bg-white flex items-center justify-center overflow-hidden">
                  {product.product_image ? (
                    <img
                      src={product.product_image.replace(
                        "http://localhost:8000",
                        "",
                      )}
                      alt={product.product_name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">👕</span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-wa-navy mb-1 truncate">
                    {product.product_name}
                  </h3>

                  <div className="flex justify-between items-center my-2">
                    <span className="text-sm text-wa-blue">
                      {product.category.name}
                    </span>
                    {/* Show unique colour names across all variants */}
                    <span className="text-sm text-gray-600">
                      {product.variants && product.variants.length > 0
                        ? [...new Set(product.variants.map((v) => v.color.color_name))].join(", ")
                        : "No variants yet"}
                    </span>
                  </div>

                  {/* Variants grouped by gender (U, M, W, Y order), each group
                      sorted by size display_order. Groups with no variants are skipped.
                      Low-stock badges get red; in-stock badges use the product's primary colour. */}
                  <div className="border-t pt-3 mt-3 flex-1">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Available Sizes:
                    </p>
                    {product.variants && product.variants.length > 0 ? (
                      <div className="space-y-3">
                        {["U", "M", "W", "Y"].map((genderCode) => {
                          const genderVariants = product.variants
                            .filter((v) => v.gender === genderCode)
                            .sort(
                              (a, b) =>
                                a.size.display_order - b.size.display_order,
                            );

                          if (genderVariants.length === 0) return null;

                          const genderLabel =
                            genderCode === "U"
                              ? "Unisex"
                              : genderCode === "M"
                                ? "Men"
                                : genderCode === "W"
                                  ? "Women"
                                  : "Youth";

                          return (
                            <div key={genderCode}>
                              {/* Gender Label */}
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                {genderLabel}:
                              </p>

                              {/* Size Badges — red when at/below minimum, coloured otherwise.
                                  White products get a gray border so the badge stays visible. */}
                              <div className="flex flex-wrap gap-1 mb-2">
                                {genderVariants.map((variant) => (
                                  <span
                                    key={variant.id}
                                    className={`px-2 py-1 rounded text-xs ${
                                      variant.qty_stock <=
                                      variant.minimum_stock_level
                                        ? "bg-red-100 text-red-700 border-2 border-red-400"
                                        : ""
                                    }`}
                                    style={{
                                      backgroundColor:
                                        variant.qty_stock >
                                          variant.minimum_stock_level &&
                                        product.primary_color
                                          ? `${product.primary_color.hex_code}40`
                                          : variant.qty_stock >
                                              variant.minimum_stock_level
                                            ? "#e5e7eb40"
                                            : undefined,
                                      color:
                                        variant.qty_stock >
                                        variant.minimum_stock_level
                                          ? "#1f2937"
                                          : undefined,
                                      border:
                                        variant.qty_stock >
                                          variant.minimum_stock_level &&
                                        product.primary_color
                                          ? product.primary_color.hex_code.toLowerCase() ===
                                              "#ffffff" ||
                                            product.primary_color.hex_code.toLowerCase() ===
                                              "#fff"
                                            ? "1px solid #9ca3af"
                                            : `1px solid ${product.primary_color.hex_code}`
                                          : variant.qty_stock >
                                              variant.minimum_stock_level
                                            ? "1px solid #d1d5db"
                                            : undefined,
                                    }}
                                  >
                                    {variant.size.size_value} - (
                                    <span className="font-bold">
                                      {variant.qty_stock}
                                    </span>
                                    )
                                  </span>
                                ))}
                              </div>

                              {/* Visual Separator (except for last group) */}
                              {genderCode !== "Y" && (
                                <div className="border-b border-gray-200 mt-2"></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No variants yet</p>
                    )}
                  </div>

                  {/* Action Buttons — Add to Request is disabled when all variants are out of stock */}
                  <div className="space-y-2 mt-auto">
                    <button
                      onClick={() => {
                        setSelectedProductForRequest(product);
                        setShowRequestModal(true);
                      }}
                      disabled={!product.variants || product.variants.every(v => v.qty_stock === 0)}
                      className={`w-full py-2 rounded-md font-medium transition-colors cursor-pointer
                        ${!product.variants || product.variants.every(v => v.qty_stock === 0)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-wa-cyan hover:bg-wa-ocean text-white'
                        }`}
                    >
                      {!product.variants || product.variants.every(v => v.qty_stock === 0)
                        ? 'Out of Stock'
                        : '+ Add to Request'
                      }
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProductForDetails(product);
                        setShowDetailsModal(true);
                      }}
                      className="btn_main"
                    >
                      View Details
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apparel Details Modal */}
      {showDetailsModal && selectedProductForDetails && (
        <ApparelDetailsModal
          product={selectedProductForDetails}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedProductForDetails(null);
          }}
          onSuccess={fetchProducts}
        />
      )}
      {/* ApparelRequestModal — on close also opens SelectionDrawer so user can review basket */}
      {showRequestModal && selectedProductForRequest && (
        <ApparelRequestModal
          product={selectedProductForRequest}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedProductForRequest(null);
            setSelectionOpen(true);
          }}
        />
      )}
    </div>
    <SelectionDrawer
      isOpen={selectionOpen}
      onClose={() => setSelectionOpen(false)}
    />
    </div>
  );
}

export default Apparel;
