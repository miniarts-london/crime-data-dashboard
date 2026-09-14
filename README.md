# Crime Data Dashboard

Search UK street-level crime by postcode and month range. Results show as totals, a map, and a filterable table. Data comes from [police.uk](https://data.police.uk/) (usually about two months behind) and postcodes are geocoded via [getthedata.com](https://www.getthedata.com/open-postcode-geo-api).

## Run

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) (or the port Next prints if 3000 is taken).

```bash
npm run test:run   # unit / component tests
npm run lint
```

## Trade-offs

- **APIs are called from the browser, not through Next.js route handlers.** That kept the app a static client with no backend to host or rate-limit. What it gives up: server-side caching, a single place to retry/backoff, and a HTTPS proxy for getthedata’s `http://` endpoint (which can fail as mixed content on an HTTPS deploy).

- **The map skips SSR (`next/dynamic` with `ssr: false`) so Leaflet never runs on the server.** That avoided the `window is not defined` crash. What it gives up: the map is absent from the first HTML payload, and this is only a client-only import, not true on-demand loading — the map still downloads as soon as the dashboard mounts, so people who never search still pay for Leaflet.

- **Searched postcodes live in `localStorage` (25 most recent), not a user account.** History survives refresh and extra tabs on the same browser with no auth. What it gives up: no history across devices or browsers, and nothing is stored if storage is blocked.

- **Searches are capped at 40 postcode/month combinations, with four requests in flight.** That avoids hammering public APIs and the police.uk 10k-crime 503. What it gives up: you cannot run a wide date range across many postcodes in one go.

- **Filtering only works by clicking table cells, with no visible filter control.** `CrimeTable.tsx` makes Postcode, Crime Type, and Outcome cells clickable to filter, but the category/outcome breakdown in `CrimeOverview.tsx` — the most natural place to expect a click-to-filter — is static, with no `onClick`. What it gives up: discoverability; there's no visual cue that filtering is even possible without reading the caption above the table.

## What I'd do with more time

- **Proxy the two APIs through Next.js Route Handlers** (`app/api/postcode/[postcode]/route.ts`, `app/api/crimes/route.ts`). No new infrastructure — Next.js already runs a server for this app — and it closes the mixed-content risk for real, drops the `NEXT_PUBLIC_` prefix requirement, and opens the door to shared server-side caching instead of today's per-browser in-memory cache.

- **Gate the map behind whether a search has happened**, not just behind SSR: `{searchPoints.length > 0 ? <CrimeMap .../> : <Typography>No data yet - run a search above.</Typography>}`. `next/dynamic(..., { ssr: false })` stays as-is for the SSR-safety it already gives; this just stops the Leaflet bundle from downloading for a visitor who never searches.

- **Wire `CrimeOverview`'s bars into the existing filter state.** Pass `onQuickFilter`/`activeFilters` down into `CrimeOverview.tsx` and add an `onClick` to `BarRow`, reusing the same `quickFilters` state `CrimeTable.tsx` already drives. Cheapest of the filtering options considered (a full filter panel, or a filter row above the table, would take more work for a similar discoverability win) since it needs no new state shape — it just makes the breakdown clickable instead of read-only.

- **Batch large searches instead of rejecting them outright.** `runSearch` in `Dashboard.tsx` currently rejects any search over `MAX_REQUESTS` (40) postcode/month combinations before firing a single request. Chunking the pairs into batches of `MAX_REQUESTS`, running them sequentially through the existing concurrency limiter, and streaming `crimes` updates as each batch resolves (instead of one `setCrimes` call at the end) would let a genuinely large search run — slower, with results appearing progressively — rather than being blocked outright. The police API has no bulk endpoint, so the total request count doesn't shrink; only the all-or-nothing UX does.

- **Cross-highlight the table and map on selection.** Clicking a table row doesn't currently do anything beyond the existing cell-level postcode/category/outcome filters, and clicking a map marker only opens its popup — neither is aware of the other. A shared `selectedCrimeId` state (keyed by `CrimeRecord.id`, lifted into `Dashboard.tsx` and passed to both `CrimeTable` and `CrimeMap`) would let selecting a row call `leaflet.markercluster`'s `zoomToShowLayer(marker, callback)` — built in specifically to reveal a marker that's currently rolled up inside a cluster bubble — and open its popup, and let clicking a marker highlight and scroll to the matching row in the table. The main wrinkle: crime markers in `CrimeMap.tsx` are built imperatively via `L.markerClusterGroup()` inside `ClusterLayer`'s `useEffect` rather than as declarative react-leaflet `<Marker>`s, so each one would need to be kept in a `Map<string, L.Marker>` keyed by crime id as it's created, so it can be looked up when a table row is clicked.

- **No feedback for an invalid From/To month.** `SearchBar.tsx` disables invalid months in the calendar UI (`shouldDisableMonth`, `maxDate`) so clicking one does nothing visible beyond it being greyed out — but that check isn't repeated for typed input: the `onChange` handlers only call `newValue.isValid()` (is this a real date) before accepting it into `from`/`to` state, not `isUnavailableMonth()` (is this an allowed date). So typing a future month, or a "To" month before "From", directly into the field slips straight into state with no rejection, no red/error styling, and no message — the `onError` callback MUI X's `DatePicker` provides specifically for this (reporting `'shouldDisableMonth' | 'minDate' | 'maxDate' | 'invalidDate' | null`) isn't wired up at all. The fix is two-part: add `onError` on both pickers to set a local `fromError`/`toError` state shown via `slotProps.textField.error`/`helperText` (e.g. "No data before this month yet" / "Must be on or after From"), and have the `onChange` handlers themselves re-check `isUnavailableMonth()` before calling `onFromChange`/`onToChange`, so a typed value can't bypass the same rule the calendar already enforces.

- **Split route files from screen components for scalability.** Right now `app/page.tsx` renders `Dashboard` directly, and everything — the full-page composition (`Dashboard.tsx`) alongside genuinely reusable pieces (`SearchBar.tsx`, `CrimeMap.tsx`, `CrimeTable.tsx`, `CrimeOverview.tsx`, `PostcodeHistory.tsx`, `Header.tsx`) — sits flat under `components/`. That's fine for a single-route app, but it doesn't scale: there's no convention for where a new route's page composition should live versus its reusable parts. Moving page/route files under an `app/(pages)/` route group (a route group's parentheses don't affect the URL, they just keep route files organized separately from layouts, API routes, etc.) and full-page compositions into a `screens/` folder (e.g. `Dashboard.tsx` → `screens/DashboardScreen.tsx`) would let `page.tsx` files stay thin (route + data-fetching only), `screens/` hold the per-route composition and state, and `components/` stay reserved for pieces actually reused across more than one screen. Worth doing before a second route is added, not after — it's cheap now and a larger refactor later, but it's pure structure with no functional change, so it doesn't improve the app as it stands with just one route today.
