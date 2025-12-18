// src/components/ProductPage.tsx
import { useState } from "react";
import { Card, Typography, Rate, Select, Pagination, Button, List, Skeleton } from "antd";
import { LeftOutlined, RightOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { countries, categories, products } from "../../store/exportMockData";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// ================================
// TYPES
// // ================================
// interface Country {
//   country_id: string;
//   country_name: string;
// }

interface Category {
  category_id: string;
  category_name: string;
  country_id: string;
}

interface Product {
  product_id: string;
  product_name: string;
  category_id: string;
  product_description: string;
  hs_code?: string;
  images: string[];
  rating: number;
  producer: string;
  country_id: string;
}

// ================================
// COMPONENT
// ================================
const ProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 8;

  // Filter categories & products
  const filteredCategories: Category[] = selectedCountry
    ? categories.filter(c => c.country_id === selectedCountry)
    : categories;

  const filteredProducts: Product[] = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  const displayedProducts: Product[] = filteredProducts.length ? filteredProducts : products;

  // Pagination
  const total = displayedProducts.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = displayedProducts.slice(startIndex, endIndex);

  // Image navigation
  const handlePrevImage = () => {
    if (!selectedProduct) return;
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : selectedProduct.images.length - 1);
  };

  const handleNextImage = () => {
    if (!selectedProduct) return;
    setCurrentImageIndex(prev => prev < selectedProduct.images.length - 1 ? prev + 1 : 0);
  };

  // Product navigation
  const handlePrevProduct = () => {
    if (!selectedProduct) return;
    const idx = displayedProducts.findIndex(p => p.product_id === selectedProduct.product_id);
    setSelectedProduct(displayedProducts[idx > 0 ? idx - 1 : displayedProducts.length - 1]);
    setCurrentImageIndex(0);
    setLoading(true);
  };

  const handleNextProduct = () => {
    if (!selectedProduct) return;
    const idx = displayedProducts.findIndex(p => p.product_id === selectedProduct.product_id);
    setSelectedProduct(displayedProducts[idx < displayedProducts.length - 1 ? idx + 1 : 0]);
    setCurrentImageIndex(0);
    setLoading(true);
  };

  // Product Detail View
  if (selectedProduct) {
    const countryName = countries.find(c => c.country_id === selectedProduct.country_id)?.country_name || "N/A";

    return (
      <div style={{ padding: 40 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => setSelectedProduct(null)}
          style={{ marginBottom: 20 }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
          {/* Image Gallery */}
          <div style={{ flex: 1, minWidth: 300, position: "relative" }}>
            {loading && <Skeleton.Image style={{ width: "100%", height: 400 }} active />}
            <img
              src={selectedProduct.images[currentImageIndex]}
              alt={selectedProduct.product_name}
              style={{
                width: "100%",
                height: 400,
                objectFit: "cover",
                marginBottom: 16,
                display: loading ? "none" : "block"
              }}
              onLoad={() => setLoading(false)}
            />
            <Button
              icon={<LeftOutlined />}
              shape="circle"
              onClick={handlePrevImage}
              style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)" }}
            />
            <Button
              icon={<RightOutlined />}
              shape="circle"
              onClick={handleNextImage}
              style={{ position: "absolute", top: "50%", right: 0, transform: "translateY(-50%)" }}
            />
            <List
              grid={{ gutter: 8, column: selectedProduct.images.length }}
              dataSource={selectedProduct.images}
              renderItem={img => (
                <List.Item>
                  <img
                    src={img}
                    alt="thumb"
                    style={{ width: "100%", height: 80, objectFit: "cover", cursor: "pointer" }}
                    onClick={() => { setCurrentImageIndex(selectedProduct.images.indexOf(img)); setLoading(true); }}
                  />
                </List.Item>
              )}
            />
          </div>

          {/* Product Info */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <Title>{selectedProduct.product_name}</Title>
            <Text strong>HS Code: </Text>
            <Text>{selectedProduct.hs_code || "N/A"}</Text>
            <div style={{ margin: "10px 0" }}>
              <Text strong>Country: </Text>
              <Text>{countryName}</Text>
            </div>
            <Rate disabled defaultValue={selectedProduct.rating} />
            <Paragraph style={{ marginTop: 16 }}>{selectedProduct.product_description}</Paragraph>
            <Paragraph><b>Producer:</b> {selectedProduct.producer}</Paragraph>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Button type="default" onClick={handlePrevProduct} icon={<LeftOutlined />}>Prev Product</Button>
              <Button type="default" onClick={handleNextProduct} icon={<RightOutlined />}>Next Product</Button>
            </div>
            <Button
              type="primary"
              style={{ backgroundColor: "#0f3952", borderColor: "#0f3952", marginTop: 16 }}
              onClick={() => navigate("/login")}
            >
              Ship Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main Grid View
  return (
    <div style={{ padding: 40 }}>
      {/* Filters */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
        <Select
          placeholder="Select Country"
          style={{ minWidth: 200 }}
          value={selectedCountry || undefined}
          onChange={value => { setSelectedCountry(value); setSelectedCategory(null); setCurrentPage(1); }}
          allowClear
        >
          {countries.map(c => <Option key={c.country_id} value={c.country_id}>{c.country_name}</Option>)}
        </Select>

        <Select
          placeholder="Select Category"
          style={{ minWidth: 200 }}
          value={selectedCategory || undefined}
          onChange={value => { setSelectedCategory(value); setCurrentPage(1); }}
          allowClear
        >
          {filteredCategories.map(cat => <Option key={cat.category_id} value={cat.category_id}>{cat.category_name}</Option>)}
        </Select>
      </div>

      {/* Product Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
        {paginatedProducts.map(product => {
          const countryName = countries.find(c => c.country_id === product.country_id)?.country_name || "N/A";
          return (
            <Card
              key={product.product_id}
              hoverable
              style={{
                cursor: "pointer",
                border: "4px solid transparent",
                borderTop: "4px solid #0f3952",
                borderLeft: "4px solid #0f3952",
                borderBottom: "2px solid #ffd600",
                borderRight: "2px solid #ffd600",
                borderRadius: 8,
                overflow: "hidden",
              }}
              cover={<img src={product.images[0]} alt={product.product_name} style={{ width: "100%", height: 200, objectFit: "cover" }} />}
              onClick={() => { setSelectedProduct(product); setCurrentImageIndex(0); setLoading(true); }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                {categories.find(cat => cat.category_id === product.category_id)?.category_name || "N/A"}
              </Text>
              <Title level={5} style={{ margin: "10px 0 0 0" }}>{product.product_name}</Title>
              <Paragraph ellipsis={{ rows: 2 }}>{product.product_description}</Paragraph>
              <Rate disabled defaultValue={product.rating} style={{ fontSize: 14 }} />
              <div style={{ marginTop: 8 }}>
                <Text strong>Country: </Text>
                <Text>{countryName}</Text>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      <div style={{ marginTop: 40, textAlign: "center" }}>
        <Pagination
          current={currentPage}
          pageSize={itemsPerPage}
          total={total}
          onChange={page => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default ProductPage;
