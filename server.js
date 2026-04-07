const express = require("express");
const PDFDocument = require("pdfkit");
const path = require("path");

const app = express();

// 🔥 IMPORTANT POUR RENDER
const PORT = process.env.PORT || 5000;

// 👉 servir le frontend
app.use(express.static(path.join(__dirname, "public")));

// =========================
// BASE LOCALE
// =========================
const base = {
  paracetamol: {
    produit: "Paracétamol",
    type: "Médicament",
    risque: "Modéré",
    effets: "Nausées, atteinte hépatique",
    conduite: "Surveillance médicale",
  },
  glyphosate: {
    produit: "Glyphosate",
    type: "Herbicide",
    risque: "Potentiellement cancérogène",
    effets: "Irritation, toxicité chronique",
    conduite: "Éviter exposition",
  },
  neem: {
    produit: "Neem",
    type: "Plante médicinale",
    risque: "Modéré",
    effets: "Vomissements",
    conduite: "Surveillance",
  },
};

// =========================
// API ANALYSE
// =========================
app.get("/analyse", (req, res) => {
  const nom = req.query.nom?.toLowerCase();

  if (base[nom]) {
    return res.json({
      ...base[nom],
      source: "Base SENTOX",
    });
  }

  // fallback IA simple
  return res.json({
    produit: nom,
    type: "Analyse IA",
    risque: "À déterminer",
    effets: "Analyse en cours",
    conduite: "Consulter un expert",
    source: "IA",
  });
});

// =========================
// PDF
// =========================
app.get("/pdf", (req, res) => {
  const nom = req.query.nom?.toLowerCase();
  const data = base[nom] || {
    produit: nom,
    type: "Analyse IA",
    risque: "À déterminer",
    effets: "Analyse en cours",
    conduite: "Consulter un expert",
  };

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=rapport_sentox.pdf"
  );

  doc.pipe(res);

  doc.fontSize(18).text("SENTOX PRO - Rapport Toxicologique\n");
  doc.fontSize(12).text(`Produit: ${data.produit}`);
  doc.text(`Type: ${data.type}`);
  doc.text(`Risque: ${data.risque}`);
  doc.text(`Effets: ${data.effets}`);
  doc.text(`Conduite: ${data.conduite}`);

  doc.end();
});

// =========================
// ROUTE PRINCIPALE 🔥
// =========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =========================
// LANCEMENT SERVEUR
// =========================
app.listen(PORT, () => {
  console.log("Serveur lancé sur port " + PORT);
});