String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substring(0, index) +
    replacement +
    this.substring(index + replacement.length)
  );
};

alphabet = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

keyboard = {
  q: document.getElementsByClassName("quordle-key").item(0),
  w: document.getElementsByClassName("quordle-key").item(1),
  e: document.getElementsByClassName("quordle-key").item(2),
  r: document.getElementsByClassName("quordle-key").item(3),
  t: document.getElementsByClassName("quordle-key").item(4),
  y: document.getElementsByClassName("quordle-key").item(5),
  u: document.getElementsByClassName("quordle-key").item(6),
  i: document.getElementsByClassName("quordle-key").item(7),
  o: document.getElementsByClassName("quordle-key").item(8),
  p: document.getElementsByClassName("quordle-key").item(9),

  a: document.getElementsByClassName("quordle-key").item(10),
  s: document.getElementsByClassName("quordle-key").item(11),
  d: document.getElementsByClassName("quordle-key").item(12),
  f: document.getElementsByClassName("quordle-key").item(13),
  g: document.getElementsByClassName("quordle-key").item(14),
  h: document.getElementsByClassName("quordle-key").item(15),
  j: document.getElementsByClassName("quordle-key").item(16),
  k: document.getElementsByClassName("quordle-key").item(17),
  l: document.getElementsByClassName("quordle-key").item(18),

  backspace: document.getElementsByClassName("quordle-key").item(19),
  z: document.getElementsByClassName("quordle-key").item(20),
  x: document.getElementsByClassName("quordle-key").item(21),
  c: document.getElementsByClassName("quordle-key").item(22),
  v: document.getElementsByClassName("quordle-key").item(23),
  b: document.getElementsByClassName("quordle-key").item(24),
  n: document.getElementsByClassName("quordle-key").item(25),
  m: document.getElementsByClassName("quordle-key").item(26),
  enter: document.getElementsByClassName("quordle-key").item(27),
};

/* 
  blocks hold their state with following structure.
  {
      known: 0,                                      // number of known letter and location.
      num_diff: 0,                               // number of known letter but different location.
      num_not_possible: 0,                           // number of not possible

      letters_fixed: ["-1","-1","-1","-1","-1"],      // object to hold the word's letters.
      letters_diff: {"a":[1,2]}                      // letters which are in different location then those in the list which can contain [0-4]
      letters_not_possible: [],                      // letters which are for sure not there.
   }
*/
block_states = [
  {
    num_known: 0,
    num_diff: 0,
    num_not_possible: 0,

    letters_fixed: ["-1", "-1", "-1", "-1", "-1"],
    letters_diff: {},
    letters_not_possible: [],
    possbile_words: [],
    is_done: false,
  },
  {
    num_known: 0,
    num_diff: 0,
    num_not_possible: 0,

    letters_fixed: ["-1", "-1", "-1", "-1", "-1"],
    letters_diff: {},
    letters_not_possible: [],
    possible_words: [],
    is_done: false,
  },
  {
    num_known: 0,
    num_diff: 0,
    num_not_possible: 0,

    letters_fixed: ["-1", "-1", "-1", "-1", "-1"],
    letters_diff: {},
    letters_not_possible: [],
    possible_words: [],
    is_done: false,
  },
  {
    num_known: 0,
    num_diff: 0,
    num_not_possible: 0,

    letters_fixed: ["-1", "-1", "-1", "-1", "-1"],
    letters_diff: {},
    letters_not_possible: [],
    possible_words: [],
    is_done: false,
  },
];

words_guessed = [];
current_guess = 1;

// Make a random choice from a list.
function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

// Return false if word exists and true if not
function detectWrongWord() {
  if (document.getElementsByClassName("text-rose-600").length > 0) {
    return true;
  } else {
    return false;
  }
}

function typeWord(word) {
  for (let i = 0; i < word.length; i++) {
    const element = word[i];
    // console.log(element);
    keyboard[element].click();
  }
}

// Clear the typed word.
function clearWord() {
  keyboard["backspace"].click();
  keyboard["backspace"].click();
  keyboard["backspace"].click();
  keyboard["backspace"].click();
  keyboard["backspace"].click();
}

// Get previous gessed rows by looking at the aria-labels.
function getLastGuessedRows() {
  if (current_guess > 1) {
    rows = [];
    for (let i = 0; i < 4; i++) {
      rows.push(document.querySelector(`[aria-label="Game Board ${i+1}"`).childNodes[current_guess-2]);
    }
    return rows;
  } else {
    throw Error("No attempts have been made yet.");
  }
}

// In a full alphabet get the next word
// Example:
//      getNextChar("a") => "b"
//      getNextChar("b") => "c"
//      ...
//      ...
//      getNextChar("z") => "a"
function getNextChar(char) {
  if (char === "z") {
    return "a";
  }

  if (char === "Z") {
    return "A";
  }

  return String.fromCharCode(char.charCodeAt(0) + 1);
}

// In a list of incomplete alphabet get the next element like a circular linked list.
// Example:
//      getNextCharFromList("a",["a","b","c"]) => "b"
//      getNextCharFromList("b",["a","b","c"]) => "c"
//      getNextCharFromList("c",["a","b","c"]) => "a"

function getNextCharFromList(char, list) {
  let index = list.indexOf(char);
  if (index !== -1) {
    if (index != list.length - 1) {
      return list[index + 1];
    } else {
      return list[0];
    }
  } else {
    throw Error(
      "Given input char (" + char + ") was not in list [" + list + "]."
    );
  }
}

// In a complete alphabet add 1 to the string of word.
// Example:
//      getNextWord("aaa") => "aab"
//      getNextWord("aab") => "aac"
//      getNextWord("aac") => "aad"
//      ...
//      ...
//      getNextWord("aaz") => "aba"
function getNextWord(word) {
  carry = 1;
  out = [];
  for (let i = word.length - 1; i >= 0; i--) {
    const element = word[i];
    if (element == "z") {
      if (carry == 1) {
        carry = 1;
        out.push(getNextChar(element));
      } else {
        out.push(element);
      }
    } else {
      if (carry == 1) {
        out.push(getNextChar(element));
        carry = 0;
      } else {
        out.push(element);
      }
    }
  }
  out.reverse();
  return out.join("");
}

// In a incomplete alphabet add 1 to the string of word.
// Example:
//      getNextWord("aaa",["a","b","c"]) => "aab"
//      getNextWord("aab",["a","b","c"]) => "aac"
//      getNextWord("aac",["a","b","c"]) => "aba"
//      getNextWord("aba",["a","b","c"]) => "abb"
function getNextWordFromList(word, list) {
  carry = 1;
  out = [];
  for (let i = word.length - 1; i >= 0; i--) {
    const element = word[i];
    if (element == list[list.length - 1]) {
      if (carry == 1) {
        carry = 1;
        out.push(getNextCharFromList(element, list));
      } else {
        out.push(element);
      }
    } else {
      if (carry == 1) {
        out.push(getNextCharFromList(element, list));
        carry = 0;
      } else {
        out.push(element);
      }
    }
  }
  out.reverse();
  return out.join("");
}

// Update the state of the puzzle. Call this function after each attemptWord call to track the letters.
function updateState() {
  // Get the last GuessedRows
  let lastGuessedRows = getLastGuessedRows();
  let lastGuessedWord = words_guessed[current_guess - 2].toLowerCase();

  // For each row lastguessed
  for (let i = 0; i < lastGuessedRows.length; i++) {
    const ithRowNodes = lastGuessedRows[i].childNodes;
    const current_block = block_states[i];

    // for each letter in the current lastguessed row.
    for (let j = 0; j < ithRowNodes.length; j++) {
      // if letter is grayed out.
      if (ithRowNodes[j].classList.contains("bg-gray-200")) {
        // This letter is not possible.
        if (!current_block.letters_not_possible.includes(lastGuessedWord[j])) {
          current_block.letters_not_possible.push(lastGuessedWord[j]);
          current_block.num_not_possible += 1;
        }
      } else if (ithRowNodes[j].classList.contains("bg-box-diff")) {
        // This letter is at different location.

        // If this letter was not found before in this block add it the list.
        if (
          !Object.keys(current_block.letters_diff).includes(lastGuessedWord[j])
        ) {
          current_block.letters_diff[lastGuessedWord[j]] = [];
          current_block.num_diff += 1;
        }

        current_block.letters_diff[lastGuessedWord[j]].push(j);
      } else if (ithRowNodes[j].classList.contains("bg-box-correct")) {
        // correct location of this word is found
        if (current_block.letters_fixed[j] != lastGuessedWord[j]) {
          current_block.letters_fixed[j] = lastGuessedWord[j];
          current_block.num_known += 1;
        }
        // correct location of this word was already found.
        else {
          // Do Nothing
        }
      }
    }

    for (let i = 0; i < block_states.length; i++) {
      const current_block = block_states[i];
      if (current_block.num_known == 5) {
        current_block.is_done = true;
      }
    }
  }
}

// Attempt the input word
function attemptWord(current_word) {
  clearWord();
  typeWord(current_word);
  keyboard["enter"].click();

  current_guess += 1;
  words_guessed.push(current_word.toUpperCase());
}

// Function which detect which block has best chance. Looking at just the state.
function detect_best_block() {
  let num_knowns = block_states.map((obj, index) => {
    return obj.num_known;
  });
  let num_diffs = block_states.map((obj) => {
    return obj.num_diff;
  });

  let num_knowns_p_diffs = block_states.map((obj, index) => {
    return obj.num_known * 1.5 + obj.num_diff;
  });

  let num_not_possible = block_states.map((obj) => {
    return obj.num_not_possible;
  });

  console.log("scores", num_knowns_p_diffs);

  // Find block with (num_knowns + num_diffs)
  const max = Math.max(...num_knowns_p_diffs);

  const indexes = [];

  for (let index = 0; index < num_knowns_p_diffs.length; index++) {
    if (num_knowns_p_diffs[index] === max) {
      indexes.push(index);
    }
  }

  return choose(indexes);
}

function findAllPossibleWords() {
  let num_possible_words = [];
  let possible_words = [];
  for (let i = 0; i < 4; i++) {
    console.debug("Finding possible words on block :", i + 1, block_states);
    if (!block_states[i].is_done) {
      let x = findListOfPossibleWordsInBlock(i);
      possible_words.push(x);
      x.length == 0
        ? num_possible_words.push(Infinity)
        : num_possible_words.push(x.length);
    } else {
      possible_words.push([]);
      num_possible_words.push(Infinity);
    }
  }
  console.log(
    num_possible_words.indexOf(Math.min(...num_possible_words)),
    possible_words,
    num_possible_words
  );
  return possible_words[
    num_possible_words.indexOf(Math.min(...num_possible_words))
  ];
}

function findListOfPossibleWordsInBlock(block_id, fixed_alphabet = undefined) {
  state = block_states[block_id];
  strings_2_gen_length = 5 - state.num_known; // if position is known for a cell we can completely ignore it.
  diff_states = [state.letters_fixed.join("").split("-1").join("_")];

  console.debug("Filling Fixeds", diff_states);

  // For each letter whos location is left to be found.
  for (const key in state.letters_diff) {
    const element = state.letters_diff[key];
    // console.log(key, element);

    if (state.letters_fixed.includes(key)) {
      // console.log(
      //   "Skipping letter from diffs as it already has 1 fixed location: ",
      //   key
      // );
      continue;
    }

    // for each _ in diffstates replace it exactly once and push it to new_diff_states
    new_diffstates = [];

    diff_states.forEach((diff_state) => {
      for (let k = 0; k < diff_state.length; k++) {
        if (diff_state[k] != "_") {
          continue;
        } else {
          // if this position was already guessed
          if (!element.includes(k)) {
            // console.log(k, element);
            new_diffstates.push(diff_state.replaceAt(k, key));
          }
        }
      }
    });
    if (new_diffstates.length != 0) {
      diff_states = new_diffstates;
    }
  }

  console.log("Filling DIFFs", diff_states);

  let num_underscores = 0;
  for (let i = 0; i < diff_states[0].length; i++) {
    if (diff_states[0][i] == "_") {
      num_underscores += 1;
    }
  }

  // TODO if its not possible to calculate possible states.
  if (
    (num_underscores >= 3 ||
      (diff_states.length > 12 && num_underscores > 1)) &&
    current_guess < 6
  ) {
    console.log(
      "Skipping Block: ",
      block_id + 1,
      ". Reason: Not feasible to calculate."
    );
    state.possbile_words = [];
    return [];
  }

  // Fill all the possible letters

  if (!fixed_alphabet) {
    alphabet_2 = alphabet.slice();
    state.letters_not_possible.forEach((letter) => {
      alphabet_2.splice(alphabet_2.indexOf(letter), 1);
    });
  } else {
    alphabet_2 = fixed_alphabet.slice();
  }

  num_underscores = 0;
  for (let i = 0; i < diff_states[0].length; i++) {
    if (diff_states[0][i] == "_") {
      num_underscores += 1;
    }
  }

  num_remaining_letters = num_underscores;

  let possible_words = [];
  // For each diff_state
  for (let i = 0; i < diff_states.length; i++) {
    const element = diff_states[i];

    // start replace _s with first possible letter in alphabet aaa or bbb (if a was in letters_diff)
    remaining_letters = alphabet_2[0].repeat(num_remaining_letters);

    tryAllRemainingLettersLoop: do {
      // Copy into new variable to replace _s  with letters
      let element_copy = element;
      for (let j = 0; j < remaining_letters.length; j++) {
        letter = remaining_letters[j];
        element_copy = element_copy.replace("_", letter);
      }
      // console.log(element_copy);

      // Just type and see if this word is in the WORDLE/QUORDLE dictionary.
      typeWord(element_copy);
      if (!detectWrongWord()) {
        possible_words.push(element_copy);
      }
      clearWord();

      remaining_letters = getNextWordFromList(remaining_letters, alphabet_2);
      // console.log(possible_words, element, element_copy, remaining_letters);
      // Uncomment To Debug
      // input = prompt("press q to quit")
      // switch (input) {
      //   case "q":
      //     break tryAllRemainingLettersLoop;
      //   default:
      //     break;
      // }
    } while (remaining_letters != alphabet_2[0].repeat(num_remaining_letters));
  }

  console.log(`possible_words in block ${block_id + 1} : `, possible_words);
  state.possbile_words = possible_words;
  return possible_words;
}

function guessWord(word) {
  console.info("[INFO] Guessing Word", word);
  current_word = word;
  attemptWord(current_word);
  updateState();
}

function algortihm() {
  let possibleWord;

  // First Word always try serai as it contains all the most common letters.
  // https://towardsdatascience.com/a-frequency-analysis-on-wordle-9c5778283363

  guessWord("serai");

  // Word which contains the next best letter according to frequency in above article.
  guessWord("until");

  // best_block = detect_best_block();
  // console.log("this is the best block", best_block);

  possibleWord = choose(findAllPossibleWords());
  // guessWord(possibleWord);

  // input = prompt("press q to quit");
  // switch (input) {
  //   case "q":
  //     return 0;
  //   default:
  //     break;
  // }
}

algortihm();
