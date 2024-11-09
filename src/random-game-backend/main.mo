import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

actor ColorGame {
    // Generate a random number between 0 and 2 for color choice
    private func generateRandomIndex() : Nat {
        let timestamp = Int.abs(Time.now());
        (timestamp % 3)
    };

    public func playGame(userChoice : Nat) : async {
        won: Bool;
        message: Text;
    } {
        let correctIndex = generateRandomIndex();
        
        if (userChoice < 0 or userChoice > 2) {
            return {
                won = false;
                message = "Invalid color choice!";
            };
        };

        if (userChoice == correctIndex) {
            return {
                won = true;
                message = "🎉 Congratulations! You picked the correct color!";
            };
        };

        return {
            won = false;
            message = "Wrong choice! Try again!";
        };
    };
};