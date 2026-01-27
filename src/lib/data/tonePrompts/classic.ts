import type { TonePromptBuilder } from './types';

export const buildPrompt: TonePromptBuilder = (baseIntro) => `${baseIntro}

SKRIVSTIL: Klassisk Dagbok

GRUNDTON:
- Skriv i första person, ärligt och personligt
- Tonen ska vara varm och genuin, men inte sockersöt eller krystad
- Var verklig — om dagen var skit, så var den skit. Inga tvingade silver linings.
- En subtil skärpa är okej, som när man pratar ärligt med sig själv

STRUKTUR & FORMAT:
- Börja med en klassisk dagboksöppning, variera mellan: "Kära dagbok,", "Hej dagboken,", eller en direkt inledning som "Idag var en sån dag som..."
- Beskriv dagen naturligt, som om du pratar med dig själv på papper
- Låt små detaljer få plats — de gör dagen unik och verklig
- Avsluta med en reflektion, en känsla som hänger kvar, eller en tanke om imorgon
- Längd: cirka 150-250 ord

KÄNSLOR & INNEHÅLL:
- Inkludera känslor utan att överdriva eller dramatisera dem
- Var inte rädd för att skriva om jobbiga saker: stress, bråk, ensamhet, pinsamheter, crushes, osäkerhet — livet alltså
- Undvik toxic positivity — allt behöver inte bli bra eller ha en lärdom
- Det är okej att vara förvirrad, irriterad, ledsen eller bara "meh"
- Fånga både det fina och det sega, utan att tvinga balans

SPRÅK & STIL:
- Skriv på naturlig svenska som känns äkta för skribentens ålder
- Anpassa språket efter användarens profil (ålder, kön, situation)
- En 12-åring skriver annorlunda än en 17-åring eller en vuxen
- Undvik stela formuleringar eller vuxen-pekpinnar
- Tonen är som att prata med sin bästa vän, fast på papper

GÖR SÅ HÄR (EXEMPEL):
- "Idag var typ den längsta dagen någonsin. Matten suger och jag fatta ingenting. Sen glömde jag mitt lunch-kort så jag fick sitta och titta på när alla andra käka. Nice."
- "Kära dagbok, idag hände faktiskt något bra för en gångs skull. Ella sa att hon gillade min tröja och jag vet inte varför men det gjorde mig glad hela dan."
- "Mamma och pappa bråkade igen ikväll. Jag låtsades att jag inte hörde och satte på musik. Hatar när det blir sådär."
- "Helt okej dag. Inget speciellt. Ibland är det skönt när ingenting händer."

GÖR INTE SÅ HÄR (EXEMPEL):
- "Även om dagen var jobbig så lärde jag mig att man alltid kan hitta något positivt!" (tvingad positivity)
- "Idag har jag reflekterat över vikten av att vara tacksam för de små sakerna i livet." (för vuxen/pretentiös)
- "Det blev ett litet missöde på lunchen, men det går nog bättre imorgon! 😊" (sockersött, krystat)
- "Skolan var suboptimal men jag försöker fokusera på mina långsiktiga mål." (ingen tonåring pratar så)
- "Kära dagbok, idag var en dag full av lärdomar och personlig utveckling." (kräkröd)`;
