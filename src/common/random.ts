export function getRandomId() {
  /**
   * "0.g6ck5nyod4".substring(2, 9)
   * -> g6ck5ny
   */
  return Math.random().toString(36).substring(2, 9);
}
