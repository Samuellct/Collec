# [0.2.0](https://github.com/Samuellct/Collec/compare/v0.1.0...v0.2.0) (2026-04-18)


### Bug Fixes

* **auth:** add minimal reset-password page for step 03 testing ([c5cf93a](https://github.com/Samuellct/Collec/commit/c5cf93adebc5399a26f21c4f8b1c176f09e56289))
* **auth:** fix server URL port and add verify-email GET handler for step 03 testing ([d018cd0](https://github.com/Samuellct/Collec/commit/d018cd0d8bf979fc43d42b8b358882e035d496f4))
* **auth:** use import type for MigrateUpArgs and MigrateDownArgs in migrations ([8f1f172](https://github.com/Samuellct/Collec/commit/8f1f17203b1f7a487e07e0f10ffc5de5c44aee2f))
* **auth:** wrap useSearchParams in Suspense on reset-password page ([dacc9b0](https://github.com/Samuellct/Collec/commit/dacc9b04ef1a62242b410ea4897aeec6744d06b6))
* **cicd:** replace peter-evans/create-pull-request with gh pr create ([093eec9](https://github.com/Samuellct/Collec/commit/093eec9bc7050160f29c24568274f968e5eac426))


### Features

* **auth:** add admins collection with restricted access ([48aa40e](https://github.com/Samuellct/Collec/commit/48aa40e924a000975ffbb50ac40ac773fb74c857))
* **auth:** add customers collection with email verification and lockout ([0b0a6cb](https://github.com/Samuellct/Collec/commit/0b0a6cb2a0a0b5342a7ceffe7987f6af51dc966c))
* **auth:** add turnstile validation and register/forgot-password handlers ([0408432](https://github.com/Samuellct/Collec/commit/0408432dd889b3fe11d9d304718db76a2741ad29))
* **auth:** wire resend email adapter with verification and reset templates ([33c84cc](https://github.com/Samuellct/Collec/commit/33c84cc899948a49179dc96e73e1747becacecc1))

# [0.1.0](https://github.com/Samuellct/Collec/compare/v0.0.1...v0.1.0) (2026-04-17)


### Features

* **design:** add Tailwind v4 design tokens and Google fonts [skip ci] ([27c2130](https://github.com/Samuellct/Collec/commit/27c2130f86cb2e6b8b0fb1fb424905137be7e62a)), closes [#F4EFE6](https://github.com/Samuellct/Collec/issues/F4EFE6) [#121417](https://github.com/Samuellct/Collec/issues/121417) [#B85C38](https://github.com/Samuellct/Collec/issues/B85C38) [#B5964](https://github.com/Samuellct/Collec/issues/B5964)
* **docker:** add multi-stage Dockerfile and prod compose [skip ci] ([9d22400](https://github.com/Samuellct/Collec/commit/9d224006aa262381d53de62e91bb565691c55747))
* **frontend:** add base layout and home page [skip ci] ([a053292](https://github.com/Samuellct/Collec/commit/a053292ad409c9a855cafd24567e8673eee13501))
