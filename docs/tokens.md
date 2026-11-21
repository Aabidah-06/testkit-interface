# tokens module

`soroban_testkit::tokens` provides Stellar Asset Contract (SAC) test doubles for deterministic minting, transfers, allowances, and balance assertions in contract tests.

## Quick start

1. Add the crate: `cargo add --dev soroban-testkit`.
2. Create a deterministic `TestEnv` and deploy a Stellar Asset Contract test double:

   ```rust
   use soroban_testkit::core::TestEnv;

   let env = TestEnv::new();
   let token = env.token();
   let alice = env.address();
   let bob = env.address();
   ```

3. Mint an initial balance to an account:

   ```rust
   token.mint(&alice, 1_000);
   assert_eq!(token.balance(&alice), 1_000);
   ```

4. Transfer tokens or pass `token.address()` into your contract under test, then assert the resulting balances:

   ```rust
   token.transfer(&alice, &bob, 350);
   assert_eq!(token.balance(&alice), 650);
   assert_eq!(token.balance(&bob), 350);
   ```
