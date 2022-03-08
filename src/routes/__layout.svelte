<script lang="ts">
	import Header from './components/_Header.svelte';
	import Footer from './components/_Footer.svelte';
</script>

<div id="fauxBody">
	<Header />
	<main>
		<h1>Bitocracy Voting Power Dashboard</h1>
		<slot />
	</main>

	<Footer />
</div>

<style>
	#fauxBody {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: auto;
		background: var(--color-main-bg);
		color: var(--color-flowText);
	}
	main {
		background-color: var(--color-modal-bg);
	}
	h1 {
		padding: 1.5rem 0;
		text-align: center;
	}
</style>
