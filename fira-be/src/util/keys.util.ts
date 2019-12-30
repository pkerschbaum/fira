// based on https://gitlab.com/aquator/node-get-keycloak-public-key

const BEGIN_KEY = '-----BEGIN RSA PUBLIC KEY-----\n';
const END_KEY = '\n-----END RSA PUBLIC KEY-----\n';

export function convertKey(key: {n: string, e: string}) {
  return getPublicKey(key.n, key.e);
}

// Based on tracker1's node-rsa-pem-from-mod-exp module.
// See https://github.com/tracker1/node-rsa-pem-from-mod-exp
function getPublicKey(modulus: string, exponent: string) {
  const mod = convertToHex(modulus);
  const exp = convertToHex(exponent);
  const encModLen = encodeLenght(mod.length / 2);
  const encExpLen = encodeLenght(exp.length / 2);
  const part = [mod, exp, encModLen, encExpLen].map(n => n.length / 2).reduce((a, b) => a + b);
  const bufferSource = `30${encodeLenght(part + 2)}02${encModLen}${mod}02${encExpLen}${exp}`;
  const pubkey = Buffer.from(bufferSource, 'hex').toString('base64');
  return BEGIN_KEY + pubkey.match(/.{1,64}/g)?.join('\n') + END_KEY;
}

function convertToHex(str: string) {
  const hex = Buffer.from(str, 'base64').toString('hex');
  return hex[0] < '0' || hex[0] > '7'
    ? `00${hex}`
    : hex;
}

function encodeLenght(n: number) {
  return n <= 127
    ? toHex(n)
    : toLongHex(n);
}

function toLongHex(n: number) {
  const str = toHex(n);
  const lengthByteLength = 128 + (str.length / 2);
  return toHex(lengthByteLength) + str;
}

function toHex(n: number) {
  const str = n.toString(16);
  return (str.length % 2)
    ? `0${str}`
    : str;
}
