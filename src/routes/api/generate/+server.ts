import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';
import type { WizardData, UserProfile } from '$lib/stores/wizard.svelte';
import { ANTHROPIC_API_KEY } from '$env/static/private';

const client = new Anthropic({
	apiKey: ANTHROPIC_API_KEY
});

function buildProfileDescription(profile: UserProfile): string {
	const parts: string[] = [];

	// Age
	if (profile.age) {
		parts.push(`${profile.age} år`);
	}

	// Pronouns -> grammatical word
	if (profile.pronouns === 'hon') {
		parts.push('tjej');
	} else if (profile.pronouns === 'han') {
		parts.push('kille');
	} else if (profile.pronouns === 'hen') {
		parts.push('person');
	}

	// Hometown
	if (profile.hometown) {
		parts.push(`i ${profile.hometown}`);
	}

	// Build the description
	if (parts.length > 0) {
		return parts.join(' ');
	}

	// Fallback if no profile data
	return 'ung person';
}

function buildTonePrompt(toneId: string, profile: UserProfile): string {
	const profileDesc = buildProfileDescription(profile);
	const baseIntro = `Du är en hjälpsam skrivassistent som skriver dagboksinlägg åt en ${profileDesc}.`;

	const toneInstructions: Record<string, string> = {
		classic: `${baseIntro}

SKRIVSTIL: Klassisk dagbok
- Skriv i första person, ärligt och personligt
- Börja med en klassisk dagboksöppning (t.ex. "Kära dagbok,")
- Beskriv dagen naturligt, som om du pratar med dig själv på papper
- Inkludera känslor utan att överdriva dem
- Låt små detaljer få plats – de gör dagen unik
- Avsluta med en reflektion eller tanke om imorgon
- Håll tonen varm men inte sockersöt
- Skriv på naturlig svenska
- Längd: cirka 150-250 ord`,

		storytelling: `${baseIntro}

SKRIVSTIL: Berättande/Storytelling
- Skriv dagen som en kort berättelse i tredje person
- Använd litterära tekniker som "show don't tell"
- Skapa en narrativ båge med början, mitten och slut
- Använd beskrivande språk och sensoriska detaljer
- Låt huvudpersonen (skribenten) vara protagonisten
- Bygg upp spänning kring vardagliga händelser
- Skriv på naturlig svenska
- Längd: cirka 150-250 ord`,

		philosophical: `${baseIntro}

SKRIVSTIL: Filosofisk
- Reflektera djupt över dagens händelser
- Ställ existentiella frågor om vardagen
- Leta efter mening och mönster i det lilla
- Använd tankefulla formuleringar och metaforer
- Varva konkreta händelser med abstrakta reflektioner
- Undvik att bli för pretentiös - behåll en varm ton
- Skriv på naturlig svenska
- Längd: cirka 150-250 ord`,

		sportscaster: `${baseIntro}

SKRIVSTIL: Sportkommentator
- Beskriv dagen som en sportkommentator som rapporterar live
- Använd energiskt, entusiastiskt språk med VERSALER för betoning
- Gör vardagliga händelser till spännande höjdpunkter
- Använd sportterminologi kreativt ("Hon tar ett STRÅLANDE beslut!")
- Inkludera "instant replays" och "slow motion"-beskrivningar
- Håll tempot högt och energin uppe
- Skriv på naturlig svenska
- Längd: cirka 150-250 ord`,

		'cat-perspective': `${baseIntro}

SKRIVSTIL: Kattperspektiv
- Skriv ur perspektivet av en högdragen huskatt som observerar sin "människa"
- Var dömande men med underliggande tillgivenhet
- Kommentera mänskliga beteenden som konstiga eller ologiska
- Använd kattlogik ("Varför åt hon inte direkt när maten var framme?")
- Inkludera typiska kattobservationer om mat, sömn och territorium
- Behåll en torr humor genomgående
- Skriv på naturlig svenska
- Längd: cirka 150-250 ord`,

		sarcastic: `${baseIntro}

SKRIVSTIL: Sarkastisk
- Använd torr, ironisk humor genomgående
- Kommentera händelser med ett höjt ögonbryn
- Överdrivna understatements ("Det var ju bara HELT fantastiskt")
- Var rolig utan att vara elak
- Inkludera ögonrullningar och suckar i texten
- Balansera sarkasmen med äkta känslor ibland
- Skriv på naturlig svenska
- Längd: cirka 150-250 ord`,

		'drama-queen': `${baseIntro}

SKRIVSTIL: Drama Queen
- Överdramatisera ALLT - varje liten händelse är ENORM
- Använd telenovela-liknande intensitet
- Dramatiska pauser, gaspar och utrop
- Gör vardagen till ett storslaget drama
- "ALDRIG har någon upplevt detta tidigare!"
- Inkludera dramatiska vändningar och cliffhangers
- Skriv på naturlig svenska
- Längd: cirka 150-250 ord`,

		meme: `${baseIntro}

SKRIVSTIL: Meme/Gen Z
- Använd internetspråk och meme-kultur
- "no bc why was today lowkey iconic"
- Blanda svenska och engelska naturligt
- Referera till meme-format och trender
- Använd "fr fr", "ngl", "lowkey", "highkey", "slay", etc.
- Inkludera emojis sparsmakat men effektivt
- Skriv som om det var ett Twitter/TikTok-inlägg
- Längd: cirka 150-250 ord`,

		cringe: `${baseIntro}

SKRIVSTIL: Cringe
- Fokusera på pinsamma ögonblick och social awkwardness
- Överdrivet självmedveten ton
- "Okej så jag råkade säga fel och ville bara dö"
- Inkludera interna skrikande och ångest
- Gör vardagliga misstag till komediguld
- Självutlämnande men på ett relaterbart sätt
- Skriv på naturlig svenska
- Längd: cirka 150-250 ord`,

		brittish: `${baseIntro}

SKRIVSTIL: Brittisk
- Skriv på ENGELSKA med brittisk charm
- Understated, torr humor
- "Rather uneventful, I must say"
- Använd brittiska uttryck ("quite", "rather", "I suppose", "bloody")
- Artig distans med underliggande värme
- Te-referenser uppskattas
- Längd: cirka 150-250 ord`,

		'quest-log': `${baseIntro}

SKRIVSTIL: Quest Log/RPG
- Formatera dagen som ett RPG quest log
- Använd spelterminologi (XP, quests, achievements, stats)
- "[QUEST COMPLETED] Överlev måndagen (+50 XP)"
- Inkludera "stats" för dagen (Energy: 7/10, Mood: +3)
- Gör uppgifter till quests och hinder till boss fights
- Side quests för oväntade händelser
- Skriv på naturlig svenska
- Längd: cirka 150-250 ord`,

		bored: `${baseIntro}

SKRIVSTIL: Uttråkad
- Skriv med minimal entusiasm
- "Jaha. Ännu en dag. Spännande."
- Korta, ointresserade meningar
- Sucka genom texten
- Hitta ingenting särskilt imponerande
- Underliggande humor i hur ointresserad tonen är
- Skriv på naturlig svenska
- Längd: cirka 150-250 ord`
	};

	return toneInstructions[toneId] || toneInstructions.classic;
}

function formatProfileForPrompt(profile: UserProfile): string {
	const lines: string[] = [];

	if (profile.name) {
		lines.push(`Namn: ${profile.name}`);
	}
	if (profile.age) {
		lines.push(`Ålder: ${profile.age} år`);
	}
	if (profile.hometown) {
		lines.push(`Bor i: ${profile.hometown}`);
	}
	if (profile.occupationDetail) {
		lines.push(`Sysselsättning: ${profile.occupationDetail}`);
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

function formatWizardDataForPrompt(data: WizardData): string {
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

	// Emojis that represent the day
	if (data.emojis.length > 0) {
		sections.push(`Dagens känsla (emojis): ${data.emojis.join(', ')}`);
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

	return sections.join('\n');
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data: WizardData = await request.json();

		const toneId = data.selectedTone || 'classic';
		const systemPrompt = buildTonePrompt(toneId, data.profile);
		const userContent = formatWizardDataForPrompt(data);

		const message = await client.messages.create({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 1024,
			system: systemPrompt,
			messages: [
				{
					role: 'user',
					content: `${userContent}\n\nSkriv ett dagboksinlägg baserat på denna information.`
				}
			]
		});

		// Extract text content from the response
		const textContent = message.content.find((block) => block.type === 'text');
		const generatedEntry = textContent?.text || '';

		return json({
			success: true,
			entry: generatedEntry
		});
	} catch (error) {
		console.error('Generation error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to generate entry'
			},
			{ status: 500 }
		);
	}
};
