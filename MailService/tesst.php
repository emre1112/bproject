<?php
include ('../dbclas/pdocls.php');
include ('abc.php');
$a=new AllGet();
$query=$a->get("user");
// echo $query;
$db = new database("root", "", "localhost", "bitirmeproje");

// header("Content-Type: application/json; charset=UTF-8");
$activeProject =  $db->getrows("SELECT  * FROM  activeproject ap INNER JoIN 
            projectall p on p.pjid=ap.pjid INNER JOIN
            user u on u.uid=p.uid INNER JOIN projectonlesson pl on pl.pjid=p.pjid 
            INNER JOIN lesson l on l.lid=pl.lid
            ");
            echo "test";
            echo "merhaba";

?>