<?php
// Ensure that this file is accessed only through POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    exit();
}

// Function to generate a unique token
function generateToken() {
    return bin2hex(random_bytes(32)); // Generates a 64-character token
}

// Simulating the generation of the key and saving to the database (adjust according to your DB)
function saveKey($key) {
    // Here you would normally save the key to the database
    // For simplicity, we're just saving it to a file
    file_put_contents('premium_keys.txt', $key . PHP_EOL, FILE_APPEND);
}

// Generate the key
$newKey = generateToken();

// Save it to the "database" or wherever necessary
saveKey($newKey);

// Return the newly generated key as a response
echo json_encode(['success' => true, 'key' => $newKey]);
exit();
?>
