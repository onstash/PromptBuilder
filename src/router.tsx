import {
  createRouter,
  // parseSearchWith,
  // stringifySearchWith,
} from "@tanstack/react-router";

// import { stringify, parse } from "zipson";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
// import { decodeFromBinary, encodeToBinary } from "./utils/search-params";

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // parseSearch: (searchStr: string) => {
    //   const id = performance.now();
    //   const result = parseSearchWith((value) => parse(decodeFromBinary(value)))(
    //     searchStr
    //   );
    //   console.log(`[${id}][parseSearch]`, { searchStr, result });
    //   return result;
    // },
    // stringifySearch: (searchObj: Record<string, any>) => {
    //   const id = performance.now();
    //   const result = stringifySearchWith((value) =>
    //     encodeToBinary(stringify(value))
    //   )(searchObj);
    //   console.log(`[${id}][stringifySearch]`, { searchObj, result });
    //   return result;
    // },
  });

  return router;
};
