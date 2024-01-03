<script lang="ts">
	import { getContext } from 'svelte';

	const { data, xGet, yGet, yScale, xScale, extents }: any = getContext('LayerCake');
	$: path =
		'M' +
		$data
			.map((d: any) => {
				return $xGet(d) + ',' + $yGet(d);
			})
			.join('L');

	let area: any;

	$: {
		const yRange = $yScale.range();

		area =
			path +
			('L' +
				$xScale($extents.x ? $extents.x[1].getTime() : 0) +
				',' +
				yRange[0] +
				'L' +
				$xScale($extents.x ? $extents.x[0] : 0) +
				',' +
				yRange[0] +
				'Z');
	}
</script>

<path
	d={path}
	stroke="#fff"
	fill="none"
	stroke-linejoin="round"
	stroke-linecap="round"
	stroke-width="3"
></path>
<path class="path-area" d={area} fill="#000"></path>
