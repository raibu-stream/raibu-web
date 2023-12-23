<script lang="ts">
	import theme from '$lib/tailwindConfig.js';

	export let previewText: string;

	const colorNeutral = theme.colors.neutral;
</script>

<mjml lang="en-US" dir="ltr">
	<mj-head>
		<mj-preview>
			<span id="__raibu-preview-text">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html previewText + ' &#8199;&#847;'.repeat(200) + '&shy;'.repeat(200) + '&nbsp;'}
			</span>
		</mj-preview>
		<mj-title>Raibu</mj-title>
		<mj-attributes>
			<mj-all font-family="system-ui, sans-serif" color={colorNeutral[100]} />
		</mj-attributes>
	</mj-head>
	<mj-body background-color={colorNeutral[900]}>
		<mj-wrapper background-color={colorNeutral[800]} padding="0px">
			<mj-section border-bottom="1px solid {colorNeutral[300]}" full-width="">
				<mj-column vertical-align="middle">
					<mj-text font-size="20px">
						<h1 style="margin: 0;">ライブ</h1>
					</mj-text>
				</mj-column>
			</mj-section>

			<slot />

			<mj-section border-top="1px solid {colorNeutral[300]}" full-width="" text-align="center">
				<mj-column vertical-align="middle">
					<mj-text align="center" line-height="20px">
						<span style="font-size: 16px; text-decoration: none; color: {colorNeutral[100]};"
							>ライブ</span
						>&nbsp;<i
							style="letter-spacing:16px;mso-font-width:-100%;display:inline-block;width:16px"
							>&#8202;</i
						>
						<a
							href="https://twitter.com/raibustream"
							style="font-size: 12px; text-decoration: none; color: {colorNeutral[100]};"
							>•&nbsp;Twitter/X</a
						>&nbsp;<i style="letter-spacing:8px;mso-font-width:-100%;display:inline-block;width:8px"
							>&#8202;</i
						>
						<a
							href="https://bsky.app/profile/raibu.stream"
							style="font-size: 12px; text-decoration: none; color: {colorNeutral[100]};"
							>•&nbsp;Bluesky</a
						>&nbsp;<i style="letter-spacing:8px;mso-font-width:-100%;display:inline-block;width:8px"
							>&#8202;</i
						>
						<a
							href="https://raibu.stream/"
							style="font-size: 12px; text-decoration: none; color: {colorNeutral[100]};"
							>•&nbsp;raibu.stream</a
						>
					</mj-text>
				</mj-column>
			</mj-section>
		</mj-wrapper>
	</mj-body>
</mjml>
