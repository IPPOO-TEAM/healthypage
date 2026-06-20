// Banque d'images Assistance Juridique — chaque clé n'est utilisée qu'à un seul endroit
// (différente de celle de AssistanceJuridiquePublicScreen pour éviter les doublons).
const u = (id: string, w = 1200) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const LEGAL = {
  // Architecture / institutions
  domeBuilding: u('photo-1771836796547-8c96dd94aae4'),
  modernConcrete: u('photo-1761387787737-c850f5db6fa3'),
  flagBuilding: u('photo-1670956020767-9d06147defda'),
  columnBuilding: u('photo-1770479488125-41ff5697bcd0'),
  domeTower: u('photo-1766102936124-eefe2948ad1b'),
  whiteRoof: u('photo-1666331132615-392cfd3ce063'),
  flagPole: u('photo-1767540885885-13c84203f2c9'),
  facadeSky: u('photo-1761792425134-7e09471c5b55'),

  // Portraits femmes (droits, témoins)
  womanScarfA: u('photo-1771695840267-b8dbef7f04f4'),
  womanScarfB: u('photo-1771695842367-d8ac22109162'),
  womanScarfC: u('photo-1771695838911-64db3b8e9ca7'),
  womanScarfD: u('photo-1771695835173-cf2b0f209184'),
  womanLocsA: u('photo-1765560216398-abcb3ce1dde7'),
  womanLocsB: u('photo-1765560213745-17957179446b'),

  // Documents / signatures
  signingDoc: u('photo-1758519288480-1489c17b1519'),
  pencilNote: u('photo-1721379805142-faaa28ab1424'),
  writingPaper: u('photo-1721379800770-fda153205b1c'),
  reviewDocs: u('photo-1775163024488-e88e4a71179f'),
  contractTable: u('photo-1758518731462-d091b0b4ed0d'),

  // Personnages travail / quotidien
  hijabSit: u('photo-1772714601002-fbb0fea8a911'),
  womanTree: u('photo-1718693942271-4cd86f5aa1f4'),
  womanOcean: u('photo-1762793193633-c26f3d34e710'),
  womanUniform: u('photo-1666867936058-de34bfd5b320'),

  // Ambiance / contexte
  darkHandshake: u('photo-1638262052630-9c3f7dd449c4'),
  classicHandshake: u('photo-1521791136064-7986c2920216'),
  meetingHands: u('photo-1521790797524-b2497295b8a0'),
  signMeeting: u('photo-1758519288905-38b7b00c1023'),

  // Symboles
  gavelClosed: u('photo-1767972159871-b9f5d320be2b'),
  gavelDark: u('photo-1767972463877-b64ba4283cd0'),
  bookOpenTable: u('photo-1739878598975-ae86a59f6c81'),
  scaleEagle: u('photo-1706614882607-b2c9db79699f'),

  // Familles / vulnérabilité
  twoWomen: u('photo-1761370981139-c1fe5402c709'),
  familyTrad: u('photo-1775688426266-752fb53e7c00'),
  vendorThumb: u('photo-1687422808565-929533931584'),
  marketCrowd: u('photo-1572851569977-e18b9ea6edbe'),
  vendorTomato: u('photo-1734255026082-82fdc81991f0'),

  // Téléphones / appel
  phoneVintage: u('photo-1764722053231-9162ed8831d2'),
  phoneSmoke: u('photo-1658843625838-1f2fae699903'),

  // Paysages
  greenField: u('photo-1674466911407-2e7869729221'),
  fieldTrees: u('photo-1699387948969-af05ca0cdacc'),
  fieldDirt: u('photo-1662815123989-d38cafa9d433'),
};

export type LegalImage = keyof typeof LEGAL;
