export function stringToBoolean(str:string) {
  switch (str.toLowerCase().trim()) {
    case 'true':
    case 'yes':
    case '1':
      return true;
    case 'false':
    case 'no':
    case '0':
    case null:
      return false;
    default:
      return Boolean(str); // or throw an error, depending on the desired behavior
  }
}