<?php
// Get the key from the URL parameter
if (!isset($_GET['key'])) {
    echo "Key not found!";
    exit();
}

$key = $_GET['key'];

// You can validate it here if you want to confirm the key before displaying it
// If valid, show the key page

echo "<h1>Your Premium Key:</h1>";
echo "<p><strong>Key:</strong> $key</p>";
?>
