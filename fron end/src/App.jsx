import api from './api'; 
import React, { useState, useMemo, useCallback, useEffect } from 'react';    


const initialMockProducts = [];
// --- END MOCK DATA FOR DASHBOARD ---


const getProductImageUrl = (productId, products) => {
    const product = products.find(p => p.id === productId);

    if (product && product.imageUrl) {
        return product.imageUrl;
    }
    const text = product ? product.name.split(' ').slice(0, 2).join('+') : 'Product';
    const color = (productId % 3 === 0) ? '6366F1' : (productId % 3 === 1) ? '10B981' : 'F59E0B';
    return `https://placehold.co/400x250/${color}/ffffff?text=${text}`;
};

const CurrencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

// --- ICON LIBRARY ---
const SearchIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const ShoppingCartIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 12.08a2 2 0 0 0 2 1.92h9.44a2 2 0 0 0 2-1.92L23 5H6"/></svg>;
const UserIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const CreditCardIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="22" height="16" x="1" y="4" rx="2" ry="2"/><line x1="1" x2="23" y1="10" y2="10"/></svg>;
const LogOutIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const EditIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const PlusIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const MapPinIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const ArchiveIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M21 8v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"/><path d="M10 12h4"/></svg>;
// --- END ICON LIBRARY ---

// ShippingAddresses ---
const ShippingAddresses = ({ addresses }) => (
    <div className="shipping-address-container" style={{padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white'}}>
        <h3 className="section-title-indigo" style={{marginBottom: '15px', display: 'flex', alignItems: 'center'}}>
            <MapPinIcon className="icon-medium" style={{marginRight: '8px'}} />
            SELECT DELIVERY ADDRESS
        </h3>
        <div className="address-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            {addresses.map(addr => (
                <div key={addr.id} className={`address-card ${addr.isDefault ? 'address-card-default' : ''}`} style={{ border: addr.isDefault ? '2px solid #6366F1' : '1px solid #ccc', borderRadius: '8px', padding: '15px', cursor: 'pointer', position: 'relative' }}>
                    <input type="radio" name="delivery_address" id={`addr-${addr.id}`} defaultChecked={addr.isDefault} className="address-radio" style={{ position: 'absolute', top: '15px', right: '15px', width: '20px', height: '20px' }} />
                    <label htmlFor={`addr-${addr.id}`} className="address-label" style={{ display: 'block', paddingRight: '30px' }}>
                        <span className="address-name" style={{ fontWeight: 'bold' }}>
                            {addr.name} 
                            {addr.tag && <span className="address-tag" style={{ marginLeft: '10px', fontSize: '0.75rem', fontWeight: 'normal', color: '#6366F1', border: '1px solid #6366F1', padding: '2px 6px', borderRadius: '4px' }}>{addr.tag}</span>}
                        </span>
                        <p className="address-street" style={{ margin: '5px 0 2px 0', fontSize: '0.9rem' }}>{addr.street}</p>
                        <p className="address-city" style={{ margin: '0', fontSize: '0.9rem', color: '#6b7280' }}>{addr.city}</p>
                    </label>
                </div>
            ))}
            <button className="add-address-btn" style={{ background: '#EEF2FF', border: '2px dashed #C7D2FE', color: '#6366F1', padding: '20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                <PlusIcon className="icon-small" style={{marginRight: '8px'}} /> Use a different address
            </button>
        </div>
        
        <div className="shipping-information" style={{marginTop: '30px'}}>
            <h3 className="section-title-indigo" style={{marginBottom: '15px'}}>SHIPPING INFORMATION (Example Inputs)</h3>
             <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input type="text" placeholder="Full Name" className="form-input" style={{padding: '10px', border: '1px solid #ccc', borderRadius: '4px'}} />
                <input type="email" placeholder="Email" className="form-input" style={{padding: '10px', border: '1px solid #ccc', borderRadius: '4px'}} />
                <input type="text" placeholder="Address Line 1" className="form-input" style={{gridColumn: '1 / span 2', padding: '10px', border: '1px solid #ccc', borderRadius: '4px'}} />
                <input type="text" placeholder="City" className="form-input" style={{padding: '10px', border: '1px solid #ccc', borderRadius: '4px'}} />
                <input type="text" placeholder="Zip Code" className="form-input" style={{padding: '10px', border: '1px solid #ccc', borderRadius: '4px'}} />
            </div>
        </div>
    </div>
);



// --- PRODUCT CARD COMPONENT ---
const ProductCard = ({ product, onAddToCart, onViewDetails, products }) => (
    <div className="product-card">
        <div 
            onClick={() => onViewDetails(product)}
            style={{cursor: 'pointer'}} 
        >
            <img
                src={getProductImageUrl(product.id, products)}
                alt={product.name}
                className="product-image"
            />
            <div className="product-content">
                <span className="product-brand-label">{product.compatibility.toUpperCase()}</span> 
                <h3 className="product-title">{product.name}</h3>
                <p className="product-description">{product.description}</p>
            </div>
        </div>
        
        <div className="product-footer">
            <span className="product-price">{CurrencyFormatter.format(product.price)}</span>
            <button
                onClick={() => onAddToCart(product)}
                className="add-to-cart-btn"
            >
                <ShoppingCartIcon className="icon-small" />
                <span>Add</span>
            </button>
        </div>
    </div>
);

// --- PRODUCT DETAIL VIEW COMPONENT ---
const ProductDetailView = ({ product, onAddToCart, onGoBack, products }) => {
    // 1. ADD STATE FOR QUANTITY
    const [selectedQty, setSelectedQty] = useState(1); 

    if (!product) return <div className="main-content-container">Product not found.</div>;

    const handleQuantityChange = (e) => {
        // 2. SAVE SELECTION TO STATE
        setSelectedQty(parseInt(e.target.value)); 
    };

    const cheapestVariant = product.variants.sort((a, b) => a.price - b.price)[0];
    const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

    return (
        <div className="main-content-container product-detail-layout">
            <div className="product-detail-card">
                <div className="product-detail-image-box">
                    <img src={getProductImageUrl(product.id, products)} alt={product.name} className="product-detail-main-image" />
                </div>

                <div className="product-detail-info-box">
                    <h1 className="product-detail-title">{product.name}</h1>
                    <p className="product-detail-sku">Brand: {product.compatibility} | Category: {product.category}</p>
                    
                    <p className="product-detail-description">
                        {product.description}
                        <br/><br/>
                        **Available Variants:**
                        <ul style={{listStyle: 'disc', marginLeft: '20px', paddingLeft: '10px'}}>
                            {product.variants.map((v, index) => (
                                <li key={index} style={{marginBottom: '5px'}}>
                                    {v.name} - **{CurrencyFormatter.format(v.price)}** (Stock: {v.stock})
                                </li>
                            ))}
                        </ul>
                    </p>
                    
                    <div className="product-detail-price-stock">
                        <span className="detail-price">Starting Price: {CurrencyFormatter.format(cheapestVariant.price)}</span>
                        <span className="detail-stock">Stock: {totalStock > 0 ? 'In stock' : 'Out of stock'} ({totalStock} units)</span>
                    </div>

                    <div className="product-detail-actions">
                        <label htmlFor="quantity" className="quantity-label">Quantity:</label>
                        {/* 3. CONNECT STATE TO SELECT */}
                        <select id="quantity" className="quantity-select" value={selectedQty} onChange={handleQuantityChange}>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                        </select>
                        <button 
                            // 4. PASS QUANTITY TO FUNCTION
                            onClick={() => onAddToCart(product, selectedQty)} 
                            className="detail-add-to-cart-btn"
                            disabled={totalStock === 0}
                        >
                            Add to cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- CART VIEW COMPONENT ---
const CartView = ({ cartItems, onUpdateQuantity, onRemove, onCheckoutClick, products }) => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 0 ? 15.00 : 0;
    const taxRate = 0.05;
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;

    if (cartItems.length === 0) {
        return (
            <div className="cart-empty-container">
                <div className="cart-empty-content">
                    <ShoppingCartIcon className="icon-large icon-indigo" />
                    <p className="text-2xl font-semibold text-gray-700">Your cart is empty.</p>
                    <p className="text-gray-500 mt-2">Add some phones to get started!</p>
                </div>
            </div>
        );
    }

    const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
        <div className="cart-item">
            <img
                src={getProductImageUrl(item.id, products)}
                alt={item.name}
                className="cart-item-image"
            />
            <div className="cart-item-details">
                <h4 className="cart-item-title">{item.name}</h4>
                <p className="cart-item-price-small">{CurrencyFormatter.format(item.price)}</p>
            </div>
            <div className="cart-item-actions">
                <div className="quantity-control">
                    <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className="quantity-btn"
                    >
                        -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="quantity-btn"
                    >
                        +
                    </button>
                </div>
                <button
                    onClick={() => onRemove(item.id)}
                    className="remove-item-btn"
                >
                    <svg className="icon-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>
    );

    return (
        <div className="main-content-container">
            <h3 className="page-title">Your Cart</h3>
            <div className="cart-layout">
                <div className="cart-items-list">
                    {cartItems.map(item => (
                        <CartItem 
                key={`${item.id}-${item.variant || 'std'}`} // <--- Unique Key Fix
                item={item} 
                onUpdateQuantity={onUpdateQuantity} 
                onRemove={onRemove} 
                     />
                    ))}
                </div>

                <div className="order-summary-box-wrapper">
                    <div className="order-summary-box">
                        <h3 className="summary-title">Order Summary</h3>
                        
                        <div className="summary-detail-list">
                            <div className="summary-detail"><span>Subtotal</span><span>{CurrencyFormatter.format(subtotal)}</span></div>
                            <div className="summary-detail"><span>Shipping</span><span>{CurrencyFormatter.format(shipping)}</span></div>
                            <div className="summary-detail"><span>Tax (5%)</span><span>{CurrencyFormatter.format(tax)}</span></div>
                            <div className="summary-total">
                                <span>Total</span>
                                <span className="summary-total-price">{CurrencyFormatter.format(total)}</span>
                            </div>
                        </div>
                        
                        <button
                            onClick={onCheckoutClick}
                            className="checkout-btn"
                        >
                            <CreditCardIcon className="icon-medium" />
                            <span>Checkout</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CHECKOUT VIEW (Fixed: No setIsFormOpen error + Zip Code Fix) ---
const CheckoutView = ({ cartItems, addresses = [], setAddresses, onPlaceOrder }) => {
    // 1. STATE
    // Select default address or 'new' if none exist
    const defaultAddr = addresses.find(a => a.isDefault);
    const [selectedAddressId, setSelectedAddressId] = useState(defaultAddr ? (defaultAddr._id || defaultAddr.id) : 'new');
    
    const [editingId, setEditingId] = useState(null);
    const [newAddressForm, setNewAddressForm] = useState({ name: '', street: '', city: '', zip: '' });

    // Payment State
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [nameOnCard, setNameOnCard] = useState('');

    // Totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 0 ? 15.00 : 0;
    const tax = subtotal * 0.05;
    const total = subtotal + shipping + tax;

    // --- HANDLERS ---
    const handleAddressFormChange = (e) => {
        setNewAddressForm({ ...newAddressForm, [e.target.name]: e.target.value });
    };

    const handleAddNewClick = () => {
        setEditingId(null);
        setNewAddressForm({ name: '', street: '', city: '', zip: '' });
        setSelectedAddressId('new');
    };

    const handleEditAddress = (e, addr) => {
        e.stopPropagation();
        setEditingId(addr._id || addr.id); // Handle both ID types
        
        // FIX: Read Zip directly. Do not split city string.
        setNewAddressForm({ 
            name: addr.label, 
            street: addr.address, 
            city: addr.city, 
            zip: addr.zip || '' 
        });
        
        setSelectedAddressId('new'); // Switch to form view
    };

    const handleDeleteAddress = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Delete this address?")) {
            const updatedList = addresses.filter(a => (a._id || a.id) !== id);
            setAddresses(updatedList);
            if (selectedAddressId === id) setSelectedAddressId('new');

            try {
                await api.put('/auth/update-addresses', { addresses: updatedList });
            } catch (err) { console.error("Delete failed", err); }
        }
    };

    const handleSaveAddress = async () => {
        if (!newAddressForm.street) return alert("Address required");

        const newAddr = { 
            _id: editingId || Date.now().toString(), 
            label: newAddressForm.name || "My Address", 
            address: newAddressForm.street, 
            city: newAddressForm.city, 
            zip: newAddressForm.zip,
            isDefault: addresses.length === 0 
        };
        
        let updatedList;
        if (editingId) {
            updatedList = addresses.map(a => (a._id || a.id) === editingId ? newAddr : a);
        } else {
            updatedList = [...addresses, newAddr];
        }
        
        setAddresses(updatedList);
        
        // FIX: Don't call setIsFormOpen(false). Just select the ID.
        setSelectedAddressId(editingId || newAddr._id);
        setEditingId(null); 

        try {
            await api.put('/auth/update-addresses', { addresses: updatedList });
        } catch (err) { console.error("Save failed", err); }
    };

    const handlePlaceOrder = (e) => {
        e.preventDefault();
        if (selectedAddressId === 'new') return alert("Please save your address first.");
        if (cardNumber.length !== 16) return alert("Card number must be 16 digits.");
        onPlaceOrder(selectedAddressId);
    };

    return (
        <div className="main-content-container checkout-container">
            <h2 className="page-title">Secure Checkout</h2>
            <div className="checkout-card">
                <form onSubmit={handlePlaceOrder} className="checkout-form">
                    
                    <div className="shipping-address-container">
                        <h3 className="section-title-indigo">
                            <MapPinIcon className="icon-medium" style={{marginRight: '8px'}} />
                            SELECT DELIVERY ADDRESS
                        </h3>

                        <div className="address-grid">
                            {addresses.map(addr => {
                                const id = addr._id || addr.id;
                                return (
                                    <div 
                                        key={id} 
                                        onClick={() => setSelectedAddressId(id)}
                                        className={`address-card ${selectedAddressId === id ? 'selected' : ''}`}
                                    >
                                        <div className="address-radio-circle">
                                            {selectedAddressId === id && <div className="address-radio-dot"></div>}
                                        </div>
                                        <label className="address-label">
                                            <span className="address-name">{addr.label}</span>
                                            <p className="address-street">{addr.address}</p>
                                            {/* FIX: Display Zip Code Here */}
                                            <p className="address-city">{addr.city} {addr.zip}</p>
                                        </label>
                                        <div className="address-actions">
                                            <button type="button" className="icon-btn edit-btn" onClick={(e) => handleEditAddress(e, addr)}>
                                                <EditIcon />
                                            </button>
                                            <button type="button" className="icon-btn delete-btn" onClick={(e) => handleDeleteAddress(e, id)}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <div 
                                onClick={handleAddNewClick} 
                                className={`add-address-btn ${selectedAddressId === 'new' && !editingId ? 'active' : ''}`}
                            >
                                <PlusIcon className="icon-small" style={{marginRight: '8px'}} /> 
                                {selectedAddressId === 'new' && !editingId ? "Entering new address..." : "Use a different address"}
                            </div>
                        </div>

                        {selectedAddressId === 'new' && (
                            <div className="shipping-information">
                                <h3 className="section-title-indigo">{editingId ? "EDIT ADDRESS" : "ADD NEW ADDRESS"}</h3>
                                <div className="form-grid">
                                    <input name="name" value={newAddressForm.name} onChange={handleAddressFormChange} type="text" placeholder="Full Name / Label" className="form-input" />
                                    <input name="street" value={newAddressForm.street} onChange={handleAddressFormChange} type="text" placeholder="Address Line 1" className="form-input form-input-full" />
                                    <input name="city" value={newAddressForm.city} onChange={handleAddressFormChange} type="text" placeholder="City" className="form-input" />
                                    <input name="zip" value={newAddressForm.zip} onChange={handleAddressFormChange} type="text" placeholder="Zip Code" className="form-input" />
                                    
                                    <button type="button" onClick={handleSaveAddress} className="save-address-btn">
                                        <CheckCircleIcon className="icon-small" />
                                        {editingId ? "Update Address" : "Save & Deliver Here"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-separator"></div>

                    {/* PAYMENT & TOTALS */}
                    <div>
                        <h3 className="section-title-indigo">PAYMENT DETAILS</h3>
                        <input type="text" placeholder="Card Number (16 digits)" required className="form-input form-input-full mb-16" maxLength="16" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))} />
                        <div className="form-grid-3">
                            <input type="text" placeholder="MM/YY" required className="form-input" value={expiry} onChange={e => setExpiry(e.target.value)} maxLength="5" />
                            <input type="text" placeholder="CVC" required className="form-input" value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))} maxLength="3" />
                            <input type="text" placeholder="Name" required className="form-input" value={nameOnCard} onChange={e => setNameOnCard(e.target.value)} />
                        </div>
                    </div>

                    <div className="checkout-total-section">
                        <div className="summary-total summary-total-large">
                            <span>Final Total</span>
                            <span className="final-total-price">{CurrencyFormatter.format(total)}</span>
                        </div>
                    </div>

                    <button type="submit" className="place-order-btn" disabled={cartItems.length === 0}>
                        Place Order
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- FORGOT PASSWORD VIEW COMPONENT ---
const ForgotPasswordView = ({ onGoBack }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        
        const customAlert = (message) => {
            const messageBox = document.createElement('div');
            messageBox.className = 'custom-alert-success';
            messageBox.textContent = message;
            document.body.appendChild(messageBox);
            setTimeout(() => {
                document.body.removeChild(messageBox);
            }, 4000);
        };
        
        customAlert(`A password reset link has been sent to ${email}. (Simulated)`);
        setTimeout(onGoBack, 2000);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Forgot Password</h2>
                <p className="auth-toggle-text" style={{ marginBottom: '20px' }}>
                    Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <input name="email" type="email" placeholder="Email Address" className="form-input" required />
                    
                    <button
                        type="submit"
                        className="auth-submit-btn"
                    >
                        Send Reset Link
                    </button>
                </form>
                
                <button onClick={onGoBack} className="auth-toggle-btn" style={{ marginTop: '15px' }}>
                    &larr; Back to Sign In
                </button>
            </div>
        </div>
    );
};
// --- CHANGE PASSWORD VIEW (FIXED) ---
const ChangePasswordView = ({ onGoBack, user }) => { // 1. ADDED 'user' HERE
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const oldPassword = e.target.old_password.value;
        const newPassword = e.target.new_password.value;
        const confirmPassword = e.target.confirm_password.value;

        // 1. Client Validation
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match!");
            return;
        }
        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            // 2. Send to Backend
            await api.put('/auth/change-password', {
                oldPassword,
                newPassword
            });

            // 3. Success
            alert("Password changed successfully!");
            onGoBack(); // Go back to dashboard

        } catch (err) {
            console.error("Change Pass Error:", err);
            setError(err.response?.data?.message || "Failed to change password. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-content-container checkout-container">
            <h2 className="page-title">Change Password</h2>
            <div className="checkout-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                
                {/* 2. ERROR DISPLAY (If any) */}
                {error && <div className="auth-error" style={{marginBottom:'20px'}}>{error}</div>}

                <form onSubmit={handleSubmit} className="checkout-form">
                    
                    {/* 3. SAFE EMAIL DISPLAY (using user?.email) */}
                    <h3 className="section-title-indigo" style={{ marginBottom: '20px' }}>
                        Security Update for {user?.email || 'your account'}
                    </h3>
                    
                    <input 
                        name="old_password" 
                        type="password" 
                        placeholder="Current Password" 
                        className="form-input form-input-full mb-16" 
                        required 
                    />
                    
                    <input 
                        name="new_password" 
                        type="password" 
                        placeholder="New Password" 
                        className="form-input form-input-full mb-16" 
                        required 
                    />
                    
                    <input 
                        name="confirm_password" 
                        type="password" 
                        placeholder="Confirm New Password" 
                        className="form-input form-input-full mb-16" 
                        required 
                    />

                    <button
                        type="submit"
                        className="place-order-btn"
                        style={{ background: '#F59E0B', marginTop: '30px' }}
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Change Password'}
                    </button>
                </form>
                
                {/* 4. FIXED BACK BUTTON (Added Text) */}
                <button 
                    onClick={onGoBack} 
                    className="utility-btn" 
                    style={{ background: 'none', color: '#6366F1', border: 'none', marginTop: '15px', cursor: 'pointer', width: '100%' }}
                >   
                    Cancel & Go Back
                </button>
            </div>
        </div>
    );
};


// --- AUTH VIEW COMPONENT (Fixed) ---
const AuthView = ({ onAuthSuccess, onForgotPasswordClick, cart }) => { 
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // State for ALL form fields
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        firstName: '',
        lastName: '',
        address: '',
        phoneNumber: ''
    });

    // Handle typing in any input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
    let response;
    if (isLogin) {
        // --- LOGIN ---
        response = await api.post('/auth/login', {
            email: formData.email,
            password: formData.password,
            guestCart: cart
        });
    } else {
        // --- REGISTER ---
        response = await api.post('/auth/register', formData);
    }

    // --- SAFER HANDLING HERE ---
    console.log("Backend Response:", response.data); // Debugging line

    if (response.data && response.data.token) {
        // 1. Save Token
        localStorage.setItem('token', response.data.token);
        
        // 2. Extract User Data (Safe way)
        // If 'user' is nested inside data, use it. Otherwise use data itself.
        const user = response.data.user || response.data;
        
        // 3. Update App
        onAuthSuccess(user);
    } else {
        throw new Error("No token received from server.");
    }

} catch (err) {
    console.error("Auth Error:", err);
    setError(err.response?.data?.message || err.message || "Authentication failed.");
} finally {
    setLoading(false);
}
        
    };
    
    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: isLogin ? '400px' : '500px' }}>
                <UserIcon className="icon-large icon-indigo auth-icon" />
                <h2 className="auth-title">{isLogin ? 'Sign In' : 'Create Account'}</h2>
                
                {error && <div className="auth-error">{error}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    
                    {/* --- REGISTRATION FIELDS (Only show if NOT logging in) --- */}
                    {!isLogin && (
                        <div style={{ animation: 'fadeIn 0.3s' }}>
                            <input 
                                name="username" type="text" placeholder="Username" 
                                className="form-input" required 
                                value={formData.username} onChange={handleChange} 
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input 
                                    name="firstName" type="text" placeholder="First Name" 
                                    className="form-input" required 
                                    value={formData.firstName} onChange={handleChange} 
                                />
                                <input 
                                    name="lastName" type="text" placeholder="Last Name" 
                                    className="form-input" required 
                                    value={formData.lastName} onChange={handleChange} 
                                />
                            </div>
                            <input 
                                name="address" type="text" placeholder="Full Address" 
                                className="form-input" required 
                                value={formData.address} onChange={handleChange} 
                            />
                            <input 
                                name="phoneNumber" type="text" placeholder="Phone Number" 
                                className="form-input" required 
                                value={formData.phoneNumber} onChange={handleChange} 
                            />
                        </div>
                    )}

                    {/* --- COMMON FIELDS (Email & Password) --- */}
                    <input 
                        name="email" type="email" placeholder="Email Address" 
                        className="form-input" required 
                        value={formData.email} onChange={handleChange}
                    />
                    <input 
                        name="password" type="password" placeholder="Password" 
                        className="form-input" required 
                        value={formData.password} onChange={handleChange}
                    />
                    
                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                        style={{ marginTop: '15px' }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>
                
                <p className="auth-toggle-text">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(null); }} 
                        className="auth-toggle-btn"
                    >
                        {isLogin ? 'Register' : 'Sign In'}
                    </button>
                </p>

                {isLogin && (
                    <button 
                        type="button" 
                        onClick={onForgotPasswordClick} 
                        className="forgot-password-link"
                        style={{ margin: '15px auto 0 auto', padding: '0', background: 'none', border: 'none', cursor: 'pointer', color: '#6366F1', fontSize: '0.9rem', textDecoration: 'underline', display: 'block' }}
                    >
                        Forgot Password?
                    </button>
                )}
            </div>
        </div>
    );
};

//  PurchaseHistoryList ---
const PurchaseHistoryList = ({ history = [], products = [] }) => {
    
    // Helper function to get product image for the order item
    const getOrderItemImageUrl = (itemId) => {
        const product = products.find(p => p.id === itemId);
        return product ? product.imageUrl : ''; 
    };

    if (history.length === 0) {
        return (
            <div className="purchase-history-list" style={{padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white'}}>
                <h3 className="section-title-indigo" style={{marginBottom: '20px', display: 'flex', alignItems: 'center'}}>
                    <ArchiveIcon className="icon-medium" style={{marginRight: '8px'}}/>
                    Purchase History
                </h3>
                <p>No purchases yet.</p>
            </div>
        );
    }

    return (
        <div className="purchase-history-list" style={{padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white'}}>
            <h3 className="section-title-indigo" style={{marginBottom: '20px', display: 'flex', alignItems: 'center'}}>
                <ArchiveIcon className="icon-medium" style={{marginRight: '8px'}}/>
                Purchase History
            </h3>
            
            {history.map(order => (
                <div key={order.id} className="order-item-card" style={{border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '15px'}}>
                    <div className="order-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #eee'}}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <span className="order-store-badge" style={{backgroundColor: '#EF4444', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginRight: '8px'}}>Mall</span>
                            <span className="order-store-name" style={{fontWeight: 'bold', color: '#374151'}}>{order.store}</span>
                        </div>
                        <span className="order-status" style={{color: '#10B981', fontWeight: 'bold'}}>{order.status}</span>
                    </div>
                    
                    {(order.items || []).map(item => (  // SAFE: fallback to empty array
                        <div key={item.id} className="order-item-detail" style={{display: 'flex', alignItems: 'center', padding: '15px 0'}}>
                            <img 
                                src={getOrderItemImageUrl(item.id)} 
                                alt={item.name} 
                                className="order-item-image"
                                style={{width: '60px', height: '60px', objectFit: 'contain', marginRight: '15px', border: '1px solid #eee', borderRadius: '4px'}}
                            />
                            <div className="order-item-info" style={{flexGrow: 1}}>
                                <p className="order-item-name" style={{fontWeight: '600', margin: '0'}}>{item.name}</p>
                                <p className="order-item-variant" style={{fontSize: '0.85rem', color: '#6b7280', margin: '2px 0'}}>{item.variant}</p>
                                <p className="order-item-quantity" style={{fontSize: '0.85rem', color: '#9ca3af', margin: '0'}}>x{item.quantity}</p>
                            </div>
                            <span className="order-item-price" style={{fontWeight: 'bold'}}>{CurrencyFormatter.format(item.price)}</span>
                        </div>
                    ))}
                    
                    <div className="order-summary" style={{textAlign: 'right', padding: '10px 0', borderTop: '1px dashed #eee'}}>
                        <span className="order-summary-text" style={{fontSize: '0.9rem'}}>Total {order.items?.length || 0} Item(s): </span>
                        <span className="order-summary-price" style={{fontWeight: 'bold', color: '#6366F1', fontSize: '1.1rem'}}>{CurrencyFormatter.format(order.total || 0)}</span>
                    </div>
                    
                    <div className="order-footer" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
                        <span className="order-delivery-date" style={{color: '#10B981', fontSize: '0.85rem'}}>Delivered on {order.date || '-'}</span>
                        <button className="order-action-btn" style={{padding: '8px 15px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>Order Received</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Icons remain the same
const TrashIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const CheckCircleIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

// --- DASHBOARD VIEW COMPONENT (Connected to Database) ---
const DashboardView = ({ user, onLogout, addresses = [], setAddresses, history, products, onChangePasswordClick }) => {
    // 1. STATE: Manage Address Form
    const [editingId, setEditingId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [addressForm, setAddressForm] = useState({ name: '', street: '', city: '', zip: '' });

    // --- HANDLERS ---
    const handleFormChange = (e) => {
        setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
    };

    const handleAddNewClick = () => {
        setEditingId(null);
        setAddressForm({ name: '', street: '', city: '', zip: '' });
        setIsFormOpen(true);
    };

    const handleEditClick = (addr) => {
        // FIX: Use _id from database if available
        setEditingId(addr._id || addr.id);
        
        // FIX: Read zip directly from object, don't split string
        setAddressForm({
            name: addr.label,
            street: addr.address,
            city: addr.city,
            zip: addr.zip || '' 
        });
        setIsFormOpen(true);
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingId(null);
    };

    // --- NEW: DELETE FROM DATABASE ---
    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            // FIX: Filter by _id OR id
            const updatedList = addresses.filter(a => (a._id || a.id) !== id);
            setAddresses(updatedList); 

            try {
                await api.put('/auth/update-addresses', { addresses: updatedList });
            } catch (err) {
                console.error("Failed to delete address", err);
                alert("Failed to sync deletion with server.");
            }
        }
    };

    // --- NEW: SAVE TO DATABASE (FIXED) ---
    const handleSaveAddress = async () => {
        if (!addressForm.street || !addressForm.city) {
            alert("Please fill in the address details.");
            return;
        }

        // 1. Create Object for LOCAL DISPLAY (needs a temp ID for React keys)
        // If we are editing, use the existing ID. If new, generate a temp string.
        const tempId = Date.now().toString(); 
        const isNewEntry = !editingId;
        
        const addressForLocalState = {
            _id: editingId || tempId, 
            label: addressForm.name || "My Address",
            address: addressForm.street,
            city: addressForm.city,
            zip: addressForm.zip,
            isDefault: addresses.length === 0 
        };

        // 2. Update Local UI Immediately (Optimistic Update)
        let updatedList;
        if (editingId) {
            updatedList = addresses.map(a => (a._id || a.id) === editingId ? { ...a, ...addressForLocalState } : a);
        } else {
            updatedList = [...addresses, addressForLocalState];
        }

        setAddresses(updatedList); 
        setIsFormOpen(false);
        setEditingId(null);

        // 3. PREPARE DATA FOR SERVER
        // IMPORTANT: We must NOT send the fake 'tempId' to the backend.
        // MongoDB will reject "1735..." because it's not a valid ObjectId.
        const listForServer = updatedList.map(addr => {
            // If the ID looks like a timestamp (numbers only), remove it so Mongo generates a real ID
            if (addr._id && /^\d+$/.test(addr._id)) {
                const { _id, ...rest } = addr;
                return rest;
            }
            return addr;
        });

        // 4. Send to Backend & Sync with REAL IDs
        try {
            const { data } = await api.put('/auth/update-addresses', { addresses: listForServer });
            
            console.log("Address saved to database!");
            
            // CRITICAL STEP: Update state with the server's response.
            // The server has generated the REAL _id for the new address.
            // We need this so you can edit/delete it later without refreshing.
            if (data.user && data.user.addresses) {
                setAddresses(data.user.addresses);
            } else if (Array.isArray(data.addresses)) {
                setAddresses(data.addresses); // Fallback depending on your API structure
            }

        } catch (err) {
            console.error("Failed to save address", err);
            // Optional: Revert local change if server fails
            alert("Failed to save to server. Please refresh.");
        }
    };

    return (
        <div className="main-content-container dashboard-container">
            <h2 className="dashboard-title">Welcome Back, {user?.name || 'Guest User'}!</h2>
            <div className="dashboard-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
                
                {/* --- LEFT COLUMN: Account Details --- */}
                <div className="dashboard-account-card" style={{padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', alignSelf: 'start'}}>
                    <div className="dashboard-details" style={{marginBottom: '30px'}}>
                        <h3 className="section-title-indigo" style={{marginBottom: '10px', display: 'flex', alignItems: 'center'}}>
                            <UserIcon className="icon-medium" style={{marginRight: '8px'}} />
                            Account Details
                        </h3>
                        <p>Email: <span className="dashboard-detail-value">{user?.email}</span></p>
                        {user?.isAdmin && <p style={{color: '#ef4444', fontWeight: 'bold'}}>Role: Administrator</p>}
                    </div>

                    <button
                        onClick={onChangePasswordClick}
                        className="change-password-btn"
                        style={{
                            width: '100%', 
                            padding: '10px', 
                            background: '#EEF2FF', 
                            color: '#6366F1', 
                            border: '1px solid #C7D2FE', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold',
                            marginBottom: '15px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}
                    >
                        <EditIcon className="icon-medium" style={{marginRight: '8px'}} />
                        Change Password
                    </button>

                    <button
                        onClick={onLogout}
                        className="logout-btn"
                        style={{width: '100%', padding: '10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'}}
                    >
                        <LogOutIcon className="icon-medium" style={{marginRight: '8px'}} />
                        Log Out
                    </button>
                </div>
                
                {/* --- RIGHT COLUMN: Address & History --- */}
                <div className="dashboard-content-card" style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                    
                    {/* Address Manager Section */}
                    <div className="shipping-address-container" style={{ margin: 0 }}>
                        <h3 className="section-title-indigo">
                            <MapPinIcon className="icon-medium" style={{ marginRight: '8px' }} />
                            Manage Addresses
                        </h3>

                        {/* List Addresses */}
                        <div className="address-grid">
                            {addresses.map(addr => {
                                // Normalize ID just for the key and delete action
                                const id = addr._id || addr.id;
                                return (
                                    <div key={id} className="address-card" style={{ cursor: 'default' }}>
                                        <label className="address-label" style={{ cursor: 'default' }}>
                                            <span className="address-name">
                                                {addr.label} {addr.isDefault && <span className="address-tag">Default</span>}
                                            </span>
                                            <p className="address-street">{addr.address}</p>
                                            {/* Show Zip Code Properly */}
                                            <p className="address-city">{addr.city} {addr.zip ? `- ${addr.zip}` : ''}</p>
                                        </label>

                                        <div className="address-actions">
                                            <button className="icon-btn edit-btn" onClick={() => handleEditClick(addr)}>
                                                <EditIcon />
                                            </button>
                                            <button className="icon-btn delete-btn" onClick={() => handleDeleteClick(id)}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <div 
                                onClick={handleAddNewClick}
                                className={`add-address-btn ${isFormOpen && !editingId ? 'active' : ''}`}
                            >
                                <PlusIcon className="icon-small" style={{ marginRight: '8px' }} /> 
                                {isFormOpen && !editingId ? "Adding New..." : "Add New Address"}
                            </div>
                        </div>

                        {/* Add/Edit Form */}
                        {isFormOpen && (
                            <div className="shipping-information">
                                <h3 className="section-title-indigo">{editingId ? "EDIT ADDRESS" : "NEW ADDRESS DETAILS"}</h3>
                                <div className="form-grid">
                                    <input name="name" value={addressForm.name} onChange={handleFormChange} type="text" placeholder="Full Name / Label" className="form-input" />
                                    <input name="street" value={addressForm.street} onChange={handleFormChange} type="text" placeholder="Address Line 1" className="form-input form-input-full" />
                                    <input name="city" value={addressForm.city} onChange={handleFormChange} type="text" placeholder="City" className="form-input" />
                                    <input name="zip" value={addressForm.zip} onChange={handleFormChange} type="text" placeholder="Zip Code" className="form-input" />
                                    
                                    <div style={{gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px'}}>
                                        <button type="button" onClick={handleCancel} style={{padding: '12px', flex: 1, border: '1px solid #ccc', borderRadius: '8px', background: 'white', cursor: 'pointer', fontWeight: 'bold'}}>
                                            Cancel
                                        </button>
                                        <button type="button" onClick={handleSaveAddress} className="save-address-btn" style={{flex: 2, margin: 0}}>
                                            <CheckCircleIcon className="icon-small" />
                                            {editingId ? "Update Address" : "Save Address"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <PurchaseHistoryList history={history} products={products} />
                </div>
            </div>
        </div>
    );
};

// PRODUCT MANAGER

const ProductManager = ({ product, onSave, onGoBack }) => {
    const isNew = !product;
    const initialProduct = product || {
        id: Date.now(), // Temporary ID for new products
        name: '',
        price: 0,
        compatibility: '',
        description: '',
        category: '',
        imageUrl: '',
        variants: [{ name: 'Standard', price: 0, stock: 0 }]
    };
    
    const [formData, setFormData] = useState(initialProduct);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
    };

    const handleVariantChange = (index, e) => {
        const { name, value } = e.target;
        const newVariants = formData.variants.map((v, i) => {
            if (i === index) {
                return { ...v, [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value };
            }
            return v;
        });
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const addVariant = () => {
        setFormData(prev => ({ 
            ...prev, 
            variants: [...prev.variants, { name: '', price: 0, stock: 0 }] 
        }));
    };

    const removeVariant = (index) => {
        setFormData(prev => ({ 
            ...prev, 
            variants: prev.variants.filter((_, i) => i !== index) 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simple validation: ensure name, price > 0, and at least one variant
        if (!formData.name || formData.price <= 0 || formData.variants.length === 0) {
            alert("Please fill out Name and ensure Price and Variants are valid.");
            return;
        }

        // Clean up price: set the main product price to the cheapest variant's price
        const sortedVariants = formData.variants.sort((a, b) => a.price - b.price);
        const finalPrice = sortedVariants[0] ? sortedVariants[0].price : formData.price;

        onSave({ 
            ...formData, 
            price: finalPrice, 
            id: isNew ? Date.now() : formData.id // Ensure stable ID for updates
        }, isNew);
    };

    return (
        <div className="main-content-container checkout-container">
            <h2 className="page-title">{isNew ? 'Add New Product' : `Edit: ${product.name}`}</h2>
            <button onClick={onGoBack} className="place-order-btn" style={{width: '200px', marginBottom: '20px', background: '#3e38c4'}}> Back to Admin Panel
            </button>
            <div className="checkout-card">
                <form onSubmit={handleSubmit} className="checkout-form">
                    <h3 className="section-title-indigo">Core Product Details</h3>
                    <div className="form-grid">
                        <input 
                            name="name" 
                            type="text" 
                            placeholder="Product Name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            className="form-input form-input-full" 
                            required 
                        />
                        <input 
                            name="compatibility" 
                            type="text" 
                            placeholder="Brand/Compatibility (e.g., Apple, Accessories)" 
                            value={formData.compatibility} 
                            onChange={handleInputChange} 
                            className="form-input" 
                            required 
                        />
                         <input 
                            name="category" 
                            type="text" 
                            placeholder="Category (e.g., Flagship, Charger)" 
                            value={formData.category} 
                            onChange={handleInputChange} 
                            className="form-input" 
                            required 
                        />
                        <input 
                            name="imageUrl" 
                            type="text" 
                            placeholder="Image URL (e.g., /images/filename.png)" 
                            value={formData.imageUrl} 
                            onChange={handleInputChange} 
                            className="form-input form-input-full" 
                        />
                        <textarea
                            name="description"
                            placeholder="Product Description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="form-input form-input-full"
                            rows="4"
                            required
                        />
                    </div>

                    <div className="form-separator"></div>
                    <h3 className="section-title-indigo" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        Variants & Stock 
                        <button type="button" onClick={addVariant} className="utility-btn" style={{background: '#3e38c4; ', color: 'white'}}>
                            <PlusIcon className="icon-small" /> Add Variant
                        </button>
                    </h3>

                    {formData.variants.map((variant, index) => (
                        <div key={index} className="form-grid" style={{border: '1px solid #ccc', padding: '10px', margin: '10px 0', position: 'relative'}}>
                            <h4 style={{gridColumn: '1 / span 2', margin: '0 0 10px 0', color: '#4b5563'}}>Variant {index + 1}</h4>
                            <input 
                                name="name" 
                                type="text" 
                                placeholder="Variant Name (e.g., Blue 128GB)" 
                                value={variant.name} 
                                onChange={(e) => handleVariantChange(index, e)} 
                                className="form-input form-input-full" 
                                required 
                            />
                            <input 
                                name="price" 
                                type="number" 
                                step="0.01" 
                                placeholder="Price (PHP)" 
                                value={variant.price} 
                                onChange={(e) => handleVariantChange(index, e)} 
                                className="form-input" 
                                required 
                            />
                            <input 
                                name="stock" 
                                type="number" 
                                step="1" 
                                placeholder="Stock" 
                                value={variant.stock} 
                                onChange={(e) => handleVariantChange(index, e)} 
                                className="form-input" 
                                required 
                            />
                            {formData.variants.length > 1 && (
                                <button type="button" onClick={() => removeVariant(index)} className="remove-item-btn" style={{position: 'absolute', top: '5px', right: '5px'}}>
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}
                    
                    <button
                        type="submit"
                        className="place-order-btn"
                        style={{marginTop: '30px', background: isNew ? '#3e38c4' : '#3e38c4; '}}
                    >
                        {isNew ? 'Create Product' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// AdminDashboardView Component
const AdminDashboardView = ({ products, onEditProduct, onAddProduct, onDeleteProduct, onGoBack }) => {
    return (
        <div className="main-content-container dashboard-container">
       <div className="admin-header-layout">
                <h2 className="dashboard-title">Admin Product Management</h2>
                <button onClick={onGoBack} className="button-back-dashboard">
                    Back to Dashboard
                </button>
            </div>
            
            <div className="dashboard-card admin-inventory-card">
                {/* Centered Add Product Button */}
                <div className="admin-actions-controls">
                    <button onClick={onAddProduct} className="admin-add-product-btn-centered">
                        <PlusIcon className="icon-medium" /> Add New Product
                    </button>
                </div>

<div className="product-list-admin">
    <div className="admin-list-header">
        <p className="admin-col-id">ID</p>
        <p className="admin-col-name">Product Name</p>
        <p className="admin-col-price">Price</p>
        <p className="admin-col-stock">Stock</p>
        <p className="admin-col-actions">Actions</p>
    </div>
    {products.map(p => {
        const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
        return (
            <div key={p.id} className="admin-list-item">
                <p className="admin-col-id">{p.id}</p>
                <p className="admin-col-name">{p.name}</p>
                <p className="admin-col-price">{CurrencyFormatter.format(p.price)}</p>
                <p className="admin-col-stock" data-stock-level={
                    totalStock > 10 ? 'high' : totalStock > 0 ? 'low' : 'out'
                }>
                    {totalStock}
                </p>
                <div className="admin-col-actions">
                    <button onClick={() => onEditProduct(p)} className="utility-btn button-edit">
                        <EditIcon className="icon-small" /> Edit
                    </button>
                    <button onClick={() => onDeleteProduct(p.id)} className="utility-btn button-delete">
                        &times; Delete
                    </button>
                </div>
            </div>
        );
    })}
</div>

            </div>
        </div>
    );
};



// --- HEADER COMPONENT ---
const Header = ({ view, setView, cartItemCount, searchTerm, setSearchTerm, user, onLogout, makeFilter, setMakeFilter, categoryFilter, setCategoryFilter }) => {
    
    return (
        <header className="main-header">
            <div className="header-container">
        <a href="#" onClick={(e) => { e.preventDefault(); setView('home'); }} className="logo-link">
              <img src="/images/gadgeet.png" alt="MobileTech Pro Logo" className="logo-image" />
    </a>
                <div className="header-left">
                    
                    <nav className="header-nav">
                        <a href="#" onClick={(e) => { e.preventDefault(); setView('home'); }} className="nav-link">Shop</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setView(user ? 'dashboard' : 'auth'); }} className="nav-link">Account</a>
                        {user?.isAdmin && (
                            <a href="#" onClick={(e) => { e.preventDefault(); setView('admin'); }} className="nav-link" style={{color: '#F59E0B', fontWeight: 'bold'}}>Admin Panel</a>
                        )}
                    </nav>
                </div>
                <div className="header-center">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <SearchIcon className="search-icon" />
                    </div>
                    <select
                        value={makeFilter}
                        onChange={(e) => setMakeFilter(e.target.value)}
                        className="header-dropdown make-filter-dropdown"
                        aria-label="Filter by Phone Brand"
                    >
                        <option value="All Makes">Categories</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Apple">Apple</option>
                        <option value="Samsung">Samsung</option>
                        <option value="Huawei">Huawei</option>
                    </select>
                </div>

                <div className="header-right">
                    <button 
                        onClick={() => setView('cart')} 
                        className="utility-btn cart-btn"
                        aria-label="Shopping Cart"
                    >
                        <ShoppingCartIcon className="icon-medium" />
                        {cartItemCount > 0 && (
                            <span className="cart-badge">
                                {cartItemCount}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={() => setView(user ? 'dashboard' : 'auth')}
                        className="utility-btn user-btn"
                        aria-label={user ? "User Dashboard" : "Sign In"}
                    >
                        <UserIcon className="icon-medium"/>
                    </button>
                    {user && (
                        <button 
                            onClick={onLogout} 
                            className="header-logout-btn"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

// --- HOME VIEW COMPONENT ---
const HomeView = ({ products, onAddToCart, onViewDetails }) => {
    return (
        <div className="main-content-container">
            
            {products.length === 0 ? (
                <div className="no-results-box">
                    <SearchIcon className="icon-large icon-indigo" />
                    <p className="no-results-text">No phones matched your search or filter.</p>
                    <p className="no-results-subtext">Try adjusting your search terms or filters.</p>
                </div>
            ) : (
                <div className="product-grid"> 
                    {products.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onAddToCart={onAddToCart}
                            onViewDetails={onViewDetails}
                            products={products} // Pass products list
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- MAIN APP COMPONENT (Updated) ---
export default function App() {
    const [view, setView] = useState('home');
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState([]);
    
    // --- THIS IS THE CRITICAL LINE YOU ARE MISSING ---
    const [addresses, setAddresses] = useState([]); 
    // ------------------------------------------------

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder] = useState('name-asc'); 
    const [makeFilter, setMakeFilter] = useState('All Makes'); 
    const [categoryFilter, setCategoryFilter] = useState('All Categories'); 
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [purchaseHistory, setPurchaseHistory] = useState([]);

    // --- ADMIN FEATURE START: Product State and Handlers ---
    const [products, setProducts] = useState(initialMockProducts);
    const [productToEdit, setProductToEdit] = useState(null);
    const [isEditingNewProduct, setIsEditingNewProduct] = useState(false);

    // --- NEW: FETCH PRODUCTS FROM DB ---
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/products');
                
                // Map DB fields to Frontend fields
                const mappedProducts = data.map(p => ({
                    ...p,
                    id: p._id, 
                    compatibility: p.brand 
                }));
                
                setProducts(mappedProducts);
            } catch (error) {
                console.error("Failed to load products", error);
            }
        };
        fetchProducts();
    }, []);

   useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // 1. Load User Profile & Addresses
                    const { data: userData } = await api.get('/auth/me');
                    
                    setUser(userData);
                    
                    if (Array.isArray(userData.addresses)) {
                        setAddresses(userData.addresses);
                    } else {
                        setAddresses([]); 
                    }

                    // 2. --- NEW: LOAD CART FROM DATABASE ---
                    // This restores your items when you refresh the page
                    try {
                        const { data: cartData } = await api.get('/cart');
                        if (Array.isArray(cartData)) {
                            setCart(cartData);
                        }
                    } catch (cartError) {
                        console.error("Failed to load cart items from DB", cartError);
                    }
                    // ---------------------------------------

                } catch (error) {
                    console.error("Session expired", error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
        };
        loadUser();
    }, []);

    const handleSaveProduct = useCallback((updatedProduct, isNew) => {
        setProducts(prevProducts => {
            if (isNew) {
                // Add new product
                return [...prevProducts, updatedProduct];
            } else {
                // Update existing product
                return prevProducts.map(p => 
                    p.id === updatedProduct.id ? updatedProduct : p
                );
            }
        });
        setProductToEdit(null);
        setIsEditingNewProduct(false);
        setView('admin');

        const customAlert = (message) => {
            const messageBox = document.createElement('div');
            messageBox.className = 'custom-alert-success';
            messageBox.textContent = message;
            document.body.appendChild(messageBox);
            setTimeout(() => {
                document.body.removeChild(messageBox);
            }, 3000);
        };
        customAlert(`Product ${isNew ? 'added' : 'updated'} successfully!`);
    }, []);

    const handleDeleteProduct = useCallback((id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
            const customAlert = (message) => {
                const messageBox = document.createElement('div');
                messageBox.className = 'custom-alert-error';
                messageBox.textContent = message;
                document.body.appendChild(messageBox);
                setTimeout(() => {
                    document.body.removeChild(messageBox);
                }, 3000);
            };
            customAlert("Product deleted!");
        }
    }, []);

    const handleEditProduct = useCallback((product) => {
        setProductToEdit(product);
        setIsEditingNewProduct(false);
        setView('admin-edit');
    }, []);

    const handleAddProduct = useCallback(() => {
        setProductToEdit(null); // Clear any previous edit
        setIsEditingNewProduct(true);
        setView('admin-edit');
    }, []);

    const handleAdminEditGoBack = useCallback(() => {
        setProductToEdit(null);
        setIsEditingNewProduct(false);
        setView('admin');
    }, []);

// --- Authentication Handlers ---
    const handleAuthSuccess = useCallback(async (userData) => {
        // 1. Set basic info immediately
        setUser({ ...userData, name: userData.name || 'Guest User', isAdmin: !!userData.isAdmin });
        setView(userData.isAdmin ? 'admin' : 'dashboard');

        // --- NEW: SYNC CART IMMEDIATELY FROM LOGIN RESPONSE ---
        // The backend login controller now returns the 'merged' cart. 
        // We update the UI immediately so the user sees their items combined.
        if (userData.cart && Array.isArray(userData.cart)) {
             setCart(userData.cart);
        }
        // -----------------------------------------------------

        // 2. Background Fetch (Double check data)
        try {
            const token = localStorage.getItem('token'); 
            if (token) {
                const { data } = await api.get('/auth/me');
                
                // Update Addresses
                if (Array.isArray(data.addresses)) {
                    setAddresses(data.addresses);
                } else {
                    setAddresses([]);
                }

                // --- NEW: SYNC CART FROM BACKGROUND FETCH ---
                // Just in case the login response missed something
                if (Array.isArray(data.cart)) {
                    setCart(data.cart);
                }
                // --------------------------------------------
                
                // Update User again
                setUser(data);
            }
        } catch (error) {
            console.error("Failed to load full profile on login", error);
        }
    }, []);
    
    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        
        setUser(null);
        setAddresses([]);
        setPurchaseHistory([]);
        setCart([]);

        setView('auth');
    }, []);

    // --- Navigation Handler for Product Detail ---
    const handleViewDetails = useCallback((product) => {
        setSelectedProduct(product);
        setView('product');
    }, []);
    // --- NEW: Change Password Handler ---
    const handleChangePasswordClick = useCallback(() => {
        setView('change-password');
    }, []);

    // --- Cart Handlers ---
const handleAddToCart = useCallback(async (product, qty = 1) => { // Accept qty, default to 1
    
    // 1. UPDATE LOCAL STATE
    setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id);
        if (existingItem) {
            return prevCart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
            );
        } else {
            // Use 'qty' here instead of 1
            return [...prevCart, { ...product, quantity: qty, variant: product.variant || 'Standard' }];
        }
    });

    const customAlert = (message) => {
        const messageBox = document.createElement('div');
        messageBox.className = 'custom-alert-added';
        messageBox.textContent = message;
        document.body.appendChild(messageBox);
        setTimeout(() => document.body.removeChild(messageBox), 1500);
    };
    customAlert(`${product.name} added to cart!`);

    // 2. SYNC WITH BACKEND
    if (user) {
        try {
            // FIX: Find the Real Variant ID (Same logic as before)
            let realVariantId = product.variant;
            if (!realVariantId && product.variants && product.variants.length > 0) {
                realVariantId = product.variants[0]._id || product.variants[0].id;
            }

            if (realVariantId) {
                await api.post('/cart', {
                    productId: product.id,
                    variantId: realVariantId, 
                    quantity: qty // Send the actual quantity selected
                });
            }
        } catch (err) {
            console.error("Failed to add to backend cart:", err);
        }
    }
}, [user]);   

const handleRemoveItem = useCallback(async (id) => {
    // 1. Find the item in the local cart
    const itemToRemove = cart.find(item => item.id === id);

    // 2. Determine the correct Variant ID to delete
    let variantIdToDelete = itemToRemove?.variant;

    // FALLBACK: If the cart item doesn't have the variant ID (e.g. from an old session),
    // look it up in the products list.
    if (!variantIdToDelete || variantIdToDelete === 'Standard') {
        const productRef = products.find(p => p.id === id);
        if (productRef && productRef.variants && productRef.variants.length > 0) {
            // Default to the first variant if we can't find a specific one
            variantIdToDelete = productRef.variants[0]._id || productRef.variants[0].id;
        }
    }

    console.log("Deleting Variant ID:", variantIdToDelete); // Check your console for this!

    // 3. Optimistic Update (Remove from UI immediately)
    setCart(prevCart => prevCart.filter(item => item.id !== id));

    // 4. Sync with Backend
    if (user && variantIdToDelete) {
        try {
            await api.delete(`/cart/${variantIdToDelete}`);
        } catch (err) {
            console.error("Failed to remove from backend", err);
            // Optional: Fetch cart again to revert changes if it failed
            // const { data } = await api.get('/cart');
            // setCart(data);
        }
    } else {
        console.warn("Skipped Backend Delete: No Variant ID found.");
    }
}, [cart, user, products]);

// --- FIXED Checkout Click ---
const handleCheckoutClick = useCallback(() => {
    if (cart.length === 0) {
        const customAlert = (msg) => {
            const box = document.createElement('div');
            box.className = 'custom-alert-error';
            box.textContent = msg;
            document.body.appendChild(box);
            setTimeout(() => document.body.removeChild(box), 3000);
        };
        customAlert("Your cart is empty. Please add items before checking out.");
        return;
    }

    // --- Navigate to checkout page instead of purchasing ---
    setView('checkout');
}, [cart]);

const handleUpdateQuantity = useCallback(async (id, delta) => {
    // 1. Find item to get its details
    const itemToUpdate = cart.find(item => item.id === id);
    if(!itemToUpdate) return;

    // 2. Optimistic UI Update
    setCart(prevCart => prevCart.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + delta } : item
    ).filter(item => item.quantity > 0));

    // 3. Backend Sync
    if (user) {
        try {
            // FIX: Ensure we use the correct Variant ID from the product list
            // (Sometimes local cart item doesn't have the full variant info)
            let variantIdToSend = itemToUpdate.variant;

            // If local item says "Standard" or is missing ID, try to find it in the products list
            const productRef = products.find(p => p.id === id);
            if(productRef && productRef.variants && productRef.variants.length > 0) {
                 // Use the first variant's ID if we don't have a specific one
                 variantIdToSend = productRef.variants[0]._id || productRef.variants[0].id;
            }

            await api.post('/cart', {
                productId: id,
                variantId: variantIdToSend, // Send Real ID
                quantity: delta // +1 or -1
            });
            console.log("DB Updated");
        } catch (err) {
            console.error("DB Update Failed", err);
        }
    }
}, [cart, user, products]);

// --- Place Order Handler (Fixed) ---
const handlePlaceOrder = useCallback((selectedAddressId) => {
    if (!selectedAddressId) {
        alert("Please select or save a delivery address.");
        return;
    }

    if (cart.length === 0) return;

    // 1. CALCULATE TOTALS (Snapshot the price at moment of purchase)
    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        const price = product?.price || item.price || 0;
        return sum + (price * item.quantity);
    }, 0);
    
    // Replicate your CheckoutView logic here
    const shipping = subtotal > 0 ? 15.00 : 0;
    const tax = subtotal * 0.05;
    const finalTotal = subtotal + shipping + tax;
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // 2. CREATE ORDER OBJECT
    const newOrder = {
        id: Date.now(),
        store: "Mall",
        status: "Delivered",
        // Use this format to fix the "Delivered on -" bug
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        }),
        // SAVE THE TOTALS HERE
        totalPrice: finalTotal, 
        totalItems: totalCount,
        items: cart.map(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            return {
                id: cartItem.id,
                name: product?.name || cartItem.name,
                price: product?.price || cartItem.price,
                imageUrl: product?.imageUrl || '',
                quantity: cartItem.quantity,
                variant: cartItem.variant || ''
            };
        }),
        addressId: selectedAddressId
    };

    // --- Update purchase history ---
    setPurchaseHistory(prev => [newOrder, ...prev]); // Add new order to top of list

    // --- Clear cart ---
    setCart([]);

    // --- Success alert ---
    const customAlert = (message) => {
        const messageBox = document.createElement('div');
        messageBox.className = 'custom-alert-success';
        messageBox.textContent = message;
        document.body.appendChild(messageBox);
        setTimeout(() => document.body.removeChild(messageBox), 3000);
    };
    customAlert("Order placed successfully!");

    // --- Navigate back to dashboard ---
    setView('dashboard');

}, [cart, products, setPurchaseHistory, setView]); // Added setView to dependencies

    // --- Search, Filter, and Sort Logic ---
    const filteredAndSortedProducts = useMemo(() => {
        let currentProducts = [...products];

        // 1. Filter by Search Term
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            currentProducts = currentProducts.filter(p =>
                p.name.toLowerCase().includes(lowerSearchTerm) ||
                p.description.toLowerCase().includes(lowerSearchTerm)
            );
        }

        // 2. Filter by Brand (Uses the compatibility field)
        if (makeFilter !== 'All Makes') {
            const lowerMake = makeFilter.toLowerCase();
            currentProducts = currentProducts.filter(p =>
                p.compatibility.toLowerCase() === lowerMake
            );
        }

        // 3. Filter by Category (Uses the new category field)
        if (categoryFilter !== 'All Categories') {
            const lowerCategory = categoryFilter.toLowerCase();
            currentProducts = currentProducts.filter(p =>
                p.category.toLowerCase() === lowerCategory
            );
        }
        
        // 4. Sort
        currentProducts.sort((a, b) => {
            if (sortOrder === 'name-asc') {
                return a.name.localeCompare(b.name);
            }
            if (sortOrder === 'price-asc') {
                return a.price - b.price;
            }
            return 0;
        });

        return currentProducts;
    }, [searchTerm, makeFilter, categoryFilter, sortOrder, products]);


    // --- View Renderer (Updated to pass new props to DashboardView) ---
    const renderView = () => {
        switch (view) {
            case 'product':
                return <ProductDetailView 
                    product={selectedProduct} 
                    onAddToCart={handleAddToCart}
                    onGoBack={() => setView('home')}
                    products={products}
                />;
            case 'cart':
                return <CartView 
                    cartItems={cart} 
                    onCheckoutClick={handleCheckoutClick}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    products={products}
                />;
            case 'checkout':
                return (
                    <CheckoutView
                        cartItems={cart}
                        addresses={addresses}
                        setAddresses={setAddresses}
                        // --- THE FIX IS HERE ---
                        // PASS THE FUNCTION NAME ONLY. Do not write code here.
                        onPlaceOrder={handlePlaceOrder} 
                    />
                );
            case 'auth':
                return <AuthView 
                    onAuthSuccess={handleAuthSuccess} 
                    onForgotPasswordClick={() => setView('forgot-password')}
                    cart={cart}
                />;
               case 'dashboard':
                // PASSING MOCK DATA AND PRODUCTS TO DASHBOARD VIEW
                return <DashboardView 
                    user={user} 
                    onLogout={handleLogout}
                    addresses={addresses}
                    setAddresses={setAddresses}
                    history={purchaseHistory}
                    products={products} // Needed for PurchaseHistoryList to get product images
                    onChangePasswordClick={handleChangePasswordClick} // NEW PROP
                />;

            case 'change-password':
                if (!user) return <AuthView onAuthSuccess={handleAuthSuccess} onForgotPasswordClick={() => setView('forgot-password')} />;
                return <ChangePasswordView 
                    onGoBack={() => setView('dashboard')} 
                    user={user}
                />;
            // --- ADMIN FEATURE START: Admin View Cases ---
            case 'admin':
                if (!user?.isAdmin) return <p className="main-content-container">Access Denied: Not an Admin</p>;
                return <AdminDashboardView 
                    products={products}
                    onEditProduct={handleEditProduct}
                    onAddProduct={handleAddProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onGoBack={() => setView('dashboard')}
                />;
            case 'admin-edit':
                if (!user?.isAdmin) return <p className="main-content-container">Access Denied: Not an Admin</p>;
                return <ProductManager
                    product={productToEdit}
                    onSave={handleSaveProduct}
                    onGoBack={handleAdminEditGoBack}
                />;
            // --- ADMIN FEATURE END ---
            
            case 'forgot-password': 
                return <ForgotPasswordView onGoBack={() => setView('auth')} />; 
            case 'home':
            default:
                return <HomeView 
                    products={filteredAndSortedProducts} 
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                />;
        }
    };

    const cartItemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

    return (
        <div className="app-container">
            <Header 
                view={view}
                setView={setView}
                cartItemCount={cartItemCount}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                user={user}
                onLogout={handleLogout}
                
                // PASS FILTER PROPS
                makeFilter={makeFilter}
                setMakeFilter={setMakeFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={categoryFilter}
            />
            <main className="main-content-wrapper">
                {renderView()}
            </main>
        </div>
    );
}