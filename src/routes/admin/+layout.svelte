<script lang="ts">
	import { page } from '$app/stores';

	let activeUrl: string;
	let pageTitle: string;
	$: activeUrl = $page.url.pathname;
	$: {
		switch (activeUrl) {
			case '/admin':
				pageTitle = 'Overview';
				break;
			case '/admin/site':
				pageTitle = 'Site Performance';
				break;
			case '/admin/stream':
				pageTitle = 'Stream performance';
				break;
			case '/admin/users':
				pageTitle = 'Users';
				break;
			case '/admin/errors':
				pageTitle = 'Errors';
				break;
		}
	}
</script>

<div class="relative flex w-full max-w-5xl grow gap-3 overflow-visible p-6">
	<aside class="sticky top-6 hidden h-max w-full max-w-max shrink-0 pr-8 sm:block">
		<nav>
			<span class="mb-3 w-full whitespace-nowrap text-left text-xl font-semibold">
				<h2 class="inline text-neutral-200">Admin /</h2>
				<h3 class="inline">
					{pageTitle}
				</h3>
			</span>
			<ul class="flex flex-col gap-3 text-left font-medium">
				<li>
					<a
						class="text-neutral-200 transition-colors hover:text-neutral-100"
						class:!text-neutral-100={activeUrl === '/admin'}
						href="/admin"
					>
						Overview
					</a>
				</li>
				<li>
					<a
						class="text-neutral-200 transition-colors hover:text-neutral-100"
						class:!text-neutral-100={activeUrl === '/admin/site'}
						href="/admin/site"
					>
						Site performance
					</a>
				</li>
				<li>
					<a
						class="text-neutral-200 transition-colors hover:text-neutral-100"
						class:!text-neutral-100={activeUrl === '/admin/stream'}
						href="/admin/stream"
					>
						Stream performance
					</a>
				</li>
				<li>
					<a
						class="text-neutral-200 transition-colors hover:text-neutral-100"
						class:!text-neutral-100={activeUrl === '/admin/users'}
						href="/admin/users"
					>
						Users
					</a>
				</li>
				<li>
					<a
						class="text-neutral-200 transition-colors hover:text-neutral-100"
						class:!text-neutral-100={activeUrl === '/admin/errors'}
						href="/admin/errors"
					>
						Errors
					</a>
				</li>
			</ul>
		</nav>
	</aside>
	<div class="min-w-0 grow">
		<slot />
	</div>
</div>
