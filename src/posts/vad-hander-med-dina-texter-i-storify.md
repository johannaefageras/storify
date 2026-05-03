---
title: Vad händer med det du skriver i Storify
date: 2026-04-13
description: Innan du skriver något privat behöver du veta exakt var det hamnar. Här är raka svar om lagring, AI-hantering, kryptering och vad som inte händer med dina texter.
tags:
  - integritet
  - datasäkerhet
  - AI
  - kryptering
  - GDPR
slug: vad-hander-med-dina-texter-i-storify
featured: /blog/vad-hander-med-dina-texter-i-storify.jpeg
---

Innan du skriver något privat i en textruta någonstans bör du veta exakt var det hamnar. Många plattformar undviker att svara på den frågan. De paketerar in sin datahantering i långa användaravtal och svepande formuleringar. Storify svarar rakt.

Du har rätt att veta [vem som läser dina texter, hur systemet fungerar under ytan och var dina data fysiskt bor](/privacy). Här är exakt vad som händer med det du skriver i verktyget.

## Vart din data lagras och vad som (inte) händer med den

Dina dagboksinlägg lagras i Storifys Supabase-databas. Det är en konkret infrastruktur utan dolda lager. Datat är krypterat i transit när det skickas över nätet, och det är krypterat i vila när det ligger lagrat. Servrarna ligger i Frankfurt.

Du kommer åt dina inlägg när du är inloggad med dina uppgifter. Ingen annan användare kommer åt dem. Det finns inga sociala funktioner inbyggda i produkten överhuvudtaget. Det finns ingen algoritmisk feed. Det finns inga vänner att lägga till eller godkänna. Det finns absolut ingen funktion för delning till andra plattformar.

Det finns ingen att performa för, för det finns ingen som tittar. Du skriver för dig själv.

## Hur AI:n behandlar det du skriver

När du använder ett verktyg som involverar modern språkteknologi uppstår specifika frågor. Det här är frågan folk faktiskt undrar över.

När du skriver i [Wizarden](/wizard) eller fyller i [AI-intervjun](/interview) skickas ditt material till Anthropics Claude-API för att generera det färdiga inlägget. Det är så tjänsten fungerar. Anthropic använder inte API-data för att träna sina modeller. Deras affärsmodell för API-kunder bygger på att datat förblir privat. Materialet bearbetas enbart för att utföra den uppgift du bad om, ett formaterat inlägg returneras till oss, och datat ligger sedan inte kvar hos dem för annat bruk. Sen sparas inlägget i din egen Storify-databas, direkt och exklusivt kopplat till ditt konto.

AI:n läser ditt material i ögonblicket den genererar ett inlägg. [Den minns det inte mellan sessioner](/blog/ai-skrivassistent-inte-livscoach). Den lär sig inte av dig över tid. Varje generering är helt fristående. Verktyget bygger ingen dold profil av din personlighet i bakgrunden.

## Vad Storify gör (och inte gör) med din data

Inget. Det är det korta svaret på vad vi gör med din data.

Storify läser inte dina inlägg. Det finns ingen avancerad analys av ditt innehåll. Det finns ingen sentimentigenkänning som försöker räkna ut hur du mår över tid. Det finns ingen samlad statistik om dina tankemönster. Datat används inte för marknadsföring av något slag. Det säljs inte vidare till mäklare. Det delas inte med någon tredje part utöver det specifika Anthropic-anropet ovan, vilket är helt nödvändigt för att produkten överhuvudtaget ska fungera.

### Vad vi inte kan lova

Vi måste säga det negativa lika rakt som det positiva. Det finns ingen end-to-end-kryptering där bara du kan läsa dina inlägg. End-to-end-kryptering kräver en specifik teknisk arkitektur som Storify inte har. Våra servrar kan tekniskt sett komma åt datat. Det är så funktioner som databasbackup, systemsupport och kontoåterställning fungerar i praktiken.

Om din hotbild gör detta till ett oacceptabelt problem, då är Storify inte rätt verktyg för dig. Det är ärligare att säga det direkt än att antyda något starkare än vad som faktiskt finns.

## Din kontroll över datan

### Radering

Du kan radera enskilda inlägg eller hela kontot. När ett konto raderas tas datat omedelbart bort från databasen. Det finns ingen karensperiod där vi behåller dina texter ifall du skulle ångra dig.

### Inloggning

Storify använder Supabase auth med e-post och lösenord. Det finns inget Google-login som följer dig över nätet. Det finns inget Facebook-login som knyter din dagbok till din sociala graf. Bara en e-postadress och ett lösenord du väljer själv.

## När du inte skapar konto: localStorage och vad det innebär

För användare som [inte vill skapa ett konto](/guide) sparas Wizardens profil i webbläsarens localStorage istället för i en central databas. Webbläsarens localStorage är en liten isolerad textfil på din egen maskin.

Det betyder att datat aldrig lämnar din enhet och aldrig når våra servrar. Det betyder också att om du rensar din webbläsare, eller använder ett inkognitofönster, så försvinner datat permanent. Det är en avvägning du gör mellan tillgänglighet och kontroll, inte en bugg i systemet.

## Rätt nivå av säkerhet för vardagstankar

Storify är säkrare än ett papper i en olåst låda och mindre säkert än en krypterad hårddisk i ett kassaskåp. För de allra flesta tankar och dagar är det precis rätt nivå. Det ger dig tillgängligheten du behöver för att faktiskt skriva, med en integritet som respekterar processen.

Men för material du absolut inte vill att någon någonsin ska kunna komma åt finns det inget digitalt verktyg som är helt riskfritt. Det gäller internet i stort och det inkluderar Storify. Skriv det du är bekväm med att skriva.

Det är ungefär det. Det finns inga dolda rader i ett avtal. Det finns inga småtryck som omdefinierar något av detta senare i processen. Storify är en okomplicerad plats att skriva ner saker på. Plattformen är byggd så att skrivandet är det enda som faktiskt händer. Vi sparar dina ord. Du läser dem. Inget annat pågår.

Vet vad du använder. Sen använd det.
