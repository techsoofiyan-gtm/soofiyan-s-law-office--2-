import GoTrue from 'gotrue-js';

export const auth = new GoTrue({
    APIUrl: 'https://offfice.netlify.app/.netlify/identity',
    setCookie: true,
});
