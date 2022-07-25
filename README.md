# Quordle Solver (in browser)
Simple dictionary agnostic algorithm for solving the quordle (daily or practice) on www.quordle.com

It is not a guranentee that this algorithm will solve the puzzle but it should improve your chances for solving all 4 blocks.

## Installation

No installation is required.

## Usage

    1. Open quordle in one tab
    2. Copy the script from hack.js file from this repo
    3. Press F12 to open DevTools and click on console. (dont close the console as you will need to read the words there.)
    4. Paste the script and press enter.
    
    Note: It might look frozen for 1-2 minutes don't panic it will try different words and print out a list of each block's most likely words.
    
    5. Select the word you think would be most likely from the choices possible. 
    6. Type `guessWord("<your word>")` in console and press enter.
    7. To try the next possible words type `this.findAllPossibleWords()` in console and press Enter.

    Repeat 6-7th step and generate possible next set of possible.

    Have fun hacking

## Future Tasks

    1. Make a small chrome plugin to smooth out the process of solving.