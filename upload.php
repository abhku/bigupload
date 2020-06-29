<?php
// In PHP versions earlier than 4.1.0, $HTTP_POST_FILES should be used instead
// f $_FILES.

$uploaddir = '/home/abhishek/upload/';
//$uploadfile = $uploaddir . basename($_FILES['userfile']['name']);
$uploadfile = $uploaddir . basename($_POST['chunk_name']);
echo '<pre>';
if (move_uploaded_file($_FILES['userfile']['tmp_name'], $uploadfile)) {
echo "File is valid, and was successfully uploaded.\n";


//echo "This is file :";
// echo file_get_contents ($uploadfile);
} 
else 
{
echo "Possible file upload attack!\n";
}

echo '<b>Here is some more debugging info:</b>';
print_r($_FILES);

print "</pre>";

?>
