/**
 * Apparel Inventory Page
 *
 * Displays 361° apparel products with size/color variant management.
 * Shows available stock for each size/color combination.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import AddApparelProductForm from "../components/AddApparelProductForm";
import AddVariantModal from "../components/AddVariantModal";
import TakeApparelModal from "../components/TakeApparelModal";
import ReturnApparelModal from "../components/ReturnApparelModal";
import ApparelDetailsModal from "../components/ApparelDetailsModal";

import Footer from "../components/Footer";

function Apparel() {
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
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] =
    useState(null);
  const [showTakeModal, setShowTakeModal] = useState(false);
  const [selectedProductForTake, setSelectedProductForTake] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedProductForReturn, setSelectedProductForReturn] =
    useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] =
    useState(null);
  const [selectedGender, setSelectedGender] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data on component mount
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

  const fetchSizes = () => {
    api
      .get("/api/apparel/sizes/")
      .then((res) => {
        // Separate clothing and footwear sizes
        const clothing = res.data.filter((s) => s.size_type === "clothing");
        const footwear = res.data.filter((s) => s.size_type === "footwear");
        setClothingSizes(clothing);
        setFootwearSizes(footwear);
      })
      .catch((err) => {
        console.error("Failed to load sizes:", err);
      });
  };

  // Filter products based on all criteria
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch = product.product_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory =
      !selectedCategory || product.category.id === parseInt(selectedCategory);

    // Gender filter
    const matchesGender = !selectedGender || product.gender === selectedGender;

    // Color filter - check if product has any variant with selected color
    const matchesColor =
      !selectedColor ||
      (product.variants &&
        product.variants.some((v) => v.color.id === parseInt(selectedColor)));

    // Clothing size filter
    const matchesClothingSize =
      !selectedClothingSize ||
      (product.variants &&
        product.variants.some(
          (v) => v.size.id === parseInt(selectedClothingSize),
        ));

    // Footwear size filter
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
    <div className="min-h-screen bg-gray-100 p-8">
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

        {/* Add New Product Button / Form Toggle */}
        {!showAddForm ? (
          <div className="bg-white p-6 rounded-lg shadow mb-8 text-center">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-wa-blue text-white px-8 py-3 rounded-md font-medium hover:bg-wa-ocean cursor-pointer transition-all duration-200"
            >
              + Add New Product
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setShowAddForm(false)}
              className="btn_cancel mb-4 py-3 px-5"
            >
              ← Cancel
            </button>
            <AddApparelProductForm
              onSuccess={() => {
                fetchProducts();
                setShowAddForm(false);
              }}
            />
          </div>
        )}
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
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
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

                <div className="p-4">
                  <h3 className="font-bold text-lg text-wa-navy mb-1 truncate">
                    {product.product_name}
                  </h3>

                  <div className="flex justify-between items-center my-2">
                    <span className="text-sm text-wa-blue">
                      {product.category.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {product.gender === "M"
                        ? "Men"
                        : product.gender === "W"
                          ? "Women"
                          : product.gender === "U"
                            ? "Unisex"
                            : "Youth"}
                    </span>
                  </div>

                  {/* Variants Display */}
                  <div className="border-t pt-3 mt-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Available Sizes:
                    </p>
                    {product.variants && product.variants.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.variants
                          .sort((a, b) => {
                            // First sort by color name
                            const colorCompare =
                              a.color.color_name.localeCompare(
                                b.color.color_name,
                              );
                            if (colorCompare !== 0) return colorCompare;
                            // Then sort by size display order within same color
                            return a.size.display_order - b.size.display_order;
                          })
                          .map((variant) => (
                            <span
                              key={variant.id}
                              className={`px-2 py-1 rounded text-xs ${
                                variant.qty_stock <= variant.minimum_stock_level
                                  ? "bg-red-100 text-red-700 border-2 border-red-400"
                                  : ""
                              }`}
                              style={{
                                backgroundColor:
                                  variant.qty_stock >
                                  variant.minimum_stock_level
                                    ? `${variant.color.hex_code}40`
                                    : undefined,
                                color:
                                  variant.qty_stock >
                                  variant.minimum_stock_level
                                    ? "#1f2937"
                                    : undefined,
                                border:
                                  variant.qty_stock >
                                  variant.minimum_stock_level
                                    ? variant.color.hex_code.toLowerCase() ===
                                        "#ffffff" ||
                                      variant.color.hex_code.toLowerCase() ===
                                        "#fff"
                                      ? "1px solid #9ca3af"
                                      : `1px solid ${variant.color.hex_code}`
                                    : undefined,
                              }}
                            >
                              {variant.color.color_name} -{" "}
                              {variant.size.size_value} - (
                              <span className="font-bold">
                                {variant.qty_stock}
                              </span>
                              )
                            </span>
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No variants yet</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 mt-4">
                    <button
                      onClick={() => {
                        setSelectedProductForDetails(product);
                        setShowDetailsModal(true);
                      }}
                      className="btn_main"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProductForVariant(product);
                        setShowAddVariantModal(true);
                      }}
                      className="w-full bg-wa-cyan text-white px-4 py-2 rounded-md font-medium hover:bg-cyan-600 transition-colors"
                    >
                      + Add Size/Color
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProductForTake(product);
                          setShowTakeModal(true);
                        }}
                        className="btn_take"
                      >
                        Take
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProductForReturn(product);
                          setShowReturnModal(true);
                        }}
                        className="btn_return"
                      >
                        Return
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Add Variant Modal */}
      {showAddVariantModal && selectedProductForVariant && (
        <AddVariantModal
          product={selectedProductForVariant}
          onClose={() => {
            setShowAddVariantModal(false);
            setSelectedProductForVariant(null);
          }}
          onSuccess={fetchProducts}
        />
      )}

      {/* Take Apparel Modal */}
      {showTakeModal && selectedProductForTake && (
        <TakeApparelModal
          product={selectedProductForTake}
          onClose={() => {
            setShowTakeModal(false);
            setSelectedProductForTake(null);
          }}
          onSuccess={fetchProducts}
        />
      )}
      {/* Return Apparel Modal */}
      {showReturnModal && selectedProductForReturn && (
        <ReturnApparelModal
          product={selectedProductForReturn}
          onClose={() => {
            setShowReturnModal(false);
            setSelectedProductForReturn(null);
          }}
          onSuccess={fetchProducts}
        />
      )}
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
    </div>
  );
}

export default Apparel;
