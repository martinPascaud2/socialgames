export const categories = [
  { name: "CEREBRAL", href: "/categories/categorie1" },
  { name: "CULTURE", href: "/categories/categorie2" },
  { name: "FAMILLE", href: "/" },
  { name: "CARTES", href: "/" },
  { name: "SOCIAL", href: "/" },
  { name: "AUTRE", href: "/" },
  { name: "CHALLENGE", href: "/" },
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
      name: "Quel mot ?",
      path: "ptitbac",
      img: "/ptitbac.jpg",
      description:
        "Le but est de trouver, par écrit et en un temps limité, une série de mots appartenant à une catégorie prédéfinie et commençant par la même lettre.",
    },
    {
      name: "Mémoire",
      path: "memory",
      img: "/memory.jpeg",
      description:
        "À son tour, chaque joueur retourne deux cartes de son choix. S'il découvre deux cartes identiques, il les ramasse et les conserve, ce qui lui permet de rejouer. Si les cartes ne sont pas identiques, il les retourne faces cachées à leur emplacement de départ. Le jeu se termine quand toutes les paires de cartes ont été découvertes et ramassées. Le gagnant est le joueur qui possède le plus de paires.",
    },
    // {
    //   name: "Action ou vérité",
    //   path: "actionouverite",
    //   img: "/actionouverite.png",
    //   description:
    //     "A tour de rôle, chaque joueur choisit entre une Action à réaliser, ou une Vérité à révéler... surprise !",
    // },
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

// check : remove isGuestsAllowed, limits in modes

export const gamesRefs = {
  grouping: { name: "un nouveau groupe", categorie: "grouping" },
  // actionouverite: {
  //   name: "Action ou Vérité",
  //   categorie: "categorie1",
  //   limits: { min: 2, max: 15 },
  //   isGuestsAllowed: true,
  // },
  undercover: {
    name: "Undercover",
    categorie: "categorie1",
    limits: { min: 3, max: 15 },
    isGuestsAllowed: true,
  },
  dobble: {
    name: "Dobble",
    categorie: "categorie1",
    limits: { min: 2, max: 15 },
    isGuestsAllowed: false,
  },
  memory: {
    name: "Mémoire",
    categorie: "categorie1",
    limits: { min: 2, max: 2 },
    isGuestsAllowed: true,
  },
  ptitbac: {
    name: "Quel mot ?",
    categorie: "categorie1",
    limits: { min: 2, max: 15 },
    isGuestsAllowed: false,
  },
  drawing: {
    name: "Dessin",
    categorie: "categorie1",
    limits: { min: 4, max: 10 },
    isGuestsAllowed: false,
  },
  uno: {
    name: "Uno",
    categorie: "categorie1",
    limits: { min: 2, max: 10 },
    isGuestsAllowed: false,
  },
  triaction: {
    name: "Triaction",
    categorie: "categorie1",
    limits: { min: 3, max: 8 },
    isGuestsAllowed: false,
  },
};

export const modesRules = {
  ptitbac: {
    name: "Quel mot ?",
    limits: { min: 2, max: 15 },
  },
  dobble: {
    name: "Dobble",
    limits: { min: 2, max: 15 },
  },
  esquisse: {
    name: "Esquisse",
    limits: { min: 4, max: 10 },
  },
  memory: {
    name: "Mémoire",
    limits: { min: 2, max: 2 },
  },
};
