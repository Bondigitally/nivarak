/** Hash links that stay on `/` when already home, otherwise go via `/#…`. */
export function marketingHomeHash(hash: string, isHome: boolean) {
  const normalized = hash.startsWith("#") ? hash : `#${hash}`;
  return isHome ? normalized : `/${normalized}`;
}
