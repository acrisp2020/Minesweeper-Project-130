<?php
// Database credentials
$servername = "localhost";
$username = "root";
$password = "new_password";
$dbname = "leaderboard";

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get data from the form
$user = $_POST['username'];
$difficulty = $_POST['difficulty'];
$tilesRevealed = intval($_POST['tilesRevealed']);
$win = $_POST['win'] === 'true' ? 1 : 0; // Convert 'true'/'false' to 1/0
$time = intval($_POST['time']);

// Step 1: Check if the user already has a record for the same difficulty
$sql = "SELECT * FROM leaderboard WHERE username = ? AND difficulty = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $user, $difficulty);
$stmt->execute();
$result = $stmt->get_result();
$existingRecord = $result->fetch_assoc();

if ($existingRecord) {
    // Step 2: If a record exists, check if the new record is better
    if ($win) {
        // If the new game is a win, check the time and update only if the time is better
        if ($existingRecord['win'] == 0 || $time < $existingRecord['time']) {
            // Step 3: Update the record with the better result
            $updateSql = "UPDATE leaderboard SET tiles_revealed = ?, win = ?, time = ? WHERE username = ? AND difficulty = ?";
            $updateStmt = $conn->prepare($updateSql);
            $updateStmt->bind_param("iiiss", $tilesRevealed, $win, $time, $user, $difficulty);
            if ($updateStmt->execute()) {
                echo "Record updated with a better result.";
            } else {
                echo "Error updating record: " . $updateStmt->error;
            }
        } else {
            echo "New record not better than the previous one.";
        }
    } else {
        // If the new game is not a win, do not update the record
        echo "Game not won, no update performed.";
    }
} else {
    // Step 4: If no record exists for the user and difficulty, insert a new one
    $insertSql = "INSERT INTO leaderboard (username, difficulty, tiles_revealed, win, time) VALUES (?, ?, ?, ?, ?)";
    $insertStmt = $conn->prepare($insertSql);
    $insertStmt->bind_param("ssiii", $user, $difficulty, $tilesRevealed, $win, $time);

    if ($insertStmt->execute()) {
        echo "New record created successfully.";
    } else {
        echo "Error: " . $insertStmt->error;
    }
}

// Close the statement and connection
$stmt->close();
$conn->close();
?>
