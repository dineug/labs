export const PREFIX_ON_EVENT = 'on';
export const PREFIX_EVENT = '@';
export const PREFIX_PROPERTY = '.';
export const PREFIX_BOOLEAN = '?';
const PREFIX_SPREAD = '...';
const PREFIX_MARKER = 'r-html';
const SUFFIX_MARKER = Math.random().toString().replace('.', '');

export const MARKER = `${PREFIX_MARKER}-${SUFFIX_MARKER}`;
export const SPREAD_MARKER = `${PREFIX_SPREAD}${MARKER}`;

export const markerIndexRegexp = new RegExp(`${MARKER}-(\\d+)`);
export const multiMarkerIndexRegexp = new RegExp(`(${MARKER}-(\\d+))`, 'g');
export const replaceMarkerRegexp = new RegExp(`${MARKER}-\\d+`, 'g');
export const markerOnlyRegexp = new RegExp(`^${MARKER}-\\d+$`);
