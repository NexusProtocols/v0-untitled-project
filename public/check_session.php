<?php
session_start();

if (isset($_SESSION['access_granted']) && $_SESSION['access_granted'] === true && time() <= $_SESSION['access_expires']) {
    echo json_encode(['authorized' => true]);
} else {
    echo json_encode(['authorized' => false]);
}
?>
