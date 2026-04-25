# [0.7.0](https://github.com/Samuellct/Collec/compare/v0.6.0...v0.7.0) (2026-04-25)


### Bug Fixes

* **progress:** correct test type annotations for where parameter ([d9e3259](https://github.com/Samuellct/Collec/commit/d9e3259bbd9e0ce8ea3ea05072eca7d95218c5f7))


### Features

* **progress:** add next-unwatched helpers for collections and pathways ([ed165a1](https://github.com/Samuellct/Collec/commit/ed165a1864dcd4c373b085303531d9755c2d4dc4))
* **progress:** add recalculate helper for collections and pathways ([f7fa910](https://github.com/Samuellct/Collec/commit/f7fa91011882ee40fdad9198a01b8826a95350d0))
* **progress:** add user-collection-progress collection ([6f10060](https://github.com/Samuellct/Collec/commit/6f100604dc740105952fbc97c9fee62660f59aaf))
* **progress:** add user-pathway-progress collection ([a31d3af](https://github.com/Samuellct/Collec/commit/a31d3af512554079a7cac11f7aa36bfb9614792b))
* **progress:** add user-watched-items collection with access control and migration ([c0908a4](https://github.com/Samuellct/Collec/commit/c0908a46dab85c0290808251afa26a2798627226))
* **progress:** wire afterChange and afterDelete hooks on user-watched-items ([6037cf8](https://github.com/Samuellct/Collec/commit/6037cf88d4d492a38674731942886955ebc1b72e))

# [0.6.0](https://github.com/Samuellct/Collec/compare/v0.5.0...v0.6.0) (2026-04-21)


### Features

* **collections:** add linked_pathway relationship to Collections ([61d7f9e](https://github.com/Samuellct/Collec/commit/61d7f9eba193ece8def82e4b50ad169cc140586a))
* **pathways:** add Pathways collection with editorial fields ([87c480b](https://github.com/Samuellct/Collec/commit/87c480bce495192b441879fb637b44996bb9296d))
* **pathways:** add PathwaySteps junction and join field on Pathways ([40e4d4c](https://github.com/Samuellct/Collec/commit/40e4d4c33f6e221e5c2e9281cc769461335fe08c))

# [0.5.0](https://github.com/Samuellct/Collec/compare/v0.4.0...v0.5.0) (2026-04-19)


### Features

* **collections:** add CollectionItems junction collection ([0f21be3](https://github.com/Samuellct/Collec/commit/0f21be31491ef2fbc6d8e042f4c968ce775bdf56))
* **collections:** add Collections collection with editorial fields ([ac4f930](https://github.com/Samuellct/Collec/commit/ac4f930081c083db3699bb8886b5dbd73cb761f8))
* **media-items:** add release_date field for chronological ordering ([c5bcd97](https://github.com/Samuellct/Collec/commit/c5bcd97ea095fcb021ef2028c466f8cad7b52429))

# [0.4.0](https://github.com/Samuellct/Collec/compare/v0.3.0...v0.4.0) (2026-04-19)


### Bug Fixes

* **media-items:** fix seed script (pg direct) and regenerate importMap ([8ed1168](https://github.com/Samuellct/Collec/commit/8ed1168b8bb2d783f30e6869fc1c5aa85c484649))


### Features

* **media-items:** add ExternalIds junction collection ([47700fa](https://github.com/Samuellct/Collec/commit/47700fa9da6e649edf7b85b9466a4631d83c33c5))
* **media-items:** add MediaItems collection with sync fields ([9bdbaf0](https://github.com/Samuellct/Collec/commit/9bdbaf0122148c1f21cbf8f0e28a19134f34350a))
* **media-items:** add MediaTypes collection for multi-medium schema ([7c91d5e](https://github.com/Samuellct/Collec/commit/7c91d5ef2fa889488c85bfd460be37d040f115be))
* **media-items:** add TMDB client, search, normalize and cache helpers ([fb745d6](https://github.com/Samuellct/Collec/commit/fb745d6c5eb8ff2963dfaf3dcc6138560eb2c888))
* **media-items:** add TMDB import panel in admin beforeList ([41845d8](https://github.com/Samuellct/Collec/commit/41845d8885c5807fdab889fdc21f66b857e1f2df))
* **media-items:** document manual override fields for ADMIN-05 ([17e360e](https://github.com/Samuellct/Collec/commit/17e360e79d11d1761104c5f0073e6ce5b664a359))

# [0.3.0](https://github.com/Samuellct/Collec/compare/v0.2.0...v0.3.0) (2026-04-18)


### Bug Fixes

* **cicd:** remove missing ready-to-merge label from create-pr workflow ([7b4f779](https://github.com/Samuellct/Collec/commit/7b4f779cb09428fe999fc8b8ee8f46498a370ed9))
* **ui:** restore French accents across all auth pages ([a1e214c](https://github.com/Samuellct/Collec/commit/a1e214cec25739d0e569ab9eaa43f61093b80007))


### Features

* **auth:** add current-user helper and auth menu in layout ([40108a4](https://github.com/Samuellct/Collec/commit/40108a430915718deb25c2e882ed98bc1c608830))
* **auth:** add forgot-password and styled reset-password pages ([8bfc431](https://github.com/Samuellct/Collec/commit/8bfc431e3f6a75997371296ad3378cac13ce3280))
* **auth:** add login page with lockout-aware error handling ([005828d](https://github.com/Samuellct/Collec/commit/005828d0e8a5e05699f9bc030295dc9f5e6edcc9))
* **auth:** add register and verify-email-sent pages ([59da35e](https://github.com/Samuellct/Collec/commit/59da35ec25387fa3474a5508ee0da7ce7bddf031))
* **auth:** add settings page with password change ([130d8b4](https://github.com/Samuellct/Collec/commit/130d8b4c95de90c81ef430798db2d9e7bfa87b50))
* **auth:** replace verify-email route handler with styled page ([48ad432](https://github.com/Samuellct/Collec/commit/48ad432d93f1d23e53497ba532c5e6793cb6d78e))
* **ui:** add auth form primitives and cn helper ([de41a1e](https://github.com/Samuellct/Collec/commit/de41a1eceec9d073fe76b062d1703ca37eb2fe92))

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
