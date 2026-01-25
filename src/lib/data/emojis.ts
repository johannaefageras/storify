import type { Component } from 'svelte';
import {
  EmojiAbacus,
  EmojiAirplane,
  EmojiBalletShoes,
  EmojiBathtub,
  EmojiBeach,
  EmojiBed,
  EmojiBiceps,
  EmojiBicycle,
  EmojiBooks,
  EmojiBriefcase,
  EmojiBroom,
  EmojiBus,
  EmojiCamping,
  EmojiCarouselHorse,
  EmojiCircusTent,
  EmojiColorPalette,
  EmojiCouchLamp,
  EmojiDivingMask,
  EmojiFerrisWheel,
  EmojiFileBox,
  EmojiFryingPan,
  EmojiHammerWrench,
  EmojiHeadphones,
  EmojiHotBeverage,
  EmojiHouseGarden,
  EmojiLaptop,
  EmojiLuggage,
  EmojiManDancing,
  EmojiMaracas,
  EmojiMemo,
  EmojiMusicalNotes,
  EmojiNailPolish,
  EmojiNewspaper,
  EmojiPageBookmarked,
  EmojiPartyPopper,
  EmojiPlaygroundSlide,
  EmojiPottedPlant,
  EmojiRailwayCar,
  EmojiRollerCoaster,
  EmojiRollerSkate,
  EmojiSchool,
  EmojiScooter,
  EmojiShoppingCart,
  EmojiShoppingsBags,
  EmojiSlotMachine,
  EmojiSmartPhone,
  EmojiSoccerBall,
  EmojiSpeedboat,
  EmojiStadium,
  EmojiTechnologist,
  EmojiTelephone,
  EmojiTram,
  EmojiTV,
  EmojiVideoGameControl,
  EmojiWomanDancing,
  EmojiWomanMeditating,
  EmojiWomanRunning,
  EmojiWomenFriends,
  EmojiWritingHand,
  EmojiYarn
} from '$lib/components/emojis/activities';
import {
  EmojiFaceAngry,
  EmojiFaceAnguished,
  EmojiFaceAnxiousSweat,
  EmojiFaceAstonished,
  EmojiFaceBagsUnderEyes,
  EmojiFaceBeamingSmilingEyes,
  EmojiFaceConfounded,
  EmojiFaceConfused,
  EmojiFaceCrossedOutEyes,
  EmojiFaceCrying,
  EmojiFaceCryingLoudly,
  EmojiFaceDiagonalMouth,
  EmojiFaceDisappointed,
  EmojiFaceDisguised,
  EmojiFaceEnraged,
  EmojiFaceExplodingHead,
  EmojiFaceExpressionless,
  EmojiFaceFrowning,
  EmojiFaceGrimacing,
  EmojiFaceGrinningSquinting,
  EmojiFaceGrinningSweat,
  EmojiFaceHeartEyes,
  EmojiFaceLOL,
  EmojiFaceMelting,
  EmojiFaceMonocle,
  EmojiFaceNauseated,
  EmojiFaceNerd,
  EmojiFaceNeutral,
  EmojiFacePartying,
  EmojiFacePersevering,
  EmojiFacePleading,
  EmojiFaceRaisedEyebrows,
  EmojiFaceRollingEyes,
  EmojiFaceSleeping,
  EmojiFaceSleepy,
  EmojiFaceSlightlyFrowning,
  EmojiFaceSlightlySmiling,
  EmojiFaceSmiling,
  EmojiFaceSmilingHearts,
  EmojiFaceSmirking,
  EmojiFaceSpiralEyes,
  EmojiFaceSquintingTongue,
  EmojiFaceStarStruck,
  EmojiFaceSteamFromNose,
  EmojiFaceSunglasses,
  EmojiFaceSwearing,
  EmojiFaceThermometer,
  EmojiFaceThinking,
  EmojiFaceTired,
  EmojiFaceUnamused,
  EmojiFaceUnhappy,
  EmojiFaceUpsideDown,
  EmojiFaceVomiting,
  EmojiFaceWeary,
  EmojiFaceWinking,
  EmojiFaceWoozy,
  EmojiFaceYawning,
  EmojiFaceZany
} from '$lib/components/emojis/feelings';
import {
  EmojiBolt,
  EmojiCherryBlossom,
  EmojiCloudLightning,
  EmojiCloudRain,
  EmojiCloudSnow,
  EmojiCyclone,
  EmojiDashingAway,
  EmojiFaceCold,
  EmojiFaceHot,
  EmojiLeaves,
  EmojiRainbow,
  EmojiSeedling,
  EmojiSnowflake,
  EmojiSun,
  EmojiSunCloud,
  EmojiTornado,
  EmojiUmbrellaRain
} from '$lib/components/emojis/weather';
import {
  EmojiAlarm,
  EmojiAlien,
  EmojiAnchor,
  EmojiBattery,
  EmojiBatteryLow,
  EmojiBomb,
  EmojiBrokenHeart,
  EmojiBullseye,
  EmojiCandle,
  EmojiChequeredFlag,
  EmojiClappingHands,
  EmojiCollision,
  EmojiConstruction,
  EmojiCrystalBall,
  EmojiDizzy,
  EmojiElectricPlug,
  EmojiFire,
  EmojiFleurDeLis,
  EmojiFourLeafClover,
  EmojiFramedPicture,
  EmojiFuelPump,
  EmojiFUHand,
  EmojiGemStone,
  EmojiGhost,
  EmojiGift,
  EmojiGlowingStar,
  EmojiHeartsOnFire,
  EmojiHerb,
  EmojiHundredPoints,
  EmojiIce,
  EmojiJoker,
  EmojiLifeBuoy,
  EmojiMagnifyingGlass,
  EmojiMedal,
  EmojiMegaphone,
  EmojiMirror,
  EmojiMoneyBag,
  EmojiNoEntry,
  EmojiOKHand,
  EmojiOwl,
  EmojiPirateFlag,
  EmojiPopcorn,
  EmojiPuzzlePiece,
  EmojiRibbon,
  EmojiRocket,
  EmojiRollOfPaper,
  EmojiScale,
  EmojiSkullCrossbones,
  EmojiSplatter,
  EmojiStar,
  EmojiTrafficLight,
  EmojiTrash,
  EmojiTrophy,
  EmojiUnicorn,
  EmojiVictoryHand,
  EmojiVolcano,
  EmojiWarning,
  EmojiWomanFacepalming,
  EmojiWomanZombie
} from '$lib/components/emojis/other';

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
      { id: 'face-angry', component: EmojiFaceAngry, label: 'arg, ilska, irritation, raseri' },
      { id: 'face-anguished', component: EmojiFaceAnguished, label: 'ångest, plåga, oro, lidande' },
      {
        id: 'face-anxious-sweat',
        component: EmojiFaceAnxiousSweat,
        label: 'nervös, stressad, press, svettig'
      },
      { id: 'face-astonished', component: EmojiFaceAstonished, label: 'förvånad, chockad, häpnad' },
      {
        id: 'face-bags-under-eyes',
        component: EmojiFaceBagsUnderEyes,
        label: 'trött, sömnbrist, utmattad'
      },
      {
        id: 'face-beaming-smiling-eyes',
        component: EmojiFaceBeamingSmilingEyes,
        label: 'jätteglad, leende, lycka'
      },
      {
        id: 'face-confounded',
        component: EmojiFaceConfounded,
        label: 'förvirrad, förbryllad, stressad'
      },
      { id: 'face-confused', component: EmojiFaceConfused, label: 'förvirrad, osäker, frågande' },
      {
        id: 'face-crossed-out-eyes',
        component: EmojiFaceCrossedOutEyes,
        label: 'slut, överkörd, kollapsad'
      },
      { id: 'face-crying', component: EmojiFaceCrying, label: 'ledsen, gråter, sorg' },
      {
        id: 'face-crying-loudly',
        component: EmojiFaceCryingLoudly,
        label: 'förtvivlad, hysterisk, stor sorg'
      },
      {
        id: 'face-diagonal-mouth',
        component: EmojiFaceDiagonalMouth,
        label: 'tveksam, obekväm, osäker'
      },
      { id: 'face-disappointed', component: EmojiFaceDisappointed, label: 'besviken, nedstämd' },
      { id: 'face-disguised', component: EmojiFaceDisguised, label: 'förklädd, hemlig, maskerad' },
      { id: 'face-enraged', component: EmojiFaceEnraged, label: 'rasande, ilska, vrede' },
      {
        id: 'face-exploding-head',
        component: EmojiFaceExplodingHead,
        label: 'mind blown, överväldigad, chock'
      },
      {
        id: 'face-expressionless',
        component: EmojiFaceExpressionless,
        label: 'neutral, tom, känslolös'
      },
      { id: 'face-frowning', component: EmojiFaceFrowning, label: 'missnöjd, ledsen, sur' },
      { id: 'face-grimacing', component: EmojiFaceGrimacing, label: 'pinsamt, stel, obekväm' },
      {
        id: 'face-grinning-squinting',
        component: EmojiFaceGrinningSquinting,
        label: 'skratt, fniss, ansträngt leende'
      },
      {
        id: 'face-grinning-sweat',
        component: EmojiFaceGrinningSweat,
        label: 'nervöst skratt, pinsamt'
      },
      { id: 'face-heart-eyes', component: EmojiFaceHeartEyes, label: 'förälskad, kärlek, älskar' },
      { id: 'face-lol', component: EmojiFaceLOL, label: 'skrattar, rolig, haha' },
      { id: 'face-melting', component: EmojiFaceMelting, label: 'överväldigad, smälter, slut' },
      {
        id: 'face-monocle',
        component: EmojiFaceMonocle,
        label: 'skeptisk, granskande, analyserar'
      },
      { id: 'face-nauseated', component: EmojiFaceNauseated, label: 'äcklad, illamående' },
      { id: 'face-nerd', component: EmojiFaceNerd, label: 'nörd, smart, pluggar' },
      { id: 'face-neutral', component: EmojiFaceNeutral, label: 'neutral, likgiltig' },
      { id: 'face-partying', component: EmojiFacePartying, label: 'fest, firande, party' },
      {
        id: 'face-persevering',
        component: EmojiFacePersevering,
        label: 'kämpar, håller ut, stress'
      },
      { id: 'face-pleading', component: EmojiFacePleading, label: 'snälla, ber, vädjar' },
      {
        id: 'face-raised-eyebrows',
        component: EmojiFaceRaisedEyebrows,
        label: 'överraskad, skeptisk'
      },
      {
        id: 'face-rolling-eyes',
        component: EmojiFaceRollingEyes,
        label: 'ögonrullning, irritation'
      },
      { id: 'face-sleeping', component: EmojiFaceSleeping, label: 'sover, trött, vila' },
      { id: 'face-sleepy', component: EmojiFaceSleepy, label: 'sömnig, gäspande' },
      {
        id: 'face-slightly-frowning',
        component: EmojiFaceSlightlyFrowning,
        label: 'lite ledsen, tveksam'
      },
      {
        id: 'face-slightly-smiling',
        component: EmojiFaceSlightlySmiling,
        label: 'försiktigt glad, nöjd'
      },
      { id: 'face-smiling', component: EmojiFaceSmiling, label: 'glad, leende' },
      {
        id: 'face-smiling-hearts',
        component: EmojiFaceSmilingHearts,
        label: 'kärlek, värme, omtanke'
      },
      { id: 'face-smirking', component: EmojiFaceSmirking, label: 'självsäker, sarkastisk' },
      { id: 'face-spiral-eyes', component: EmojiFaceSpiralEyes, label: 'förvirrad, snurrig' },
      { id: 'face-squinting-tongue', component: EmojiFaceSquintingTongue, label: 'tramsig, busig' },
      { id: 'face-star-struck', component: EmojiFaceStarStruck, label: 'imponerad, beundran' },
      { id: 'face-steam-from-nose', component: EmojiFaceSteamFromNose, label: 'frustrerad, arg' },
      { id: 'face-sunglasses', component: EmojiFaceSunglasses, label: 'cool, självsäker' },
      { id: 'face-swearing', component: EmojiFaceSwearing, label: 'svär, förbannad' },
      { id: 'face-thermometer', component: EmojiFaceThermometer, label: 'sjuk, feber' },
      { id: 'face-thinking', component: EmojiFaceThinking, label: 'tänker, funderar' },
      { id: 'face-tired', component: EmojiFaceTired, label: 'utmattad, trött' },
      { id: 'face-unamused', component: EmojiFaceUnamused, label: 'ointresserad, missnöjd' },
      { id: 'face-unhappy', component: EmojiFaceUnhappy, label: 'olycklig, ledsen' },
      { id: 'face-upside-down', component: EmojiFaceUpsideDown, label: 'ironisk, upp-och-ned' },
      { id: 'face-vomiting', component: EmojiFaceVomiting, label: 'spyr, illamående' },
      { id: 'face-weary', component: EmojiFaceWeary, label: 'sliten, trött' },
      { id: 'face-winking', component: EmojiFaceWinking, label: 'blinkar, skojar' },
      { id: 'face-woozy', component: EmojiFaceWoozy, label: 'yr, förvirrad' },
      { id: 'face-yawning', component: EmojiFaceYawning, label: 'gäspande, trött' },
      { id: 'face-zany', component: EmojiFaceZany, label: 'galen, knäpp, tokig' }
    ]
  },
  {
    name: 'Aktiviteter & Prylar',
    emojis: [
      { id: 'abacus', component: EmojiAbacus, label: 'kulram, räkning, matematik, siffror' },
      { id: 'airplane', component: EmojiAirplane, label: 'flygplan, resa, flyga, semester' },
      { id: 'ballet-shoes', component: EmojiBalletShoes, label: 'balettskor, dans, balett, scen' },
      { id: 'bathtub', component: EmojiBathtub, label: 'badkar, bada, badrum, avkoppling' },
      { id: 'beach', component: EmojiBeach, label: 'strand, hav, sommar, semester' },
      { id: 'bed', component: EmojiBed, label: 'säng, sömn, vila, natt' },
      { id: 'biceps', component: EmojiBiceps, label: 'biceps, styrka, träning, muskler' },
      { id: 'bicycle', component: EmojiBicycle, label: 'cykel, cykla, transport, motion' },
      { id: 'books', component: EmojiBooks, label: 'böcker, läsa, studier, kunskap' },
      { id: 'briefcase', component: EmojiBriefcase, label: 'portfölj, arbete, jobb, kontor' },
      { id: 'broom', component: EmojiBroom, label: 'kvast, städa, rengöring, hushåll' },
      { id: 'bus', component: EmojiBus, label: 'buss, kollektivtrafik, resa, pendling' },
      { id: 'camping', component: EmojiCamping, label: 'camping, tälta, friluftsliv, natur' },
      {
        id: 'carousel-horse',
        component: EmojiCarouselHorse,
        label: 'karusell, nöjesfält, häst, barn'
      },
      { id: 'circus-tent', component: EmojiCircusTent, label: 'cirkus, tält, show, underhållning' },
      {
        id: 'color-palette',
        component: EmojiColorPalette,
        label: 'färgpalett, färg, design, kreativitet'
      },
      { id: 'couch-lamp', component: EmojiCouchLamp, label: 'soffa, lampa, vardagsrum, mys' },
      {
        id: 'diving-mask',
        component: EmojiDivingMask,
        label: 'dykarmask, snorkling, hav, semester'
      },
      {
        id: 'ferris-wheel',
        component: EmojiFerrisWheel,
        label: 'pariserhjul, nöjesfält, utsikt, åktur'
      },
      { id: 'file-box', component: EmojiFileBox, label: 'arkivlåda, filer, organisering, papper' },
      {
        id: 'frying-pan',
        component: EmojiFryingPan,
        label: 'stekpanna, matlagning, laga mat, kök'
      },
      {
        id: 'hammer-wrench',
        component: EmojiHammerWrench,
        label: 'verktyg, bygga, fixa, reparation'
      },
      { id: 'headphones', component: EmojiHeadphones, label: 'hörlurar, musik, ljud, lyssna' },
      { id: 'hot-beverage', component: EmojiHotBeverage, label: 'varm dryck, kaffe, te, fika' },
      { id: 'house-garden', component: EmojiHouseGarden, label: 'hus, trädgård, hem, boende' },
      { id: 'laptop', component: EmojiLaptop, label: 'laptop, dator, arbete, teknik' },
      { id: 'luggage', component: EmojiLuggage, label: 'bagage, resväska, resa, packa' },
      { id: 'man-dancing', component: EmojiManDancing, label: 'dansande man, dans, glädje, fest' },
      { id: 'maracas', component: EmojiMaracas, label: 'maracas, musik, rytm, fest' },
      { id: 'memo', component: EmojiMemo, label: 'anteckning, memo, skriva, komma ihåg' },
      {
        id: 'musical-notes',
        component: EmojiMusicalNotes,
        label: 'musiknoter, musik, ljud, melodi'
      },
      { id: 'nail-polish', component: EmojiNailPolish, label: 'nagellack, skönhet, naglar, stil' },
      { id: 'newspaper', component: EmojiNewspaper, label: 'tidning, nyheter, läsa, media' },
      {
        id: 'page-bookmarked',
        component: EmojiPageBookmarked,
        label: 'bokmärke, sida, spara, läsa senare'
      },
      {
        id: 'party-popper',
        component: EmojiPartyPopper,
        label: 'party popper, fest, firande, konfetti'
      },
      {
        id: 'playground-slide',
        component: EmojiPlaygroundSlide,
        label: 'rutschkana, lekplats, barn, lek'
      },
      {
        id: 'potted-plant',
        component: EmojiPottedPlant,
        label: 'krukväxt, växt, inredning, natur'
      },
      { id: 'railway-car', component: EmojiRailwayCar, label: 'tågvagn, tåg, resa, transport' },
      {
        id: 'roller-coaster',
        component: EmojiRollerCoaster,
        label: 'berg-och-dalbana, nöjesfält, spänning'
      },
      {
        id: 'roller-skate',
        component: EmojiRollerSkate,
        label: 'rullskridsko, sport, fritid, åka'
      },
      { id: 'school', component: EmojiSchool, label: 'skola, utbildning, studier, klassrum' },
      { id: 'scooter', component: EmojiScooter, label: 'sparkcykel, transport, åka, stad' },
      {
        id: 'shopping-cart',
        component: EmojiShoppingCart,
        label: 'kundvagn, handla, shopping, butik'
      },
      {
        id: 'shoppings-bags',
        component: EmojiShoppingsBags,
        label: 'shoppingkassar, shopping, affär, köpa'
      },
      {
        id: 'slot-machine',
        component: EmojiSlotMachine,
        label: 'spelautomat, casino, spel, chans'
      },
      {
        id: 'smart-phone',
        component: EmojiSmartPhone,
        label: 'smartphone, mobil, telefon, teknik'
      },
      { id: 'soccer-ball', component: EmojiSoccerBall, label: 'fotboll, sport, match, spela' },
      { id: 'speedboat', component: EmojiSpeedboat, label: 'snabbåt, båt, hav, fart' },
      { id: 'stadium', component: EmojiStadium, label: 'arena, stadion, sport, publik' },
      {
        id: 'technologist',
        component: EmojiTechnologist,
        label: 'tekniker, programmerare, dator, arbete'
      },
      { id: 'telephone', component: EmojiTelephone, label: 'telefon, ringa, samtal, kontakt' },
      { id: 'tram', component: EmojiTram, label: 'spårvagn, kollektivtrafik, stad' },
      { id: 'tv', component: EmojiTV, label: 'tv, television, titta, underhållning' },
      {
        id: 'video-game-control',
        component: EmojiVideoGameControl,
        label: 'handkontroll, tv-spel, gaming, spela'
      },
      {
        id: 'woman-dancing',
        component: EmojiWomanDancing,
        label: 'dansande kvinna, dans, glädje, fest'
      },
      {
        id: 'woman-meditating',
        component: EmojiWomanMeditating,
        label: 'meditation, lugn, mindfulness, yoga'
      },
      {
        id: 'woman-running',
        component: EmojiWomanRunning,
        label: 'springande kvinna, löpning, träning'
      },
      {
        id: 'women-friends',
        component: EmojiWomenFriends,
        label: 'vänner, vänskap, gemenskap, tillsammans'
      },
      {
        id: 'writing-hand',
        component: EmojiWritingHand,
        label: 'skrivande hand, skriva, anteckna'
      },
      { id: 'yarn', component: EmojiYarn, label: 'garn, sticka, virka, handarbete' }
    ]
  },
  {
    name: 'Väder & Natur',
    emojis: [
      { id: 'bolt', component: EmojiBolt, label: 'blixt, åska, oväder' },
      {
        id: 'cherry-blossom',
        component: EmojiCherryBlossom,
        label: 'körsbärsblomma, blomning, vår'
      },
      { id: 'cloud-lightning', component: EmojiCloudLightning, label: 'åskmoln, blixt, oväder' },
      { id: 'cloud-rain', component: EmojiCloudRain, label: 'regn, regnmoln, nederbörd' },
      { id: 'cloud-snow', component: EmojiCloudSnow, label: 'snöfall, vinter, snö' },
      { id: 'cyclone', component: EmojiCyclone, label: 'cyklon, storm, oväder' },
      { id: 'dashing-away', component: EmojiDashingAway, label: 'vind, fart, blåst' },
      { id: 'face-cold', component: EmojiFaceCold, label: 'kall, fryser, kyla' },
      { id: 'face-hot', component: EmojiFaceHot, label: 'varm, hetta, svettig' },
      { id: 'leaves', component: EmojiLeaves, label: 'löv, natur, höst' },
      { id: 'rainbow', component: EmojiRainbow, label: 'regnbåge, hopp, färger' },
      { id: 'seedling', component: EmojiSeedling, label: 'grodd, växt, tillväxt' },
      { id: 'snowflake', component: EmojiSnowflake, label: 'snöflinga, kyla, vinter' },
      { id: 'sun', component: EmojiSun, label: 'sol, solsken, värme' },
      { id: 'sun-cloud', component: EmojiSunCloud, label: 'växlande molnighet, halvklart' },
      { id: 'tornado', component: EmojiTornado, label: 'tornado, storm, extremväder' },
      { id: 'umbrella-rain', component: EmojiUmbrellaRain, label: 'regn, paraply, oväder' }
    ]
  },
  {
    name: 'Övriga Symboler',
    emojis: [
      { id: 'alarm', component: EmojiAlarm, label: 'alarm, väckarklocka, varning, tid' },
      { id: 'alien', component: EmojiAlien, label: 'alien, utomjording, konstig, sci-fi' },
      { id: 'anchor', component: EmojiAnchor, label: 'ankare, stabilitet, hamn, sjöfart' },
      { id: 'battery', component: EmojiBattery, label: 'batteri, energi, laddning' },
      {
        id: 'battery-low',
        component: EmojiBatteryLow,
        label: 'lågt batteri, slut på energi, trött'
      },
      { id: 'bomb', component: EmojiBomb, label: 'bomb, explosion, kaos, fara' },
      {
        id: 'broken-heart',
        component: EmojiBrokenHeart,
        label: 'brustet hjärta, sorg, hjärtesorg'
      },
      { id: 'bullseye', component: EmojiBullseye, label: 'mitt i prick, mål, fokus, precision' },
      { id: 'candle', component: EmojiCandle, label: 'ljus, stillhet, minne, stämning' },
      {
        id: 'chequered-flag',
        component: EmojiChequeredFlag,
        label: 'mållinje, klart, tävling, slut'
      },
      {
        id: 'clapping-hands',
        component: EmojiClappingHands,
        label: 'applåder, beröm, uppskattning'
      },
      { id: 'collision', component: EmojiCollision, label: 'krock, konflikt, smäll' },
      { id: 'construction', component: EmojiConstruction, label: 'arbete, byggarbete, pågående' },
      { id: 'crystal-ball', component: EmojiCrystalBall, label: 'spådom, framtid, mystik' },
      { id: 'dizzy', component: EmojiDizzy, label: 'yr, snurrig, förvirrad' },
      { id: 'electric-plug', component: EmojiElectricPlug, label: 'el, ström, koppla in, ladda' },
      { id: 'fire', component: EmojiFire, label: 'eld, hetta, intensitet, energi' },
      { id: 'fleur-de-lis', component: EmojiFleurDeLis, label: 'symbol, heraldik, dekoration' },
      { id: 'four-leaf-clover', component: EmojiFourLeafClover, label: 'fyrklöver, tur, lycka' },
      { id: 'framed-picture', component: EmojiFramedPicture, label: 'tavla, minne, konst, foto' },
      { id: 'fuel-pump', component: EmojiFuelPump, label: 'bränsle, tanka, energi' },
      { id: 'fu-hand', component: EmojiFUHand, label: 'ilska, protest, förolämpning' },
      { id: 'gem-stone', component: EmojiGemStone, label: 'ädelsten, värdefull, skatt' },
      { id: 'ghost', component: EmojiGhost, label: 'spöke, skräck, halloween' },
      { id: 'gift', component: EmojiGift, label: 'present, gåva, överraskning' },
      {
        id: 'glowing-star',
        component: EmojiGlowingStar,
        label: 'stjärna, glänsa, något speciellt'
      },
      { id: 'hearts-on-fire', component: EmojiHeartsOnFire, label: 'intensiv kärlek, passion' },
      { id: 'herb', component: EmojiHerb, label: 'ört, växt, natur, krydda' },
      {
        id: 'hundred-points',
        component: EmojiHundredPoints,
        label: 'hundra poäng, perfekt, full pott'
      },
      { id: 'ice', component: EmojiIce, label: 'is, kyla, frost' },
      { id: 'joker', component: EmojiJoker, label: 'joker, skämtare, kaosfaktor' },
      { id: 'life-buoy', component: EmojiLifeBuoy, label: 'livboj, hjälp, räddning' },
      {
        id: 'magnifying-glass',
        component: EmojiMagnifyingGlass,
        label: 'förstoring, söka, undersöka'
      },
      { id: 'medal', component: EmojiMedal, label: 'medalj, prestation, vinst' },
      { id: 'megaphone', component: EmojiMegaphone, label: 'megafon, ropa, budskap' },
      { id: 'mirror', component: EmojiMirror, label: 'spegel, reflektion, självbild' },
      { id: 'money-bag', component: EmojiMoneyBag, label: 'pengar, ekonomi, rikedom' },
      { id: 'no-entry', component: EmojiNoEntry, label: 'förbjudet, stopp, nej' },
      { id: 'ok-hand', component: EmojiOKHand, label: 'okej, bra, godkänt' },
      { id: 'owl', component: EmojiOwl, label: 'uggla, visdom, natt' },
      { id: 'pirate-flag', component: EmojiPirateFlag, label: 'piratflagga, rebell, fara' },
      { id: 'popcorn', component: EmojiPopcorn, label: 'popcorn, drama, underhållning' },
      { id: 'puzzle-piece', component: EmojiPuzzlePiece, label: 'pusselbit, lösning, samband' },
      { id: 'ribbon', component: EmojiRibbon, label: 'rosett, dekoration, pris' },
      { id: 'rocket', component: EmojiRocket, label: 'raket, start, framåt, lansering' },
      {
        id: 'roll-of-paper',
        component: EmojiRollOfPaper,
        label: 'pappersrulle, hushåll, toapapper'
      },
      { id: 'scale', component: EmojiScale, label: 'balans, rättvisa, väga' },
      { id: 'skull-crossbones', component: EmojiSkullCrossbones, label: 'fara, gift, dödskalle' },
      { id: 'splatter', component: EmojiSplatter, label: 'stänk, kaos, kladd' },
      { id: 'star', component: EmojiStar, label: 'stjärna, favorit, betyg' },
      { id: 'traffic-light', component: EmojiTrafficLight, label: 'trafikljus, stopp, köra' },
      { id: 'trash', component: EmojiTrash, label: 'skräp, kasta, sopor' },
      { id: 'trophy', component: EmojiTrophy, label: 'trofé, vinst, seger' },
      { id: 'unicorn', component: EmojiUnicorn, label: 'enhörning, magi, fantasi' },
      { id: 'victory-hand', component: EmojiVictoryHand, label: 'seger, fred, vinst' },
      { id: 'volcano', component: EmojiVolcano, label: 'vulkan, utbrott, kraft' },
      { id: 'warning', component: EmojiWarning, label: 'varning, risk, uppmärksamhet' },
      {
        id: 'woman-facepalming',
        component: EmojiWomanFacepalming,
        label: 'facepalm, pinsamt, suck'
      },
      { id: 'woman-zombie', component: EmojiWomanZombie, label: 'zombie, trött, hjärndöd' },
      { id: 'women-friends', component: EmojiWomenFriends, label: 'vänner, gemenskap, tillsammans' }
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
