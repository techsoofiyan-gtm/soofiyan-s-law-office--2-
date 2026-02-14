import GoTrue from 'gotrue-js';

export const auth = new GoTrue({
    APIUrl: 'https://soofiyan-law-office.netlify.app/.netlify/identity',
    setCookie: true,
});
