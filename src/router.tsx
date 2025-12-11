import * as Sentry from "@sentry/tanstackstart-react";
import {
  createRouter,
  parseSearchWith,
  stringifySearchWith,
} from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import { stringify, parse } from "zipson";
import * as LZ from "lz-string";

import { decodeFromBinary, encodeToBinary } from "./utils/search-params-core";

const FEATURE_CONFIG = {
  ENABLE_COMPRESSED_SEARCH_PARAMS: false,
};

const parseSearch = (searchStr: string) => {
  const id = performance.now();
  let index = 0;
  const result = parseSearchWith((value) => {
    const decompressed = LZ.decompress(value);
    const _decodedValue = decodeFromBinary(decompressed);
    const _parsedDecodedValue = parse(_decodedValue);
    console.log(`\t[${id}][parseSearch]`, {
      index,
      value,
      decompressed,
      _decodedValue,
      _parsedDecodedValue,
    });
    index += 1;
    return _parsedDecodedValue;
  })(searchStr);
  console.log(`[${id}][parseSearch]`, { searchStr, result });
  return result;
};

const stringifySearch = (searchObj: Record<string, any>) => {
  const id = performance.now();
  let index = 0;
  const result = stringifySearchWith((value) => {
    const _stringifiedValue = stringify(value);
    const compressed = LZ.compress(_stringifiedValue);
    const _encodedStringifiedValue = encodeToBinary(compressed);
    console.log(`\t[${id}][stringifySearch]`, {
      index,
      value,
      compressed,
      _stringifiedValue,
      _encodedStringifiedValue,
    });
    index += 1;
    return _encodedStringifiedValue;
  })(searchObj);
  console.log(`[${id}][stringifySearch]`, { searchObj, result });
  return result;
};

// Create a new router instance
export const getRouter = () => {
  const router = createRouter(
    FEATURE_CONFIG.ENABLE_COMPRESSED_SEARCH_PARAMS
      ? {
          routeTree,
          scrollRestoration: true,
          defaultPreloadStaleTime: 0,
          parseSearch,
          stringifySearch,
        }
      : {
          routeTree,
          scrollRestoration: true,
          defaultPreloadStaleTime: 0,
        }
  );

  if (!router.isServer) {
    Sentry.init({
      dsn: "https://e355b27fdb2047aa2e65b53c737c185c@o4510516655423488.ingest.us.sentry.io/4510516658831360",

      // Adds request headers and IP for users, for more info visit:
      // https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
      sendDefaultPii: true,

      integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for tracing.
      // We recommend adjusting this value in production.
      // Learn more at https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
      tracesSampleRate: 1.0,
      tunnel: "/api/sentry/tunnel",
    });
  }

  return router;
};
