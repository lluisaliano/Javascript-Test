export default class Node {
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