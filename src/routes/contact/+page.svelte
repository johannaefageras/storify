<script lang="ts">
	import { EmojiLegalContactStorify } from '$lib/components/emojis';

	let name = $state('');
	let email = $state('');
	let subject = $state('');
	let message = $state('');
	let showConfirmation = $state(false);

	function handleSubmit(e: Event) {
		e.preventDefault();
		// TODO: Implementera faktisk formulärhantering
		showConfirmation = true;
		setTimeout(() => {
			showConfirmation = false;
			name = '';
			email = '';
			subject = '';
			message = '';
		}, 3000);
	}
</script>

<main class="legal-page">
	<a href="/" class="back-link">&larr; Tillbaka</a>
	<div class="page-header">
		<EmojiLegalContactStorify size={80} />
		<h1>Hör av dig</h1>
	</div>

	<section>
		<h2>Jag vill gärna höra från dig!</h2>
		<p>Oavsett om du har feedback, hittat en bugg, vill samarbeta eller bara säga hej – tveka inte att höra av dig. Jag svarar vanligtvis inom ett par dagar.</p>
	</section>

	<section>
		<h2>Skicka ett meddelande</h2>
		<form class="contact-form" onsubmit={handleSubmit}>
			<div class="form-group">
				<label for="name">Namn</label>
				<input
					type="text"
					id="name"
					bind:value={name}
					placeholder="Ditt namn"
					required
				/>
			</div>

			<div class="form-group">
				<label for="email">E-post</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					placeholder="din@epost.se"
					required
				/>
			</div>

			<div class="form-group">
				<label for="subject">Ämne</label>
				<select id="subject" bind:value={subject} required>
					<option value="" disabled>Välj ett ämne...</option>
					<option value="feedback">Feedback & förslag</option>
					<option value="bug">Buggrapport</option>
					<option value="collaboration">Samarbete</option>
					<option value="press">Press & media</option>
					<option value="other">Annat</option>
				</select>
			</div>

			<div class="form-group">
				<label for="message">Meddelande</label>
				<textarea
					id="message"
					bind:value={message}
					placeholder="Skriv ditt meddelande här..."
					rows="5"
					required
				></textarea>
			</div>

			<button type="submit" class="btn btn-primary">
				Skicka meddelande
			</button>

			{#if showConfirmation}
				<div class="confirmation">
					<span class="confirmation-icon">✓</span>
					Tack! Ditt meddelande har skickats.
				</div>
			{/if}
		</form>
	</section>

	<section>
		<h2>Andra sätt att nå mig</h2>
		<ul class="contact-links">
			<li>
				<strong>GitHub:</strong>
				<a href="https://github.com/johannaefageras" target="_blank" rel="noopener">@johannaefageras</a>
			</li>
			<li>
				<strong>E-post:</strong>
				<a href="mailto:johanna@mystorify.se">johanna@mystorify.se</a>
			</li>
		</ul>
	</section>

	<section>
		<h2>Vad kan du höra av dig om?</h2>
		<ul>
			<li><strong>Konstruktiv kritik och feedback:</strong> Vad fungerar bra? Vad kan bli bättre?</li>
			<li><strong>Buggar:</strong> Hittat något som inte fungerar som det ska? Berätta!</li>
			<li><strong>Samarbeten:</strong> Har du en idé du vill diskutera?</li>
			<li><strong>Press och media:</strong> Vill skriva om Storify? Kul!</li>
			<li><strong>Eller bara säga hej:</strong> Det uppskattas också.</li>
		</ul>
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

	h2 {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		color: var(--color-text);
		margin-bottom: 0.75rem;
	}

	section {
		margin-bottom: 2.5rem;
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

	/* Contact form */
	.contact-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-text);
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text);
		background-color: var(--color-bg-elevated);
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px rgba(244, 63, 122, 0.1);
	}

	.form-group input::placeholder,
	.form-group textarea::placeholder {
		color: var(--color-text-muted);
		opacity: 0.6;
	}

	.form-group select {
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b6b6b' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 1rem center;
		padding-right: 2.5rem;
	}

	.form-group textarea {
		resize: vertical;
		min-height: 120px;
	}

	.contact-form .btn {
		align-self: flex-start;
		margin-top: 0.5rem;
	}

	.confirmation {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background-color: var(--color-neutral);
		border-radius: var(--radius-sm);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text);
		animation: fade-in 0.3s ease;
	}

	.confirmation-icon {
		color: var(--color-accent);
		font-weight: var(--weight-bold);
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Contact links */
	.contact-links {
		list-style: none;
		margin: 1rem 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.contact-links li {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
	}

	.contact-links li strong {
		color: var(--color-text);
		font-weight: var(--weight-medium);
	}

	/* Regular list */
	ul:not(.contact-links) {
		list-style: none;
		margin: 1rem 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	ul:not(.contact-links) li {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		padding-left: 1.25rem;
		position: relative;
	}

	ul:not(.contact-links) li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.55rem;
		width: 5px;
		height: 5px;
		background-color: var(--color-accent);
		border-radius: 50%;
	}

	ul:not(.contact-links) li strong {
		color: var(--color-text);
		font-weight: var(--weight-medium);
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
