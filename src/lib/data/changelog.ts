export interface ChangelogEntry {
	date: string;
	title: string;
	notes: string[];
}

export const changelogEntries: ChangelogEntry[] = [
	{
		date: '2026-05-14',
		title: 'Trygghetsöversikt på startsidan',
		notes: [
			'Lagt till ett tydligare trust-block om privat läge, AI-träning, leverantörer och öppen källkod.',
			'Återanvänder samma trygghetsöversikt på Om-sidan så informationen inte glider isär.'
		]
	},
	{
		date: '2026-05-14',
		title: 'Tydligare avsändare i footern',
		notes: [
			'Lagt till copyright, organisationsnummer och kontaktadress i sidfoten.',
			'Lagt till direktlänk till projektets källkod på GitHub.'
		]
	},
	{
		date: '2026-05-13',
		title: 'Beta-status förtydligad',
		notes: [
			'Startsidan säger nu tydligt att Storify är gratis under beta.',
			'Om-sidan har fått ett kort avsnitt om affärsmodell och eventuell framtida premiumversion.'
		]
	},
	{
		date: '2026-05-13',
		title: 'Röstantal från samma källa',
		notes: [
			'Publika texter använder nu aktiva, valbara röster som källa för antal röster.',
			'Startsida, metadata och villkor slipper hårdkodade röstantal som kan bli fel när röster ändras.'
		]
	},
	{
		date: '2026-05-13',
		title: 'Bloggcopy uppdaterad för framtida röster',
		notes: [
			'Blogginlägg som nämnde ett fast antal röster har skrivits om till mer tidlös copy.',
			'Inlägget om 32 röster behåller sin titel men har fått en redaktionsnotis med länk till aktuell röstlista.'
		]
	}
];
