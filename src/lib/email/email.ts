import { convert } from 'html-to-text';
import { createTransport, type TransportOptions } from 'nodemailer';
import {
	RAIBU_EMAIL_HOST,
	RAIBU_EMAIL_PORT,
	RAIBU_EMAIL_USER,
	RAIBU_EMAIL_PASS,
	RAIBU_IP_GEOLOCATION_API_KEY
} from '$env/static/private';
import mjml2html from 'mjml';
import type { SvelteComponent } from 'svelte';
import { error } from '@sveltejs/kit';
import { FRIENDLY_ERROR_MESSAGE } from '$lib/utils';
import PasswordResetAlert from './PasswordResetAlert.svelte';
import { arbitraryHandleError } from '../../hooks.server';
import EmailUpdateAlert from './EmailUpdateAlert.svelte';

const mailer = createTransport({
	host: RAIBU_EMAIL_HOST,
	port: RAIBU_EMAIL_PORT,
	auth: {
		user: RAIBU_EMAIL_USER,
		pass: RAIBU_EMAIL_PASS
	}
} as TransportOptions);

export const sendEmail = async (html: string, subject: string, recipient: string) => {
	const plainText = toPlainText(html);

	await mailer.sendMail({
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

	if (errors.length > 0) error(500, FRIENDLY_ERROR_MESSAGE);

	return html;
};

const stripSvelteClasses = (html: string) =>
	html.replaceAll(/class="s-[\w-]+"/g, '').replaceAll(/data-svelte-h="[\w-]+"/g, '');

export const sendPasswordResetAlert = async (recipient: string, ip: string) => {
	const location = await fetch(
		`https://api.ipgeolocation.io/ipgeo?apiKey=${RAIBU_IP_GEOLOCATION_API_KEY}&ip=${ip}&fields=geo,country_emoji`
	)
		.then(async (res) => {
			const location = await res.json();
			if (location.message !== undefined) throw location.message;

			return `${location.country_name}${location.country_emoji !== '' ? ' ' + location.country_emoji : ''}${location.city !== '' ? ', ' + location.city : location.state_prov !== '' ? ', ' : ' '}${location.state_prov !== '' ? location.state_prov : ''}`;
		})
		.catch(async (err) => {
			await arbitraryHandleError(err);

			return undefined;
		});
	const html = renderMjmlComponent(PasswordResetAlert, {
		location
	});

	await sendEmail(html, 'Raibu password changed', recipient);
};

export const sendEmailUpdateAlert = async (recipient: string) => {
	const html = renderMjmlComponent(EmailUpdateAlert, {});

	await sendEmail(html, 'Raibu email changed', recipient);
};
