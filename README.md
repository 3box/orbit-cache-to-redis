# orbit-cache-to-redis

Transfer orbit cache directory to a redis orbit cache.

Transfer data from [https://github.com/orbitdb/orbit-db-cache](orbit-db-cache) instance (default in orbitdb) to [https://github.com/3box/orbit-db-cache-redis](orbit-db-cache-redis])

```
$ npm i orbit-cache-to-redis
```
Run command to copy orbitdb cache data from source directory (arg 1) to redis host destination (arg 2)

```
$ orbit-cache-copy ./orbitdb 127.0.0.1
```
