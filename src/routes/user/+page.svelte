<script lang="ts">
	import CopyMe from './CopyMe.svelte';
	import type { PageServerData } from './$types';

	export let data: PageServerData;

	let streamkey = 'foobar';
</script>

<div class="my-8">
	<h2 class="text-2xl font-bold tracking-tight">
		<span class="text-primary-200">ellitedev's</span> RTMP private server
	</h2>
	<small class="italic tracking-wide">Logged in as {data.email}</small>
</div>

<section class="section">
	<small>Server location: <em>Nuremberg - Germany</em></small>
	<h3 class="mt-1">Pushing To The Server</h3>
	<p class="mb-4">
		In OBS, Set <span class="value">Stream > Service</span> to <span class="value">Custom...</span>
	</p>
	<ul class="mb-2 flex flex-col gap-1">
		<li>
			<code>
				<CopyMe>rtmp://ellite.dev/</CopyMe>
			</code>
		</li>
		<li>
			<code> <CopyMe>rtsp://ellite.dev/</CopyMe> </code>
		</li>
		<li>
			<code>
				<CopyMe>srt://ellite.dev:8890?streamid=publish:<em>{streamkey}</em>&pkt_size=1316</CopyMe>
			</code>
		</li>
	</ul>
	<p>
		You can stream using any <code class="value">{streamkey}</code> you want. If your stream isn't
		working, try using a different <code class="value">{streamkey}</code>
		In OBS, both RTMP and RTSP use the <code class="value">{streamkey}</code> field.
	</p>
	<p>
		SRT does not, so include it within the URL, like shown above. I <strong>highly</strong> suggest
		using
		<code class="value">RTMP</code> to stream using OBS. It's given me the least amount of issues.
	</p>
</section>

<section class="section">
	<h3>Reading From Server</h3>
	<ul class="mb-2 flex flex-col gap-1">
		<li>
			<code>
				<CopyMe>rtmp://ellite.dev:1935/<em>{streamkey}</em></CopyMe>
			</code>
		</li>
		<li>
			<code><CopyMe>rtsp://ellite.dev:8554/<em>{streamkey}</em></CopyMe></code>
		</li>
		<li>
			<code><CopyMe>srt://ellite.dev:8890?streamid=read:<em>{streamkey}</em></CopyMe></code>
		</li>
		<li>
			<code><CopyMe>https://hls.ellite.dev/<em>{streamkey}</em></CopyMe></code>
		</li>
	</ul>
	<p>
		I suggest using <span class="value">RTSP</span> to read the stream. If you notice a lot of
		stuttering or lag, try using <span class="value">RTMP</span>.
		<span class="value">RTSPT</span> DOES NOT WORK!!!
	</p>
	<p>
		If that doesn't help,
		<span class="value">HLS</span> might be your solution, but it'll have way more latency.
	</p>
</section>
<section class="section">
	<h3>House Rules</h3>
	<p>
		Please exercise common curtesy and stream with reasonable settings, <strong>
			bandwidth isn't free!!
		</strong>
	</p>

	<br />
	<ul>
		<p>Please follow these settings:</p>
		<li>
			<p>
				Video: <span class="value">720p</span>, Fractional FPS Value
				<span class="value">237/4</span>
				(59.25fps),
				<span class="value">3000kbps</span>, <span class="value">Max&nbsp;B-frames:&nbsp;0</span>
			</p>
		</li>
		<li>
			<p>
				Audio: <span class="value">320kbps</span>, <span class="value">44.1kHz</span>,
				<span class="value">stereo</span>
			</p>
		</li>
	</ul>
</section>

<style lang="postcss">
	p {
		@apply mb-2;
	}
	.value {
		@apply select-all rounded bg-secondary-700 px-1 text-primary-200;
	}
</style>
