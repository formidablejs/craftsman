# 0.5.0-alpha.2 (2021-10-08)


### Bug Fixes

* **deps:** fix chalk import ([9d7af3c](https://github.com/formidablejs/craftsman/commit/9d7af3cf2366c781a7c9641be6153e4f60b06e0f))
* **environment:** check if application is in production before running the shouldRun check ([24635d7](https://github.com/formidablejs/craftsman/commit/24635d75df0723b94a4b56f0360844c3e2bc9fef))



# 0.5.0-alpha.1 (2021-10-08)


### Bug Fixes

* add -h, --help, -v and --version to the allowlist ([0b8d0d8](https://github.com/formidablejs/craftsman/commit/0b8d0d85974520d30452d5bcb163dd2abc8c7cab))
* check config.paths instead of vendor.paths under the config flag ([d99636a](https://github.com/formidablejs/craftsman/commit/d99636a0d07f1bcbc7a7b2377514560d7cd8e0c5))
* handle other error types ([771a6a8](https://github.com/formidablejs/craftsman/commit/771a6a8d5b59886cd9cf5b2b03786dd6ce74285a))
* improve node 14 support ([39d891d](https://github.com/formidablejs/craftsman/commit/39d891da694c0f3e6af14f018e23955e3a0f7222))
* refactor cache code ([d270a9f](https://github.com/formidablejs/craftsman/commit/d270a9ff1b0f153b0690933e937a6cca338c1072))


### Features

* add build silent mode ([9cad16f](https://github.com/formidablejs/craftsman/commit/9cad16fc756403a199b18d1dd31a943dbaff6894))
* add seeder command ([5fd400b](https://github.com/formidablejs/craftsman/commit/5fd400ba7d7e9bbef9d1aee4ff1172c6f849cb9b))
* added a new migrate fresh action/command ([51d8cae](https://github.com/formidablejs/craftsman/commit/51d8cae210570f7d4af5954338cb2098a93e539e))
* added a prompt for critical commands ([accbdf0](https://github.com/formidablejs/craftsman/commit/accbdf07f5c4040907bc655693481cd7de7f4572))
* added a publisher new command ([ba6ccb0](https://github.com/formidablejs/craftsman/commit/ba6ccb0be453159265c36c59bf173cd32502cf26))
* added a update line util ([f8debc1](https://github.com/formidablejs/craftsman/commit/f8debc1888bbf4d35d836ae9f457307dc37165b6))
* added guidelines ([ec33fb7](https://github.com/formidablejs/craftsman/commit/ec33fb74cacb7d1f4c0b9261fec18216e4aa9d6f))
* allow cache distribution ([c68d62e](https://github.com/formidablejs/craftsman/commit/c68d62ec4a39d4e0cb965a3719086f0d40098d72))
* allow custom port, cache before serving and allow targeted serving ([8ef9ed8](https://github.com/formidablejs/craftsman/commit/8ef9ed8e92eb0d2f7bf3ce74375ac6274d1f3794))
* allow silent mode toggle with debug flag ([49a71f1](https://github.com/formidablejs/craftsman/commit/49a71f1712271c230576f57dcd435671dbf7f3a9))
* allow targeted building - and change entry file and output directory ([eff688d](https://github.com/formidablejs/craftsman/commit/eff688d39a8b9180252fd0e189c49cf940579283))
* allow targeted caching and entry file ([38c68a8](https://github.com/formidablejs/craftsman/commit/38c68a8bae0fe0922c0008e407a9ea366d346950))
* allow targeted key generation ([be9611e](https://github.com/formidablejs/craftsman/commit/be9611e3f18fa760a55a642ace428cb60bcc6b8b))
* attach iv to application key ([ab485df](https://github.com/formidablejs/craftsman/commit/ab485df58546ca46aecaba31ab48aae1966b6095))
* bring the application out of maintenance mode ([be12a0c](https://github.com/formidablejs/craftsman/commit/be12a0c6362d35b4f3a8fcf5e34e11500e8f05c4))
* change entry file ([08876af](https://github.com/formidablejs/craftsman/commit/08876af516995c18798632e6bdf67dd5dd7af831))
* deprecate install command ([dc37822](https://github.com/formidablejs/craftsman/commit/dc37822f257cbadfbb634016f32b419cd611b5a8))
* improve onboarding ([8c0aedc](https://github.com/formidablejs/craftsman/commit/8c0aedca55c0932d02aa6caa86459bc8c9292d88))
* improve onboarding - add database driver selector and fix stderr handler ([bc6962f](https://github.com/formidablejs/craftsman/commit/bc6962f652f5422d3b10f52c4247a3de044cc411))
* improved the onboarding experience ([c026145](https://github.com/formidablejs/craftsman/commit/c0261451ab1b16e8406cff06cbb20ee3ae0b0c3f))
* invoke the cache function if it exists in the application instance ([818db6b](https://github.com/formidablejs/craftsman/commit/818db6b16df62f463d521cdbb4827f7db95bc928))
* **maintenance:** added a redirect flag ([a554a3e](https://github.com/formidablejs/craftsman/commit/a554a3e505eeae4fe0e153a82a41e7ae28a5d705))
* parse value as boolean ([9729dbe](https://github.com/formidablejs/craftsman/commit/9729dbeae11e299a6bfbaba258040463851b85fd))
* prompt in production ([446572f](https://github.com/formidablejs/craftsman/commit/446572f5a8feb5f0b4a2353dd42a717a68093e6c))
* **publisher:** added a --force flag and a --tags flag ([370307a](https://github.com/formidablejs/craftsman/commit/370307a49c387a112b2570ae0c16283afbf7659c))
* **publisher:** use the --tag flag to publish packages when create a new application ([2c646a1](https://github.com/formidablejs/craftsman/commit/2c646a14341ea643b28ce7c71a7d0bf47c71f364))
* put the application into maintenance mode ([54658f6](https://github.com/formidablejs/craftsman/commit/54658f63c9c612e6bf85b1be6b184918ee9ffca4))
* return true if value is undefined ([e33a239](https://github.com/formidablejs/craftsman/commit/e33a239d8e837c73a78b585fae1a7195809aeba6))
* run build in silent mode ([f18c68c](https://github.com/formidablejs/craftsman/commit/f18c68c22f72a4f3500d0584e2bc22e5cbd5daf4))
* run cache command twice ([4768f1f](https://github.com/formidablejs/craftsman/commit/4768f1f290b22ad1311e91a35a426159ccae8b74))
* switch to knex ([109fa89](https://github.com/formidablejs/craftsman/commit/109fa8946c9bb69eb62b15c764ea74dfc736a1c7))
* use the updateline util ([e79bb93](https://github.com/formidablejs/craftsman/commit/e79bb93a2558a0d32f305606b6bdf0d11b8a1ac1))



