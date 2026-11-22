# money module

`soroban_testkit::money` provides adversarial numeric inputs and token conservation assertions so rounding errors, overflow boundaries, and leaked balances fail tests immediately.

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

## Version and compatibility

- **Current version**: Soroban SDK 27.0.x and later.
- **Minimum Rust version**: Rust 1.84 or later with the `wasm32v1-none` target.
- **Stellar network support**: Compatible with Testnet and Mainnet `i128` / `u128` arithmetic and Stellar Asset Contract (SEP-41) balance semantics.
- **Known considerations**:
  - **Signed `i128` token balances**: Soroban SAC balances use signed `i128`; adversarial boundary inputs test `0`, `1`, `i128::MAX`, and overflow boundaries.
  - **Rounding and dust**: Integer division in fee splits or pro-rata payouts can leave dust; `Conservation::new(initial, after).assert_holds()` catches leaked or created value.
  - **Multi-step workflows**: Use `assert_conserved_over` when testing multi-step lifecycles such as escrow releases or vesting claims so invariants hold after every transition.

## Troubleshooting FAQ

- **Why does `Conservation::assert_holds()` fail by 1 or a few stroops?**
  Integer division in fee, split, or pro-rata calculations truncated a remainder without accounting for dust. Route remainder/dust explicitly to a designated recipient or treasury so total supply is conserved.
- **Why does my contract panic on `i128::MAX` or adversarial boundary inputs?**
  Unchecked arithmetic (`+`, `-`, `*`) overflowed `i128` in debug or WASM builds. Use `checked_add`, `checked_sub`, and `checked_mul` and return a contract error on overflow.
- **Why does `assert_conserved_over` fail on an intermediate step even though the final balance matches?**
  An intermediate state transition temporarily minted, burned, or miscounted a participant's balance before a later step compensated for it. Include every holding address (such as escrow or fee vaults) in the conserved total at each step.
- **Why do negative amounts cause a panic before my conservation check runs?**
  Soroban SAC `transfer` and `mint` reject negative `i128` amounts at the host boundary. Validate `amount > 0` (or `>= 0` where zero-value no-ops are allowed) at contract entry points.
