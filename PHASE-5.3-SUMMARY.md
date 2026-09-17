# Phase 5.3 — Calm Over-Limit Treatment

- **Token:** Reused the existing semantic `--warning` token; no new color was added. Its dark-theme value is `#D6A852` with muted surface `#4B3920`; its light-theme value is `#9A6A21` with muted surface `#F5E8C8`.
- **Threshold:** The calm warning state begins at the first amount strictly greater than the monthly limit (`spent > limit`). A hard boundary avoids a second, arbitrary buffer and reflects the student’s stated cap exactly.
- **Views:** `CategoryProgress` switches its capped fill from `--accent` to `--warning` and announces “A bit over this month.” In the category-management list, the same compact warning bar appears with that plain-language label. In category detail, the shared component replaces the former red weekly bar and label.
- **Dashboard and insights:** The home spending snapshot now uses the warning token and the same “A bit over this month” copy for a monthly cap passed. Pace-vs-budget insight cards use `--warning` rather than a category accent, and their sentence says “a bit past your plan.” Other Phase 4 insight types do not represent a category limit crossing.
- **Motion:** The existing calm width transition remains; no alert motion or iconography was added.
- **Verification:** `npm run typecheck`, `npm run test:run -- src/lib/insights.test.ts src/lib/customCategories.test.ts` (9 passing), and `npm run build` pass.
