export const categories = [
  {
    name: "CEREBRAL",
    href: "/categories/categorie1",
    src: "/categoriesIcons/cerebral.png",
  },
  {
    name: "CULTURE",
    href: "/categories/categorie2",
    src: "/categoriesIcons/knowledge2.png",
  },
  {
    name: "FAMILLE",
    href: "/categories/categorie3",
    src: "/categoriesIcons/family1.png",
  },
  {
    name: "CARTES",
    href: "/categories/categorie4",
    src: "/categoriesIcons/cards2.png",
  },
  {
    name: "SOCIAL",
    href: "/categories/categorie5",
    src: "/categoriesIcons/social.png",
  },
  {
    name: "DEUX",
    href: "/categories/categorie6",
    src: "/categoriesIcons/duo1.png",
  },
  {
    name: "APPLI",
    href: "/",
    src: "/categoriesIcons/appli.png",
  },
];

export const subCategories = {
  grouping: [{ name: "grouping", path: "grouping" }],
  categorie1: [
    {
      name: "Identiques",
      path: "dobble",
      img: "/dobble.jpg",
      description:
        "Découvrez l’unique symbole identique entre deux cartes... avant les autres !",
    },
  ],
  categorie2: [
    {
      name: "Placement",
      path: "sort",
      img: "/timeline.png",
      description: "Description du jeu de tri",
    },
  ],
  categorie3: [
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
  ],
  categorie4: [
    {
      name: "Classico",
      path: "uno",
      img: "/uno.jpeg",
      description:
        "Pour gagner une manche de Uno, il faut être le premier joueur à se défausser de la dernière carte de sa main. La manche s'arrête alors (après les pioches de cartes éventuelles), et l'on compte les points. Le jeu continue, manche par manche, jusqu'à ce qu'un joueur atteigne 500 points.",
    },
  ],
  categorie5: [
    {
      name: "Connaissance des autres",
      path: "socialknowledge",
      img: "/socialknowledge.png",
      description: "La description de connaissance des autres",
    },
    {
      name: "Triaction",
      path: "triaction",
      img: "/triathlon.jpeg",
      description: "Blablabla eojrnvenrvlejrv ervedv dfvdvf",
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
  ],
  categorie6: [
    {
      name: "Mémoire",
      path: "memory",
      img: "/memory.jpeg",
      description:
        "À son tour, chaque joueur retourne deux cartes de son choix. S'il découvre deux cartes identiques, il les ramasse et les conserve, ce qui lui permet de rejouer. Si les cartes ne sont pas identiques, il les retourne faces cachées à leur emplacement de départ. Le jeu se termine quand toutes les paires de cartes ont été découvertes et ramassées. Le gagnant est le joueur qui possède le plus de paires.",
    },
  ],
};

// to be done : remove isGuestsAllowed, limits in modes

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
    categorie: "categorie5",
    limits: { min: 3, max: 15 },
    isGuestsAllowed: true,
  },
  dobble: {
    name: "Identiques",
    categorie: "categorie1",
    limits: { min: 2, max: 15 },
    isGuestsAllowed: false,
  },
  memory: {
    name: "Mémoire",
    categorie: "categorie6",
    limits: { min: 2, max: 2 },
    isGuestsAllowed: true,
  },
  ptitbac: {
    name: "Quel mot ?",
    categorie: "categorie3",
    limits: { min: 2, max: 15 },
    isGuestsAllowed: false,
  },
  drawing: {
    name: "Dessin",
    categorie: "categorie3",
    limits: { min: 4, max: 10 },
    isGuestsAllowed: false,
  },
  uno: {
    name: "Classico",
    categorie: "categorie4",
    limits: { min: 2, max: 10 },
    isGuestsAllowed: false,
  },
  triaction: {
    name: "Triaction",
    categorie: "categorie5",
    limits: { min: 3, max: 8 },
    isGuestsAllowed: false,
  },
  sort: {
    name: "Placement",
    categorie: "categorie2",
    limits: { min: 2, max: 8 },
    isGuestsAllowed: false,
  },
  socialknowledge: {
    name: "Connaissance des autres",
    categorie: "categorie5",
    limits: { min: 2, max: 10 },
    isGuestsAllowed: false,
  },
};

export const modesRules = {
  ptitbac: {
    name: "Quel mot ?",
    limits: { min: 2, max: 15 },
  },
  dobble: {
    name: "Identiques",
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
  triaction: {
    name: "Triaction",
    limits: { min: 3, max: 8 },
  },
  undercover: {
    name: "Undercover",
    limits: { min: 3, max: 15 },
  },
  uno: {
    name: "Classico",
    limits: { min: 2, max: 10 },
  },
  sort: {
    name: "Placement",
    limits: { min: 2, max: 8 },
  },
  tableau: {
    name: "Tableau",
    limits: { min: 2, max: 10 },
  },
};
