<?php
session_start();

// Create session variables
$_SESSION['access_granted'] = true;
$_SESSION['access_expires'] = time() + (01 * 05); // 1 hour validity

// Redirect to React secure page
header('Location: /key-generator'); // Next.js page path
exit;
?>
