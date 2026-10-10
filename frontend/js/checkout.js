
document.addEventListener("DOMContentLoaded", () => {
    const checkoutForm = document.getElementById("checkoutForm");
    const paymentMessage = document.getElementById("paymentMessage");
    const customerDetails = document.getElementById("customerDetails");

    const RAZORPAY_KEY_ID = "rzp_test_TlXAjXpKPbxVeu";

    function displayCustomerDetails(customer) {
        const fields = {
            displayName: customer.name,
            displayEmail: customer.email,
            displayPhone: customer.phone,
            displayAddress: customer.address
        };

        for (const [id, value] of Object.entries(fields)) {
            const element = document.getElementById(id);
            if (element) element.textContent = value || "";
        }

        if (customerDetails) customerDetails.style.display = "block";
        if (checkoutForm) checkoutForm.style.display = "none";
    }

    function getCheckoutAmount() {
        const cart =
            JSON.parse(localStorage.getItem("evergreenCart") || "null") ||
            JSON.parse(localStorage.getItem("cart") || "null") ||
            JSON.parse(localStorage.getItem("shoppingCart") || "[]");

        if (!Array.isArray(cart) || cart.length === 0) {
            throw new Error("Your cart is empty. Please add products first.");
        }

        let total = 0;

        for (const item of cart) {
            const quantity = Number(item.quantity);
            const price = Number(item.price);

            if (
                !Number.isFinite(quantity) ||
                !Number.isFinite(price) ||
                quantity <= 0 ||
                price < 0
            ) {
                throw new Error("A cart item has an invalid price or quantity.");
            }

            total += price * quantity;
        }

        if (!Number.isFinite(total) || total <= 0) {
            throw new Error("Your cart total is invalid.");
        }

        return Math.round(total * 100) / 100;
    }

    if (!checkoutForm) {
        console.error("Checkout form #checkoutForm was not found.");
        return;
    }

    checkoutForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name =
            document.getElementById("customerName")?.value.trim();
        const email =
            document.getElementById("customerEmail")?.value.trim();
        const phone =
            document.getElementById("customerPhone")?.value.trim();
        const address =
            document.getElementById("customerAddress")?.value.trim();

        if (!name || !email || !phone || !address) {
            alert("Please complete all customer details.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!window.Razorpay) {
            alert(
                "Razorpay Checkout did not load. Please check checkout.html."
            );
            return;
        }

        let checkoutAmount;

        try {
            checkoutAmount = getCheckoutAmount();
        } catch (error) {
            alert(error.message);
            return;
        }

        const submitButton = checkoutForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (submitButton) submitButton.disabled = true;

        if (paymentMessage) {
            paymentMessage.textContent = "Creating payment order...";
        }

        try {
            const response = await fetch("https://https://evergreen-web-1.onrender.com/api/payment/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: checkoutAmount,
                    customer: {
                        name,
                        email,
                        phone,
                        address
                    }
                })
            });

            const data = await response.json();

            console.log("Order response:", data);

            if (!response.ok || !data.success || !data.order?.id) {
                throw new Error(
                    data.message || "Unable to create the payment order."
                );
            }

            const order = data.order;

            if (
                !order.amount ||
                order.currency !== "INR" ||
                !RAZORPAY_KEY_ID.startsWith("rzp_test_")
            ) {
                throw new Error(
                    "Please check your Razorpay test key and order configuration."
                );
            }

            const options = {
                key: RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "EverGreen",
                description: "EverGreen order payment",
                order_id: order.id,

                prefill: {
                    name: name,
                    email: email,
                    contact: phone
                },

                notes: {
                    address: address
                },

                // Put UPI first while retaining other available methods.
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: "Pay using UPI",
                                instruments: [
                                    {
                                        method: "upi"
                                    }
                                ]
                            }
                        },
                        sequence: ["block.upi"],
                        preferences: {
                            show_default_blocks: true
                        }
                    }
                },

                handler: async function (paymentResponse) {
                    if (paymentMessage) {
                        paymentMessage.textContent = "Verifying payment...";
                    }

                    try {
                        const verifyResponse = await fetch("https://https://evergreen-web-1.onrender.com/api/payment/verify",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    razorpay_order_id:
                                        paymentResponse.razorpay_order_id,
                                    razorpay_payment_id:
                                        paymentResponse.razorpay_payment_id,
                                    razorpay_signature:
                                        paymentResponse.razorpay_signature
                                })
                            }
                        );

                        const verifyData = await verifyResponse.json();

                        console.log("Verification response:", verifyData);

                        if (!verifyResponse.ok || !verifyData.success) {
                            throw new Error(
                                verifyData.message ||
                                "Payment verification failed."
                            );
                        }

                        if (paymentMessage) {
                            paymentMessage.textContent =
                                "Payment verified successfully!";
                        }

                        displayCustomerDetails({
                            name,
                            email,
                            phone,
                            address
                        });

                        localStorage.removeItem("evergreenCart");
                        localStorage.removeItem("cart");
                        localStorage.removeItem("shoppingCart");
                    } catch (error) {
                        console.error("Verification error:", error);

                        if (paymentMessage) {
                            paymentMessage.textContent =
                                "Payment verification failed. Please contact support before retrying.";
                        }

                        alert(error.message);
                    } finally {
                        if (submitButton) submitButton.disabled = false;
                    }
                },

                modal: {
                    ondismiss: function () {
                        if (paymentMessage) {
                            paymentMessage.textContent =
                                "Payment window closed. You can try again.";
                        }

                        if (submitButton) submitButton.disabled = false;
                    }
                },

                theme: {
                    color: "#198754"
                }
            };

            const checkout = new window.Razorpay(options);

            checkout.on("payment.failed", function (failure) {
                const error = failure.error || {};

                console.error("Razorpay payment failure:", error);

                if (paymentMessage) {
                    paymentMessage.textContent =
                        error.description || "Payment failed. Please try again.";
                }

                alert(
                    "Payment failed\n" +
                    "Code: " + (error.code || "Unknown") + "\n" +
                    "Description: " +
                    (error.description || "No description") + "\n" +
                    "Step: " + (error.step || "Unknown") + "\n" +
                    "Reason: " + (error.reason || "Unknown")
                );

                if (submitButton) submitButton.disabled = false;
            });

            checkout.open();
        } catch (error) {
            console.error("Checkout error:", error);

            if (paymentMessage) {
                paymentMessage.textContent = error.message;
            }

            alert(error.message || "Unable to start checkout.");

            if (submitButton) submitButton.disabled = false;
        }
    });
});
