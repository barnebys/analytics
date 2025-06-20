import { parse } from 'node:url';

export default function queryParser(url) {
  const { query } = parse(url, true);

  if (query._h === 'event') {
    return {
      hitType: query._h,
      fingerprint: query._f,
      refs: query._r,
      programId: query.p,
      url: query.url,
      category: query.c,
      action: query.a,
      label: query.l,
      value: query.v,
      currency: query.cur,
      source: query.source,
    };
  } else {
    return {
      hitType: query._h,
      programId: query.p,
      kind: query.k && query.k.replace(/-/g, '_'),
      affiliate: query.a,
      url: query.url,
      dimension1: query.d1,
      dimension2: query.d2,
      dimension3: query.d3,
      dimension4: query.d4,
      dimension5: query.d5,
      isSponsored: query.sp,
      dealType: query.dt,
      secret: query.s,
      source: query.source,
    };
  }
}
