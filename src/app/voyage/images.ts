// Catalogue d'images pour Voyage & Loisirs.
// Mélange : photos locales fournies par l'utilisateur (style Afrique de l'Ouest authentique)
// + Unsplash (CDN distant) strictement dans le même registre visuel.
// Règle : chaque clé pointe vers une URL/source UNIQUE — pas de doublons.

import localWaterfallPirogue from '../../imports/photo_1_2026-05-08_16-46-01.jpg';
import localPirogueLake from '../../imports/photo_2_2026-05-08_16-46-01.jpg';
import localJungleHike from '../../imports/photo_3_2026-05-08_16-46-01.jpg';
import localWaterfallCrowd from '../../imports/photo_5_2026-05-08_16-46-01.jpg';
import localKenteRopeBridge from '../../imports/photo_6_2026-05-08_16-46-01.jpg';
import localMangroveRedDress from '../../imports/photo_7_2026-05-08_16-46-01.jpg';
import localRopeBridgeMan from '../../imports/photo_10_2026-05-08_16-46-01.jpg';
import localFallenTreeJungle from '../../imports/photo_11_2026-05-08_16-46-01.jpg';
import localSunsetPirogues from '../../imports/photo_13_2026-05-08_16-46-01.jpg';
import localSavannaElephants from '../../imports/photo_14_2026-05-08_16-46-01.jpg';

// Variantes complémentaires (mêmes registres, scènes différentes)
import localWaterfallPinkDress from '../../imports/photo_1_2026-05-08_16-46-01-1.jpg';
import localPirogueMan from '../../imports/photo_2_2026-05-08_16-46-01-1.jpg';
import localJungleHikers from '../../imports/photo_3_2026-05-08_16-46-01-1.jpg';
import localWaterfallVillage from '../../imports/photo_5_2026-05-08_16-46-01-1.jpg';
import localKenteBridgeBeach from '../../imports/photo_6_2026-05-08_16-46-01-1.jpg';
import localMangroveGroup from '../../imports/photo_7_2026-05-08_16-46-01-1.jpg';
import localMangroveMonkey from '../../imports/photo_9_2026-05-08_16-46-01.jpg';
import localBridgeWaterfallMan from '../../imports/photo_10_2026-05-08_16-46-01-1.jpg';
import localPirogueMarketSunset from '../../imports/photo_13_2026-05-08_16-46-01-1.jpg';
import localSavannaSunsetTree from '../../imports/photo_14_2026-05-08_16-46-01-1.jpg';

const SALY_PALM = 'https://images.unsplash.com/photo-1743518576474-c332abd1db79?auto=format&fit=crop&w=1600&q=80';
const SALY_UMBRELLAS = 'https://images.unsplash.com/photo-1743518576341-565e14b77dcc?auto=format&fit=crop&w=1600&q=80';
const SALY_HUTS = 'https://images.unsplash.com/photo-1743518576468-bed065594281?auto=format&fit=crop&w=1600&q=80';
const SALY_EMPTY = 'https://images.unsplash.com/photo-1743518576380-6e8968426b87?auto=format&fit=crop&w=1600&q=80';
const SALY_BOATS = 'https://images.unsplash.com/photo-1743518576502-101437a26d12?auto=format&fit=crop&w=1600&q=80';
const SALY_AERIAL = 'https://images.unsplash.com/photo-1743518576541-f5db9134d1da?auto=format&fit=crop&w=1600&q=80';
const SALY_SCENIC = 'https://images.unsplash.com/photo-1743518576305-652c0e1a6fdb?auto=format&fit=crop&w=1600&q=80';

const SL_BOATS = 'https://images.unsplash.com/photo-1709305361635-3355851b75d1?auto=format&fit=crop&w=1600&q=80';
const SL_HARBOR = 'https://images.unsplash.com/photo-1615486905505-7863587b1c3f?auto=format&fit=crop&w=1600&q=80';
const SL_FISH = 'https://images.unsplash.com/photo-1761471420566-5ca748e79afc?auto=format&fit=crop&w=1600&q=80';
const SL_BOAT2 = 'https://images.unsplash.com/photo-1629300678017-eb3cb4eb4b77?auto=format&fit=crop&w=1600&q=80';
const SL_CASAMANCE = 'https://images.unsplash.com/photo-1657302699239-c350f0372260?auto=format&fit=crop&w=1600&q=80';

const RIAD_POOL = 'https://images.unsplash.com/photo-1624804823268-7d5454caa8c8?auto=format&fit=crop&w=1600&q=80';
const RIAD_FACADE = 'https://images.unsplash.com/photo-1624804821465-5c7c80f99bd1?auto=format&fit=crop&w=1600&q=80';
const RIAD_VIEW = 'https://images.unsplash.com/photo-1698681829549-3804783c1aba?auto=format&fit=crop&w=1600&q=80';
const RIAD_GAZEBO = 'https://images.unsplash.com/photo-1628962601069-ffe240250c35?auto=format&fit=crop&w=1600&q=80';
const RIAD_GREEN_POOL = 'https://images.unsplash.com/photo-1570135460243-84a775827316?auto=format&fit=crop&w=1600&q=80';
const RIAD_OPEN_POOL = 'https://images.unsplash.com/photo-1628642004970-1da51c8c7dec?auto=format&fit=crop&w=1600&q=80';
const RIAD_HALL = 'https://images.unsplash.com/photo-1570133435529-62359fac701b?auto=format&fit=crop&w=1600&q=80';
const RIAD_BLUE_POOL = 'https://images.unsplash.com/photo-1570133435807-5feefeb2d196?auto=format&fit=crop&w=1600&q=80';
const RIAD_WHITE = 'https://images.unsplash.com/photo-1612600870196-5757968822bd?auto=format&fit=crop&w=1600&q=80';
const RIAD_ALLEY = 'https://images.unsplash.com/photo-1547473898-39cbd3a1047f?auto=format&fit=crop&w=1600&q=80';

const ESS_BOAT_SLEEP = 'https://images.unsplash.com/photo-1651525096539-978645b38d39?auto=format&fit=crop&w=1600&q=80';
const ESS_BOATS_BEACH = 'https://images.unsplash.com/photo-1669882689201-c56a0aa948e0?auto=format&fit=crop&w=1600&q=80';
const ESS_BOAT_SAND = 'https://images.unsplash.com/photo-1728065461736-d4975cb428c3?auto=format&fit=crop&w=1600&q=80';
const ESS_BOATS_WATER = 'https://images.unsplash.com/photo-1650634198952-3ba925eb8785?auto=format&fit=crop&w=1600&q=80';
const ESS_BLUE_BOAT = 'https://images.unsplash.com/photo-1627653421695-481fcb4f46ab?auto=format&fit=crop&w=1600&q=80';
const ESS_STREET = 'https://images.unsplash.com/photo-1592760977536-200056fb30ef?auto=format&fit=crop&w=1600&q=80';
const ESS_COLOR = 'https://images.unsplash.com/photo-1542618026-6b7e7e5b1fdf?auto=format&fit=crop&w=1600&q=80';

const ZAN_BOAT = 'https://images.unsplash.com/photo-1621357268218-29e17d6cb0c4?auto=format&fit=crop&w=1600&q=80';
const ZAN_SAILBOAT = 'https://images.unsplash.com/photo-1692895975768-11bc8a3fdf8f?auto=format&fit=crop&w=1600&q=80';
const ZAN_CLEAR = 'https://images.unsplash.com/photo-1746722886794-25ad42c57a3b?auto=format&fit=crop&w=1600&q=80';
const ZAN_HOUSE = 'https://images.unsplash.com/photo-1656324124627-2f72343bbc11?auto=format&fit=crop&w=1600&q=80';
const ZAN_OCEAN_HOUSE = 'https://images.unsplash.com/photo-1646668352973-989182f03091?auto=format&fit=crop&w=1600&q=80';
const ZAN_BEACH_WALK = 'https://images.unsplash.com/photo-1657639263095-d2bac7257635?auto=format&fit=crop&w=1600&q=80';
const ZAN_BOATS_SHORE = 'https://images.unsplash.com/photo-1661001078114-4cdc6f3079b1?auto=format&fit=crop&w=1600&q=80';
const ZAN_PALM_BEACH = 'https://images.unsplash.com/photo-1740695765524-c5a9f8a20d1f?auto=format&fit=crop&w=1600&q=80';
const ZAN_PALM_MAN = 'https://images.unsplash.com/photo-1729321779792-a8c2f0c80bad?auto=format&fit=crop&w=1600&q=80';
const ZAN_BOAT_PALM = 'https://images.unsplash.com/photo-1717792212209-5b5db4d179e2?auto=format&fit=crop&w=1600&q=80';

const DESERT_SILHOUETTE = 'https://images.unsplash.com/photo-1527841430192-32adc8530984?auto=format&fit=crop&w=1600&q=80';
const DESERT_RESTING = 'https://images.unsplash.com/photo-1639512630894-642570301913?auto=format&fit=crop&w=1600&q=80';
const DESERT_GROUP = 'https://images.unsplash.com/photo-1689322366136-4740ee40d932?auto=format&fit=crop&w=1600&q=80';
const DESERT_CARAVAN = 'https://images.unsplash.com/photo-1689742855019-a09e208930e8?auto=format&fit=crop&w=1600&q=80';
const DESERT_WALK = 'https://images.unsplash.com/photo-1522751119405-dd4a636a4958?auto=format&fit=crop&w=1600&q=80';
const DESERT_REST_LARGE = 'https://images.unsplash.com/photo-1759655159466-c6d30cd50346?auto=format&fit=crop&w=1600&q=80';
const DESERT_LEAD = 'https://images.unsplash.com/photo-1747485010651-7cd1ac02df67?auto=format&fit=crop&w=1600&q=80';

const CT_MOUNTAIN = 'https://images.unsplash.com/photo-1592910725283-4a7752699e67?auto=format&fit=crop&w=1600&q=80';
const CT_PALMS = 'https://images.unsplash.com/photo-1565679419655-ff7514d6048b?auto=format&fit=crop&w=1600&q=80';
const CT_AERIAL = 'https://images.unsplash.com/photo-1708747956368-7583058615a0?auto=format&fit=crop&w=1600&q=80';
const CT_CITY = 'https://images.unsplash.com/photo-1510922300212-4f004bf09981?auto=format&fit=crop&w=1600&q=80';
const CT_HILL = 'https://images.unsplash.com/photo-1693752551747-1a26fb1d5c45?auto=format&fit=crop&w=1600&q=80';
const CT_CLIFF = 'https://images.unsplash.com/photo-1635260980154-315c57168b12?auto=format&fit=crop&w=1600&q=80';

const SPA_PLANTS = 'https://images.unsplash.com/photo-1680669115934-2b04b96d9eac?auto=format&fit=crop&w=1600&q=80';
const SPA_POOL = 'https://images.unsplash.com/photo-1680669666020-fcd592e4f4ae?auto=format&fit=crop&w=1600&q=80';
const SPA_WALL = 'https://images.unsplash.com/photo-1680669115592-60963a878eb2?auto=format&fit=crop&w=1600&q=80';
const SPA_COUCH = 'https://images.unsplash.com/photo-1680669115320-e874dd7dbe08?auto=format&fit=crop&w=1600&q=80';
const SPA_RETREAT = 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=1600&q=80';
const SPA_CANDLES = 'https://images.unsplash.com/photo-1639758597299-81abeebc5f9d?auto=format&fit=crop&w=1600&q=80';

const YOGA_RED = 'https://images.unsplash.com/photo-1635617240041-c95219c05542?auto=format&fit=crop&w=1600&q=80';
const YOGA_BEACH = 'https://images.unsplash.com/photo-1760774714285-61ff516f86c5?auto=format&fit=crop&w=1600&q=80';
const YOGA_ROCK = 'https://images.unsplash.com/photo-1590421554129-19a2dff37230?auto=format&fit=crop&w=1600&q=80';
const YOGA_CIRCLE = 'https://images.unsplash.com/photo-1551345021-fa29e6451e45?auto=format&fit=crop&w=1600&q=80';
const YOGA_SUNRISE = 'https://images.unsplash.com/photo-1589634752793-aabd114351ed?auto=format&fit=crop&w=1600&q=80';

const FOOD_RICE = 'https://images.unsplash.com/photo-1640199199982-95dbd3602d70?auto=format&fit=crop&w=1600&q=80';
const FOOD_CARROTS = 'https://images.unsplash.com/photo-1626266800006-5f5ca8204027?auto=format&fit=crop&w=1600&q=80';
const FOOD_LEMON = 'https://images.unsplash.com/photo-1626266800035-0f65355cb33a?auto=format&fit=crop&w=1600&q=80';
const FOOD_PLATE = 'https://images.unsplash.com/photo-1577223219744-5a47e62fa68f?auto=format&fit=crop&w=1600&q=80';
const FOOD_HAND = 'https://images.unsplash.com/photo-1702538808213-4da9a0ee039c?auto=format&fit=crop&w=1600&q=80';
const FOOD_BOWL = 'https://images.unsplash.com/photo-1615865441757-e5328eb6a5ad?auto=format&fit=crop&w=1600&q=80';

const PATTERN_HATS = 'https://images.unsplash.com/photo-1509005382670-7281764d8d9a?auto=format&fit=crop&w=1600&q=80';
const PATTERN_BLUE = 'https://images.unsplash.com/photo-1555885424-77ccf23eaafb?auto=format&fit=crop&w=1600&q=80';
const PATTERN_INDIGO_ANIMALS = 'https://images.unsplash.com/photo-1761516659531-81f8cce1b480?auto=format&fit=crop&w=1600&q=80';
const PATTERN_INDIGO = 'https://images.unsplash.com/photo-1627547333969-cc6c758daecf?auto=format&fit=crop&w=1600&q=80';

export const AFR = {
  // Saly / Petite Côte
  salyPalmBeach: SALY_PALM,
  salyUmbrellas: SALY_UMBRELLAS,
  salyHuts: SALY_HUTS,
  salyEmptyBeach: SALY_EMPTY,
  salyBoatsRestaurant: SALY_BOATS,

  // Pirogues & balades Sénégal — photos locales authentiques
  piroguesColor: localPirogueLake,
  piroguePink: SL_BOAT2,
  beachBike: SALY_AERIAL,
  goreeWaterEdge: SALY_SCENIC,
  caleche: localMangroveRedDress,

  // Saint-Louis & Saloum
  saintLouisBoat: SL_BOATS,
  saintLouisShop: SL_FISH,
  saintLouisCity: SL_HARBOR,
  saintLouisRiver: SL_CASAMANCE,
  saintLouisHarbor: localSunsetPirogues,
  saloumPirogue: localPirogueMarketSunset,
  saloumLakeMan: localPirogueMan,

  // Marrakech / Riads
  marrakechRiad: RIAD_FACADE,
  riadPool: RIAD_POOL,
  riadHall: RIAD_HALL,
  riadFacade: RIAD_VIEW,
  riadPink: RIAD_GAZEBO,
  marrakechSquare: RIAD_ALLEY,
  riadBlueDoor: RIAD_BLUE_POOL,
  riadOpenPool: RIAD_OPEN_POOL,
  riadGreenPool: RIAD_GREEN_POOL,
  riadWhite: RIAD_WHITE,

  // Essaouira
  essaouiraBoats: ESS_BOATS_BEACH,
  essaouiraAlley: ESS_STREET,
  essaouiraDocks: ESS_BOAT_SAND,
  essaouiraBlueBoat: ESS_BLUE_BOAT,
  essaouiraColor: ESS_COLOR,
  essaouiraWater: ESS_BOATS_WATER,

  // Zanzibar / Lamu
  zanzibarChairs: ZAN_BEACH_WALK,
  zanzibarHouse: ZAN_HOUSE,
  lamuBoat: ZAN_BOAT,
  lamuLoungers: ZAN_SAILBOAT,
  zanzibarHut: ZAN_OCEAN_HOUSE,
  zanzibarPier: ZAN_BOATS_SHORE,
  zanzibarResort: ZAN_PALM_BEACH,
  zanzibarPath: ZAN_PALM_MAN,
  zanzibarPalm: ZAN_BOAT_PALM,
  zanzibarClear: ZAN_CLEAR,

  // Désert
  desertWoman: DESERT_RESTING,
  desertSunset: DESERT_SILHOUETTE,
  desertGroup: DESERT_GROUP,
  desertWhiteDress: DESERT_REST_LARGE,
  desertCamels: DESERT_WALK,
  desertCaravan: DESERT_CARAVAN,
  desertLead: DESERT_LEAD,

  // Cape Town
  capeTownMountain: CT_MOUNTAIN,
  capeTownYellow: CT_PALMS,
  capeTownStreet: CT_CITY,
  capeTownRoad: CT_HILL,
  capeTownAerial: CT_AERIAL,
  capeTownClock: CT_CLIFF,

  // Nature & jungle (photos locales)
  ethiopiaWaterfall: localWaterfallPirogue,
  ethiopiaMountains: localWaterfallCrowd,
  ethiopiaValley: localJungleHike,
  ethiopiaClouds: localRopeBridgeMan,
  jungleFallenTree: localFallenTreeJungle,
  savannaElephantsSunset: localSavannaElephants,
  savannaAcaciaSunset: localSavannaSunsetTree,
  jungleHikers: localJungleHikers,
  jungleWaterfallCrowd: localWaterfallVillage,
  bridgeWaterfall: localBridgeWaterfallMan,
  mangroveWalkGroup: localMangroveGroup,
  mangroveMonkey: localMangroveMonkey,
  waterfallPinkDress: localWaterfallPinkDress,
  kenteBridgeBeach: localKenteBridgeBeach,

  // Spa & wellness
  spaManProfile: SPA_PLANTS,
  spaTreeGroup: SPA_WALL,
  yogaRiver: YOGA_ROCK,
  africanGreenDress: SPA_POOL,
  spaBackMassage: SPA_RETREAT,
  spaAfro: SPA_COUCH,
  spaOceanRoom: SPA_CANDLES,
  spaProneMassage: YOGA_RED,

  // Food
  foodPlateRice: FOOD_RICE,
  foodPumpkinWoman: FOOD_HAND,
  foodFruits: FOOD_LEMON,
  foodBowl: FOOD_BOWL,
  foodLouisHansel: FOOD_PLATE,
  foodCarrots: FOOD_CARROTS,

  // Patterns / déco
  indigoWall: PATTERN_INDIGO,
  indigoAnimals: PATTERN_INDIGO_ANIMALS,
  patternSurface: localKenteRopeBridge,
  patternHats: localKenteBridgeBeach,
  patternBlue: PATTERN_BLUE,

  // Expériences
  expHammam: 'https://images.unsplash.com/photo-1527760370098-806667fa3750?auto=format&fit=crop&w=1600&q=80',
  expHammamRoom: 'https://images.unsplash.com/photo-1730759214772-1d11f28fe0de?auto=format&fit=crop&w=1600&q=80',
  expHammamStone: 'https://images.unsplash.com/photo-1703778579034-c6e186654f97?auto=format&fit=crop&w=1600&q=80',
  expCookingTagine: 'https://images.unsplash.com/photo-1567596045677-50ea5cdf2ea7?auto=format&fit=crop&w=1600&q=80',
  expCookingClass: 'https://images.unsplash.com/photo-1729442045755-1f663f313684?auto=format&fit=crop&w=1600&q=80',
  expCookingMarket: 'https://images.unsplash.com/photo-1596578233012-a5a67564512a?auto=format&fit=crop&w=1600&q=80',
  expSafari: localSavannaSunsetTree,
  expSafariJeep: 'https://images.unsplash.com/photo-1599921778557-082147629542?auto=format&fit=crop&w=1600&q=80',
  expSafariElephant: localMangroveMonkey,
  expSurf: 'https://images.unsplash.com/photo-1737559514765-8d6d110df366?auto=format&fit=crop&w=1600&q=80',
  expSurfBoard: 'https://images.unsplash.com/photo-1737559514802-c9d76122ee11?auto=format&fit=crop&w=1600&q=80',
  expSurfWave: 'https://images.unsplash.com/photo-1706007472211-3b278915a492?auto=format&fit=crop&w=1600&q=80',
  expYogaGroup: YOGA_BEACH,
  expYogaCircle: YOGA_CIRCLE,
  expYogaSunrise: YOGA_SUNRISE,

  // Événements
  eventFestival: 'https://images.unsplash.com/photo-1776435303185-95be02310cff?auto=format&fit=crop&w=1600&q=80',

  // Communauté — portraits
  commWoman1: 'https://images.unsplash.com/photo-1745572587190-962fe038f073?auto=format&fit=crop&w=800&q=80',
  commWoman2: 'https://images.unsplash.com/photo-1770393391946-7d9b658deec3?auto=format&fit=crop&w=800&q=80',
  commWoman3: 'https://images.unsplash.com/photo-1745572587171-85fbb581bdb4?auto=format&fit=crop&w=800&q=80',
  commWoman4: 'https://images.unsplash.com/photo-1745572587597-dcf157492c48?auto=format&fit=crop&w=800&q=80',
  commMan1: 'https://images.unsplash.com/photo-1712047153411-7dee7fdbfbb8?auto=format&fit=crop&w=800&q=80',
  commMan2: 'https://images.unsplash.com/photo-1585619588455-97b48dbf6d77?auto=format&fit=crop&w=800&q=80',
  commMan3: 'https://images.unsplash.com/photo-1712047153649-f9a2f5de0902?auto=format&fit=crop&w=800&q=80',
  commMan4: 'https://images.unsplash.com/photo-1546523656-8ecf2e1af513?auto=format&fit=crop&w=800&q=80',
} as const;

export type AfricanImageKey = keyof typeof AFR;

export function uniqueImages(...keys: AfricanImageKey[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of keys) {
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(AFR[k]);
  }
  return out;
}
