export interface Country {
  name: { common: string }
  idd: { root: string; suffixes: string[] }
  flag: string
  cca2: string
}

export async function fetchCountries(): Promise<Country[]> {
  const res = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,flag,cca2')
  return res.json()
}

export function getDialCode(country: Country): string {
  if (!country.idd?.root) return ''
  const suffix = country.idd.suffixes?.[0] || ''
  return country.idd.root + suffix
}