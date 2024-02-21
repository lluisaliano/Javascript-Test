import Node from './Node.js'

export default class Queue {
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
