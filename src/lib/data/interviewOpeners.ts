/**
 * Hand-crafted opening lines for the four interview-mode conversation starters.
 *
 * When a user taps one of the four starter chips on the empty interview screen,
 * we pick a random opener from the matching pool and inject it directly into
 * the chat as an assistant message — no /api/chat round-trip needed for the
 * first turn. This keeps the first impression instant, free, and consistently
 * on-brand.
 *
 * Openers are per-interviewer: the first assistant message sets the tone
 * immediately, so a Kompisen-style opener coming from Terapeuten would break
 * the illusion before the model even speaks. Each persona has its own pool
 * per starter.
 *
 * All openers follow the shared interviewer persona constraints from
 * src/lib/data/chatbotPrompts/:
 *   - Swedish
 *   - exactly one question per message
 *   - 1–3 sentences
 *   - no markdown, no unsolicited emojis
 *   - warm-but-neutral, never therapist-like (the Terapeuten persona is
 *     gentler around feelings but still follows SHARED_BOUNDARIES)
 *
 * They tilt slightly more playful/characterful than a mid-conversation
 * interviewer reply — that's the whole point. The dial moves; the persona
 * stays.
 */

import type { InterviewerId } from './chatbotPrompts';

export type StarterId = 'tips' | 'unexpectedQuestion' | 'rememberDay' | 'digInteresting';

/**
 * Canonical order of starter chips in the empty-state grid.
 * The UI renders chips in this order; pick a label for each from the pools
 * below.
 */
export const STARTER_IDS: readonly StarterId[] = [
  'tips',
  'unexpectedQuestion',
  'rememberDay',
  'digInteresting'
] as const;

/**
 * Shared shape for both label pools (what the chip *says*) and opener pools
 * (what the interviewer *replies with* when the chip is tapped). Per
 * interviewer, per starter id, an array of string variants.
 */
type StarterPools = Record<InterviewerId, Record<StarterId, readonly string[]>>;

/**
 * Per-interviewer label pools for the starter chips. The chip keeps the same
 * `StarterId` (so the opener pool it routes to is stable), only the label
 * shown to the user varies per persona. Add more strings to any pool to
 * extend the variations.
 */
export const STARTER_LABEL_POOLS: StarterPools = {
  friend: {
    tips: [
      'Ge mig tips på vad jag borde skriva om..',
      'Kasta fram en ingång — vad kan jag börja med?'
    ],
    unexpectedQuestion: [
      'Ställ mig en fråga jag inte väntar mig..',
      'Fråga mig något jag aldrig frågat mig själv..'
    ],
    rememberDay: ['Hjälp mig att komma ihåg den här dagen..', 'Fånga ett minne från idag åt mig..'],
    digInteresting: ['Gräv fram något intressant ur min dag..', 'Hitta guldet i vardagen idag..']
  },
  journalist: {
    tips: ['Ge mig en ingång till dagens story..', 'Föreslå en vinkel att börja skriva om..'],
    unexpectedQuestion: [
      'Ställ en oväntad intervjufråga..',
      'Fråga mig något bara en reporter skulle våga..'
    ],
    rememberDay: ['Dokumentera dagen med mig..', 'Hjälp mig arkivera den här dagen ordentligt..'],
    digInteresting: ['Hitta vinkeln i min dag..', 'Gräv fram reportaget ur mitt idag..']
  },
  therapist: {
    tips: ['Hjälp mig hitta var jag vill börja..', 'Visa mig en mjuk väg in i texten..'],
    unexpectedQuestion: [
      'Ställ en fråga som får mig att stanna upp..',
      'Fråga mig något jag sällan frågar mig själv..'
    ],
    rememberDay: [
      'Hjälp mig bevara det som var idag..',
      'Lyft fram något från idag värt att minnas..'
    ],
    digInteresting: [
      'Hitta det i dagen som vill få plats..',
      'Utforska vad som rör sig under ytan idag..'
    ]
  }
} as const;

/**
 * Pick a random label for a starter chip, scoped to an interviewer persona.
 */
export function pickStarterLabel(
  interviewerId: InterviewerId,
  starterId: StarterId,
  rng: () => number = Math.random
): string {
  const pool = STARTER_LABEL_POOLS[interviewerId][starterId];
  return pool[Math.floor(rng() * pool.length)];
}

export const INTERVIEW_OPENERS: StarterPools = {
  friend: {
    tips: [
      'Okej, snabbtest: vad är det första som dyker upp i huvudet just nu — även om det är något pinsamt litet?',
      'Vi börjar baklänges. Vad är det sista du gjorde innan du öppnade den här appen?',
      'Tänk på dagen som en film — vilken scen skulle ha fått närbild?',
      'Har det hänt något idag som du redan vet att du kommer berätta för någon senare?',
      'Vad var det bästa du åt idag? Vi kan börja där och se vart det leder.',
      'Om dagen hade en undertext på Netflix, vad skulle det stå?',
      'Vilken nivå har dagen haft på en skala från "light-läsk" till "nyöppnad champagne"?',
      'Vilket var det konstigaste eller mest oväntade ögonblicket idag — även om det bara varade tre sekunder?',
      'Vilken person dök upp i dina tankar idag, oavsett varför?',
      'Vad har du gjort idag som ditt 12-åriga jag skulle tycka var coolt — eller lamt?',
      'Vilken detalj säger mest om dagens stämning, om du var tvungen att välja en?',
      'Vilken liten sak lade du märke till idag som ingen annan förmodligen såg?',
      'Vad var det första du tänkte på när du vaknade? Ärligt.',
      'Om dagen var ett väder, vad skulle det vara och varför?',
      'Finns det något från idag som ligger och blinkar i bakgrunden?',
      'Om någon bad dig sammanfatta dagen ärligt, vad skulle du säga?',
      'Vilket litet ögonblick gjorde dig glad idag, även om det var dumt?',
      'Vilken låt skulle vara dagens soundtrack?',
      'Har du sett, hört eller läst något idag som fastnat i hjärnan?',
      'Vad är något du gjorde idag som överraskade dig själv — på gott eller ont?',
      'Här är en smal ingång: skriv om dagens mest använda föremål. Vilket var det?',
      'Börja med en plats du passerade utan att stanna. Vad såg du där?',
      'Testa maten som portal. Vad åt eller drack du idag som säger något om dagen?',
      'Skriv om dagens lilla friktion. Vad tog längre tid än det borde?',
      'Ta det från en vardagsreplik. Vad hörde du idag som fastnade lite?',
      'Välj ett ögonblick där du var på väg någonstans. Vart var du på väg?',
      'Börja med vädret fast på riktigt. Vad gjorde vädret med dagen?',
      'Skriv om något som låg framme. Vilken sak såg du flera gånger idag?',
      'Ta en pinsamt liten seger. Vad fungerade bättre än väntat?',
      'Börja med det du nästan glömde. Vad kom tillbaka nu när du tänkte efter?',
      'Skriv om en paus. Vad gjorde du när ingen krävde något av dig?',
      'Välj dagens mest onödiga tanke. Vad handlade den om?',
      'Skriv om en doft, ett ljud eller en yta. Vilken sensorisk detalj vill du börja med?',
      'Ta dagens mest ointressanta transportsträcka. Vad hände där ändå?',
      'Börja med något du gjorde med händerna. Vad var det?',
      'Vi kan testa att fokusera på tekniken. Vad är det senaste du fotade med mobilen idag?',
      'Ibland hjälper det att titta på vad man bär. Vilket klädesplagg har betytt mest för din bekvämlighet idag?',
      'Ta en titt på din skärmtid eller historik. Vilken sajt eller app stal mest av din uppmärksamhet idag?',
      'Fokusera på en transportsträcka. Vad tänkte du på medan du väntade på bussen, tåget eller kaffet?',
      'Skriv om en sak du äger som du använde idag. Vilket föremål skulle vara svårast att vara utan just nu?',
      'Tänk på vad du har i fickorna eller väskan. Vilken liten sak hamnade där idag?',
      'Vi kan börja med din fysiska omgivning. Vilken möbel eller plats har du suttit vid längst idag?',
      'Reflektera över dagens digitala spår. Vad handlade det senaste meddelandet du skickade om?',
      'Prova att skriva om något du konsumerat. Vilken rubrik, podd eller video fick dig att stanna upp en sekund?',
      'Börja med dagens ljudnivå. Var det tystare eller bullrigare än vanligt omkring dig idag?',
      'Skriv om en tröskel du har passerat. Vad märkte du först när du kom hem idag?',
      'Fokusera på dina händer. Vad är det mest praktiska du har gjort med dem idag?',
      'Ta en specifik doft från dagen. Vilken doft dominerade mest?',
      'Skriv om en plan som ändrades. Vad var det som inte blev av idag?',
      'Vi kan utgå från en annan person. Vem har du pratat mest med idag?'
    ],

    unexpectedQuestion: [
      'Om du skulle döpa om en av veckans dagar, vilket nytt namn skulle den få?',
      'Vad är det mest överskattade i din vardag just nu?',
      'Vilken lukt skulle få dig att stanna mitt i ett samtal?',
      'Om dina senaste 24 timmar var en bok, vad skulle baksidestexten säga?',
      'Vilket föremål i ditt hem skulle du rädda först om det inte fick vara något viktigt?',
      'Om du fick veta exakt vad alla i ditt liv tänker på dig — skulle du vilja det?',
      'Vad ljuger du om utan att tänka på det?',
      'Vilken kompliment har du fått som du fortfarande tänker på?',
      'Om du var tvungen att leva om ett år av ditt liv, vilket skulle du välja?',
      'Vad skulle du göra med en helt tom söndag, ingen får veta något, inga konsekvenser?',
      'Vilken är den sämsta gåvan du någonsin gett någon?',
      'Om du fick välja en superkraft som var pinsamt opraktisk, vilken skulle det bli?',
      'Vilken åsikt har du som du vet är lite orimlig men ändå håller fast vid?',
      'Om du kunde äta middag med en version av dig själv från vilken ålder som helst, vilken skulle du välja?',
      'Vad är den minst romantiska sak någon har gjort som ändå smälte ditt hjärta?',
      'Vilken regel som du följer skulle ingen annan bry sig om ifall du bröt mot den?',
      'Om dina tankar hade en volymknapp, var skulle den vara just nu?',
      'Vilken plats i världen har du aldrig varit på men känner dig konstigt nostalgisk över?',
      'Vad är något du gjorde som barn som du fortfarande är hemligt stolt över?',
      'Om du fick radera en konversation ur ditt liv utan att ändra något annat, skulle du göra det?',
      'Om din dag hade en hemlig titel som ingen fick godkänna, vad skulle den vara?',
      'Vilket vanligt föremål borde be om ursäkt till dig?',
      'Om dina senaste 24 timmar var ett djur i fel habitat, vilket djur var det?',
      'Vilken av dina åsikter skulle låta mest misstänkt i domstol?',
      'Om en främling bara såg dina skor idag, vad skulle de gissa fel om dig?',
      'Vilken liten regel följer du som ingen har bett dig följa?',
      'Om du kunde lägga dagens humör i någons brevlåda, vem skulle få det?',
      'Vilken sak i ditt hem känns mest som en före detta optimist?',
      'Om en hiss spelade din inre monolog, vilken våning skulle alla gå av på?',
      'Vilken del av vuxenlivet känns fortfarande som en bluff?',
      'Om din vecka var en maträtt på en motorvägsrestaurang, vad skulle den heta?',
      'Vilken banal sanning borde ha dramatisk musik bakom sig?',
      'Om du fick byta plats med ett föremål i tio minuter, vilket skulle få ledigt?',
      'Vilken komplimang skulle låta som en förolämpning om fel person sa den?',
      'Om universum skickade en pushnotis till dig just nu, vad skulle det stå?',
      'Om din dag var en bortglömd pryl i en flyttlåda, vad skulle det vara för något?',
      'Vilken är den mest onödiga talang du önskar att du plötsligt vaknade upp med?',
      'Om du var tvungen att byta förnamn till en krydda, vilken skulle passa ditt humör idag?',
      'Vilken är den märkligaste platsen du har somnat på?',
      'Om du fick radera ett specifikt ord från svenska språket, vilket skulle ryka först?',
      'Vilket fiktivt universum skulle vara absolut värst att behöva sköta sin vardag i?',
      'Om ditt liv var en dokumentär, vilken kändis skulle göra den mest opassande berättarrösten?',
      'Vilken är den mest envisa myt om dig själv som du har slutat orka rätta?',
      'Om du kunde byta doft med ett valfritt bakverk för en dag, vad skulle du dofta?',
      'Vilken sak i ditt kylskåp speglar din personlighet bäst just nu?',
      'Om du fick starta en protestlista mot en helt obetydlig sak, vad skulle du protestera mot?',
      'Vilken typ av väder skulle du vilja förbjuda genom lagstiftning?',
      'Om du var en bakgrundskaraktär i en film, vad skulle din enda replik vara?',
      'Vilken historisk epok tror du att du skulle ha klarat dig sämst i?',
      'Om du fick ge ett enda föremål i ditt hem förmågan att prata, vilket skulle ha mest att säga?'
    ],

    rememberDay: [
      'Vad från idag skulle vara svårast att förklara för någon som inte var där?',
      'Vad är den första detaljen du skulle vilja minnas om sex månader?',
      'Om du skulle ta ett mentalt fotografi av dagen — vad skulle vara i bild?',
      'Vad sa någon idag som du inte vill glömma?',
      'Vilket ögonblick idag kändes ovanligt närvarande, även om det var kort?',
      'Vilken känsla i kroppen är starkast just nu — och vad hör den ihop med?',
      'Om dagen hade en doft, vilken skulle det vara?',
      'Vad gjorde idag annorlunda från igår, även om det knappt märktes?',
      'Vilket ljud förknippar du med idag?',
      'Vem mötte du idag som fortfarande finns kvar i minnet, även om det bara var ett ögonkast med en främling?',
      'Vilken måltid från idag minns du tydligast?',
      'Vilket litet ögonblick tror du att du kommer glömma först om vi inte fångar det nu?',
      'Om du blundar och tänker på dagen, vilken bild dyker upp först?',
      'Vad sa du högt idag som du är glad att du sa?',
      'Hur kändes dagens väder när du faktiskt var ute i det?',
      'Vilket plagg från idag säger mest om hur dagen började?',
      'Om dagen hade en huvudperson — du eller någon annan — vem skulle det vara?',
      'Vilken liten detalj från idag skulle få dig att sucka av igenkänning om tio år?',
      'Vilken tanke från precis innan du somnade igår natt följde med in i idag?',
      'Vilken syn, vilket ljud eller vilken känsla från idag fanns bara där i bakgrunden?',
      'Vilken färg hade ljuset när du först märkte att dagen var igång?',
      'Vad låg framme där du var mest under dagen?',
      'Vilken liten rörelse från någon annan vill du minnas?',
      'Vilket ljud från idag skulle räcka för att dra tillbaka hela scenen?',
      'Vad fanns precis bredvid dig när något viktigt eller nästan viktigt hände?',
      'Vilken lukt, även en ful, hör ihop med den här dagen?',
      'Vilken mening från idag skulle se konstig ut som textmeddelande utan sammanhang?',
      'Vilken plats från idag skulle du kunna rita slarvigt men känna igen direkt?',
      'Vad såg du genom ett fönster, en skärm eller en dörröppning idag?',
      'Vilken yta rörde du vid som kroppen kanske minns före huvudet?',
      'Vilket vädertecken vill du spara: jacka, vått hår, sol i ögonen eller något annat?',
      'Vilket ansikte från idag hade en min som säger mer än orden?',
      'Vad var det sista du lade märke till innan dagen började kännas över?',
      'Vilken detalj skulle du sakna om någon återberättade dagen för snabbt?',
      'Om du fick stoppa en sekund från idag i ett kuvert, vilken sekund skulle det bli?',
      'Hur föll ljuset i rummet vid den tidpunkt då dagen kändes som mest intensiv?',
      'Vilken specifik färg eller mönster på någons kläder fastnade i blicken idag?',
      'Vilken fysisk ansträngning, hur liten som helst, känns i musklerna just nu?',
      'Vad var det första du hörde när du klev utanför dörren imorse?',
      'Om du ser dig omkring just nu, vilken detalj i din närhet kommer du garanterat ha glömt imorgon?',
      'Hur kändes materialet i det viktigaste du höll i handen idag?',
      'Vilken var den exakta temperaturen i luften när du kände dig som mest nöjd idag?',
      'Vilket ansiktsuttryck hos en annan person vill du spara i ett arkiv för framtiden?',
      'Vad var den sista saken du ställde ner på ett bord innan du satte dig här?',
      'Vilken oväntad skugga eller spegling lade du märke till under dagen?',
      'Vilken typ av papper eller skärm har du vilat ögonen på mest idag?',
      'Om du tänker på dagens tempo, var det en dag som sprang eller en dag som kröp?',
      'Vilket småprat eller fragment av ett samtal i bakgrunden vill du minnas?',
      'Hur kändes skorna mot fötterna under dagens längsta promenad eller förflyttning?',
      'Vilken var den sista smaken du hade i munnen innan du bestämde dig för att skriva?'
    ],

    digInteresting: [
      'Okej, jag blir dagens gruvarbetare. Vad var det tråkigaste som hände idag — där brukar guldet ligga?',
      'Om du beskriver dagen som om ingenting hände, vilken detalj börjar ändå sticka ut?',
      'Vad var det mest meningslösa du gjorde idag? Vi börjar där.',
      'Vem såg du idag som du inte pratade med?',
      'Vad väntade du på idag, oavsett hur litet?',
      'Vilken tanke kom och gick idag utan att du följde upp den?',
      'Om du var antropolog och studerade din egen dag — vad skulle vara mest fascinerande?',
      'Vad gjorde du idag på autopilot som du faktiskt skulle kunna ifrågasätta?',
      'Vilket tillfälle idag fick dig att nästan säga något men låta bli?',
      'Vad har du undvikit idag som ändå tog plats i dagen?',
      'Vilket ögonblick idag passade inte in i berättelsen om hur dagen "skulle" vara?',
      'Vad gjorde du idag som du inte skulle erkänna i en jobbintervju?',
      'Vad såg du idag som du inte riktigt förstod?',
      'Vilken liten irritation idag avslöjade något om hur dagen fungerade?',
      'Vad blev inte som du tänkt dig idag — på ett intressant sätt, inte ett dåligt?',
      'Vem visade en sida idag som du inte väntat dig?',
      'Vad var det mest motsägelsefulla med dagen?',
      'Vilken vana märkte du av idag som du inte visste att du hade?',
      'När tänkte du en sak idag men gjorde en annan?',
      'Vad hände i bakgrunden av din dag medan du var fokuserad på något annat?',
      'Vilken rutin idag var egentligen en liten förhandling med dig själv?',
      'Vad gjorde du idag som verkade praktiskt men avslöjade något annat?',
      'Vilken tråkig stund hade bäst chans att bli intressant om vi zoomar in?',
      'Vilket väntande från idag säger mest om dagen?',
      'Vilken liten irritation var egentligen en karta över något större?',
      'När gjorde du något på autopilot som en utomstående skulle tycka var märkligt?',
      'Vilken detalj i bakgrunden störde ordningen lite?',
      'Vad försökte du effektivisera idag som vägrade bli effektivt?',
      'Vilken sak du ignorerade idag förtjänar egentligen en egen scen?',
      'Vilket ögonblick idag hade en undertext som ingen sa högt?',
      'Vad gjorde du idag som bara låter tråkigt tills man frågar varför?',
      'Vilken plats idag bar på mer stämning än handling?',
      'Vilken liten omväg, fysisk eller mental, tog du utan att planera den?',
      'Vilken grej från idag skulle bli rolig om man överanalyserade den skamlöst?',
      'Vad hände idag som först såg ut som ingenting men lämnade en rest?',
      'Vilken del av din morgonrutin genomförde du med minst entusiasm idag?',
      'Vad var det mest vardagliga du såg idag som plötsligt kändes som konst?',
      'Vilken liten sak har du skjutit upp till imorgon utan att egentligen ha en bra anledning?',
      'När kände du dig som mest lik — eller olik — din vanliga bild av dig själv idag?',
      'Vilken teknisk pryl har irriterat dig mest med sin blotta existens idag?',
      'Vad var det för något du lade märke till idag som du brukar gå förbi utan att se?',
      'Vilket ögonblick av tystnad idag var faktiskt ganska talande?',
      'Vad gissade du om den mest anonyma människan du interagerade med idag?',
      'Vilken av dagens små uppgifter kändes som ett onödigt hinder?',
      'När använde du senast ett ord eller en fras idag som du egentligen inte gillar?',
      'Vilken liten detalj i ditt hem eller på din arbetsplats har hamnat snett utan att du orkat rätta till den?',
      'Vad gjorde du idag bara för att det förväntades av dig, snarare än att du ville?',
      'Vilken tanke har du brottats med idag som egentligen inte leder någonstans?',
      'Vilken del av dagens autopilot skulle du vilja stänga av om du fick chansen?',
      'Vad var det för anspråkslös sak som hände idag som du ändå känner ett behov av att sätta ord på?'
    ]
  },

  journalist: {
    tips: [
      'Börja med personerna. Vem är huvudpersonen i din dag idag?',
      'Vi tar det som en scen — var befann du dig när dagen blev som mest dig själv?',
      'Ge mig ett citat. Vad sa någon idag som du fortfarande hör i huvudet?',
      'Om en reporter ringde nu, vilken händelse från idag skulle hen vilja höra mer om?',
      'Var börjar vi — vid frukosten, på vägen ut, eller direkt i dagens första samtal?',
      'Jag vill ha detaljer. Vad hade du på dig när något viktigt hände idag?',
      'Ta mig tillbaka till ett rum. Hur såg det ut, och vad luktade det där?',
      'Om vi skulle bygga reportaget kring en enda scen, vilken scen väljer vi?',
      'Ge mig en tidpunkt. När idag skedde det mest anmärkningsvärda?',
      'Vi kan börja med en lista. Vilka personer har du pratat med idag?',
      'Börja med platsen. Var har du tillbringat mest tid idag?',
      'Vi tar det kronologiskt en stund. Vad gjorde du först när du klev ut genom dörren?',
      'Ge mig en rubrik. Vilket är dagens största nyhet — i din vardag?',
      'Börja med en replik som fastnade. Vem sa den, och hur lät rösten?',
      'Vi tar fem W:n. Vem, vad, var, när — välj ett att börja med.',
      'Peka på dagens viktigaste namn. Vem dyker upp oftast i historien om idag?',
      'Ge mig en sak du såg, en sak du hörde, en sak du tänkte. Vilken av dem börjar vi med?'
    ],

    unexpectedQuestion: [
      'Vem såg dig senast på ett sätt som du tror att du missuppfattade?',
      'Vilket rum har du varit i flest minuter den här veckan, och vad står på dess bord?',
      'Om en fotograf följt dig idag — vilken bild skulle hen publicerat först?',
      'Vad exakt åt du senast, och minns du hur det såg ut på tallriken?',
      'Vilket samtal idag skulle bli intressantast om det spelades in utan din vetskap?',
      'Vem i ditt liv har du senast skickat ett meddelande till där du valde ord extra noga?',
      'Om jag fick intervjua en person i ditt liv om dig — vem skulle ge det mest ärliga svaret?',
      'Vilken av dina vardagsrutiner skulle låta absurd om den beskrevs i en tidningsartikel?',
      'Ge mig ett exakt klockslag idag — och berätta vad som hände just då.',
      'Vilken är den sista fysiska plats du besökte där du inte kände någon annan?',
      'Vem var den första personen du hörde prata idag, och vad var det första ordet?',
      'Vilket föremål i ditt hem har flyttats mest idag utan att du tänkt på det?',
      'Om jag bad dig beskriva en kollega, vän eller granne i två meningar — vem väljer du?',
      'Vilken konkret summa pengar har du spenderat idag som du tänkt efteråt att det var onödigt?',
      'Vad har du läst eller sett idag som du skulle vilja fråga källan om?',
      'Vilken skylt, affisch eller rubrik har du tittat på idag utan att läsa klart?',
      'Vem från dagens bakgrund — en kassörska, en chaufför, en förbigående — hade värt en egen artikel?'
    ],

    rememberDay: [
      'Vi bygger arkivet. Vilken konkret detalj från idag vill du absolut inte förlora?',
      'Ge mig namnen. Vem var med dig under dagens viktigaste ögonblick?',
      'Vilken plats från idag skulle vara svårast att rita utan att missa något avgörande?',
      'Vad exakt sa någon till dig idag — ord för ord om du kan?',
      'Vilken tid på dagen var ljuset som mest specifikt, och hur föll det?',
      'Om vi skulle dokumentera en enda minut av idag i detalj, vilken minut väljer vi?',
      'Vilken sensorisk detalj — ljud, lukt, temperatur — är mest specifik för just idag?',
      'Ge mig en kvitto- eller notisrad från telefonen. Vad berättar den om dagen?',
      'Vilken kropp-till-kropp-kontakt, hur liten som helst, vill du fästa i minnet från idag?',
      'Vad bar du på kroppen idag som du aldrig riktigt tänker på annars?',
      'Vilken bakgrundsdetalj under en scen idag skulle du helst vilja kunna zooma in på?',
      'Om vi skulle skriva dagens transkript — vilket samtal börjar vi med?',
      'Beskriv dagens första fem minuter så exakt du kan minnas dem.',
      'Vilken exakt mening, skriven eller talad, vill du spara från idag?',
      'Vem bar vilka kläder idag, och vilket plagg minns du bäst?',
      'Vilket klockslag idag skulle det vara synd att ha glömt om fem år?',
      'Vilka tre konkreta föremål fanns inom en meter från dig när dagen kändes som mest intensiv?'
    ],

    digInteresting: [
      'Vi letar efter motsägelsen. Vad sa någon idag som inte riktigt stämde med det de gjorde?',
      'Vilken vinkel har du missat i din egen dag? Vilken sida har du inte berättat än?',
      'Ge mig en person som uppförde sig annorlunda än vanligt idag — även marginellt.',
      'Var fanns det en paus idag, en stillhet mitt i något — och vad hände i den pausen?',
      'Vilket konkret faktum från dagen skulle chocka någon som bara hörde rubriken?',
      'Vem sa något idag som du instinktivt tänkte "det där ska jag gräva i senare"?',
      'Vilken detalj i din omgivning idag var där tidigare utan att du märkt det?',
      'Vilket beslut fattade du idag där du fortfarande inte är säker på varför?',
      'Vad gjorde någon idag som stack ut ur mönstret, hur liten avvikelsen än var?',
      'Vilket samtal bröts innan ämnet var klart — och vilket ämne var det?',
      'Ge mig den hemligaste detaljen i dagens mest öppna rum.',
      'Vilken siffra eller statistik från idag skulle vara mest avslöjande om någon fick se den?',
      'Var finns sprickan i den officiella versionen av hur dagen gick?',
      'Vem i din dag idag bär på en bakgrundshistoria som du aldrig fått höra?',
      'Vilken ljudbakgrund under dagen innehöll något du först nu lägger märke till?',
      'Vilken detalj skulle en främling fastna vid först om hen läste en ärlig beskrivning av din dag?',
      'Vad har du idag accepterat som självklart — men som vid närmare granskning inte alls är det?'
    ]
  },

  therapist: {
    tips: [
      'Ingen brådska. Vad landar i dig nu när jag bara frågar?',
      'Vi behöver inte ha en plan. Var märker du att du bär dagen i kroppen just nu?',
      'Om du bara lyssnar inåt en stund — vad vill du börja med?',
      'Vi kan börja var du vill. Vad drar dig först?',
      'Finns det något från idag som ligger och väntar på lite utrymme?',
      'Vi kan ta det långsamt. Vilken känsla är tydligast just nu?',
      'Om du blundar en sekund — vilken bild från dagen kommer först?',
      'Vi behöver ingen sammanfattning. Vilken detalj vill ha din uppmärksamhet just nu?',
      'Vad i dagen känns oavslutat, även om det är smått?',
      'Börja med det som väger mest — stort eller litet spelar ingen roll.',
      'Vi kan utgå från kroppen. Var i dig känns dagen tydligast?',
      'Vad har du burit på idag som du inte riktigt satt ord på än?',
      'Vilken känsla återkommer idag, även om den bara viskar i bakgrunden?',
      'Vi tar det i din takt. Vad är det du vill lägga ner först?',
      'Ingen fråga behöver svaras på direkt. Vad dröjer sig kvar från dagen?',
      'Du får fylla tystnaden när du vill. Var vill du börja?',
      'Om du låter axlarna sjunka en stund — vad stiger upp då?'
    ],

    unexpectedQuestion: [
      'Vad är det du sällan frågar dig själv men ändå alltid vet svaret på?',
      'Om din kropp fick en röst idag, vad skulle den vilja säga först?',
      'Finns det en känsla som följt dig idag utan att du gett den ett namn?',
      'Vad har du inte sagt högt idag som ändå tog plats i dig?',
      'Om du fick sitta tyst med en person idag, vem skulle du välja — utan att förklara varför?',
      'Vilket litet behov har du burit idag utan att låta någon annan märka?',
      'Var i dagen kände du dig mest dig själv?',
      'Vilken tanke har återkommit idag som du inte riktigt vet vart du ska göra av?',
      'Vad gör du när ingen ser — inte i hemlighet, utan bara av ren vana?',
      'Om du fick vara helt osedd en timme idag, vad skulle du ha gjort?',
      'Vilken version av dig själv har saknat utrymme idag?',
      'Vad skulle du säga till den du var för ett år sen om du träffade hen just nu?',
      'Vad har känts för tyst och vad har känts för högt idag?',
      'Finns det något du längtat efter idag utan att själv veta det?',
      'Vilket ögonblick idag var du stilla fast allting runt omkring rörde sig?',
      'Vad i dig har väntat på att få komma fram idag?',
      'Om du lyssnar inåt nu — vilken mening formar sig där utan att du försöker?'
    ],

    rememberDay: [
      'Vad i idag vill du bära vidare även om detaljerna suddas ut?',
      'Vilken känsla är starkast just nu, och vill du stanna i den en stund?',
      'Hur kändes det i kroppen när dagen var som mest närvarande?',
      'Om du fick förvara en enda känsla från idag i något säkert — vilken skulle du välja?',
      'Vilken del av idag är du glad över att du inte rusade förbi?',
      'Vad i dagen förtjänar att du stannar upp och faktiskt ger det plats?',
      'Vilken liten rörelse i dig skedde idag som du vill ge utrymme i minnet?',
      'Om du bara fick ta med en stämning från idag — vilken vore det?',
      'Vilket ögonblick idag fick dig att andas djupare?',
      'Vad landade i dig som sant idag, även om du inte sa det högt?',
      'Vilken kroppslig känsla vill du ankra fast från idag?',
      'Hur kändes det när dagen började, djupt inne?',
      'Finns det ett ögonblick idag du vill återvända till i tanken senare?',
      'Vilken värme eller vilken tyngd vill du låta följa med in i kvällen?',
      'Vad vill du att ditt framtida jag ska veta om hur det kändes att vara du idag?',
      'Om du skulle lägga en enda detalj i ett minne som aldrig bleknar — vilken?',
      'Vilket lugn, hur kort det än varade, vill du minnas från idag?'
    ],

    digInteresting: [
      'Vilken liten känsla ville få mer plats idag men fick det inte?',
      'Var i dagen märkte du att du höll något tillbaka?',
      'Vilken förbi-passerande tanke idag bar något viktigt?',
      'Vad var där under ytan idag, även om du inte gick ner till den?',
      'Vilken fråga från dig själv ignorerade du idag?',
      'Var kändes det skavigt idag på ett sätt du inte riktigt förstod?',
      'Vilken reaktion överraskade dig hos dig själv idag?',
      'Vad väckte en känsla som var större än situationen?',
      'Vilken liten tystnad idag sa något som orden inte hann med?',
      'När idag kändes det som att du skyndade förbi något du egentligen ville stanna i?',
      'Vad i dagen fick dig att dra efter andan, även kort?',
      'Vilken självklarhet idag är kanske inte självklar när du tittar igen?',
      'Vad rörde vid något gammalt i dig idag?',
      'Var i dagen fanns det en öppning du inte tog?',
      'Vilken känsla fick vara med hela dagen utan att du ville kännas vid den?',
      'Vad har du idag lämnat osagt som fortfarande ligger och bultar svagt?',
      'Vilken del av idag har du försökt tänka bort men inte riktigt lyckats med?'
    ]
  }
} as const;

/**
 * Pick a random opener for a given interviewer + starter. Pure function —
 * pass `Math.random` (or a seeded RNG in tests) to keep this deterministic
 * when needed.
 */
export function pickOpener(
  interviewer: InterviewerId,
  starter: StarterId,
  rng: () => number = Math.random
): string {
  const pool = INTERVIEW_OPENERS[interviewer][starter];
  const index = Math.floor(rng() * pool.length);
  return pool[index];
}
