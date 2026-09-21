---
status: pending
title: Pass-and-Play Chess with Legal Move Highlighting
---

1. Verify/establish the base app scaffold: `index.html`, `src/main.tsx`, `src/styles/global.css` (containing only the Tailwind import), `vite.config.ts` with the Tailwind and TanStack Router Vite plugins plus the `@/` alias to `src/`, and `tsconfig.json` path mapping for `@/*`. Expected outcome: dev server boots and renders a routed page with Tailwind classes applied.

2. Create `src/types/chess.ts` defining the shared domain types: piece colour, piece kind, a piece value, a square coordinate (file/rank indices), a board representation as an 8x8 grid of nullable pieces, a move descriptor (from, to, optional promotion kind, flags for castle/en-passant/capture), and a full game state containing board, side to move, castling rights for all four sides, en-passant target square or null, halfmove clock, fullmove number, and a game status union (`playing`, `check`, `checkmate`, `stalemate`, `draw-fifty-move`, `draw-insufficient-material`). Expected outcome: one place all logic and UI import types from; no duplicate ad-hoc types elsewhere.

3. Create `src/lib/board.ts` with board construction and small helpers: initial position setup, square in-bounds check, square-to-index conversion, immutable board cloning, piece lookup by square, and square colour (light/dark) computation for rendering. Expected outcome: pure helpers with no React imports, safe to unit-reason about.

4. Create `src/lib/moves.ts` with pseudo-legal move generation per piece type: sliding generation for bishop/rook/queen, offset generation for knight/king, pawn pushes (single, double from starting rank), pawn diagonal captures including capture onto the en-passant target square, castling candidate generation gated on castling rights and empty intervening squares. Expected outcome: a function returning all pseudo-legal moves for a given square, and one returning all pseudo-legal moves for a side.

5. Extend `src/lib/moves.ts` (or add `src/lib/rules.ts`) with legality filtering: an attack-detection function answering "is square X attacked by colour Y", a king-locator, application of a move to produce a new state (handling rook relocation on castle, captured-pawn removal on en passant, piece replacement on promotion, castling-rights revocation when king or rook moves or a rook square is captured, en-passant target set only after a double pawn push, halfmove clock reset on pawn move or capture). Filter pseudo-legal moves by rejecting any that leave the mover's own king in check; additionally reject castling when the king is in check, passes through an attacked square, or lands on one. Expected outcome: `getLegalMoves(state, square)` and `applyMove(state, move)` returning a new immutable state.

6. Add game-status evaluation in the same rules module: after each move, compute whether the side to move is in check, whether it has any legal moves, and resolve to `checkmate`, `stalemate`, `check`, or `playing`; also detect insufficient material (king vs king, king+bishop, king+knight, king+bishop vs king+bishop on same colour) and the fifty-move rule. Expected outcome: `gameState.status` is always accurate immediately after `applyMove`.

7. Create `src/lib/pieces.ts` mapping each colour+kind pair to its Unicode chess glyph and an accessible label (e.g. "white knight"). Expected outcome: single source for piece rendering and aria labels.

8. Create `src/hooks/useChessGame.ts`: holds game state in React state, exposes the current state, the currently selected square, the legal destination squares for that selection, and actions — `selectSquare` (select own piece, re-select another own piece, deselect on repeat click, attempt move when clicking a legal destination), `promote` (resolve a pending promotion choice), and `newGame` (reset). Store a pending-promotion descriptor when a pawn move reaches the last rank so the UI can prompt before committing. Expected outcome: all interaction rules live in one hook; components stay presentational.

9. Create `src/components/Square.tsx`: renders one board square with warm wood tones (light squares a pale sand/maple tone, dark squares a rich walnut tone via Tailwind arbitrary colour values), applies visual states for selected square, legal-move dot (small centred circle for empty targets, ring outline for capture targets), and a red-tinted highlight when the square holds a king in check. Renders the piece glyph centred, large, with a subtle text shadow for contrast. Expected outcome: a pure, memo-friendly button element with proper aria-label.

10. Create `src/components/Board.tsx`: renders an 8x8 grid from the board state using `Square`, wrapped in a thick darker wood frame border with rounded corners and a soft shadow, plus file letters (a–h) and rank numbers (1–8) rendered along the frame edges. White is always at the bottom (no flip, per scope). The board is square and responsive via aspect-ratio and a max width. Expected outcome: a correctly oriented, visually classic board driven purely by props.

11. Create `src/components/PromotionDialog.tsx`: a centred overlay shown only when a promotion is pending, offering queen, rook, bishop, and knight as large glyph buttons in the promoting side's colour, with no dismiss path other than choosing a piece. Expected outcome: promotion always resolves to a valid piece.

12. Create `src/components/GameStatus.tsx`: shows whose turn it is with a small colour swatch and label, a "Check!" notice when applicable, and a prominent game-over message for checkmate (naming the winner), stalemate, or draw, alongside a "New Game" button. Expected outcome: the player always knows the turn and the terminal outcome.

13. Create `src/routes/__root.tsx` as the app shell: a warm neutral page background, centred content container, app heading, and an `Outlet`. Expected outcome: consistent framing for the single route.

14. Create `src/routes/index.tsx` as the game page: consumes `useChessGame` and composes `GameStatus`, `Board`, and `PromotionDialog`, passing selection and legal-destination data down. Expected outcome: visiting `/` gives a fully playable pass-and-play game.

15. Manual verification pass: play through a castle (both sides), an en-passant capture, a promotion to each piece type, a back-rank checkmate, and a stalemate position; confirm illegal moves that expose the king are not offered as highlights, that the turn indicator alternates, that the game-over message appears and blocks further moves, and that "New Game" fully resets state. Expected outcome: no console errors, no type errors, and all rule cases behave correctly.
