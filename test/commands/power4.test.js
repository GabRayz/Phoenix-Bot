import Power4 from "../../src/commands/games/power4"

/**
 * @function Power4.isBoardFull
 */
describe('Power4 isBoardFull function Unit Test Suites', () => {
    beforeAll(() => {
        for (let i = 0; i < 7; i++) Power4.board[i] = [0, 0, 0, 0, 0, 0]
    })

    test('isBoardFull should return true if the board is full', () => (
        expect(Power4.isBoardFull()).toEqual(false)
    ))

    test('isBoardFull should return false if the board is not full', () => (
        Power4.board.forEach((line) => line.forEach((tile) => tile = 1)),
        expect(Power4.isBoardFull()).toEqual(true)
    ))
})

/**
 * @function Power4.getLowestTile
 */
describe('Power4 getLowestTile function Unit Test Suites', () => {
    beforeAll(() => {
        for (let i = 0; i < 7; i++) Power4.board[i] = [1, 0, 0, 0, 0, 0]
    })

    test('getLowestTile should return 1 if the column only contains one token', () => (
        expect(Power4.getLowestTile(0)).toEqual(1)
    ))
})

/**
 * @function Power4.isColumnFilled
 */
describe('Power4 isColumnFilled function Unit Test Suites', () => {
    beforeAll(() => {
        for (let i = 0; i < 7; i++) Power4.board[i] = [1, 1, 1, 1, 1, 1]
    })

    test('getLowestTile should return true if the column is full', () => (
        expect(Power4.isColumnFilled(0)).toEqual(true)
    ))

    test('getLowestTile should return false if the column is not full', () => (
        Power4.board[0][5] = 0,
        expect(Power4.isColumnFilled(0)).toEqual(false)
    ))
})

/**
 * @function Power4.getLowestTile
 */
describe('Power4 place function Unit Test Suites', () => {
    beforeAll(() => {
        for (let i = 0; i < 7; i++) Power4.board[i] = [0, 0, 0, 0, 0, 0]
    })

    test('place should place the good token in board', () => (
        Power4.place(0, 1),
        Power4.place(0, 2),
        expect(Power4.board[0][0]).toEqual(1),
        expect(Power4.board[0][1]).toEqual(2)
    ))
})
