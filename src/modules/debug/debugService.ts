
let hitCounter = 0;

export class DebugService {
  public static debugAfterHit(hitAmount) {
    hitCounter++;
    const should = hitCounter === hitAmount;
    return should;
  }
}
