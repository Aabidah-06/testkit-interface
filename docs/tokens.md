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

## Version and compatibility

- **Current version**: Soroban SDK 27.0.x and later.
- **Minimum Rust version**: Rust 1.84 or later with the `wasm32v1-none` target.
- **Token standard support**: Implements the Stellar Asset Contract (SEP-41) token interface (`transfer`, `transfer_from`, `approve`, `balance`, `allowance`).
- **Stellar network support**: Compatible with Testnet and Mainnet SAC behavior, using `i128` signed amounts.
- **Known considerations**:
  - **Signed `i128` amounts**: All token amounts and balances use `i128`; negative values or overflows panic as in the Soroban SAC.
  - **Auth requirements on transfers**: `token.mint` uses test admin privileges, whereas `token.transfer` and `token.transfer_from` follow standard SAC authorization rules.
  - **Isolated per `TestEnv`**: Each `env.token()` instance is scoped to its `TestEnv` and does not share state across tests.
