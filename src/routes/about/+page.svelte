<script lang="ts">
	import { EmojiAppRosePinkLight, EmojiAppRosePinkDark, EmojiLegalAboutStorify } from '$lib/components/emojis';
	import { themeStore } from '$lib/stores/theme.svelte';
</script>

<main class="legal-page">
	<a href="/" class="back-link">&larr; Tillbaka</a>
	<div class="page-header">
		{#if themeStore.current === 'dark'}
			<EmojiAppRosePinkDark size={80} />
		{:else}
			<EmojiAppRosePinkLight size={80} />
		{/if}
		<h1>Om Storify</h1>
	</div>

	<section>
		<h2>En dagbok för oss som aldrig skriver dagbok</h2>
		<p>Du vet de där fina anteckningsböckerna du köpt med de bästa intentioner? De som ligger i en låda någonstans med kanske tre inlägg – varav det sista börjar med "Oj, det var länge sen..."?</p>
		<p>Storify är för oss. För alla som vill minnas sin vardag men som inte har tid, ork eller inspiration att faktiskt sätta sig ner och skriva. Svara på några frågor, välj en röst som passar ditt humör, och låt AI:n göra det jobbiga – själva skrivandet.</p>
	</section>

	<section>
		<h2>Varför jag byggde det här</h2>
		<div class="about-johanna">
			<div class="johanna-avatar">
				<EmojiLegalAboutStorify size={96} />
			</div>
			<div class="johanna-text">
				<p>Jag heter Johanna, bor i Göteborg och jobbar som sjuksköterska. På fritiden kodar jag (självlärd och stolt över det), syr mina egna kläder, och försöker hålla mina krukväxter vid liv. Ibland lyckas jag med alla tre samtidigt.</p>
			</div>
		</div>
		<p>Storify började som ett litet hobbyprojekt en kväll när jag tänkte: "Tänk om jag kunde få hjälp att skriva dagbok istället för att bara tänka att jag borde göra det?" Några kaffekoppar och kodningskvällar senare var appen född.</p>
	</section>

	<section>
		<h2>Filosofin bakom</h2>
		<p>Dagboksskrivande ska vara enkelt, träffsäkert och – vågar jag säga det – roligt. Ibland vill man ha en poetisk reflektion över livet. Ibland vill man bara att en uttråkad AI konstaterar att man åt pasta igen. Båda är lika giltiga.</p>
		<p>Målet är att du ska le när du läser din dagbokstext. Eller skratta. Eller känna igen dig. Helst allt på en gång.</p>
	</section>

	<section>
		<h2>Tack för att du är här</h2>
		<p>Att du använder något jag byggt på min fritid mellan arbetspass och kattgos betyder enormt mycket. Har du tankar, idéer eller bara vill säga hej? <a href="/contact">Hör av dig!</a></p>
	</section>
</main>

<style>
	.legal-page {
		max-width: 680px;
		margin: 0 auto;
		padding: 2rem;
		padding-top: calc(env(safe-area-inset-top, 0px) + 2rem);
		padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 2rem);
	}

	.back-link {
		display: inline-block;
		margin-bottom: 2rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.back-link:hover {
		color: var(--color-text);
	}

	.page-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 2rem;
	}

	h1 {
		font-family: var(--font-primary);
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		color: var(--color-text);
		margin-bottom: 0;
		text-align: center;
	}

	.about-johanna {
		display: flex;
		gap: 1.25rem;
		align-items: center;
		background: var(--color-bg-elevated);
		padding: 1.25rem;
		border-radius: var(--radius-md);
		margin-bottom: 1rem;
	}

	.johanna-avatar {
		flex-shrink: 0;
	}

	.johanna-text p {
		margin-bottom: 0;
	}

	h2 {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		color: var(--color-text);
		margin-bottom: 0.75rem;
	}

	section {
		margin-bottom: 2rem;
	}

	p {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin-bottom: 0.75rem;
	}

	p:last-child {
		margin-bottom: 0;
	}

	a {
		color: var(--color-accent);
		text-decoration: none;
		font-weight: var(--weight-medium);
		transition: color 0.2s ease;
	}

	a:hover {
		text-decoration: underline;
		text-underline-offset: 2px;
	}
</style>
