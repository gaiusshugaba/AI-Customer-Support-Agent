// ... existing imports ...

// Add fallback at the top (after imports)
function randomUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback using crypto.getRandomValues
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  buf[6] = (buf[6] & 0x0f) | 0x40;
  buf[8] = (buf[8] & 0x3f) | 0x80;
  return [...buf]
    .map((b, i) =>
      (i === 4 || i === 6 || i === 8 || i === 10)
        ? `-${b.toString(16).padStart(2, "0")}`
        : b.toString(16).padStart(2, "0")
    )
    .join("");
}

// ... rest of the component ...

// Inside startNewConversation:
const id = randomUUID();   // previously crypto.randomUUID()

// Inside deliver:
const localId = randomUUID();   // previously crypto.randomUUID()

// Inside the submit handler (when adding assistant message):
id: randomUUID(),   // previously crypto.randomUUID()

// ... all other crypto.randomUUID() calls replaced similarly.
