import Hangman from "../../src/commands/games/hangman"

/**
 * @function Hangman.isWordValid
 */
describe('Hangman isWordValid function Unit Test Suites', () => {
    test('isWordValid should return true if valid word', () => (
        expect(Hangman.isWordValid("VALID")).toEqual(true)
    ))

    test('isWordValid should return false if word contains invalid characters', () => (
        expect(Hangman.isWordValid("VAL_D")).toEqual(false)
    ))
})

/**
 * @function Hangman.generateBoard
 */
describe('Hangman generateBoard function Unit Test Suites', () => {
    beforeAll(() => {
        Hangman.generateBoard("TEST")
    });

    test('generateBoard should return set mystery with the given word', () => (
        expect(Hangman.mystery).toEqual("TEST")
    ))

    test('generateBoard should set the found[0] and found[word.length - 1] to true', () => (
        expect(Hangman.found[0]).toEqual(true),
        expect(Hangman.found[3]).toEqual(true)
    ))

    test('generateBoard should set all tab cell with false', () => (
        expect(Hangman.found[1]).toEqual(false),
        expect(Hangman.found[2]).toEqual(false)
    ))
})

/**
 * @function Hangman.applyGuess
 */
describe('Hangman stop function Unit Test Suites', () => {
    beforeAll(() => {
        Hangman.mystery = "TEST"
        Hangman.lives = 2
    });

    test('successfull applyGuess should set the corresponding cell to true', () => (
        Hangman.applyGuess("E"),
        expect(Hangman.found[1]).toEqual(true)
    ))

    test('unsuccessfull applyGuess should add the letter to tested and lower the lives', () => (
        Hangman.applyGuess("W"),
        expect(Hangman.tested.includes("W")).toEqual(true),
        expect(Hangman.lives).toEqual(1)
    ))
})

/**
 * @function Hangman.stop
 */
describe('Hangman applyGuess function Unit Test Suites', () => {
    beforeAll(() => {
        Hangman.stop()
    });

    test('start should set isPlaying to false', () => (
        expect(Hangman.isPlaying).toEqual(false)
    ))
})
