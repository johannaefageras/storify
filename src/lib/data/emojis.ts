import ActivityBeerMugs from '$lib/assets/emojis/activity-beer-mugs.svg?url';
import ActivityBooks from '$lib/assets/emojis/activity-books.svg?url';
import ActivityBrain from '$lib/assets/emojis/activity-brain.svg?url';
import ActivityCoffee from '$lib/assets/emojis/activity-coffee.svg?url';
import ActivityDice from '$lib/assets/emojis/activity-dice.svg?url';
import ActivityHeadphones from '$lib/assets/emojis/activity-headphones.svg?url';
import ActivityHousePlant from '$lib/assets/emojis/activity-house-plant.svg?url';
import ActivityLaptop from '$lib/assets/emojis/activity-laptop.svg?url';
import ActivityMemo from '$lib/assets/emojis/activity-memo.svg?url';
import ActivityPalette from '$lib/assets/emojis/activity-palette.svg?url';
import ActivityShoppingCart from '$lib/assets/emojis/activity-shopping-cart.svg?url';
import ActivitySoccerBall from '$lib/assets/emojis/activity-soccer-ball.svg?url';

import FeelingExplodingHead from '$lib/assets/emojis/feeling-exploding-head.svg?url';
import FeelingHoldingBackTears from '$lib/assets/emojis/feeling-holding-back-tears.svg?url';
import FeelingMelting from '$lib/assets/emojis/feeling-melting.svg?url';
import FeelingMonocle from '$lib/assets/emojis/feeling-monocle.svg?url';
import FeelingRollingEyes from '$lib/assets/emojis/feeling-rolling-eyes.svg?url';
import FeelingSmirking from '$lib/assets/emojis/feeling-smirking.svg?url';
import FeelingStarStruck from '$lib/assets/emojis/feeling-star-struck.svg?url';
import FeelingThinking from '$lib/assets/emojis/feeling-thinking.svg?url';
import FeelingUnamused from '$lib/assets/emojis/feeling-unamused.svg?url';
import FeelingUpsideDown from '$lib/assets/emojis/feeling-upside-down.svg?url';
import FeelingWeary from '$lib/assets/emojis/feeling-weary.svg?url';
import FeelingZany from '$lib/assets/emojis/feeling-zany.svg?url';

import GestureBiceps from '$lib/assets/emojis/gesture-biceps.svg?url';
import GestureClappingHands from '$lib/assets/emojis/gesture-clapping-hands.svg?url';
import GestureFuckYou from '$lib/assets/emojis/gesture-fuck-you.svg?url';
import GestureHandsFolded from '$lib/assets/emojis/gesture-hands-folded.svg?url';
import GestureHandshake from '$lib/assets/emojis/gesture-handshake.svg?url';
import GestureIndexPointingUp from '$lib/assets/emojis/gesture-index-pointing-up.svg?url';
import GestureOk from '$lib/assets/emojis/gesture-ok.svg?url';
import GesturePinchedFingers from '$lib/assets/emojis/gesture-pinched-fingers.svg?url';
import GestureSignOfTheHorns from '$lib/assets/emojis/gesture-sign-of-the-horns.svg?url';
import GestureThumbsDown from '$lib/assets/emojis/gesture-thumbs-down.svg?url';
import GestureThumbsUp from '$lib/assets/emojis/gesture-thumbs-up.svg?url';
import GestureVictory from '$lib/assets/emojis/gesture-victory.svg?url';

import LocationBeach from '$lib/assets/emojis/location-beach.svg?url';
import LocationCar from '$lib/assets/emojis/location-car.svg?url';
import LocationCityscape from '$lib/assets/emojis/location-cityscape.svg?url';
import LocationHighway from '$lib/assets/emojis/location-highway.svg?url';
import LocationHospital from '$lib/assets/emojis/location-hospital.svg?url';
import LocationHouse from '$lib/assets/emojis/location-house.svg?url';
import LocationNationalPark from '$lib/assets/emojis/location-national-park.svg?url';
import LocationOcean from '$lib/assets/emojis/location-ocean.svg?url';
import LocationOffice from '$lib/assets/emojis/location-office.svg?url';
import LocationSchool from '$lib/assets/emojis/location-school.svg?url';
import LocationTram from '$lib/assets/emojis/location-tram.svg?url';
import LocationTree from '$lib/assets/emojis/location-tree.svg?url';

import SymbolBomb from '$lib/assets/emojis/symbol-bomb.svg?url';
import SymbolBrokenHeart from '$lib/assets/emojis/symbol-broken-heart.svg?url';
import SymbolBullseye from '$lib/assets/emojis/symbol-bullseye.svg?url';
import SymbolLifeBuoy from '$lib/assets/emojis/symbol-life-buoy.svg?url';
import SymbolPileOfPoo from '$lib/assets/emojis/symbol-pile-of-poo.svg?url';
import SymbolRainbow from '$lib/assets/emojis/symbol-rainbow.svg?url';
import SymbolRocket from '$lib/assets/emojis/symbol-rocket.svg?url';
import SymbolSkull from '$lib/assets/emojis/symbol-skull.svg?url';
import SymbolToiletPaper from '$lib/assets/emojis/symbol-toilet-paper.svg?url';
import SymbolTrophy from '$lib/assets/emojis/symbol-trophy.svg?url';
import SymbolUnicorn from '$lib/assets/emojis/symbol-unicorn.svg?url';
import SymbolVolcano from '$lib/assets/emojis/symbol-volcano.svg?url';

export interface EmojiItem {
  id: string;
  src: string;
  label: string;
}

export interface EmojiCategory {
  name: string;
  emojis: EmojiItem[];
}

export const emojiCategories: EmojiCategory[] = [
  {
    name: 'Aktiviteter',
    emojis: [
      {
        id: 'activity-beer-mugs',
        src: ActivityBeerMugs,
        label: 'ölsejdlar, öl, fest, skål, dryck'
      },
      { id: 'activity-books', src: ActivityBooks, label: 'böcker, läsa, studier, kunskap' },
      { id: 'activity-brain', src: ActivityBrain, label: 'hjärna, tänka, smart, idé' },
      { id: 'activity-coffee', src: ActivityCoffee, label: 'kaffe, fika, varm dryck, paus' },
      { id: 'activity-dice', src: ActivityDice, label: 'tärning, spel, slump, chans' },
      {
        id: 'activity-headphones',
        src: ActivityHeadphones,
        label: 'hörlurar, musik, ljud, lyssna'
      },
      {
        id: 'activity-house-plant',
        src: ActivityHousePlant,
        label: 'krukväxt, växt, inredning, natur'
      },
      { id: 'activity-laptop', src: ActivityLaptop, label: 'laptop, dator, arbete, teknik' },
      { id: 'activity-memo', src: ActivityMemo, label: 'anteckning, memo, skriva, komma ihåg' },
      {
        id: 'activity-palette',
        src: ActivityPalette,
        label: 'färgpalett, färg, design, kreativitet'
      },
      {
        id: 'activity-shopping-cart',
        src: ActivityShoppingCart,
        label: 'kundvagn, handla, shopping, butik'
      },
      {
        id: 'activity-soccer-ball',
        src: ActivitySoccerBall,
        label: 'fotboll, sport, match, spela'
      }
    ]
  },
  {
    name: 'Känslor',
    emojis: [
      {
        id: 'feeling-exploding-head',
        src: FeelingExplodingHead,
        label: 'mind blown, överväldigad, chock'
      },
      {
        id: 'feeling-holding-back-tears',
        src: FeelingHoldingBackTears,
        label: 'håller tillbaka tårar, rörd, nära att gråta'
      },
      {
        id: 'feeling-melting',
        src: FeelingMelting,
        label: 'överväldigad, smälter, slut'
      },
      {
        id: 'feeling-monocle',
        src: FeelingMonocle,
        label: 'skeptisk, granskande, analyserar'
      },
      {
        id: 'feeling-rolling-eyes',
        src: FeelingRollingEyes,
        label: 'ögonrullning, irritation'
      },
      {
        id: 'feeling-smirking',
        src: FeelingSmirking,
        label: 'självsäker, sarkastisk, flin'
      },
      {
        id: 'feeling-star-struck',
        src: FeelingStarStruck,
        label: 'imponerad, beundran, stjärnögon'
      },
      {
        id: 'feeling-thinking',
        src: FeelingThinking,
        label: 'tänker, funderar, reflekterar'
      },
      {
        id: 'feeling-unamused',
        src: FeelingUnamused,
        label: 'ointresserad, missnöjd, otrolig'
      },
      {
        id: 'feeling-upside-down',
        src: FeelingUpsideDown,
        label: 'ironisk, upp-och-ned, sarkastisk'
      },
      {
        id: 'feeling-weary',
        src: FeelingWeary,
        label: 'sliten, trött, utmattad'
      },
      {
        id: 'feeling-zany',
        src: FeelingZany,
        label: 'galen, knäpp, tokig'
      }
    ]
  },
  {
    name: 'Gester',
    emojis: [
      { id: 'gesture-biceps', src: GestureBiceps, label: 'biceps, styrka, träning, muskler' },
      {
        id: 'gesture-clapping-hands',
        src: GestureClappingHands,
        label: 'applåder, beröm, uppskattning'
      },
      {
        id: 'gesture-fuck-you',
        src: GestureFuckYou,
        label: 'långfinger, ilska, protest, förolämpning'
      },
      {
        id: 'gesture-hands-folded',
        src: GestureHandsFolded,
        label: 'knäppta händer, bön, tack, snälla'
      },
      {
        id: 'gesture-handshake',
        src: GestureHandshake,
        label: 'handslag, överenskommelse, hälsning'
      },
      {
        id: 'gesture-index-pointing-up',
        src: GestureIndexPointingUp,
        label: 'pekfinger upp, uppmärksamhet, idé'
      },
      { id: 'gesture-ok', src: GestureOk, label: 'okej, bra, godkänt' },
      {
        id: 'gesture-pinched-fingers',
        src: GesturePinchedFingers,
        label: 'nyparde fingrar, italiensk gest, vad då'
      },
      {
        id: 'gesture-sign-of-the-horns',
        src: GestureSignOfTheHorns,
        label: 'rock, horn, metal, häftigt'
      },
      {
        id: 'gesture-thumbs-down',
        src: GestureThumbsDown,
        label: 'tummen ner, dåligt, nej, ogillar'
      },
      { id: 'gesture-thumbs-up', src: GestureThumbsUp, label: 'tummen upp, bra, ja, gillar' },
      { id: 'gesture-victory', src: GestureVictory, label: 'seger, fred, vinst, peace' }
    ]
  },
  {
    name: 'Platser',
    emojis: [
      { id: 'location-beach', src: LocationBeach, label: 'strand, hav, sommar, semester' },
      { id: 'location-car', src: LocationCar, label: 'bil, köra, transport, resa' },
      {
        id: 'location-cityscape',
        src: LocationCityscape,
        label: 'stad, skyline, storstad, urban'
      },
      {
        id: 'location-highway',
        src: LocationHighway,
        label: 'motorväg, väg, resa, körning'
      },
      {
        id: 'location-hospital',
        src: LocationHospital,
        label: 'sjukhus, vård, sjuk, akut'
      },
      { id: 'location-house', src: LocationHouse, label: 'hus, hem, boende, bostad' },
      {
        id: 'location-national-park',
        src: LocationNationalPark,
        label: 'nationalpark, natur, friluftsliv, vildmark'
      },
      { id: 'location-ocean', src: LocationOcean, label: 'hav, ocean, vatten, vågor' },
      {
        id: 'location-office',
        src: LocationOffice,
        label: 'kontor, arbete, jobb, byggnad'
      },
      {
        id: 'location-school',
        src: LocationSchool,
        label: 'skola, utbildning, studier, klassrum'
      },
      { id: 'location-tram', src: LocationTram, label: 'spårvagn, kollektivtrafik, stad' },
      { id: 'location-tree', src: LocationTree, label: 'träd, natur, skog, grönt' }
    ]
  },
  {
    name: 'Symboler',
    emojis: [
      { id: 'symbol-bomb', src: SymbolBomb, label: 'bomb, explosion, kaos, fara' },
      {
        id: 'symbol-broken-heart',
        src: SymbolBrokenHeart,
        label: 'brustet hjärta, sorg, hjärtesorg'
      },
      {
        id: 'symbol-bullseye',
        src: SymbolBullseye,
        label: 'mitt i prick, mål, fokus, precision'
      },
      { id: 'symbol-life-buoy', src: SymbolLifeBuoy, label: 'livboj, hjälp, räddning' },
      {
        id: 'symbol-pile-of-poo',
        src: SymbolPileOfPoo,
        label: 'bajshög, skit, dåligt, skräp'
      },
      { id: 'symbol-rainbow', src: SymbolRainbow, label: 'regnbåge, hopp, färger' },
      { id: 'symbol-rocket', src: SymbolRocket, label: 'raket, start, framåt, lansering' },
      { id: 'symbol-skull', src: SymbolSkull, label: 'dödskalle, död, fara, skrämmande' },
      {
        id: 'symbol-toilet-paper',
        src: SymbolToiletPaper,
        label: 'toapapper, hushåll, pappersrulle'
      },
      { id: 'symbol-trophy', src: SymbolTrophy, label: 'trofé, vinst, seger' },
      { id: 'symbol-unicorn', src: SymbolUnicorn, label: 'enhörning, magi, fantasi' },
      { id: 'symbol-volcano', src: SymbolVolcano, label: 'vulkan, utbrott, kraft' }
    ]
  }
];

// Build maps for quick emoji lookup by id
export const emojiMap = new Map<string, string>();
export const emojiLabelMap = new Map<string, string>();
emojiCategories.forEach((category) => {
  category.emojis.forEach((emoji) => {
    emojiMap.set(emoji.id, emoji.src);
    emojiLabelMap.set(emoji.id, emoji.label);
  });
});

// Helper function to get a random selection of emojis from a category
export function getRandomEmojis(emojis: EmojiItem[], count: number): EmojiItem[] {
  const shuffled = [...emojis].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, emojis.length));
}
