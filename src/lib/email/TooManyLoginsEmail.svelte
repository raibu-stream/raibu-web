<script>
	import EmailLayout from '$lib/email/EmailLayout.svelte';
	import theme from '$lib/tailwindConfig.js';

	export let unlockLink;

	const colorNeutral = theme.colors.neutral;
	const colorPrimary = theme.colors.primary;
</script>

<EmailLayout previewText="You've made too many login attempts with the wrong password">
	<mj-section padding="12px" padding-bottom="0px" padding-top="16px" full-width="">
		<mj-column>
			<mj-text font-size="16px" font-weight="600">
				<h2 style="margin: 0;">Too many login attempts</h2>
			</mj-text>
		</mj-column>
	</mj-section>
	<mj-section padding="12px" padding-top="10px" full-width="">
		<mj-column>
			<mj-text font-size="14px">
				<p style="margin: 0;">
					You've made too many attempts to login to your account with the wrong password. Please
					click below to unlock and login to your account. You can request a password reset by
					clicking on "Forgot password?" when logging in.
				</p>
			</mj-text>
		</mj-column>
	</mj-section>
	<mj-section padding="12px" padding-top="0px" padding-bottom="0px" full-width="">
		<mj-column>
			<mj-button
				align="left"
				inner-padding="16px"
				padding-top="0px"
				width="100px"
				background-color={colorPrimary[200]}
				color={colorNeutral[800]}
				font-size="14px"
				border-radius="4px"
				href={unlockLink}>Login</mj-button
			>
		</mj-column>
	</mj-section>
	<mj-section padding="12px" padding-top="2px" padding-bottom="18px" full-width="">
		<mj-column>
			<mj-text font-size="12px">
				<p style="margin: 0;">
					If this wasn't you and your account keeps getting locked, contact us at <a
						href="mailto:contact@raibu.stream"
						style="color: {colorNeutral[100]};"
					>
						contact@raibu.stream
					</a>
				</p>
			</mj-text>
		</mj-column>
	</mj-section>
</EmailLayout>
