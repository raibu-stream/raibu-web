<script lang="ts">
	import { page } from '$app/stores';

	let activeUrl: string;
	let pageTitle: string;
	$: activeUrl = $page.url.pathname;
	$: {
		switch (activeUrl) {
			case '/user':
				pageTitle = 'Dashboard';
				break;
			case '/user/billing':
				pageTitle = 'Billing';
				break;
		}
	}
</script>

<div class="relative flex w-full grow gap-3 overflow-visible">
	<aside class="sticky top-0 hidden h-full shrink-0 pr-12 pt-18 sm:block">
		<nav>
			<ul class="flex flex-col gap-7 pr-12 text-left text-lg font-medium">
				<li>
					<a
						class="hover:text-neutral-10 rounded-r-md p-4 pl-16 pr-8 text-neutral-200 transition-colors"
						class:!text-neutral-100={activeUrl === '/user'}
						class:bg-secondary-800={activeUrl === '/user'}
						href="/user"
					>
						Dashboard
					</a>
				</li>
				<li>
					<a
						class="rounded-r-md p-4 pl-16 pr-8 text-neutral-200 transition-colors hover:text-neutral-100"
						class:!text-neutral-100={activeUrl === '/user/billing'}
						class:bg-secondary-800={activeUrl === '/user/billing'}
						href="/user/billing"
					>
						Billing
					</a>
				</li>
				<li>
					<a
						class="rounded-r-md p-4 pl-16 pr-8 text-neutral-200 transition-colors hover:text-neutral-100"
						class:!text-neutral-100={activeUrl === '/user/streams'}
						class:bg-secondary-800={activeUrl === '/user/streams'}
						href="/user/streams"
					>
						Streams
					</a>
				</li>
			</ul>
		</nav>
	</aside>
	<div class="min-w-0 grow px-8 sm:pl-0">
		<slot />
	</div>
</div>
