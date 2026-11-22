# money module

`soroban_testkit::money` provides adversarial numeric inputs and token conservation assertions so rounding errors, overflow boundaries, and leaked balances fail tests immediately.

## API overview

- `Conservation::new(before, after)` — captures the expected and observed total supply across participating accounts for a state transition.
- `.assert_holds()` — asserts that `before == after`, panicking with the signed delta if any value was leaked or created.
- `assert_conserved_over(initial, steps)` — verifies that total supply remains conserved after every transition in a multi-step lifecycle.
- `adversarial_amounts()` — generates boundary and rounding-edge `i128` inputs (`0`, `1`, `i128::MAX`) to stress-test arithmetic and overflow handling.

## Quick start

1. Add the crate: `cargo add --dev soroban-testkit`.
2. Create a `TestEnv`, spin up a token with `env.token()`, and generate buyer, seller, and escrow addresses via `env.address()`.
3. Mint the initial balance and record `initial_total` before executing transfers or contract calls.
4. Compute `after_total` and call `Conservation::new(initial_total, after_total).assert_holds()` (or `assert_conserved_over` for multi-step flows).

## Runnable example

Put this in a test file of your contract crate (for example `tests/money.rs`), with `soroban-testkit` as a dev-dependency, then run `cargo test`:

```rust
use soroban_testkit::core::TestEnv;
use soroban_testkit::money::Conservation;

#[test]
fn escrow_release_conserves_total_supply() {
    let env = TestEnv::new();
    let token = env.token();
    let buyer = env.address();
    let seller = env.address();
    let escrow = env.address();

    token.mint(&buyer, 1_000);
    let initial_total = token.balance(&buyer) + token.balance(&seller) + token.balance(&escrow);

    // Simulate escrow deposit and partial release.
    token.transfer(&buyer, &escrow, 1_000);
    token.transfer(&escrow, &seller, 600);

    let after_total = token.balance(&buyer) + token.balance(&seller) + token.balance(&escrow);
    Conservation::new(initial_total, after_total).assert_holds();
}
```

For multi-step lifecycles (such as vesting schedules with repeated claims), use `soroban_testkit::money::assert_conserved_over` to verify conservation after every state transition.

## Common failure modes

- **`supply conservation mismatch`**: `Conservation::new(before, after).assert_holds()` panicked because `after` differed from `before`. Check for unburned fees, rounding dust, or missed account balances in the total.
- **`i128 arithmetic overflow`**: summing balances or multiplying large adversarial amounts exceeded `i128::MAX`. Use checked arithmetic (`checked_add`, `checked_mul`) in contract calculations.
- **`rounding dust accumulation`**: integer division or fee splits truncated remainders across repeated transfers, causing `assert_conserved_over` to fail on a later step.
- **`negative amount input`**: passing a negative `i128` amount to token transfers or mints panics immediately; validate `amount >= 0` at contract entry points.
