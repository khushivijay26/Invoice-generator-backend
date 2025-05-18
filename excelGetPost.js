// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3001;

// CORS config (so frontend can connect)
const corsOptions = {
  origin: "http://localhost:3000", // React app
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------
// ✅ MONGODB CONNECTION
// ----------------------
mongoose.connect("mongodb://127.0.0.1:27017/invoiceDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("✅ MongoDB connected");
});

// ----------------------
// ✅ MONGOOSE MODELS
// ----------------------
const ItemSchema = new mongoose.Schema({
  hsn_code: String,
  quantity: String,
  rate: String,
});

const InvoiceSchema = new mongoose.Schema({
  company_name: String,
  seller_address: String,
  seller_phone_no: String,
  seller_email: String,
  seller_gst_no: String,
  seller_state: String,
  purchaser_name: String,
  billing_address: String,
  shipping_address: String,
  purchaser_gst_no: String,
  shipper_gst_no: String,
  tax: String,
  option: String,
  items: [ItemSchema],
  total: String,
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);

// ----------------------
// ✅ POST API - Save Data to MongoDB
// ----------------------
app.post("/submit", async (req, res) => {
  const {
    company_name,
    seller_address,
    seller_phone_no,
    seller_email,
    seller_gst_no,
    seller_state,
    purchaser_name,
    billing_address,
    shipping_address,
    purchaser_gst_no,
    shipper_gst_no,
    tax,
    option,
    items,
    total,
  } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).send("Items must be an array.");
  }

  try {
    const invoice = new Invoice({
      company_name,
      seller_address,
      seller_phone_no,
      seller_email,
      seller_gst_no,
      seller_state,
      purchaser_name,
      billing_address,
      shipping_address,
      purchaser_gst_no,
      shipper_gst_no,
      tax,
      option,
      items,
      total,
    });
    await invoice.save();
    console.log("✅ Data saved to MongoDB");
    res.send("Data saved to MongoDB");
  } catch (error) {
    console.error("MongoDB save error:", error);
    res.status(500).send("MongoDB error");
  }
});

// ----------------------
// ✅ GET API - Fetch MongoDB Data
// ----------------------
app.get("/mongo-data", async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  } catch (error) {
    console.error("Mongo GET error:", error);
    res.status(500).send("MongoDB read error.");
  }
});

// ✅ GET API - Invoice Number from MongoDB
app.get("/invoice-number", async function (req, res) {
  try {
    const invoiceCount = await Invoice.countDocuments();
    const nextInvoiceNumber = invoiceCount + 1;
    res.json({ nextInvoiceNumber });
  } catch (error) {
    console.error("Error in GET /invoice-number:", error);
    res.status(500).send("Error calculating invoice number.");
  }
});

// ----------------------
// ✅ Start Server
// ----------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
