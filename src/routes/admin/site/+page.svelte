<script lang="ts">
	import LineChart from '$lib/components/LineChart.svelte';
	import { LayerCake, Svg } from 'layercake';
	import { scaleTime } from 'd3-scale';
	import SvelteSeo from 'svelte-seo';

	export let data;

	const cleanData = (table: any) => {
		const withMs = table.map((row: any) => {
			row.latencyInMs = Number(row.latencyInNs / BigInt(1000000));
			return row;
		});

		return withMs;
	};
</script>

<SvelteSeo title="Site Performance | Raibu" />

{#await data.logs.pageRoutes}
	loading
{:then data}
	<div class="h-64 w-full overflow-hidden">
		<LayerCake
			data={cleanData(data)}
			x="requestDate"
			y="latencyInMs"
			xScale={scaleTime()}
			yDomain={[0, null]}
			yNice={4}
		>
			<Svg>
				<LineChart />
			</Svg>
		</LayerCake>
	</div>
{/await}
