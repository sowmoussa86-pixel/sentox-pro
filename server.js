const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const OpenAI = require("openai");
const path = require("path");

const produits = require("./data");

const app = express();
app.use(cors());
app.use(express.json());

// 👉 servir site web
app.use(express.static("public"));

// 👉 IA
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 👉 score toxicité
function getRisque(dl50) {
  if (!dl50) return "Non déterminé";
  if (dl50 < 50) return "Très toxique";
  if (dl50 < 300) return "Toxique";
  if (dl50 < 2000) return "Modéré";
  return "Faible";
}

// 👉 IA analyse
async function analyseIA(nom) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: `Analyse toxicologique de ${nom}` }
      ]
    });

    return response.choices[0].message.content;

  } catch (e) {
    return "Analyse IA locale (mode secours)";
  }
}

// 👉 analyse simple
app.get("/analyse", async (req, res) => {
  const nom = req.query.nom?.toLowerCase();

  const produit = produits.find(p => p.nom === nom);

  if (!produit) {
    return res.json({ erreur: "Produit non trouvé" });
  }

  const ia = await analyseIA(nom);

  res.json({
    produit: produit.nom,
    type: produit.type,
    risque: getRisque(produit.dl50),
    effets: produit.effets,
    conduite: produit.conduite,
    interactions: produit.interactions,
    ia: ia
  });
});

// 👉 interactions multiples
app.post("/interaction", (req, res) => {
  const liste = req.body.produits || [];
  let alertes = [];

  liste.forEach(p1 => {
    const prod = produits.find(p => p.nom === p1);
    if (prod) {
      prod.interactions.forEach(i => {
        if (liste.includes(i)) {
          alertes.push(`${p1} ↔ ${i}`);
        }
      });
    }
  });

  res.json({
    interactions: alertes.length ? alertes : ["Aucune interaction"]
  });
});

// 👉 PDF
app.get("/pdf", (req, res) => {
  const nom = req.query.nom?.toLowerCase();
  const produit = produits.find(p => p.nom === nom);

  if (!produit) return res.send("Produit non trouvé");

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  doc.fontSize(18).text("SENTOX PRO", { align: "center" });
  doc.moveDown();
  doc.text("Produit: " + produit.nom);
  doc.text("Type: " + produit.type);
  doc.text("Effets: " + produit.effets);
  doc.text("Conduite: " + produit.conduite);

  doc.end();
});

app.listen(5000, "0.0.0.0", () => {
  console.log("SENTOX PRO lancé sur http://localhost:5000");
});