const weekdays = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
const months = [
	'januari',
	'februari',
	'mars',
	'april',
	'maj',
	'juni',
	'juli',
	'augusti',
	'september',
	'oktober',
	'november',
	'december'
];

export function formatLocalDateISO(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

export function getSwedishDiaryDate(date: Date = new Date()): {
	weekday: string;
	date: string;
	dateISO: string;
} {
	return {
		weekday: weekdays[date.getDay()],
		date: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
		dateISO: formatLocalDateISO(date)
	};
}
