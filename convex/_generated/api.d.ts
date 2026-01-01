/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as duels from "../duels.js";
import type * as files from "../files.js";
import type * as maintenance from "../maintenance.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as oracle from "../oracle.js";
import type * as posts from "../posts.js";
import type * as quests from "../quests.js";
import type * as teams from "../teams.js";
import type * as users from "../users.js";
import type * as worldEvents from "../worldEvents.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  duels: typeof duels;
  files: typeof files;
  maintenance: typeof maintenance;
  messages: typeof messages;
  notifications: typeof notifications;
  oracle: typeof oracle;
  posts: typeof posts;
  quests: typeof quests;
  teams: typeof teams;
  users: typeof users;
  worldEvents: typeof worldEvents;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
