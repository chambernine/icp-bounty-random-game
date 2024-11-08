import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";

actor RandomGame {
    // Generate a pseudo-random number between 1 and 100
    private func generateRandomNumber() : Nat {
        let timestamp = Int.abs(Time.now());
        ((timestamp % 100) + 1)
    };

    public func playGame(userGuess : Nat) : async {
        won: Bool;
        message: Text;
    } {
        let targetNumber = generateRandomNumber();
        
        if (userGuess < 1 or userGuess > 100) {
            return {
                won = false;
                message = "Please guess a number between 1 and 100!";
            };
        };

        if (userGuess == targetNumber) {
            return {
                won = true;
                message = "🎉 Congratulations! You guessed the correct number: " # Nat.toText(targetNumber);
            };
        };

        return {
            won = false;
            message = if (userGuess < targetNumber) {
                "Try higher! Your guess was too low."
            } else {
                "Try lower! Your guess was too high."
            };
        };
    };
};