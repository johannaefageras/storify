import type { WizardData, UserProfile } from '$lib/stores/wizard.svelte';
import { getZodiacFromBirthday, getAgeFromBirthday } from '$lib/utils/zodiac';
import emojiMeanings from '$lib/data/emojiMeanings.json';
import type { ToneId } from '$lib/data/tonePrompts/types';

/**
 * Tone metadata for addon instructions.
 * Defines language and style summary for each tone so that addon content
 * (horoscope, historical events) matches the main diary entry's voice.
 */
interface ToneMetadata {
	language: 'swedish' | 'english';
	styleSummary: string;
}

const toneMetadata: Record<ToneId, ToneMetadata> = {
	classic: {
		language: 'swedish',
		styleSummary: 'varm, personlig och reflekterande'
	},
	storytelling: {
		language: 'swedish',
		styleSummary: 'berättande och målande, som en saga'
	},
	philosophical: {
		language: 'swedish',
		styleSummary: 'eftertänksam och filosofisk'
	},
	sportscaster: {
		language: 'swedish',
		styleSummary: 'energisk sportkommentator med dramatik'
	},
	'cat-perspective': {
		language: 'swedish',
		styleSummary: 'ur en katts arroganta och nyfikna perspektiv'
	},
	cynical: {
		language: 'swedish',
		styleSummary: 'cynisk och sarkastisk med mörk humor'
	},
	'drama-queen': {
		language: 'swedish',
		styleSummary: 'överdrivet dramatisk med STORA KÄNSLOR'
	},
	meme: {
		language: 'swedish',
		styleSummary: 'meme-humor och internetspråk'
	},
	cringe: {
		language: 'swedish',
		styleSummary: 'pinsam och överdrivet entusiastisk'
	},
	british: {
		language: 'english',
		styleSummary: 'British understatement, dry wit, and reserved observation. Use British English spelling (colour, favourite, realise)'
	},
	'quest-log': {
		language: 'swedish',
		styleSummary: 'som en quest-log i ett RPG-spel'
	},
	bored: {
		language: 'swedish',
		styleSummary: 'uttråkad och likgiltig'
	},
	'nature-documentary': {
		language: 'swedish',
		styleSummary: 'som David Attenborough i en naturdokumentär'
	},
	therapist: {
		language: 'swedish',
		styleSummary: 'empatisk och stöttande som en terapeut'
	},
	'ai-robot': {
		language: 'swedish',
		styleSummary: 'som en robot som försöker förstå människor'
	},
	shakespeare: {
		language: 'swedish',
		styleSummary: 'teatralisk och poetisk i Shakespearesk stil'
	},
	tabloid: {
		language: 'swedish',
		styleSummary: 'som en sensationell kvällstidning'
	},
	formal: {
		language: 'swedish',
		styleSummary: 'formell och professionell'
	},
	troubadour: {
		language: 'swedish',
		styleSummary: 'som en medeltida trubadur med rim och vers'
	},
	nerd: {
		language: 'swedish',
		styleSummary: 'nördig med referenser och fakta'
	},
	'tinfoil-hat': {
		language: 'swedish',
		styleSummary: 'konspirationsteoretisk och paranoid'
	},
	'self-help': {
		language: 'swedish',
		styleSummary: 'som en motiverande självhjälpsbok'
	},
	detective: {
		language: 'swedish',
		styleSummary: 'som en noir-detektiv som utreder dagen'
	},
	'passive-aggressive': {
		language: 'swedish',
		styleSummary: 'passiv-aggressiv med undertoner'
	},
	melodramatic: {
		language: 'swedish',
		styleSummary: 'överdrivet melodramatisk och känslosam'
	},
	chaotic: {
		language: 'swedish',
		styleSummary: 'kaotisk och osammanhängande'
	},
	bureaucratic: {
		language: 'swedish',
		styleSummary: 'byråkratisk och formell som ett myndighetsdokument'
	},
	overthinker: {
		language: 'swedish',
		styleSummary: 'övertänkande med många parenteser och sidonoteringar'
	}
};

/**
 * Get metadata for a tone, with fallback to classic.
 */
export function getToneMetadata(toneId: string): ToneMetadata {
	return toneMetadata[toneId as ToneId] || toneMetadata.classic;
}

export function formatProfileForPrompt(profile: UserProfile): string {
	const lines: string[] = [];

	if (profile.name) {
		lines.push(`Namn: ${profile.name}`);
	}
	if (profile.birthday) {
		const age = getAgeFromBirthday(profile.birthday);
		if (age !== null) {
			lines.push(`Ålder: ${age} år`);
		}
	}
	if (profile.hometown) {
		lines.push(`Bor i: ${profile.hometown}`);
	}
	if (profile.occupationDetail.length > 0) {
		lines.push(`Sysselsättning: ${profile.occupationDetail.join(', ')}`);
	}
	if (profile.family.length > 0) {
		lines.push(`Familj: ${profile.family.join(', ')}`);
	}
	if (profile.pets.length > 0) {
		lines.push(`Husdjur: ${profile.pets.join(', ')}`);
	}
	if (profile.interests.length > 0) {
		lines.push(`Intressen: ${profile.interests.join(', ')}`);
	}

	if (lines.length > 0) {
		return `OM SKRIBENTEN:\n${lines.join('\n')}`;
	}
	return '';
}

export function formatWizardDataForPrompt(data: WizardData): string {
	const sections: string[] = [];

	// Profile info (if any)
	const profileSection = formatProfileForPrompt(data.profile);
	if (profileSection) {
		sections.push(profileSection);
		sections.push(''); // Empty line separator
	}

	// Date info
	sections.push(`DAGENS INFORMATION:`);
	sections.push(`Datum: ${data.weekday} ${data.date}`);

	// Location (auto-detected via geocoding)
	if (data.locationName) {
		sections.push(`Plats: ${data.locationName}`);
	}

	// Weather (auto-detected from user's location)
	if (data.weather) {
		sections.push(`Väder: ${data.weather.temperature}°C, ${data.weather.description}`);
	}

	// Emojis that represent the day (with rich meanings for AI)
	if (data.emojis.length > 0) {
		const emojiDescriptions = data.emojis
			.map((emojiId) => {
				const emoji = emojiMeanings[emojiId as keyof typeof emojiMeanings];
				if (emoji) {
					return `- ${emoji.name}: ${emoji.meaning}`;
				}
				return `- ${emojiId}`;
			})
			.join('\n');
		sections.push(`Dagens känsla (emojis):\n${emojiDescriptions}`);
	}

	// Energy levels
	sections.push(`Sömn: ${data.sleepQuality}/10`);
	sections.push(`Energi: ${data.energyLevel}/10`);
	sections.push(`Humör: ${data.mood}/10`);

	// Locations
	const allLocations = [...data.locations, ...data.customLocations].filter(Boolean);
	if (allLocations.length > 0) {
		sections.push(`Platser: ${allLocations.join(', ')}`);
	}

	// Activities
	const allActivities = [...data.activities, ...data.customActivities].filter(Boolean);
	if (allActivities.length > 0) {
		sections.push(`Aktiviteter: ${allActivities.join(', ')}`);
	}

	// People
	if (data.people.length > 0) {
		sections.push(`Personer: ${data.people.join(', ')}`);
	}

	// Wins
	const wins = data.wins.filter((w) => w.trim());
	if (wins.length > 0) {
		sections.push(`Bra saker/vinster: ${wins.join('; ')}`);
	}

	// Frustrations
	const frustrations = data.frustrations.filter((f) => f.trim());
	if (frustrations.length > 0) {
		sections.push(`Motgångar/frustration: ${frustrations.join('; ')}`);
	}

	// Reflections (optional fields)
	if (data.almostHappened?.trim()) {
		sections.push(`Nästan hände: ${data.almostHappened}`);
	}
	if (data.unnecessaryThing?.trim()) {
		sections.push(`Onödig sak jag gjorde: ${data.unnecessaryThing}`);
	}
	if (data.wouldRedo?.trim()) {
		sections.push(`Skulle göra om: ${data.wouldRedo}`);
	}

	// Food
	const allMeals = [...data.meals, ...data.customMeals].filter(Boolean);
	if (allMeals.length > 0) {
		sections.push(`Mat: ${allMeals.join(', ')}`);
	}

	// Soundtrack
	const allSoundtracks = [...data.soundtracks, ...data.customSoundtracks].filter(Boolean);
	if (allSoundtracks.length > 0) {
		sections.push(`Musik/ljud: ${allSoundtracks.join(', ')}`);
	}

	// Time capsule memory
	if (data.memoryFor10Years?.trim()) {
		sections.push(`Minne att spara (tidskapsel): ${data.memoryFor10Years}`);
	}

	// Message to future self
	if (data.messageToFutureSelf?.trim()) {
		sections.push(`Meddelande till framtida jag: ${data.messageToFutureSelf}`);
	}

	// Horoscope info (if enabled)
	if (data.includeHoroscope && data.profile.birthday) {
		const zodiac = getZodiacFromBirthday(data.profile.birthday);
		if (zodiac) {
			sections.push('');
			sections.push(`HOROSKOP:`);
			sections.push(`Stjärntecken: ${zodiac.name} (${zodiac.symbol})`);
		}
	}

	return sections.join('\n');
}

export function buildOnThisDayInstructions(dateString: string, toneId?: string): string {
	const metadata = getToneMetadata(toneId || 'classic');
	const isEnglish = metadata.language === 'english';

	if (isEnglish) {
		return `

---

"ON THIS DAY" SECTION:

After the diary entry (and horoscope if included), add a SEPARATE section with the heading "On this day..." (with an appropriate emoji like 📜 or 🗓️).

IMPORTANT: Write this section in ENGLISH, matching the diary's language and tone.
Apply the same writing style as the main entry: ${metadata.styleSummary}

THE SECTION SHOULD:
- Mention 1-2 interesting historical events that occurred on this date (${dateString})
- Be factual – only use real historical events you're certain about
- Be brief and concise (2-4 sentences)
- Match the tone and style of the main diary entry
- Connect the event to something in today's diary if it fits naturally

EXAMPLE (in British tone):
- "📜 On this day in 1969, Neil Armstrong took humanity's first step on the moon. Not quite as monumental as getting out of bed this morning, but rather historic nonetheless."
- "🗓️ On this day in 1912, the Titanic sank. Unlike one's mood today, which seems to be floating along quite nicely."

DO NOT:
- Make up events – only use facts you're certain about
- Be too long or detailed
- Force a connection to today's events if it doesn't fit naturally`;
	}

	return `

---

"PÅ DENNA DAG"-TILLÄGG:

Efter dagboksinlägget (och eventuellt horoskop), lägg till ett SEPARAT avsnitt med rubriken "På denna dag..." (gärna med en passande emoji som 📜 eller 🗓️).

VIKTIGT: Skriv detta avsnitt med SAMMA ton och stil som dagboksinlägget.
Använd stilen: ${metadata.styleSummary}

AVSNITTET SKA:
- Nämna 1-2 intressanta historiska händelser som inträffade på detta datum (${dateString})
- Vara faktabaserat – använd verkliga historiska händelser
- Gärna inkludera en svensk koppling om möjligt, men internationella händelser är också bra
- Vara kort och koncist (2-4 meningar)
- Matcha tonen och stilen i huvuddagboken
- Gärna koppla händelsen till något i dagens dagbok om det passar naturligt

EXEMPEL PÅ BRA "PÅ DENNA DAG":
- "📜 På denna dag 1969 tog Neil Armstrong mänsklighetens första steg på månen. Kanske inte lika stort som ditt steg ut ur sängen idag, men ändå historiskt."
- "🗓️ Den här dagen 1912 sjönk Titanic. Till skillnad från ditt humör idag som verkar flyta på fint."

GÖR INTE:
- Hitta på händelser – använd bara fakta du är säker på
- Var inte för lång eller detaljerad
- Tvinga inte en koppling till dagens händelser om det inte passar`;
}

export function buildHoroscopeInstructions(zodiacName: string, toneId?: string): string {
	const metadata = getToneMetadata(toneId || 'classic');
	const isEnglish = metadata.language === 'english';

	// Map Swedish zodiac names to English
	const zodiacNameEnglish: Record<string, string> = {
		Väduren: 'Aries',
		Oxen: 'Taurus',
		Tvillingarna: 'Gemini',
		Kräftan: 'Cancer',
		Lejonet: 'Leo',
		Jungfrun: 'Virgo',
		Vågen: 'Libra',
		Skorpionen: 'Scorpio',
		Skytten: 'Sagittarius',
		Stenbocken: 'Capricorn',
		Vattumannen: 'Aquarius',
		Fiskarna: 'Pisces'
	};

	if (isEnglish) {
		const englishZodiac = zodiacNameEnglish[zodiacName] || zodiacName;
		return `

---

HOROSCOPE SECTION:

After the diary entry, add a SEPARATE section with the heading "Horoscope for ${englishZodiac}" (with an appropriate emoji).

IMPORTANT: Write this section in ENGLISH, matching the diary's language and tone.
Apply the same writing style as the main entry: ${metadata.styleSummary}

THE HOROSCOPE SHOULD:
- Be based on today's events and feelings from the diary
- Match the tone and style of the main diary entry (understated, dry wit)
- Be personal and connected to what actually happened today
- Include a positive or encouraging touch without being over the top
- Be 2-4 sentences long
- Include some "cosmic" language, like "the stars suggest..." or "the universe appears to..."

EXAMPLE (in British tone):
- "The stars observed your efforts today and were, one might say, moderately impressed. Venus is in a position that suggests an unexpected compliment may be forthcoming. Rather nice, if true."
- "The universe took note of your persistence today. The cosmic energy tends to reward such stubbornness – one might expect a small victory in the coming week. Nothing too dramatic, of course."

DO NOT:
- Write generic horoscopes that could apply to anyone
- Write about things that didn't happen or weren't mentioned today
- Be too serious or mystical
- Use clichés like "love awaits around the corner" unless it fits the context`;
	}

	return `

---

HOROSKOP-TILLÄGG:

Efter dagboksinlägget, lägg till ett SEPARAT avsnitt med rubriken "Horoskop för ${zodiacName}" (gärna med en passande emoji).

VIKTIGT: Skriv detta avsnitt med SAMMA ton och stil som dagboksinlägget.
Använd stilen: ${metadata.styleSummary}

HOROSKOPET SKA:
- Vara baserat på dagens händelser och känslor från dagboken
- Matcha tonen och stilen i huvuddagboken
- Vara personligt och kopplat till det som faktiskt hänt idag
- Innehålla en positiv eller uppmuntrande touch utan att vara krystat
- Vara 2-4 meningar långt
- Gärna inkludera lite "kosmisk" språkdräkt, som "stjärnorna antyder..." eller "universum vill..."

EXEMPEL PÅ BRA HOROSKOP:
- "Stjärnorna såg din insats idag och var imponerade. Venus står i en position som antyder att du snart kommer få ett oväntat komplimang."
- "Universum noterade att du inte gav upp. Den kosmiska energin belönar envishet – förvänta dig en liten seger i veckan som kommer."

GÖR INTE:
- Skriv inte generiska horoskop som kunde gälla vem som helst
- Skriv inte om saker som inte hänt eller nämnts i dagens händelser
- Var inte för allvarlig eller mystisk
- Använd inte klyschor som "kärlek väntar runt hörnet" om det inte passar kontexten`;
}
