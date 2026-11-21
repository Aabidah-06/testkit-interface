# tokens module

`soroban_testkit::tokens` provides Stellar Asset Contract (SAC) test doubles, minting helpers, and balance conservation checks for contract tests.

## Troubleshooting FAQ

**Transfer or deposit panics with insufficient balance.**
The sender address has not been minted enough test tokens, or the amount did not account for Stellar Asset Contract 7-decimal precision. Call `token.mint(&sender, &amount)` before invoking the contract under test, and express whole units in stroops (for example, `10_000_000` for 1.0 token).

**`HostError: Error(Auth, InvalidAction)` on `transfer` or `approve`.**
Stellar Asset Contract calls require authorization from the `from` or `owner` address. Enable `env.mock_all_auths()` for happy-path balance tests, or configure explicit `mock_auths` entries when verifying authorization boundaries.

**`transfer_from` fails even after `approve`.**
The allowance expired before the call, or the spender passed to `transfer_from` does not match the approved address. Pass an `expiration_ledger` greater than or equal to `env.ledger().sequence()` when calling `approve`, and verify the spender address matches.

**Balance conservation assertion fails after fee-splitting calls.**
A conservation check only summed sender and recipient balances without accounting for protocol fee or treasury addresses. Include every participating account (including fee sinks and contract escrow addresses) when asserting total balance deltas across an invocation.
