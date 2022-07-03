const hangman = require("../../commands/hangman")

/**
 * @function Hangman.isWordValid
 */
describe('Hangman isWordValid function Unit Test Suites', () => {
    test('isWordValid should return true if valid word', () => (
        expect(hangman.isWordValid("VALID")).toEqual(true)
    ))

    test('isWordValid should return false if word contains invalid characters', () => (
        expect(hangman.isWordValid("VAL_D")).toEqual(false)
    ))
})

/**
 * @function Hangman.generateBoard
 */
describe('Hangman generateBoard function Unit Test Suites', () => {
    beforeAll(() => {
        hangman.generateBoard("TEST")
    });

    test('generateBoard should return set mystery with the given word', () => (
        expect(hangman.mystery).toEqual("TEST")
    ))

    test('generateBoard should set the found[0] and found[word.length - 1] to true', () => (
        expect(hangman.found[0]).toEqual(true),
        expect(hangman.found[3]).toEqual(true)
    ))

    test('generateBoard should set all tab cell with false', () => (
        expect(hangman.found[1]).toEqual(false),
        expect(hangman.found[2]).toEqual(false)
    ))
})

/**
 * @function Hangman.applyGuess
 */
describe('Hangman stop function Unit Test Suites', () => {
    beforeAll(() => {
        hangman.mystery = "TEST"
        hangman.lives = 2
    });

    test('successfull applyGuess should set the corresponding cell to true', () => (
        hangman.applyGuess("E"),
        expect(hangman.found[1]).toEqual(true)
    ))

    test('unsuccessfull applyGuess should add the letter to tested and lower the lives', () => (
        hangman.applyGuess("W"),
        expect(hangman.tested.includes("W")).toEqual(true),
        expect(hangman.lives).toEqual(1)
    ))
})

/**
 * @function Hangman.stop
 */
describe('Hangman applyGuess function Unit Test Suites', () => {
    beforeAll(() => {
        hangman.stop()
    });

    test('start should set isPlaying to false', () => (
        expect(hangman.isPlaying).toEqual(false)
    ))
})
