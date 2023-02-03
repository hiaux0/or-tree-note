function replaceAll(target: string, search, replacement) {
  return target.replace(new RegExp(search, 'g'), replacement);
}

export class AddCommaToViewValueConverter {
  toView(numberValue: number) {
    return numberValue?.toLocaleString();
  }

  fromView(currentValue: string) {
    const result = replaceAll(currentValue, ',', '');
    return Number(result);
  }
}
