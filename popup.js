document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById('password');
    const checkBtn = document.getElementById('checkBtn');
    const meter = document.createElement('div');
    meter.style.marginTop = "5px";
    meter.style.fontSize = "12px";
    input.parentNode.insertBefore(meter, input.nextSibling);

    checkBtn.addEventListener("click", async () => {
        const password = input.value;
        if (!password) {
            meter.textContent = "";
            return;
        }

        const strength = getPasswordStrength(password);
        meter.textContent = `Strength: ${strength.label}`;
        meter.style.color = strength.color;

        try {
            const fullHash = (await sha1(password)).toUpperCase();
            const prefix = fullHash.substring(0, 5);
            const suffix = fullHash.substring(5);

            const response = await fetch("https://api.pwnedpasswords.com/range/" + prefix);
            const text = await response.text();

            const lines = text.split('\n');
            let breachCount = 0;
            for (const line of lines) {
                const [hashSuffix, count] = line.split(':');
                if (hashSuffix === suffix) {
                    breachCount = parseInt(count);
                    break;
                }
            }

            if (breachCount > 0) {
                meter.textContent += ` ⚠️ Found in breaches ${breachCount} time${breachCount > 1 ? 's' : ''}! Change your password.`;
                meter.style.color = "red";
            } else {
                meter.textContent += " ✅ Password not found in breaches.";
                if (strength.color !== "red") meter.style.color = "green";
            }
        } catch (error) {
            meter.textContent += " ⚠️ Error checking breach status.";
            meter.style.color = "orange";
            console.error("Error checking password breach:", error);
        }
    });
});

function getPasswordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    switch(score) {
        case 0:
        case 1: return { label: "Very Weak", color: "red" };
        case 2: return { label: "Weak", color: "orange" };
        case 3: return { label: "Moderate", color: "blue" };
        case 4: return { label: "Strong", color: "green" };
    }
}

async function sha1(msg) {
    const encoder = new TextEncoder();
    const data = encoder.encode(msg);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
