// hash digest (https://jameshfisher.com/2017/10/30/web-cryptography-api-hello-world/)
async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(str));
  return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
}

// encrypt/decrypt AES-GCM (https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a)
async function aesGcmEncrypt(plaintext, password) {
  const pwUtf8 = new TextEncoder().encode(password);
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const alg = { name: 'AES-GCM', iv: iv };

  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);

  const ptUint8 = new TextEncoder().encode(plaintext);
  const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);

  const ctArray = Array.from(new Uint8Array(ctBuffer));
  const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');
  const ctBase64 = btoa(ctStr);

  const ivHex = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('');

  return ivHex+ctBase64;
}

async function aesGcmDecrypt(ciphertext, password) {
  const pwUtf8 = new TextEncoder().encode(password);
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);

  const iv = ciphertext.slice(0,24).match(/.{2}/g).map(byte => parseInt(byte, 16));

  const alg = { name: 'AES-GCM', iv: new Uint8Array(iv) };

  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);

  const ctStr = atob(ciphertext.slice(24));
  const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)));

  const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8);
  const plaintext = new TextDecoder().decode(plainBuffer);

  return plaintext;
}

// show an error
function show_error(msg) {
  var err = '<span id="err", style="background-color:red;color:white;">'+msg+"</span>";
  $("body").html($("body").html()+err);
}

