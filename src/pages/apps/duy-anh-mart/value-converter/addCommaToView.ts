function replaceAll(target: string, search, replacement) {
  return target.replace(new RegExp(search, 'g'), replacement);
}

export class AddCommaToViewValueConverter {
  toView(numberValue: number) {
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: addCommaToView.ts ~ line 3 ~ numberInput', numberValue);
    return numberValue?.toLocaleString();
  }

  fromView(currentValue: string) {
    const result = replaceAll(currentValue, ',', '');
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: addCommaToView.ts ~ line 13 ~ result ', result);
    return Number(result);
  }
}
