require("dotenv").config();

const Razorpay = require("razorpay");
const crypto = require("crypto");


const razorpay = new Razorpay({

    key_id: process.env.RAZORPAY_KEY_ID,

    key_secret: process.env.RAZORPAY_KEY_SECRET

});


// ==========================================
// CREATE ORDER
// ==========================================

const createOrder = async (req, res) => {

    try {

        const {
            amount,
            customer
        } = req.body;


        if (!amount) {

            return res.status(400).json({

                success: false,

                message: "Amount is required"

            });

        }


        console.log(
            "CUSTOMER:",
            customer
        );


        const options = {

            amount:
                Math.round(
                    Number(amount) * 100
                ),

            currency: "INR",

            receipt:
                `receipt_${Date.now()}`

        };


        const order =
            await razorpay.orders.create(
                options
            );


        return res.status(200).json({

            success: true,

            order: order

        });


    } catch (error) {

        console.error(
            "CREATE ORDER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create Razorpay order",

            error:
                error.message

        });

    }

};


// ==========================================
// VERIFY PAYMENT
// ==========================================

const verifyPayment = async (req, res) => {

    try {

        const {

            razorpay_order_id,

            razorpay_payment_id,

            razorpay_signature

        } = req.body;


        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment details are missing"

            });

        }


        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");


        if (
            generatedSignature ===
            razorpay_signature
        ) {

            return res.status(200).json({

                success: true,

                message:
                    "Payment verified successfully"

            });

        }


        return res.status(400).json({

            success: false,

            message:
                "Invalid payment signature"

        });


    } catch (error) {

        console.error(
            "VERIFY PAYMENT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Payment verification failed",

            error:
                error.message

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    createOrder,

    verifyPayment

};