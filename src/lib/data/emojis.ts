import type { Component } from 'svelte';
import {
  EmojiFeelingAngry,
  EmojiFeelingConfused,
  EmojiFeelingCrossedOutEyes,
  EmojiFeelingCrying,
  EmojiFeelingCryingLoudly,
  EmojiFeelingExplodingHead,
  EmojiFeelingGrimacing,
  EmojiFeelingGrinningSweat,
  EmojiFeelingMelting,
  EmojiFeelingMonocle,
  EmojiFeelingNeutral,
  EmojiFeelingPartying,
  EmojiFeelingPleading,
  EmojiFeelingRollingEyes,
  EmojiFeelingSmilingHearts,
  EmojiFeelingSmilingSunglasses,
  EmojiFeelingSmirking,
  EmojiFeelingStarStruck,
  EmojiFeelingSteamFromNose,
  EmojiFeelingUpsideDown,
  EmojiFeelingVomiting,
  EmojiFeelingWoozy,
  EmojiFeelingYawning,
  EmojiFeelingZany,
  EmojiActivityAbacus,
  EmojiActivityBathtub,
  EmojiActivityBeach,
  EmojiActivityBed,
  EmojiActivityBooks,
  EmojiActivityBrain,
  EmojiActivityBriefcase,
  EmojiActivityCar,
  EmojiActivityCircus,
  EmojiActivityDancer,
  EmojiActivityDiscoBall,
  EmojiActivityFerrisWheel,
  EmojiActivityFriends,
  EmojiActivityHeadphones,
  EmojiActivityHotBeverage,
  EmojiActivityHouse,
  EmojiActivityLuggage,
  EmojiActivityMeditating,
  EmojiActivityMemo,
  EmojiActivityNailPolish,
  EmojiActivityPalette,
  EmojiActivityPartyPopper,
  EmojiActivityPhone,
  EmojiActivityPlaygroundSlide,
  EmojiActivityPottedPlant,
  EmojiActivityRunning,
  EmojiActivitySchool,
  EmojiActivityScooter,
  EmojiActivityShoppingCart,
  EmojiActivitySlotMachine,
  EmojiActivitySoccerBall,
  EmojiActivityTechnologist,
  EmojiActivityTeddyBear,
  EmojiActivityTelephone,
  EmojiActivityTelevision,
  EmojiActivityTramCar,
  EmojiActivityVideoGame,
  EmojiWeatherCherryBlossom,
  EmojiWeatherCloud,
  EmojiWeatherCyclone,
  EmojiWeatherFire,
  EmojiWeatherHighVoltage,
  EmojiWeatherLeafFluttering,
  EmojiWeatherRainbow,
  EmojiWeatherSnowflake,
  EmojiWeatherSun,
  EmojiWeatherSunBehindCloud,
  EmojiWeatherTornado,
  EmojiWeatherUmbrellaRain,
  EmojiOtherAlien,
  EmojiOtherBomb,
  EmojiOtherBullseye,
  EmojiOtherChequeredFlag,
  EmojiOtherCollision,
  EmojiOtherConstruction,
  EmojiOtherCrown,
  EmojiOtherGemStone,
  EmojiOtherGhost,
  EmojiOtherGift,
  EmojiOtherHandMiddleFinger,
  EmojiOtherHandOk,
  EmojiOtherHeartOnFire,
  EmojiOtherLifeBuoy,
  EmojiOtherLightBulb,
  EmojiOtherLoudspeaker,
  EmojiOtherMoneyBag,
  EmojiOtherPoo,
  EmojiOtherPool8Ball,
  EmojiOtherRibbon,
  EmojiOtherRobot,
  EmojiOtherRocket,
  EmojiOtherRollerCoaster,
  EmojiOtherRollOfPaper,
  EmojiOtherScale,
  EmojiOtherSkull,
  EmojiOtherSpeechBalloon,
  EmojiOtherStar,
  EmojiOtherTrafficLight,
  EmojiOtherTrash,
  EmojiOtherTrophy,
  EmojiOtherTulip,
  EmojiOtherUnicorn,
  EmojiOtherVolcano,
  EmojiOtherWarning,
  EmojiOtherZombie
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
      { id: 'feeling-angry', component: EmojiFeelingAngry, label: 'arg, irriterad' },
      { id: 'feeling-confused', component: EmojiFeelingConfused, label: 'förvirrad, häpen' },
      {
        id: 'feeling-knocked-out',
        component: EmojiFeelingCrossedOutEyes,
        label: 'helt slut, knockad'
      },
      { id: 'feeling-crying', component: EmojiFeelingCrying, label: 'gråter, ledsen' },
      {
        id: 'feeling-crying-loudly',
        component: EmojiFeelingCryingLoudly,
        label: 'jätteledsen, förtvivlad, gråter mycket'
      },
      {
        id: 'feeling-mind-blown',
        component: EmojiFeelingExplodingHead,
        label: 'mind blown, chockad, överväldigad'
      },
      { id: 'feeling-awkward', component: EmojiFeelingGrimacing, label: 'pinsamt, obekväm' },
      {
        id: 'feeling-relieved',
        component: EmojiFeelingGrinningSweat,
        label: 'nervöst leende, lättad'
      },
      {
        id: 'feeling-grateful',
        component: EmojiFeelingPleading,
        label: 'tacksam, gråtmild'
      },
      { id: 'feeling-meltdown', component: EmojiFeelingMelting, label: 'härdsmälta, sammanbrott' },
      { id: 'feeling-skeptical', component: EmojiFeelingMonocle, label: 'granskar, skeptisk' },
      {
        id: 'feeling-neutral',
        component: EmojiFeelingNeutral,
        label: 'neutral, okej, varken eller'
      },
      { id: 'feeling-party', component: EmojiFeelingPartying, label: 'firar, feststämning, party' },
      {
        id: 'feeling-rolling-eyes',
        component: EmojiFeelingRollingEyes,
        label: 'himlar med ögonen, uppgiven'
      },
      {
        id: 'feeling-smiling-hearts',
        component: EmojiFeelingSmilingHearts,
        label: 'lycklig, kärleksfull'
      },
      {
        id: 'feeling-cool',
        component: EmojiFeelingSmilingSunglasses,
        label: 'cool, självsäker, nöjd'
      },
      {
        id: 'feeling-smirking',
        component: EmojiFeelingSmirking,
        label: 'flin, hånfull, självsäker'
      },
      {
        id: 'feeling-star-struck',
        component: EmojiFeelingStarStruck,
        label: 'imponerad, stjärnögd'
      },
      { id: 'feeling-frustrated', component: EmojiFeelingSteamFromNose, label: 'arg, frustrerad' },
      {
        id: 'feeling-upside-down',
        component: EmojiFeelingUpsideDown,
        label: 'något förvirrad, tveksam'
      },
      { id: 'feeling-sick', component: EmojiFeelingVomiting, label: 'illamående, äcklad' },
      { id: 'feeling-woozy', component: EmojiFeelingWoozy, label: 'snurrig, yr, berusad' },
      { id: 'feeling-yawning', component: EmojiFeelingYawning, label: 'gäspar, uttråkad, trött' },
      { id: 'feeling-zany', component: EmojiFeelingZany, label: 'galen, knäpp, tokig' }
    ]
  },
  {
    name: 'Aktiviteter & Prylar',
    emojis: [
      { id: 'activity-abacus', component: EmojiActivityAbacus, label: 'räknar, matte' },
      {
        id: 'activity-bathtub',
        component: EmojiActivityBathtub,
        label: 'badar, tvättar sig, badkar'
      },
      { id: 'activity-beach', component: EmojiActivityBeach, label: 'strand, semester' },
      { id: 'activity-bed', component: EmojiActivityBed, label: 'säng, sova, sömn' },
      { id: 'activity-books', component: EmojiActivityBooks, label: 'böcker, läsa' },
      { id: 'activity-brain', component: EmojiActivityBrain, label: 'tänka, hjärna' },
      {
        id: 'activity-briefcase',
        component: EmojiActivityBriefcase,
        label: 'arbete, jobb, portfölj'
      },
      { id: 'activity-car', component: EmojiActivityCar, label: 'bil, resa' },
      { id: 'activity-circus', component: EmojiActivityCircus, label: 'cirkus' },
      { id: 'activity-dancer', component: EmojiActivityDancer, label: 'dansa' },
      { id: 'activity-disco', component: EmojiActivityDiscoBall, label: 'dansa, disco' },
      {
        id: 'activity-ferris-wheel',
        component: EmojiActivityFerrisWheel,
        label: 'tivoli, pariserhjul'
      },
      {
        id: 'activity-friends',
        component: EmojiActivityFriends,
        label: 'vänner, kompisar, vänskap'
      },
      {
        id: 'activity-headphones',
        component: EmojiActivityHeadphones,
        label: 'hörlurar, musik, soundtrack'
      },
      {
        id: 'activity-hot-beverage',
        component: EmojiActivityHotBeverage,
        label: 'varm dryck, kaffe, te'
      },
      { id: 'activity-house', component: EmojiActivityHouse, label: 'hem, hus' },
      {
        id: 'activity-luggage',
        component: EmojiActivityLuggage,
        label: 'bagage, väska, packning, resa'
      },
      {
        id: 'activity-meditating',
        component: EmojiActivityMeditating,
        label: 'meditera, yoga, mindfulness'
      },
      { id: 'activity-memo', component: EmojiActivityMemo, label: 'pm, anteckning, notering' },
      {
        id: 'activity-nail-polish',
        component: EmojiActivityNailPolish,
        label: 'nagellack, skönhet'
      },
      { id: 'activity-palette', component: EmojiActivityPalette, label: 'palett, konst, måla' },
      {
        id: 'activity-party-popper',
        component: EmojiActivityPartyPopper,
        label: 'konfetti, fest, party, kalas'
      },
      { id: 'activity-phone', component: EmojiActivityPhone, label: 'telefon, mobil' },
      {
        id: 'activity-playground-slide',
        component: EmojiActivityPlaygroundSlide,
        label: 'lek, rutchkana, lekplats'
      },
      {
        id: 'activity-potted-plant',
        component: EmojiActivityPottedPlant,
        label: 'krukväxter, växter, plantering, odling'
      },
      {
        id: 'activity-running',
        component: EmojiActivityRunning,
        label: 'löpning, träning, springa'
      },
      {
        id: 'activity-school',
        component: EmojiActivitySchool,
        label: 'skola, utbildning, studera'
      },
      { id: 'activity-scooter', component: EmojiActivityScooter, label: 'elsparkcykel, skoter' },
      {
        id: 'activity-shopping-cart',
        component: EmojiActivityShoppingCart,
        label: 'shoppa, handla'
      },
      {
        id: 'activity-slot-machine',
        component: EmojiActivitySlotMachine,
        label: 'spela, enarmad bandit, casino'
      },
      { id: 'activity-soccer-ball', component: EmojiActivitySoccerBall, label: 'fotboll, sport' },
      {
        id: 'activity-technologist',
        component: EmojiActivityTechnologist,
        label: 'teknologi, teknik'
      },
      { id: 'activity-teddy-bear', component: EmojiActivityTeddyBear, label: 'nallebjörn, leka' },
      {
        id: 'activity-telephone',
        component: EmojiActivityTelephone,
        label: 'telefon, telefonsamtal'
      },
      { id: 'activity-television', component: EmojiActivityTelevision, label: 'tv, film, serier' },
      { id: 'activity-tram', component: EmojiActivityTramCar, label: 'spårvagn, pendla, resa' },
      { id: 'activity-video-game', component: EmojiActivityVideoGame, label: 'tv-spel, spel' }
    ]
  },
  {
    name: 'Väder & Natur',
    emojis: [
      { id: 'weather-cherry-blossom', component: EmojiWeatherCherryBlossom, label: 'vår, blommor' },
      { id: 'weather-cloud', component: EmojiWeatherCloud, label: 'moln, mulet' },
      { id: 'weather-cyclone', component: EmojiWeatherCyclone, label: 'cyklon, storm, oväder' },
      { id: 'weather-fire', component: EmojiWeatherFire, label: 'eld, värme, hetta' },
      {
        id: 'weather-high-voltage',
        component: EmojiWeatherHighVoltage,
        label: 'blixt, åska, oväder'
      },
      {
        id: 'weather-leaf-fluttering',
        component: EmojiWeatherLeafFluttering,
        label: 'löv, höst, vind'
      },
      { id: 'weather-rainbow', component: EmojiWeatherRainbow, label: 'regnbåge, färgglad' },
      {
        id: 'weather-snowflake',
        component: EmojiWeatherSnowflake,
        label: 'snö, snöflinga, kyla, vinter'
      },
      { id: 'weather-sun', component: EmojiWeatherSun, label: 'sol, sommar, värme' },
      {
        id: 'weather-sun-behind-cloud',
        component: EmojiWeatherSunBehindCloud,
        label: 'halvklart, sol, moln'
      },
      {
        id: 'weather-tornado',
        component: EmojiWeatherTornado,
        label: 'storm, blåst, oväder, orkan'
      },
      { id: 'weather-umbrella-rain', component: EmojiWeatherUmbrellaRain, label: 'regn, paraply' }
    ]
  },
  {
    name: 'Övriga Symboler',
    emojis: [
      { id: 'other-alien', component: EmojiOtherAlien, label: 'alien, utomjording, märkligt' },
      { id: 'other-bomb', component: EmojiOtherBomb, label: 'bomb, explosion, kaos' },
      { id: 'other-bullseye', component: EmojiOtherBullseye, label: 'träff, mål, precision' },
      {
        id: 'other-chequered-flag',
        component: EmojiOtherChequeredFlag,
        label: 'mållinje, klart, avslut'
      },
      {
        id: 'other-collision',
        component: EmojiOtherCollision,
        label: 'krock, olycka, sammanstötning'
      },
      { id: 'other-construction', component: EmojiOtherConstruction, label: 'arbete, bygg, pågår' },
      { id: 'other-crown', component: EmojiOtherCrown, label: 'kunglig, seger, bäst' },
      { id: 'other-ghost', component: EmojiOtherGhost, label: 'spöke, hemsökt' },
      {
        id: 'other-gem-stone',
        component: EmojiOtherGemStone,
        label: 'ädelsten, värdefullt, skatt'
      },
      { id: 'other-gift', component: EmojiOtherGift, label: 'present, gåva, överraskning' },
      {
        id: 'other-hand-middle-finger',
        component: EmojiOtherHandMiddleFinger,
        label: 'fuck you, ilska, protest'
      },
      { id: 'other-hand-ok', component: EmojiOtherHandOk, label: 'okej, bra, godkänt' },
      {
        id: 'other-heart-on-fire',
        component: EmojiOtherHeartOnFire,
        label: 'passion, intensiv kärlek, stark känsla'
      },
      { id: 'other-life-buoy', component: EmojiOtherLifeBuoy, label: 'hjälp, räddning, stöd' },
      { id: 'other-light-bulb', component: EmojiOtherLightBulb, label: 'idé, insikt, aha' },
      {
        id: 'other-loudspeaker',
        component: EmojiOtherLoudspeaker,
        label: 'meddelande, utrop, ljud'
      },
      { id: 'other-money-bag', component: EmojiOtherMoneyBag, label: 'pengar, ekonomi, rikedom' },
      { id: 'other-poo', component: EmojiOtherPoo, label: 'bajs, kaos, skitdag' },
      { id: 'other-pool-8-ball', component: EmojiOtherPool8Ball, label: 'biljard, slump, öde' },
      { id: 'other-ribbon', component: EmojiOtherRibbon, label: 'rosett, dekoration, pris' },
      { id: 'other-robot', component: EmojiOtherRobot, label: 'robot, automatiskt, maskinellt' },
      { id: 'other-rocket', component: EmojiOtherRocket, label: 'raket, start, fart' },
      {
        id: 'other-roll-of-paper',
        component: EmojiOtherRollOfPaper,
        label: 'toalettpapper, papper, slut'
      },
      {
        id: 'other-roller-coaster',
        component: EmojiOtherRollerCoaster,
        label: 'berg-och-dalbana, tivoli, nöjespark'
      },
      { id: 'other-scale', component: EmojiOtherScale, label: 'balans, rättvisa, väga' },
      { id: 'other-skull', component: EmojiOtherSkull, label: 'död, fara, mörkt' },
      { id: 'other-sparkles', component: EmojiOtherStar, label: 'stjärna, glitter' },
      {
        id: 'other-speech-balloon',
        component: EmojiOtherSpeechBalloon,
        label: 'prata, säga, kommunikation'
      },
      {
        id: 'other-star-glowing',
        component: EmojiOtherTulip,
        label: 'blomma, tulpan'
      },
      { id: 'other-traffic-light', component: EmojiOtherTrafficLight, label: 'stopp, kör, vänta' },
      { id: 'other-trash', component: EmojiOtherTrash, label: 'skräp, slänga, rensa' },
      { id: 'other-trophy', component: EmojiOtherTrophy, label: 'vinst, prestation, belöning' },
      { id: 'other-unicorn', component: EmojiOtherUnicorn, label: 'enhörning, fantasi, unikt' },
      { id: 'other-volcano', component: EmojiOtherVolcano, label: 'utbrott, ilska, kraft' },
      { id: 'other-warning', component: EmojiOtherWarning, label: 'varning, fara, se upp' },
      { id: 'other-zombie', component: EmojiOtherZombie, label: 'hjärndöd, trött, zombie-läge' }
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
