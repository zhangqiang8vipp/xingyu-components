# Contributing (pre-release)

This repository is public but experimental. Its open-source license has not been selected, so external code contributions are on hold until the maintainer selects a license and contribution policy.

Internal development checklist:

1. Branch from `main`; open a Draft PR for changes in the core contract.
2. Add a schema first. One registered component type must have one strict parser shape and one documented rendering path.
3. Run `npm install && npm run ci`. Add tests for valid input, unknown keys, bounds, fallback, escaping, mobile and keyboard behavior. Every registered component must have a real-renderer fixture under `gallery/fixtures.mjs`, otherwise the gallery build rejects the PR.
4. Never relax an existing version or security boundary to pass tests.
5. Keep site-specific permissions, publishing, storage, LLM orchestration and cloud configuration outside this repository.
6. Do not accidentally check in production data, credentials, secrets, user files or private XINGYU implementation details.
