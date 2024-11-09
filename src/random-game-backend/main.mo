import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";
import Random "mo:base/Random";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Array "mo:base/Array";

actor ColorGame {
    // Store the latest random seed
    private stable var currentSeed : ?Blob = null;

    // Generate a cryptographically secure random number between 0 and 2
    private func generateRandomIndex() : async Nat {
        // Get raw entropy from IC
        let entropy = await Random.blob();
        
        // Update our seed
        currentSeed := ?entropy;

        // Convert first byte to number between 0-2
        let randomBytes = Blob.toArray(entropy);
        if (randomBytes.size() > 0) {
            Nat8.toNat(randomBytes[0]) % 3;
        } else {
            // Fallback to timestamp-based randomness
            let timestamp = Int.abs(Time.now());
            timestamp % 3;
        };
    };

    // Play a round of the game
    public shared func playGame(userChoice : Nat) : async {
        won: Bool;
        message: Text;
    } {
        // Validate input
        if (userChoice < 1 or userChoice > 3) {
            return {
                won = false;
                message = "Invalid choice! Please pick a number between 1 and 3";
            };
        };

        // Generate random winning color (0-2)
        let correctIndex = await generateRandomIndex();
        
        // Compare user's choice (1-3) with generated index (0-2)
        if (userChoice - 1 == correctIndex) {
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

    // Optional: Get the last used random seed (for verification/debugging)
    public query func getLastSeed() : async ?Blob {
        currentSeed
    };
}