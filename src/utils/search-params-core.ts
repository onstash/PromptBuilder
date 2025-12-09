export function decodeFromBinary(str: string): string {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );
}

export function encodeToBinary(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    }),
  );
}

// Generic mapping type
type KeyMapping<T, S> = {
  [K in keyof S]: keyof T;
};

// Generic converter functions
export const createSearchParamsConverter = <
  TLong extends Record<string, any>,
  TShort extends Record<string, any>,
>(
  mapping: KeyMapping<TLong, TShort>,
) => {
  return {
    longToShort: (data: Partial<TLong>): Partial<TShort> => {
      const result: Partial<TShort> = {};
      for (const [shortKey, longKey] of Object.entries(mapping)) {
        result[shortKey as keyof TShort] = data[longKey as keyof TLong];
      }
      return result;
    },
    shortToLong: (data: Partial<TShort>): Partial<TLong> => {
      const result: Partial<TLong> = {};
      for (const [shortKey, longKey] of Object.entries(mapping)) {
        result[longKey as keyof TLong] = data[shortKey as keyof TShort];
      }
      return result;
    },
  };
};

// Generic key mapping factory function
export const createKeyMapping = <
  TLong extends Record<string, any>,
  TShort extends Record<string, any>,
>(
  mapping: KeyMapping<TLong, TShort>,
): KeyMapping<TLong, TShort> => {
  return mapping;
};
