# Print Queue

A simple system for users ask for things to be 3D Printer at RobotsConf.

## Set up

First ensure you have redis & node installed.

Then:

```
$ git clone https://github.com/skalnik/print-queue.git
$ cd print-queue
$ REDIS_URL=redis://127.0.0.1:6379 npm start
```

Then go to [localhost:3000](http://localhost:3000) :eyes:

The admin panel is available at [/admin](http://localhost:3000/admin) as well :closed_lock_with_key:
