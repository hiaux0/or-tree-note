export function sendKeyEvent(key: string) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key }));
}

export function sendKeySequence(keys: string) {
  keys.split("").forEach((key) => {
    sendKeyEvent(key);
  });
}
