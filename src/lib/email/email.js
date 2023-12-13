import { convert } from 'html-to-text';
import nodemailer from 'nodemailer';
import {
    RAIBU_EMAIL_HOST,
    RAIBU_EMAIL_PORT,
    RAIBU_EMAIL_USER,
    RAIBU_EMAIL_PASS
} from '$env/static/private';
import mjml2html from "mjml";

const mailer = nodemailer.createTransport({
    host: RAIBU_EMAIL_HOST,
    port: RAIBU_EMAIL_PORT,
    secure: true,
    auth: {
        user: RAIBU_EMAIL_USER,
        pass: RAIBU_EMAIL_PASS
    }
});

export const sendEmail = (html, subject, recipient) => {
    const plainText = toPlainText(html);

    mailer.sendMail({
        from: `Raibu <${RAIBU_EMAIL_USER}>`,
        recipient,
        subject: subject,
        html,
        text: plainText
    });
}

const toPlainText = (html) => {
    return convert(html, {
        selectors: [
            { selector: 'img', format: 'skip' },
            { selector: '#__raibu-preview-text', format: 'skip' }
        ]
    });
}

export const renderMjmlComponent = (component, props) => {
    const { html: mjml } = component.render(props);

    const { html, errors } = mjml2html(stripSvelteClasses(mjml));
    if (errors.length > 0) console.error(errors);

    return html;
};

const stripSvelteClasses = (html) =>
    html.replaceAll(/class="s-[\w-]+"/g, "").replaceAll(/data-svelte-h="[\w-]+"/g, "");
