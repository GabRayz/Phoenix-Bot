export default class Music {
    name: string
    id: string | null

    constructor(name: string, id: string | null) {
        this.name = name;
        this.id = id;
    }
}