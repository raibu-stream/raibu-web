<script>
	import EmailLayout from '$lib/email/EmailLayout.svelte';
	import theme from '$lib/tailwindConfig.js';

	export let resetLink;

	const colorNeutral = theme.colors.neutral;
	const colorPrimary = theme.colors.primary;
</script>

<EmailLayout previewText="You've requested a password reset. Click here to reset your password">
	<mj-section padding="12px" padding-bottom="0px" padding-top="16px" full-width="">
		<mj-column>
			<mj-text font-size="16px" font-weight="600">
				<h2 style="margin: 0;">Reset your password</h2>
			</mj-text>
		</mj-column>
	</mj-section>
	<mj-section padding="12px" padding-top="10px" full-width="">
		<mj-column>
			<mj-text font-size="14px">
				<p style="margin: 0;">If you requested a password reset, click the button below.</p>
			</mj-text>
		</mj-column>
	</mj-section>
	<mj-section padding="12px" padding-top="0px" padding-bottom="0px" full-width="">
		<mj-column>
			<mj-button
				align="left"
				inner-padding="16px"
				padding-top="0px"
				width="150px"
				background-color={colorPrimary[200]}
				color={colorNeutral[800]}
				font-size="14px"
				border-radius="4px"
				href={resetLink}>Reset password</mj-button
			>
		</mj-column>
	</mj-section>
	<mj-section padding="12px" padding-top="2px" padding-bottom="18px" full-width="">
		<mj-column>
			<mj-text font-size="12px">
				<p style="margin: 0;">
					If you didn't request a password reset, you're safe to ignore this email.
				</p>
			</mj-text>
		</mj-column>
	</mj-section>
</EmailLayout>
