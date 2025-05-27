const inputFields = document.querySelectorAll('input[type="password"]');
inputFields.forEach(input => {
    const meter = document.createElement('div');
    meter.style.marginTop = "5px";
    meter.style.fontSize = "12px";
    input.parentNode.insertBefore(meter, input.nextSibling);

    input.addEventListener('input', async () => {
        const password = input.value;
        if (!password) {
            meter.textContent = "";
            return;
        }

        const response = await fetch("https://api.pwnedpasswords.com/range/" + sha1(password).substring(0, 5));
        const text = await response.text();
        const hashSuffix = sha1(password).substring(5).toUpperCase();
        const found = text.includes(hashSuffix);

        meter.textContent = found ? "⚠️ Password found in breach!" : "✅ Password is safe";
        meter.style.color = found ? "red" : "green";
    });
});

function sha1(msg) {
    const crypto = new TextEncoder();
    const data = crypto.encode(msg);
    return crypto.subtle.digest("SHA-1", data).then(buf => {
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    });
}
