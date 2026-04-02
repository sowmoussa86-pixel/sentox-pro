const produits = [
  {
    nom: "paracetamol",
    type: "medicament",
    dl50: 338,
    effets: ["Nausées", "Atteinte hépatique"],
    conduite: "Surveillance médicale",
    interactions: ["alcool"]
  },
  {
    nom: "aspirine",
    type: "medicament",
    dl50: 200,
    effets: ["Saignements", "Irritation gastrique"],
    conduite: "Consultation médicale",
    interactions: ["anticoagulants"]
  },
  {
    nom: "alcool",
    type: "chimique",
    dl50: 7060,
    effets: ["Dépression SNC"],
    conduite: "Surveillance",
    interactions: ["paracetamol"]
  },
  {
    nom: "neem",
    type: "plante",
    dl50: 500,
    effets: ["Vomissements"],
    conduite: "Surveillance",
    interactions: []
  }
];

module.exports = produits;