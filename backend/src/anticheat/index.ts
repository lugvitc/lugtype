export function implemented(): boolean {
  return false;
}

export function validateResult(
  _result: object,
  _version: string,
  _uaStringifiedObject: string,
  _lbOptOut: boolean
): boolean {
  return true;
}

export function validateKeys(_result: object, _uid: string): boolean {
  return true;
}
