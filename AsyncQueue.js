class Node {
    #value
    #next
    constructor(value) {
        this.#value = value;
    }
    setNext(value) {
        this.#next = value
    }

    getNext() {return this.#next ?? null}
    getValue() {return this.#value}
}

class Queue {
    #first;
    #last;
    length = 0;
    constructor() {}

    push(value) {
        if (this.length === 0) {
            this.#first = new Node(value);
            this.#last = this.#first;
            this.length++;
            return;
        }
        let newNode = new Node(value);
        this.#last.setNext(newNode);
        this.#last = newNode;
        this.length++;
    }

    shift() {
        // If queue is already empty return
        if (this.length === 0) return null;

        let deletedNode = this.#first;

        // If there is one element, change first node
        if (this.#first === this.#last) {
            this.#last = null;
        }

        this.#first = deletedNode.getNext()
        this.length--;
        return deletedNode.getValue();
    }


}

class AsyncQueue {
    values = [];
    resolvers = [];
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

for (let i = 0; i <= 5; i++) queue.enqueue(`Nombre ${i}`);

async function eventsStream() {
    for await (let value of queue) {
        console.log(value);
        if (value === AsyncQueue.EOS) return value;
    }
}

eventsStream().then((value) => {
    console.log("Queue has been closed");
})

setTimeout(() => {queue.enqueue("Lluis")}, 3000); // 3s
setTimeout(() => {queue.enqueue("Tet")}, 6000); // 6s
setTimeout(() => {queue.enqueue("Try again")}, 7500); // 7,5s
setTimeout(() => {queue.close()}, 10000); // 7s

