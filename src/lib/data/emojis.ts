import type { Component } from 'svelte';
import {
  EmojiFaceSlightlySmiling,
  EmojiFaceSmilingHearts,
  EmojiFaceZany,
  EmojiFacePartying,
  EmojiFaceStarStruck,
  EmojiFaceSunglasses,
  EmojiFaceLOL,
  EmojiFaceHoldingBackTears,
  EmojiFaceInClouds,
  EmojiFaceUpsideDown,
  EmojiFaceGrimacing,
  EmojiFaceNeutral,
  EmojiFaceThinking,
  EmojiFaceRollingEyes,
  EmojiFaceRaisingEyebrow,
  EmojiFaceMelting,
  EmojiFaceUnamused,
  EmojiFaceCrying,
  EmojiFaceCryingLoudly,
  EmojiFaceBagsUnderEyes,
  EmojiFaceAngry,
  EmojiFaceSteamFromNose,
  EmojiFaceVomiting,
  EmojiFaceExplodingHead,
  EmojiBooks,
  EmojiHeadphones,
  EmojiPottedPlant,
  EmojiShoppingCart,
  EmojiBed,
  EmojiVideoGame,
  EmojiSuitcase,
  EmojiWomanLaptop,
  EmojiHotBeverage,
  EmojiCar,
  EmojiWomanRunning,
  EmojiWomenBunnyEars,
  EmojiTV,
  EmojiTram,
  EmojiSoccerBall,
  EmojiSchool,
  EmojiPlaygroundSlide,
  EmojiPalette,
  EmojiMoneyWings,
  EmojiHouse,
  EmojiCouch,
  EmojiBeach,
  EmojiBank,
  EmojiDiscoBall,
  EmojiWomanDancing,
  EmojiManSurfing,
  EmojiCamping,
  EmojiBeer,
  EmojiBathtub,
  EmojiSmartPhone,
  EmojiSlotMachine,
  EmojiBicycle,
  EmojiSun,
  EmojiSunBehindCloud,
  EmojiCloudRain,
  EmojiCloudLightning,
  EmojiSnowflake,
  EmojiRainbow,
  EmojiCyclone,
  EmojiTornado,
  EmojiPalmTree,
  EmojiFire,
  EmojiLeavesFluttering,
  EmojiCherryBlossom,
  EmojiUmbrellaRain,
  EmojiSeedling,
  EmojiMapleLeaf,
  EmojiHighVoltage,
  EmojiFaceCold,
  EmojiFaceSweating,
  EmojiCloudThunderstorm,
  EmojiAir,
  EmojiCloudSnow,
  EmojiVolcano,
  EmojiTulip,
  EmojiCloud,
  EmojiThermometer,
  EmojiTrophy,
  EmojiRobot,
  EmojiSkull,
  EmojiPoo,
  EmojiUnicorn,
  EmojiAlien,
  EmojiThoughtBalloon,
  EmojiOneHundredPoints,
  EmojiWarning,
  EmojiGift,
  EmojiDizzy,
  EmojiBullseye,
  EmojiBomb,
  EmojiBrain,
  EmojiAlarm,
  EmojiChequeredFlag,
  EmojiConstruction,
  EmojiCollision,
  EmojiCrystalBall,
  EmojiFourLeafClover,
  EmojiGemStone,
  EmojiGhost,
  EmojiHeartOnFire,
  EmojiHeadstone,
  EmojiMagnifyingGlass,
  EmojiMegaphone,
  EmojiRocket,
  EmojiToiletPaper,
  EmojiTrash,
  EmojiMirror,
  EmojiLightBulb,
  EmojiLifeBuoy,
  EmojiCrown,
  EmojiBalloon
} from '$lib/components/emojis';

export interface EmojiItem {
  id: string;
  component: Component;
  label: string;
}

export interface EmojiCategory {
  name: string;
  emojis: EmojiItem[];
}

export const emojiCategories: EmojiCategory[] = [
  {
    name: 'Humör & Känslor',
    emojis: [
      {
        id: 'face-slightly-smiling',
        component: EmojiFaceSlightlySmiling,
        label: 'försiktigt glad, nöjd'
      },
      {
        id: 'face-smiling-hearts',
        component: EmojiFaceSmilingHearts,
        label: 'kärlek, värme, omtanke'
      },
      { id: 'face-zany', component: EmojiFaceZany, label: 'galen, knäpp, tokig' },
      { id: 'face-partying', component: EmojiFacePartying, label: 'fest, firande, party' },
      { id: 'face-star-struck', component: EmojiFaceStarStruck, label: 'imponerad, beundran' },
      { id: 'face-sunglasses', component: EmojiFaceSunglasses, label: 'cool, självsäker' },
      { id: 'face-lol', component: EmojiFaceLOL, label: 'skrattar, rolig, haha' },
      {
        id: 'face-holding-back-tears',
        component: EmojiFaceHoldingBackTears,
        label: 'håller tillbaka tårar, rörd, försöker att inte gråta'
      },
      {
        id: 'face-in-clouds',
        component: EmojiFaceInClouds,
        label: 'i dimma, frånvarande, dagdrömmer, borta i tankar'
      },
      { id: 'face-upside-down', component: EmojiFaceUpsideDown, label: 'ironisk, upp-och-ned' },
      { id: 'face-grimacing', component: EmojiFaceGrimacing, label: 'pinsamt, stel, obekväm' },
      { id: 'face-neutral', component: EmojiFaceNeutral, label: 'neutral, likgiltig' },
      { id: 'face-thinking', component: EmojiFaceThinking, label: 'tänker, funderar' },
      {
        id: 'face-rolling-eyes',
        component: EmojiFaceRollingEyes,
        label: 'ögonrullning, irritation'
      },
      {
        id: 'face-raising-eyebrow',
        component: EmojiFaceRaisingEyebrow,
        label: 'skeptisk, höjer ögonbryn, ifrågasätter'
      },
      { id: 'face-melting', component: EmojiFaceMelting, label: 'överväldigad, smälter, slut' },
      { id: 'face-unamused', component: EmojiFaceUnamused, label: 'ointresserad, missnöjd' },
      { id: 'face-crying', component: EmojiFaceCrying, label: 'ledsen, gråter, sorg' },
      {
        id: 'face-crying-loudly',
        component: EmojiFaceCryingLoudly,
        label: 'förtvivlad, hysterisk, stor sorg'
      },
      {
        id: 'face-bags-under-eyes',
        component: EmojiFaceBagsUnderEyes,
        label: 'trött, sömnbrist, utmattad'
      },
      { id: 'face-angry', component: EmojiFaceAngry, label: 'arg, ilska, irritation, raseri' },
      { id: 'face-steam-from-nose', component: EmojiFaceSteamFromNose, label: 'frustrerad, arg' },
      { id: 'face-vomiting', component: EmojiFaceVomiting, label: 'spyr, illamående' },
      {
        id: 'face-exploding-head',
        component: EmojiFaceExplodingHead,
        label: 'mind blown, överväldigad, chock'
      }
    ]
  },
  {
    name: 'Aktiviteter & Prylar',
    emojis: [
      { id: 'books', component: EmojiBooks, label: 'böcker, läsa, studier, kunskap' },
      { id: 'headphones', component: EmojiHeadphones, label: 'hörlurar, musik, lyssna' },
      {
        id: 'potted-plant',
        component: EmojiPottedPlant,
        label: 'krukväxt, växt, natur, inredning'
      },
      { id: 'shopping-cart', component: EmojiShoppingCart, label: 'handla, shopping, butik' },
      { id: 'bed', component: EmojiBed, label: 'säng, sömn, vila' },
      {
        id: 'video-game-controller',
        component: EmojiVideoGame,
        label: 'tv-spel, gaming, spela'
      },
      { id: 'suitcase', component: EmojiSuitcase, label: 'resväska, resa, packa' },
      {
        id: 'laptop-woman',
        component: EmojiWomanLaptop,
        label: 'arbete, dator, studier, teknik'
      },
      {
        id: 'hot-beverage',
        component: EmojiHotBeverage,
        label: 'kaffe, te, fika, varm dryck'
      },
      { id: 'couch', component: EmojiCouch, label: 'soffa, vila, mys, hemma' },
      { id: 'car', component: EmojiCar, label: 'bil, köra, resa, transport' },
      {
        id: 'woman-running',
        component: EmojiWomanRunning,
        label: 'löpning, träning, motion'
      },
      {
        id: 'women-bunny-ears',
        component: EmojiWomenBunnyEars,
        label: 'fest, vänner, uteliv'
      },
      { id: 'tv', component: EmojiTV, label: 'tv, titta, underhållning' },
      { id: 'tram', component: EmojiTram, label: 'spårvagn, kollektivtrafik, stad' },
      { id: 'soccer-ball', component: EmojiSoccerBall, label: 'fotboll, sport, match' },
      { id: 'school', component: EmojiSchool, label: 'skola, utbildning, studier' },
      {
        id: 'playground-slide',
        component: EmojiPlaygroundSlide,
        label: 'lekplats, barn, lek'
      },
      {
        id: 'palette',
        component: EmojiPalette,
        label: 'design, färg, kreativitet'
      },
      {
        id: 'money-wings',
        component: EmojiMoneyWings,
        label: 'pengar, utgifter, ekonomi'
      },
      { id: 'house', component: EmojiHouse, label: 'hem, boende, vardag' },
      { id: 'beach', component: EmojiBeach, label: 'strand, sommar, semester' },
      { id: 'bank', component: EmojiBank, label: 'bank, ekonomi, pengar' },
      {
        id: 'disco-ball',
        component: EmojiDiscoBall,
        label: 'dans, fest, nattliv'
      },
      {
        id: 'woman-dancing',
        component: EmojiWomanDancing,
        label: 'dans, glädje, fest'
      },
      {
        id: 'man-surfing',
        component: EmojiManSurfing,
        label: 'surfing, hav, sport'
      },
      {
        id: 'camping',
        component: EmojiCamping,
        label: 'camping, friluftsliv, natur'
      },
      { id: 'beer', component: EmojiBeer, label: 'öl, bar, umgänge' },
      { id: 'bathtub', component: EmojiBathtub, label: 'bada, badkar, avkoppling' },
      {
        id: 'smartphone',
        component: EmojiSmartPhone,
        label: 'mobil, telefon, teknik'
      },
      {
        id: 'slot-machine',
        component: EmojiSlotMachine,
        label: 'spel, casino, chans'
      },
      { id: 'bicycle', component: EmojiBicycle, label: 'cykel, motion, transport' }
    ]
  },
  {
    name: 'Väder & Natur',
    emojis: [
      { id: 'sun', component: EmojiSun, label: 'sol, solsken, värme' },
      {
        id: 'sun-behind-cloud',
        component: EmojiSunBehindCloud,
        label: 'växlande molnighet, halvklart'
      },
      { id: 'cloud', component: EmojiCloud, label: 'molnigt, grått väder' },
      { id: 'cloud-rain', component: EmojiCloudRain, label: 'regn, nederbörd, regnmoln' },
      {
        id: 'cloud-lightning',
        component: EmojiCloudLightning,
        label: 'åska, blixt, oväder'
      },
      {
        id: 'cloud-thunderstorm',
        component: EmojiCloudThunderstorm,
        label: 'kraftigt oväder, storm, åska'
      },
      { id: 'cloud-snow', component: EmojiCloudSnow, label: 'snöfall, vinter, snö' },
      { id: 'snowflake', component: EmojiSnowflake, label: 'kyla, snö, vinter' },
      { id: 'rainbow', component: EmojiRainbow, label: 'regnbåge, hopp, ljusning' },
      { id: 'cyclone', component: EmojiCyclone, label: 'storm, hårt väder' },
      { id: 'tornado', component: EmojiTornado, label: 'tornado, extremväder' },
      { id: 'high-voltage', component: EmojiHighVoltage, label: 'blixt, elektricitet, laddat' },
      {
        id: 'wind-leaves',
        component: EmojiLeavesFluttering,
        label: 'vind, blåst, höstluft'
      },
      { id: 'umbrella-rain', component: EmojiUmbrellaRain, label: 'regn, paraply, rusk' },
      { id: 'air', component: EmojiAir, label: 'luft, vind, frisk bris' },
      { id: 'fire', component: EmojiFire, label: 'hetta, värme, intensivt' },
      { id: 'face-hot', component: EmojiFaceSweating, label: 'varmt, svettigt, hetta' },
      { id: 'face-cold', component: EmojiFaceCold, label: 'kallt, fryser, kyla' },
      {
        id: 'thermometer',
        component: EmojiThermometer,
        label: 'temperatur, varmt eller kallt'
      },
      { id: 'seedling', component: EmojiSeedling, label: 'tillväxt, nytt, grönska' },
      {
        id: 'cherry-blossom',
        component: EmojiCherryBlossom,
        label: 'vår, blomning, lätthet'
      },
      { id: 'tulip', component: EmojiTulip, label: 'blomma, vår, natur' },
      { id: 'maple-leaf', component: EmojiMapleLeaf, label: 'höst, löv, natur' },
      { id: 'palm-tree', component: EmojiPalmTree, label: 'semester, tropiskt, värme' },
      { id: 'volcano', component: EmojiVolcano, label: 'utbrott, tryck, intensitet' }
    ]
  },
  {
    name: 'Övriga Symboler',
    emojis: [
      { id: 'trophy', component: EmojiTrophy, label: 'trofé, vinst, prestation' },
      { id: 'robot', component: EmojiRobot, label: 'robot, teknik, automatiskt, mekaniskt' },
      { id: 'skull', component: EmojiSkull, label: 'dödskalle, fara, mörkt' },
      { id: 'poo', component: EmojiPoo, label: 'skit, kaos, humor, katastrof' },
      { id: 'unicorn', component: EmojiUnicorn, label: 'enhörning, magi, fantasi' },
      { id: 'alien', component: EmojiAlien, label: 'alien, utanförskap, konstigt' },
      {
        id: 'thought-balloon',
        component: EmojiThoughtBalloon,
        label: 'tanke, grubbel, inre dialog'
      },
      {
        id: 'hundred-points',
        component: EmojiOneHundredPoints,
        label: 'hundra poäng, perfekt, full pott'
      },
      { id: 'warning', component: EmojiWarning, label: 'varning, risk, uppmärksamhet' },
      { id: 'gift', component: EmojiGift, label: 'present, överraskning, något fint' },
      { id: 'dizzy', component: EmojiDizzy, label: 'yr, snurrig, förvirrad' },
      { id: 'bullseye', component: EmojiBullseye, label: 'träffsäkerhet, mål, fokus' },
      { id: 'bomb', component: EmojiBomb, label: 'explosion, kaos, briserade känslor' },
      { id: 'brain', component: EmojiBrain, label: 'hjärna, tankar, mental belastning' },
      { id: 'alarm', component: EmojiAlarm, label: 'alarm, varning, tid, stress' },
      {
        id: 'chequered-flag',
        component: EmojiChequeredFlag,
        label: 'mållinje, klart, avslut'
      },
      {
        id: 'construction',
        component: EmojiConstruction,
        label: 'pågående, arbete, under uppbyggnad'
      },
      { id: 'collision', component: EmojiCollision, label: 'krock, konflikt, smäll' },
      {
        id: 'crystal-ball',
        component: EmojiCrystalBall,
        label: 'framtid, osäkerhet, spådom'
      },
      {
        id: 'four-leaf-clover',
        component: EmojiFourLeafClover,
        label: 'tur, lycka, medvind'
      },
      { id: 'gem-stone', component: EmojiGemStone, label: 'värdefullt, skatt, något viktigt' },
      { id: 'ghost', component: EmojiGhost, label: 'spöke, oro, något som hänger kvar' },
      {
        id: 'heart-on-fire',
        component: EmojiHeartOnFire,
        label: 'passion, intensitet, starka känslor'
      },
      {
        id: 'headstone',
        component: EmojiHeadstone,
        label: 'slut, förlust, något som är över'
      },
      {
        id: 'magnifying-glass',
        component: EmojiMagnifyingGlass,
        label: 'granska, analysera, leta'
      },
      { id: 'megaphone', component: EmojiMegaphone, label: 'uttrycka sig, ropa, höras' },
      { id: 'rocket', component: EmojiRocket, label: 'start, framåt, acceleration' },
      {
        id: 'toilet-paper',
        component: EmojiToiletPaper,
        label: 'vardag, krisberedskap, lågpunkt'
      },
      { id: 'trash', component: EmojiTrash, label: 'släppa taget, kasta bort' },
      { id: 'mirror', component: EmojiMirror, label: 'självbild, reflektion' },
      { id: 'light-bulb', component: EmojiLightBulb, label: 'idé, insikt, aha-ögonblick' },
      { id: 'life-buoy', component: EmojiLifeBuoy, label: 'hjälp, stöd, räddning' },
      { id: 'crown', component: EmojiCrown, label: 'självvärde, makt, stolthet' },
      { id: 'balloon', component: EmojiBalloon, label: 'lätthet, glädje, något som lyfter' }
    ]
  }
];

// Build maps for quick emoji lookup by id
export const emojiMap = new Map<string, Component>();
export const emojiLabelMap = new Map<string, string>();
emojiCategories.forEach((category) => {
  category.emojis.forEach((emoji) => {
    emojiMap.set(emoji.id, emoji.component);
    emojiLabelMap.set(emoji.id, emoji.label);
  });
});

// Helper function to get a random selection of emojis from a category
export function getRandomEmojis(emojis: EmojiItem[], count: number): EmojiItem[] {
  const shuffled = [...emojis].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, emojis.length));
}
