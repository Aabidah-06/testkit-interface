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
