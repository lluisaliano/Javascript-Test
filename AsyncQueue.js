import Queue from "./Structures/Queue.js"
class AsyncQueue {
    values = new Queue();
    resolvers = new Queue();
    #closed = false;
    static EOS = Symbol("End of Stream");

    constructor() {}

    // Enqueue Value to the list
    enqueue(value) {
        // If an unresolved promise has already been dequeued (we have a resolver stored), resolve it with given value
        if (this.resolvers.length > 0) {
            this.resolvers.shift()(value);
        } else if (!this.#closed) {
            // If stream is not  closed and there are not any resolvers, store value
            this.values.push(value);
        } else {
            // If stream is closed, throw new error
            return Promise.resolve(AsyncQueue.EOS);
        }
    }

    // Dequeue Promises
    dequeue() {
        // If there are values stored, return a promise resolving with that value
        if (this.values.length > 0) {
            return Promise.resolve(this.values.shift());
        } else {
            // If closed resolve promises with EOS symbol
            if (this.#closed) {
                return Promise.resolve(AsyncQueue.EOS);
            }
            // Else store resolver and return unresolved promise
            return new Promise((resolve) => {
                this.resolvers.push(resolve);
            })
        }
    }

    // Close Queue
    close() {
        this.#closed = true;

        while (this.resolvers.length !== 0) {
            this.resolvers.shift()(AsyncQueue.EOS);
        }
    }

    // Make this class iterable asynchronously
    [Symbol.asyncIterator]() {
        return this;
    }

    // Define Async Iterator method
    next() {
        return this.dequeue().then((value) => {
            return (value === AsyncQueue.EOS) ?
                {value: undefined, done: true} : {value: value, done: false}
        })
    }
}

let queue = new AsyncQueue()


for (let i = 0; i <= 10000; i++) queue.enqueue(`Nombre ${i}`);

async function eventsStream() {
    for await (let value of queue) {
        console.log(value);
    }
}

eventsStream().then(() => {
    console.log("Queue has been closed");
})

setTimeout(() => {queue.close()}, 4000);

