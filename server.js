const express = require("express");
const PDFDocument = require("pdfkit");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = 5000;

// 🔥 servir le frontend
app.use(express.static("public"));

// 🔬 Base locale intelligente
const base = {
  paracetamol: {
    produit: "Paracétamol",
    type: "Médicament",
    toxicite: {
      nature: "Hépatotoxique",
      organe: "Foie"
    },
    dose: {
      faible: "< 3 g/j",
      moderee: "3 - 7 g",
      elevee: "> 7 g (toxique)"
    },
    effets: "Nausées, atteinte hépatique",
    conduite: "Surveillance médicale",
    source: "Locale"
  }
};

// 🔬 Fonction PubChem
async function getPubChem(produit) {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${produit}/property/MolecularFormula,MolecularWeight/JSON`;

    const res = await fetch(url);
    const data = await res.json();

    const props = data.PropertyTable.Properties[0];

    return {
      formule: props.MolecularFormula,
      poids: props.MolecularWeight,
      source: "PubChem"
    };
  } catch {
    return null;
  }
}

// 🔥 ROUTE ANALYSE
app.get("/analyse/:produit", async (req, res) => {
  const produit = req.params.produit.toLowerCase();

  // 1️⃣ base locale
  if (base[produit]) {
    return res.json(base[produit]);
  }

  // 2️⃣ PubChem
  const pub = await getPubChem(produit);

  if (pub) {
    return res.json({
      produit,
      type: "Composé chimique",
      toxicite: {
        nature: "À déterminer",
        organe: "À déterminer"
      },
      dose: {
        faible: "-",
        moderee: "-",
        elevee: "-"
      },
      effets: "À compléter",
      conduite: "Consulter un expert",
      ...pub
    });
  }

  res.json({ message: "Produit non trouvé" });
});

// 📄 ROUTE PDF
app.get("/pdf/:produit", async (req, res) => {
  const produit = req.params.produit.toLowerCase();

  const data = base[produit] || await getPubChem(produit);

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  // 🖼️ logo
  doc.image(path.join(__dirname, "public/logo.png"), 50, 30, { width: 100 });

  doc.fontSize(20).text("SENTOX PRO", 200, 50);
  doc.moveDown();
  doc.fontSize(14).text("Rapport toxicologique");

  doc.moveDown();

  doc.fontSize(12).text(`Produit : ${data.produit || produit}`);
  doc.text(`Type : ${data.type || "-"}`);

  doc.text(`Toxicité : ${data.toxicite?.nature || "-"}`);
  doc.text(`Organe : ${data.toxicite?.organe || "-"}`);

  doc.text(`Dose faible : ${data.dose?.faible || "-"}`);
  doc.text(`Dose modérée : ${data.dose?.moderee || "-"}`);
  doc.text(`Dose élevée : ${data.dose?.elevee || "-"}`);

  doc.text(`Effets : ${data.effets || "-"}`);
  doc.text(`Conduite : ${data.conduite || "-"}`);

  doc.text(`Formule : ${data.formule || "-"}`);
  doc.text(`Poids : ${data.poids || "-"}`);

  doc.text(`Source : ${data.source || "-"}`);

  doc.end();
});

// 🚀 LANCEMENT
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});