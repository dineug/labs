export const PREFIX_ON_EVENT = 'on';
export const PREFIX_EVENT = '@';
export const PREFIX_PROPERTY = '.';
const PREFIX_SPREAD = '...';
const PREFIX_MARKER = 'rx-html$';
const SUFFIX_MARKER = Math.random().toString().replace('.', '');

export const MARKER = `${PREFIX_MARKER}-${SUFFIX_MARKER}`;
export const SPREAD_MARKER = `${PREFIX_SPREAD}${MARKER}`;
