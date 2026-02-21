

# Responsive Optimization Plan

This plan covers making the Automation Analyzer look and work great across desktop (1200px+), tablet (768-1199px), and mobile (<768px).

---

## Current Issues

- **Results header bar**: On mobile, the logo + input + mic + analyze button all sit in one row and get cramped
- **Results grid**: `lg:grid-cols-[380px_1fr]` only kicks in at 1024px, so tablets get a single-column layout but without mobile-optimized spacing
- **Effort/Impact Matrix**: Fixed `h-[280px]` is too tall on small screens
- **Workflow Blueprint**: Horizontal scroll works, but nodes have rigid min-widths that waste space on mobile
- **ScoreDial**: Fixed `w-40 h-40` doesn't scale down for small screens
- **Search History**: Delete button only appears on hover (unusable on touch devices)
- **Landing textarea placeholder**: Long example text overflows on narrow screens
- **Task description under title**: `max-w-xl` can still overflow on very small screens

---

## Changes by File

### 1. `src/pages/Index.tsx`

**Results header bar (mobile-first):**
- Wrap the header in a stacked layout on mobile: logo on top, input row below
- On mobile (`<md`), stack vertically; on `md+`, keep current horizontal layout
- Hide the "Automation Analyzer" text label on small screens, keep just the icon

**Results grid:**
- Change from `lg:grid-cols-[380px_1fr]` to `md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr]` so tablets get the two-column layout too

**Task summary title:**
- Add `px-4` and `text-base md:text-xl` for the title
- Add `text-xs md:text-sm` for the description with `line-clamp-3` on mobile

**Landing page:**
- Reduce textarea rows on mobile: use `rows={4}` on mobile, `rows={5}` on desktop (via a responsive approach or keeping rows=4 which works fine)
- Scale heading: `text-3xl md:text-4xl lg:text-5xl`

### 2. `src/components/ScoreDial.tsx`

- Make the dial smaller on mobile: `w-28 h-28 md:w-40 md:h-40`
- Scale the score text: `text-3xl md:text-4xl`

### 3. `src/components/EffortImpactMatrix.tsx`

- Reduce chart height on mobile: `h-[220px] md:h-[280px]`
- Reduce chart margins on mobile for better use of space

### 4. `src/components/WorkflowBlueprint.tsx`

- Reduce node `min-w` on mobile: `min-w-[100px] md:min-w-[120px]`
- Reduce padding: `px-3 py-2 md:px-4 md:py-3`

### 5. `src/components/SearchHistory.tsx`

- Make the delete button always visible on touch devices (remove `opacity-0 group-hover:opacity-100`, use `md:opacity-0 md:group-hover:opacity-100` instead so it's always visible on mobile/tablet)

### 6. `src/components/ResultCard.tsx`

- Reduce card padding on mobile: `p-4 md:p-6 lg:p-8` (currently `p-6 md:p-8`)
- Codewords prompt section: ensure horizontal scroll on mobile with `overflow-x-auto`

---

## Technical Details

All changes use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) -- no new dependencies or hooks needed. The existing `useIsMobile` hook is available if any JS-level branching is required, but CSS-only responsiveness is preferred for performance.

### Breakpoint strategy:
- **Mobile**: default (no prefix) -- targets < 768px
- **Tablet**: `md:` -- targets 768px+
- **Desktop**: `lg:` -- targets 1024px+

No structural changes to component APIs or state management. All changes are purely presentational.

