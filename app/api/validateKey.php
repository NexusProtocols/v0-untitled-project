<?php
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('HTTP/1.1 405 Method Not Allowed');
    exit();
}

// Get the key from the query string
if (!isset($_GET['key'])) {
    echo json_encode(['valid' => false, 'message' => 'Key not provided']);
    exit();
}

$key = $_GET['key'];

// Simulate key validation - check against a stored key (adjust to your actual DB or data source)
$storedKeys = file('premium_keys.txt', FILE_IGNORE_NEW_LINES); // Or query from a database

if (in_array($key, $storedKeys)) {
    echo json_encode(['valid' => true, 'premium' => true]);
} else {
    echo json_encode(['valid' => false]);
}
exit();
?>
