import { convert } from 'html-to-text';
import { createTransport, type TransportOptions } from 'nodemailer';
import {
	RAIBU_EMAIL_HOST,
	RAIBU_EMAIL_PORT,
	RAIBU_EMAIL_USER,
	RAIBU_EMAIL_PASS
} from '$env/static/private';
import mjml2html from 'mjml';
import type { SvelteComponent } from 'svelte';

const mailer = createTransport({
	host: RAIBU_EMAIL_HOST,
	port: RAIBU_EMAIL_PORT,
	auth: {
		user: RAIBU_EMAIL_USER,
		pass: RAIBU_EMAIL_PASS
	}
} as TransportOptions);

export const sendEmail = (html: string, subject: string, recipient: string) => {
	const plainText = toPlainText(html);

	mailer.sendMail({
		from: `Raibu <${RAIBU_EMAIL_USER}>`,
		to: recipient,
		subject: subject,
		html,
		text: plainText
	});
};

const toPlainText = (html: string) => {
	return convert(html, {
		selectors: [
			{ selector: 'img', format: 'skip' },
			{ selector: '#__raibu-preview-text', format: 'skip' }
		]
	});
};

export const renderMjmlComponent = <Props extends Record<string, any>>(
	component: new (...args: any[]) => SvelteComponent<Props>,
	props: Props
) => {
	const ssrComponent = component as any;
	const { html: mjml } = ssrComponent.render(props);

	const { html, errors } = mjml2html(stripSvelteClasses(mjml));

	if (errors.length > 0) console.error(errors);

	return html;
};

const stripSvelteClasses = (html: string) =>
	html.replaceAll(/class="s-[\w-]+"/g, '').replaceAll(/data-svelte-h="[\w-]+"/g, '');
