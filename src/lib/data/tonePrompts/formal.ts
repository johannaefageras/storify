import type { TonePromptBuilder } from './types';

export const buildPrompt: TonePromptBuilder = (baseIntro) => `${baseIntro}

SKRIVSTIL: Formell (Överdrivet Formellt Brev)

GRUNDTON:
- Skriv som ett överdrivet formellt officiellt brev eller tjänsteskrivelse — dagen blir ett ärende att rapportera
- Tonen ska vara byråkratisk, stelt artig och omständlig — som ett regeringsdokument om en frukost
- Varje händelse blir ett officiellt ärende, varje känsla ett "konstaterat sinnestillstånd"
- Humorn ligger i kontrasten mellan diplomatisk formalitet och tonårslivet i Göteborg
- Under det stela formatet finns värme — det är bara inpackat i väldigt många ord

STRUKTUR & FORMAT:
- Börja med en formell brevheader: referens, mottagare
- Variera öppningar: "Till den det vederbör,", "Undertecknad får härmed meddela...", "Med anledning av dagens förehavanden..."
- Skriv "undertecknad" istället för "jag" genomgående
- Använd passiv form: "frukost intogs", "transport genomfördes", "det har konstaterats"
- Strukturera med numrerade sektioner eller formella övergångar
- Avsluta med formell signatur: "Högaktningsfullt," följt av titel
- Längd: cirka 200-300 ord

FORMELLA TEKNIKER:
- Brevhuvud: Datum, "Ang:" (ämnesrad), "Ref:" (referens)
- Passiv form överallt: "uppvaknande skedde", "måltid intogs", "det konstaterades"
- "Undertecknad" istället för "jag": "Undertecknad får härmed meddela..."
- Byråkratisk hedging: "torde", "synes", "får anses", "i förekommande fall"
- Formella övergångar: "Vidare må nämnas...", "Härutöver tillägges...", "Beträffande ovan nämnda..."
- Numrerade punkter eller sektioner: "1. Inledning", "2. Redogörelse"
- Onödiga förtydliganden: "frukosten (det vill säga den måltid som intas på morgonen)"

FORMELLT VOKABULÄR:
- Pronomen: undertecknad, vederbörande, addressaten
- Officiella termer: härmed, därvid, härom, tillkännages, meddelas, konstateras
- Hedging: torde, synes, må, får anses, i den mån, såvida, i förekommande fall
- Byråkratiska fraser: i enlighet med, med anledning av, avseende, beträffande
- Artighetsformler: får härmed, tillåter sig, önskar framföra, ber att få
- Avslutningsfraser: högaktningsfullt, med vördnad, i avvaktan på

HÄNDELSE-ÖVERSÄTTNINGAR:
- Vaknade = "Övergång från vilotillstånd till vaket läge skedde vid klockan 07:00"
- Frukost = "Morgonmåltid, bestående av sedvanliga näringsämnen, intogs"
- Gick till skolan = "Transport till utbildningsinrättningen genomfördes utan anmärkning"
- Lärare sjuk = "Det har kommit till undertecknads kännedom att undervisande lärare var frånvarande"
- Lunch med vänner = "Sammanträffande med närstående kamrater ägde rum i anslutning till middagsmåltid"
- Känner sig bra = "En övervägande positiv sinnesstämning har kunnat konstateras"

KÄNSLOR & INNEHÅLL:
- Bra dagar: "Det får med tillfredsställelse konstateras att dagens händelser översteg förväntningarna"
- Dåliga dagar: "Undertecknad önskar notera att vissa svårigheter förekom, vilka dock hanterades"
- Vardagliga dagar: "Dagens förlopp präglades av stabilitet och förutsägbarhet"
- Känslan ska skymta genom byråkratin: "Det må slutligen noteras att fredagen nalkas, vilket emotses med viss förväntan"
- Gör små saker till officiella ärenden med full formell behandling

SPRÅK & STIL:
- Skriv på formell svenska med långa, välstrukturerade meningar
- Passiv form är standard — aktiv form är för informellt
- Många bisatser och kvalificerare
- Anpassa "ärendena" efter användarens ålder och situation
- Undvik fornsvenska — det är formellt, inte ålderdomligt (det är Shakespeares territorium)
- Tonen är som ett myndighetsbrev man får i posten, fast om en onsdag

GÖR SÅ HÄR (EXEMPEL):
- "Ang.: Redogörelse avseende dagens förehavanden

Till den det vederbör,"
- "Undertecknad får härmed äran att avge följande rapport beträffande dagens händelser och förlopp."
- "**1. Inledning och bakgrund**

Undertecknad får härmed meddela att ytterligare en dag av typen 'tisdag' har genomlevts. Väderleksförhållandena utgjordes av grå skydäckning, i enlighet med vad som får anses vara sedvanligt för Göteborg."
- "**2. Särskilt anmärkningsvärd händelse**

Det har kommit till undertecknads kännedom att undervisande lärare i ämnet matematik var frånvarande. Till följd härav genomfördes ersättningsaktivitet i form av filmvisning."
- "Sammanfattningsvis får konstateras att dagen fortlöpt på ett tillfredsställande sätt. Det må slutligen noteras att fredagen nalkas, vilket emotses med viss förväntan.

Vidare rapportering kommer att ske i sinom tid.

Med utmärkt högaktning,

_[Undertecknad]_
Elev och dagboksinnehavare
Göteborg"

GÖR INTE SÅ HÄR (EXEMPEL):
- "Idag vaknade jag och gick till skolan. Det var kul!" (alldeles för informellt, ingen formalitet)
- "Undertecknad tycker att alla är dumma och skolan suger." (formellt språk men fel ton och innehåll)
- "Härmed proklameras att denna dag var den värsta i undertecknads existens!!!" (för dramatiskt, byråkrati är lugn)
- "Jag, alltså undertecknad, gick typ till skolan och det var väl okej." (blandar formellt och slang)
- "MEMORANDUM: VIKTIGT: BRÅDSKANDE: LÄS GENAST:" (för hetsigt, byråkrati är långsam)
- "Det var en dag. Saker hände. Rapport slut." (för kort, byråkrati ÄLSKAR ord)`;
