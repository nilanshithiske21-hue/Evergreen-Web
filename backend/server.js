const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();


app.use(cors());

app.use(
    express.json()
);


// ======================================
// FRONTEND
// ======================================

app.use(
    express.static(
        path.join(
            __dirname,
            "../frontend"
        )
    )
);


app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../frontend/index.html"
            )
        );

    }
);


// ======================================
// PAYMENT ROUTES
// ======================================

const paymentRoutes =
    require(
        "./routes/paymentRoutes"
    );


app.use(
    "/api/payment",
    paymentRoutes
);


// ======================================
// TEST API
// ======================================

app.get(
    "/api/test",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Backend is working!"

        });

    }
);


// ======================================
// SERVER
// ======================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);