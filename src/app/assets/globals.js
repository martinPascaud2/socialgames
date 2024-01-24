export const categories = [
  { name: "Catégorie 1", href: "/categories/categorie1" },
  { name: "Catégorie 2", href: "/categories/categorie2" },
  { name: "Catégorie 3", href: "/" },
  { name: "Catégorie 4", href: "/" },
  { name: "Catégorie 5", href: "/" },
  { name: "Catégorie 6", href: "/" },
  { name: "Catégorie 7", href: "/" },
  { name: "Catégorie 8", href: "/" },
];

export const subCategories = {
  categorie1: [
    { name: "Uno", path: "uno", img: "/uno.jpeg" },
    {
      name: "Action ou vérité",
      path: "actionouverite",
      img: "/actionouverite.png",
    },
    { name: "Undercover", path: "undercover", img: "/undercover.png" },
    { name: "game4", path: "uno", img: "/uno.jpeg" },
    { name: "game5", path: "uno", img: "/uno.jpeg" },
    { name: "game6", path: "uno", img: "/uno.jpeg" },
    { name: "game7", path: "uno", img: "/uno.jpeg" },
    { name: "game8", path: "uno", img: "/uno.jpeg" },
  ],
  categorie2: [
    { name: "game6", path: "uno", img: "/uno.jpeg" },
    { name: "game7", path: "uno", img: "/uno.jpeg" },
    { name: "game8", path: "uno", img: "/uno.jpeg" },
    { name: "game9", path: "uno", img: "/uno.jpeg" },
    { name: "game10", path: "uno", img: "/uno.jpeg" },
  ],
};

export const gamesRefs = {
  actionouverite: { name: "Action ou Vérité", categorie: "categorie1" },
  undercover: { name: "Undercover", categorie: "categorie1" },
};
