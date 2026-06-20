// Banque d'images Happy Page — chaque clé n'est utilisée qu'à un seul endroit.
const u = (id: string, w = 1200) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const HAPPY = {
  // Coloriage / mandalas
  mandalaCircle: u('photo-1610573600031-bc1c2a16c6e0'),
  kaleidoStar: u('photo-1763970278011-adc2d74cce78'),
  kaleidoFlower: u('photo-1741166237257-d694c313def0'),
  kaleidoSym: u('photo-1752910801444-f057334f2310'),
  // Textiles wax
  waxBright: u('photo-1768212566108-4ce4f329e4d2'),
  waxStack: u('photo-1578509566163-068acd11b8e7'),
  waxChart: u('photo-1658597563660-d0e311b8d191'),
  waxGlass: u('photo-1664151100165-71ed5515adad'),
  waxClose: u('photo-1726208206168-6673899aff25'),
  background: u('photo-1669321449105-244016283fc9'),
  // Enfants / portraits joie
  kidsHouse: u('photo-1761168434263-1a01b07b64d8'),
  kidStripes: u('photo-1615802260121-b811bc9d469e'),
  kidJacket: u('photo-1542319272-42dba4f554be'),
  kidPlay: u('photo-1692855863716-c22c14183820'),
  girlHands: u('photo-1736205360390-024ab4d248bd'),
  // Musique / casque
  womanWriting: u('photo-1655720348598-526764cd2bca'),
  scarfHeadphones: u('photo-1697641665161-48344289a88f'),
  parkMusic: u('photo-1753685723643-9a75a5d885ea'),
  // Zen
  zenSandStones: u('photo-1768396748006-b7638fcb4219'),
  zenDriftwood: u('photo-1771406118147-8c40f9008b29'),
  zenLines: u('photo-1566940564578-309d64952258'),
  zenRock: u('photo-1672758688320-685bb6b36846'),
  // Étoiles / ciel
  starSky: u('photo-1647518262960-d8f3a34b3c4f'),
  bigStar: u('photo-1736231182175-c3202ce807c0'),
  nebulaHeart: u('photo-1765120298918-e9932c6c0332'),
  starsClouds: u('photo-1633785976570-d14fb8b632c7'),
  // Village / paysage
  villageRoad: u('photo-1564085592941-91909f8eb533'),
  villageHouses: u('photo-1761342613225-d8a89ab221fb'),
  villageHut: u('photo-1709256817701-8d5f2ab0533e'),
  villageThatch: u('photo-1759217801409-f95619d6c1e2'),
  // Bulles / abstrait
  bubbleOrange: u('photo-1620377045865-81341542470d'),
  bubbleDrops: u('photo-1598789051264-b3b29782b0b8'),
  bubbleSwirl: u('photo-1777835158638-4ef4097e778f'),
  // Avatars portraits
  manDenim: u('photo-1582567056798-7dc94989e56d'),
  manDreads: u('photo-1764592746176-510fd3676bcd'),
  manBandana: u('photo-1714567911234-44ae36916fd7'),
  manJacket: u('photo-1597384708133-af8b03bb1287'),
  // Arcade / mini-jeux
  arcadeNeon: u('photo-1636070759654-5c93bbca2862'),
  arcadeSign: u('photo-1666861986217-b011a4eb7d4b'),
  arcadeMachine: u('photo-1543033906-8f2a9f541af9'),
  // Puzzle
  puzzleWhite: u('photo-1590146758181-4d4d31adfc76'),
  puzzleBowls: u('photo-1590146757983-5da4bdd679f3'),
  // Story / livre
  storyHarry: u('photo-1771712745074-80faaadc030e'),
  storyLor: u('photo-1767219077120-1aa6d2398717'),
  storyShelf: u('photo-1762275194005-8770989c9419'),
  storyStack: u('photo-1764091572382-31834aaf93f5'),
};

export type HappyImage = keyof typeof HAPPY;
