import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaTag } from 'react-icons/fa';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const isDistributor = user?.userType === 'distributor';
  const isApproved = user?.distributorApprovalStatus === 'approved';

  const getPrice = () => {
    if (isDistributor && isApproved && product.distributor_price) {
      return product.distributor_price;
    }
    return product.retail_price;
  };

  const getSalePrice = () => {
    if (!product.is_on_sale) return null;
    return product.sale_price;
  };

  const calculateDiscount = () => {
    const price = getPrice();
    const salePrice = getSalePrice();
    if (!salePrice) return null;
    return Math.round(((price - salePrice) / price) * 100);
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: getSalePrice() || getPrice(),
      image: product.images?.[0]?.image_url,
      quantity: 1,
    });
  };

  const discount = calculateDiscount();
  const finalPrice = getSalePrice() || getPrice();

  return (
    <div className="product-card">
      {product.is_new && <span className="badge badge-new">New</span>}
      {discount && <span className="badge badge-sale">-{discount}%</span>}

      <div className="product-image">
        <img
          src={product.images?.[0]?.image_url || '/placeholder.png'}
          alt={product.name}
          onError={(e) => {
            e.target.src = '/placeholder.png';
          }}
        />
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>

        {product.tags && product.tags.length > 0 && (
          <div className="product-tags">
            <FaTag />
            {product.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="product-footer">
          <div className="price-section">
            {discount ? (
              <>
                <span className="original-price">${getPrice().toFixed(2)}</span>
                <span className="sale-price">${finalPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="price">${finalPrice.toFixed(2)}</span>
            )}
            {isDistributor && isApproved && (
              <span className="price-label">Distributor Price</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="btn btn-add-cart"
            disabled={!product.is_active || product.stock_quantity === 0}
          >
            <FaShoppingCart />
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>

        {product.stock_quantity > 0 && product.stock_quantity < 10 && (
          <div className="stock-warning">
            Only {product.stock_quantity} left in stock
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
