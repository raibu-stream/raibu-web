<script>
	import CopyMe from './CopyMe.svelte';

	let streamkey = 'foobar';
</script>

<main class="p-4">
	<a href="/">../home</a>
	<h1>
		<span class="text-primary-200">ellitedev's</span> RTMP private server
	</h1>
	<p>Server location: <em>Nuremberg - Germany</em></p>
	<br />
	<h2>Pushing to the server:</h2>
	<!-- Hover added -->
	<p>
		In OBS, Set <span class="value">Stream > Service</span> to <span class="value">Custom...</span>
	</p>
	<ul>
		<li>
			<CopyMe>rtmp://ellite.dev/</CopyMe>
		</li>
		<li>
			<CopyMe>rtsp://ellite.dev/</CopyMe>
		</li>
		<li>
			<CopyMe>srt://ellite.dev:8890?streamid=publish:<em>{streamkey}</em>&pkt_size=1316</CopyMe>
		</li>
	</ul>
	<p>
		You can stream using any <span class="value">{streamkey}</span> you want. If your stream isn't
		working, try using a different <span class="value">{streamkey}</span><br />
		In OBS, both RTMP and RTSP use the <span class="value">{streamkey}</span> field. SRT does not,
		so include it within the URL, like shown above. <br />
		I <b><em>highly</em></b> suggest using <span class="value">RTMP</span> to stream using OBS. It's
		given me the least amount of issues.
	</p>
	<br />
	<h2>Reading from server:</h2>
	<ul>
		<li>
			<CopyMe>rtmp://ellite.dev:1935/<em>{streamkey}</em></CopyMe>
		</li>
		<li>
			<CopyMe>rtsp://ellite.dev:8554/<em>{streamkey}</em></CopyMe>
		</li>
		<li>
			<CopyMe>srt://ellite.dev:8890?streamid=read:<em>{streamkey}</em></CopyMe>
		</li>
		<li>
			<CopyMe>https://hls.ellite.dev/<em>{streamkey}</em></CopyMe>
		</li>
	</ul>
	<p>
		I suggest using <span class="value">RTSP</span> to read the stream. <br />
		If you notice a lot of stuttering or lag, try using <span class="value">RTMP</span>. <br />
		<span class="value">RTSPT</span> DOES NOT WORK!!!<br />
		If that doesn't help, <span class="value">HLS</span> might be your solution, but it'll have way more
		latency.
	</p>
	<br />
	<h2>House rules:</h2>
	<p>
		Please exercise common curtesy and stream with reasonable settings, <em
			>bandwidth isn't free!!</em
		>
	</p>

	<br />
	Please follow these settings:
	<ul>
		<li>
			Video: <span class="value">720p</span>, Fractional FPS Value <span class="value">237/4</span>
			(59.25fps),
			<span class="value">3000kbps</span>, <span class="value">Max B-frames: 0</span>
		</li>
		<li>
			Audio: <span class="value">320kbps</span>, <span class="value">44.1kHz</span>,
			<span class="value">stereo</span>
		</li>
	</ul>
</main>

<style lang="postcss">
	li {
		@apply h-11;
	}
	h1,
	h2 {
		@apply font-bold;
	}
	.value {
		@apply text-primary-200 border-secondary-800 border rounded bg-secondary-800 px-1 select-all;
	}
</style>
