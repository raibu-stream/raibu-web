<script lang="ts">
	import EmailLayout from '$lib/email/EmailLayout.svelte';

	export let verifyCode: string;
	export let existing: boolean = false;
</script>

<EmailLayout
	previewText="Use your verification code {verifyCode} to {existing
		? 'update your email'
		: 'start using your account'}"
>
	<mj-section padding="12px" padding-bottom="0px" padding-top="16px" full-width="">
		<mj-column>
			<mj-text font-size="16px" font-weight="600">
				<h2 style="margin: 0;">Verify your email</h2>
			</mj-text>
		</mj-column>
	</mj-section>
	<mj-section padding="12px" padding-top="10px" full-width="">
		<mj-column>
			<mj-text font-size="14px">
				<p style="margin: 0;">
					{#if existing}
						In order to update your email, we need to confirm your email address
					{:else}
						In order to start using your account, we need to confirm your email address
					{/if}
				</p>
			</mj-text>
		</mj-column>
	</mj-section>
	<mj-section padding="12px" padding-top="0px" padding-bottom="0px" full-width="">
		<mj-column>
			<mj-text align="center" font-size="24px">
				{verifyCode}
			</mj-text>
		</mj-column>
	</mj-section>
</EmailLayout>
