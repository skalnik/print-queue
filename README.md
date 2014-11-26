# Print Queue

A simple queueing system for the 3D Printers at RobotsConf written with Node &
Redis. Giggle at my terrible code.

## How the fuck does this work?

First ensure you have redis & node installed.

Then:

```
$ git clone https://github.com/skalnik/print-queue.git
$ cd print-queue
$ REDIS_URL=redis://127.0.0.1:16379 npm start
```

Then go to [localhost:3000](http://localhost:3000) :eyes:

![Whats it look like](http://cloud.mikeskalnik.com/image/0f042P0g1y2d/Screen%20Shot%202014-10-10%20at%209.00.59%20PM.png)

The admin panel is available at [/admin](http://localhost:3000/admin) as well :closed_lock_with_key:
