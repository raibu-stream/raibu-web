<script lang="ts">
	import EmailLayout from '$lib/email/EmailLayout.svelte';
	import theme from '$lib/tailwindConfig.js';

	const colorNeutral = theme.colors.neutral;
</script>

<EmailLayout previewText="Your email was updated. Was that you?">
	<mj-section padding="12px" padding-bottom="0px" padding-top="16px" full-width="">
		<mj-column>
			<mj-text font-size="16px" font-weight="600">
				<h2 style="margin: 0;">Your email at Raibu was changed</h2>
			</mj-text>
		</mj-column>
	</mj-section>
	<mj-section padding="12px" padding-top="10px" full-width="">
		<mj-column>
			<mj-text font-size="14px">
				<p style="margin: 0;">
					Someone changed the email associated with your Raibu account. If that someone was you,
					then you don't need to do anything! If that wasn't you, please contact
					<a
						href="mailto:contact@raibu.stream"
						style="text-decoration: none; font-weight: bolder; color: {colorNeutral[100]};"
					>
						contact@raibu.stream
					</a>
					immediately.
				</p>
			</mj-text>
		</mj-column>
	</mj-section>
	<!-- {#if location !== undefined}
		<mj-section padding="12px" padding-top="2px" padding-bottom="18px" full-width="">
			<mj-column>
				<mj-text font-size="12px">
					<p style="margin: 0;">
						Your password was reset from {location} approximately.
					</p>
				</mj-text>
			</mj-column>
		</mj-section>
	{/if} -->
</EmailLayout>
