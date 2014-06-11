<?php
    $res = array();
    if(isset($_FILES["files"]))
    {
        for($i = 0; $i < count($_FILES["files"]["name"]); $i++)
        {
            $name = $_FILES["files"]["name"][$i];
            if(move_uploaded_file($_FILES["files"]["tmp_name"][$i], "files/".$name))
            {
                array_push($res, array("filename"=> $name, "filename_full" => "http://localhost/my_path_uploaded/files/".$name, "filename_partial" => "files/".$name));
            }
        }
    }
    echo json_encode($res);
?>