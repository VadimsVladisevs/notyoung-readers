// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill for global crypto.getRandomValues used by Vite in certain environments
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
	try {
		// prefer webcrypto if available
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const nodeCrypto = require('crypto');
		if (nodeCrypto.webcrypto && nodeCrypto.webcrypto.getRandomValues) {
			globalThis.crypto = nodeCrypto.webcrypto;
		} else if (!globalThis.crypto || !globalThis.crypto.getRandomValues) {
			globalThis.crypto = globalThis.crypto || {};
			globalThis.crypto.getRandomValues = (arr) => {
				const buf = nodeCrypto.randomBytes(arr.length);
				arr.set(buf);
				return arr;
			};
		}
	} catch (e) {
		// ignore - best effort polyfill
	}
}
