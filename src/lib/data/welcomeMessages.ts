export type WelcomeMessage = {
  title: string;
  greetings: [string, string];
};

export const welcomeMessages: WelcomeMessage[] = [
  {
    title: 'Hej där!',
    greetings: [
      'Stort eller smått, roligt eller tungt, vardagligt eller omvälvande – allt som rör sig i dig är värt att skriva om. Var vill du börja idag?',
      'Det finns inget för obetydligt och inget för stort att skriva om här. Vad är det första som dyker upp när du tänker efter?'
    ]
  },
  {
    title: 'Hej!',
    greetings: [
      'Skönt att du tog dig tid för det här, mitt i allt annat som pågår. Var känns det naturligt att börja idag?',
      'Ingen brådska, inga krav – bara du och en tom sida att fylla med det som är sant just nu. Vad vill du skriva om?'
    ]
  },
  {
    title: 'Hejsan!',
    greetings: [
      'Hur har dagen varit så här långt, när du verkligen stannar upp och tänker efter? Berätta det som känns närmast.',
      'Vad har du burit med dig idag, stort eller smått, lätt eller tungt? Allt får plats här.'
    ]
  },
  {
    title: 'Hallå där!',
    greetings: [
      'Vad är det som pockar på uppmärksamhet just nu, det där som liksom gnager i bakgrunden? Släpp ut det här.',
      'Något som måste ut innan det tar för stor plats i huvudet? Det här är en bra plats att börja på.'
    ]
  },
  {
    title: 'Hej hej!',
    greetings: [
      'Kul att du är här igen. Vad har hänt sedan sist, och vad är det som rör sig i dig just nu?',
      'Allt som snurrar i huvudet får plats här – de stora tankarna, de små, och allt däremellan. Var vill du börja?'
    ]
  },
  {
    title: 'Kul att se dig!',
    greetings: [
      'Skönt att du tog dig tid idag, mitt i allt annat. Berätta, vad är det som är på gång i ditt liv just nu?',
      'Vad roligt att du tittar in. Stort eller litet, lugnt eller rörigt – vad vill du skriva om idag?'
    ]
  },
  {
    title: 'Där är du ju!',
    greetings: [
      'Jag hade nästan börjat undra. Vad har snurrat i huvudet sedan sist, och vad vill du sätta ord på idag?',
      'Kom och sätt dig en stund. Vad är det som tar plats i dig just nu, stort eller smått?'
    ]
  },
  {
    title: 'Åh, hej!',
    greetings: [
      'Så fint att du tittar in. Vad bär du med dig idag – en känsla, en tanke, en händelse som inte vill släppa taget?',
      'Hur mår du på riktigt, bortom det där du brukar svara? Börja där, om du vill.'
    ]
  },
  {
    title: 'Hur står det till?',
    greetings: [
      'Berätta hur du har det just nu, stort som smått, lätt som tungt. Det finns plats för allt här.',
      'Vilken känsla är starkast i dig i det här ögonblicket, och vad tror du att den vill berätta för dig?'
    ]
  },
  {
    title: 'Något på hjärtat?',
    greetings: [
      'Säg det som ligger närmast, utan filter och utan krav. Det finns inget rätt eller fel sätt att skriva på.',
      'Det finns inget för litet och inget för stort att skriva om här. Vad är det första som dyker upp?'
    ]
  },
  {
    title: 'Titta vem som är här!',
    greetings: [
      'Hjärna full? Hjärta fullt? En tom sida väntar, redo att ta emot precis vad som helst. Var vill du börja?',
      'En ny stund, en tom sida, tusen möjligheter. Vad är det som vill ut ur huvudet idag?'
    ]
  },
  {
    title: 'Nämen, hej!',
    greetings: [
      'Vad roligt att se dig! Vad har hänt sedan sist, och vad är det som rör sig i dig just nu?',
      'Kom igen, berätta – vad är det som är på gång, både i det stora och det lilla?'
    ]
  },
  {
    title: 'Se där!',
    greetings: [
      'Dags att skriva av sig lite? Vad är det som har samlats på hög sedan sist, stort eller smått?',
      'Vad är det som spökar i skallen idag, det där som inte riktigt vill släppa taget? Släpp ut det här.'
    ]
  },
  {
    title: 'Tjabba!',
    greetings: [
      'Läget i huvudet då? Vad snurrar där inne – tankar, känslor, nåt som hänt, nåt som är på gång?',
      'Kör igång – vad som helst får plats här, från det vardagliga till det omvälvande. Var vill du börja?'
    ]
  },
  {
    title: 'Tja! Läget?',
    greetings: [
      'Berätta, vad är det som händer i ditt liv just nu, både på utsidan och på insidan?',
      'Vad har du burit med dig idag, stort eller smått, lätt eller tungt? Det får alltihop plats här.'
    ]
  }
];

/**
 * Returns a random welcome message with a randomly selected greeting from its pair.
 */
export function getRandomWelcomeMessage(): { title: string; greeting: string } {
  const message = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  const greeting = message.greetings[Math.floor(Math.random() * message.greetings.length)];
  return { title: message.title, greeting };
}
