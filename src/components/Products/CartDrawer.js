import React from "react";
import { useHistory } from "react-router-dom";
import { Alert, Spinner } from "react-bootstrap";
import { Button } from "react-bootstrap";
import useCart from "hooks/useCart";
import { isAuthenticated } from "services/authService";
import { placeOrder } from "services/orderService";

export default function CartDrawer({ show, onHide }) {
    const history = useHistory();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
        clearCart,
  } = useCart();
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);

  if (!show) return null;

  const formatPrice = (price) => {
    return "₺" + price.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
  };

    const handleCheckout = async () => {
        setError("");
        setSuccess("");

        if (!isAuthenticated()) {
            onHide();
            history.push("/login", { from: "/orders" });
            return;
        }

        setSubmitting(true);
        try {
            await placeOrder(
                cartItems.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                }))
            );
            clearCart();
            setSuccess("Siparisiniz basariyla olusturuldu.");
            setTimeout(() => {
                onHide();
                history.push("/orders");
            }, 500);
        } catch (err) {
            setError(err && err.message ? err.message : "Siparis olusturulamadi.");
        } finally {
            setSubmitting(false);
        }
    };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000 }}>
        {/* Backdrop */}
        <div 
            style={{ 
                position: "absolute", 
                top: 0, 
                left: 0, 
                width: "100%", 
                height: "100%", 
                backgroundColor: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)"
            }}
            onClick={onHide}
        ></div>
        
        {/* Drawer Panel - Glassmorphism */}
        <div 
            style={{ 
                position: "absolute", 
                top: 0, 
                right: 0, 
                width: "min(400px, 100vw)", 
                height: "100%", 
                backgroundColor: "rgba(255, 255, 255, 0.98)", // Beyaz
                backdropFilter: "blur(15px)",
                borderLeft: "1px solid rgba(0,0,0,0.05)",
                color: "#0F172A",
                display: "flex",
                flexDirection: "column",
                animation: "slideInRight 0.3s cubic-bezier(0, 0, 0.2, 1)"
            }}
        >
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
            
            {/* Drawer Header */}
            <div style={{ 
                padding: "24px", 
                borderBottom: "1px solid rgba(0,0,0,0.05)", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                background: "rgba(0,0,0,0.02)"
            }}>
                <div className="d-flex align-items-center gap-2">
                    <i className="fas fa-shopping-basket" style={{ color: "#6366F1" }}></i>
                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: "1.25em" }}>SEPETİM ({cartCount})</h4>
                </div>
                <i 
                    className="fas fa-times" 
                    style={{ cursor: "pointer", fontSize: "1.25em", opacity: 0.7 }}
                    onClick={onHide}
                ></i>
            </div>
            
            {/* Cart Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                {cartItems.length === 0 ? (
                    <div style={{ textAlign: "center", marginTop: "100px", opacity: 0.5 }}>
                        <i className="fas fa-shopping-basket" style={{ fontSize: "5em", marginBottom: "20px" }}></i>
                        <h5>Sepetiniz Boş</h5>
                        <Button 
                            variant="outline-info" 
                            className="mt-4" 
                            style={{ borderRadius: "25px", padding: "8px 24px", fontWeight: 700 }}
                            onClick={onHide}
                        >
                            Keşfetmeye Başla
                        </Button>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.id} style={{ 
                            display: "flex", 
                            gap: "15px", 
                            marginBottom: "20px", 
                            padding: "15px",
                            backgroundColor: "#F8FAFC",
                            borderRadius: "15px",
                            border: "1px solid rgba(0,0,0,0.05)"
                        }}>
                            <div style={{ 
                                width: "65px", 
                                height: "65px", 
                                background: "rgba(0,0,0,0.05)", 
                                borderRadius: "10px", 
                                display: "flex", 
                                alignItems: "center", 
                                                                justifyContent: "center",
                                                                overflow: "hidden"
                            }}>
                                                                {item.imageUrl ? (
                                                                    <img
                                                                        src={item.imageUrl}
                                                                        alt={item.name}
                                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                    />
                                                                ) : (
                                                                    <i className="nc-icon nc-album-2" style={{ color: "rgba(0,0,0,0.1)", fontSize: "1.5em" }}></i>
                                                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h6 style={{ margin: "0 0 5px", fontWeight: 700, color: "#0F172A", fontSize: "0.95em" }}>{item.name}</h6>
                                <p style={{ margin: "0 0 12px", color: "#6366F1", fontWeight: 800, fontSize: "1.05em" }}>{formatPrice(item.price)}</p>
                                
                                <div className="d-flex justify-content-between align-items-center">
                                    <div style={{ 
                                        display: "flex", 
                                        alignItems: "center", 
                                        gap: "12px", 
                                        background: "rgba(0,0,0,0.03)", 
                                        padding: "4px 10px", 
                                        borderRadius: "20px",
                                        border: "1px solid rgba(0,0,0,0.05)"
                                    }}>
                                        <i 
                                            className="fas fa-minus" 
                                            style={{ fontSize: "0.7em", cursor: "pointer", color: "rgba(0,0,0,0.3)" }}
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        ></i>
                                        <span style={{ fontWeight: 800, fontSize: "0.9em", minWidth: "20px", textAlign: "center" }}>{item.quantity}</span>
                                        <i 
                                            className="fas fa-plus" 
                                            style={{ fontSize: "0.7em", cursor: "pointer", color: "#6366F1" }}
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        ></i>
                                    </div>
                                    <button 
                                        style={{ background: "none", border: "none", padding: "5px", color: "rgba(244,63,94,0.7)", cursor: "pointer" }}
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* Cart Footer */}
            {cartItems.length > 0 && (
                <div style={{ 
                    padding: "24px", 
                    borderTop: "1px solid rgba(0,0,0,0.05)", 
                    backgroundColor: "#F8FAFC",
                }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 style={{ margin: 0, fontWeight: 600, color: "rgba(15,23,42,0.5)", fontSize: "1em" }}>TOPLAM:</h5>
                        <h4 style={{ margin: 0, fontWeight: 900, color: "#6366F1", fontSize: "1.6em" }}>{formatPrice(cartTotal)}</h4>
                    </div>
                    <Button 
                        className="btn-fill w-100 py-3" 
                        variant="info" 
                        disabled={submitting}
                        style={{ 
                            fontWeight: 800, 
                            borderRadius: "15px", 
                            textTransform: "uppercase", 
                            letterSpacing: "1.5px",
                            boxShadow: "0 8px 25px rgba(99, 102, 241, 0.4)",
                            backgroundColor: "#6366F1",
                            border: "none",
                            fontSize: "1em"
                        }}
                                                onClick={handleCheckout}
                    >
                                                {submitting ? (
                                                    <>
                                                        <Spinner animation="border" size="sm" className="mr-2" />
                                                        ISLENIYOR...
                                                    </>
                                                ) : (
                                                    "ODEMEYE GEC"
                                                )}
                    </Button>
                </div>
            )}
        </div>
    </div>
  );
}
