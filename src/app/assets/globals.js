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
  grouping: [{ name: "grouping", path: "grouping" }],
  categorie1: [
    {
      name: "Uno",
      path: "uno",
      img: "/uno.jpeg",
      description:
        "Pour gagner une manche de Uno, il faut être le premier joueur à se défausser de la dernière carte de sa main. La manche s'arrête alors (après les pioches de cartes éventuelles), et l'on compte les points. Le jeu continue, manche par manche, jusqu'à ce qu'un joueur atteigne 500 points.",
    },
    {
      name: "Dessin",
      path: "drawing",
      img: "/esquisse.jpg",
      description: "Dessin dessin dessin",
    },
    {
      name: "P'tit bac",
      path: "ptitbac",
      img: "/ptitbac.jpg",
      description:
        "Le but est de trouver, par écrit et en un temps limité, une série de mots appartenant à une catégorie prédéfinie et commençant par la même lettre.",
    },
    {
      name: "Memory",
      path: "memory",
      img: "/memory.jpeg",
      description:
        "À son tour, chaque joueur retourne deux cartes de son choix. S'il découvre deux cartes identiques, il les ramasse et les conserve, ce qui lui permet de rejouer. Si les cartes ne sont pas identiques, il les retourne faces cachées à leur emplacement de départ. Le jeu se termine quand toutes les paires de cartes ont été découvertes et ramassées. Le gagnant est le joueur qui possède le plus de paires.",
    },
    {
      name: "Action ou vérité",
      path: "actionouverite",
      img: "/actionouverite.png",
      description:
        "A tour de rôle, chaque joueur choisit entre une Action à réaliser, ou une Vérité à révéler... surprise !",
    },
    {
      name: "Undercover",
      path: "undercover",
      img: "/undercover.png",
      description:
        "Au début de la partie, chacun reçoit un mot secret. Les joueurs doivent ensuite révéler petit à petit des informations sur leur mot pour deviner qui a le même mot qu’eux ! Après quelques tours d’élimination, réussiront-ils à découvrir leur identité et à se défaire de leurs ennemis ?",
    },
    {
      name: "Dobble",
      path: "dobble",
      img: "/dobble.jpg",
      description:
        "Découvrez l’unique symbole identique entre deux cartes... avant les autres !",
    },
    {
      name: "Triaction ",
      path: "triaction",
      img: "/triathlon.jpeg",
      description: "Blablabla eojrnvenrvlejrv ervedv dfvdvf",
    },
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
  grouping: { name: "un nouveau groupe", categorie: "grouping" },
  actionouverite: { name: "Action ou Vérité", categorie: "categorie1" },
  undercover: { name: "Undercover", categorie: "categorie1" },
  dobble: { name: "Dobble", categorie: "categorie1" },
  memory: { name: "Memory", categorie: "categorie1" },
  ptitbac: { name: "P'tit bac", categorie: "categorie1" },
  drawing: { name: "Dessin", categorie: "categorie1" },
  uno: { name: "Uno", categorie: "categorie1" },
  triaction: { name: "Triaction", categorie: "categorie1" },
};
