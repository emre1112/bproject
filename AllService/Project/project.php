<?php
session_start();
require_once('../dbclas/pdocls.php');
header("Content-Type: application/json; charset=UTF-8");
class Project extends database
{

    public $result = array();
    public function GET()
    {
        if (isset($_SESSION["UNM"])) {
            $allProjectRows =$this->getrows("SELECT  * FROM  projectall p INNER JoIN user u on p.uid=u.uid");
            if (count($allProjectRows) == 0) {
                $this->result = array("status" => "None");
                return $this->result;
            } else {
                for ($i = 0; $i < count($allProjectRows); $i++) {
                    $this->result[] = array(
                        "status" => "Okey",
                        "pjid" => $allProjectRows[$i]['pjid'],
                        "pjnm" => $allProjectRows[$i]['pjnm'],
                        "pjtechnology" => $allProjectRows[$i]["pjtechnology"],
                        "pjcntn" => $allProjectRows[$i]["pjcntn"],
                        "pjperiod" => $allProjectRows[$i]["pjperiod"],
                        "uid" => $allProjectRows[$i]["uid"],
                        "ufnm" => $allProjectRows[$i]["ufnm"] . " " . $allProjectRows[$i]["ulnm"],
                        "pjquota" => $allProjectRows[$i]["pjquota"],
                    );
                }
            }
            return $this->result;
        }
    }
    public function GETWHERE($where, $allparam)
    {
        if (isset($_SESSION["UNM"])) {
            $fparam = array();
            for ($index = 0; $index < count($allparam); $index++) {
                array_push($fparam, $allparam[$index]);
            }
            $allProjectRows =$this->getrows("SELECT  * FROM  projectall  WHERE $where", $fparam);
            if (count($allProjectRows) == 0) {
                $this->result = array("status" => "None");
                return $this->result;
            } else {
                for ($i = 0; $i < count($allProjectRows); $i++) {
                    $this->result[] = array(
                        "status" => "Okey",
                        "pjid" => $allProjectRows[$i]['pjid'],
                        "pjnm" => $allProjectRows[$i]['pjnm'],
                        "pjtechnology" => $allProjectRows[$i]["pjtechnology"],
                        "pjcntn" => $allProjectRows[$i]["pjcntn"],
                        "pjperiod" => $allProjectRows[$i]["pjperiod"],
                        "uid" => $allProjectRows[$i]["uid"],
                        "pjquota" => $allProjectRows[$i]["pjquota"],
                    );
                }
                return $this->result;
            }
        }
    }
    public function SET($wparam, $operation, $wset, $wsetparam, $setfield)
    {
        if (isset($_SESSION["UNM"])) {
            $fparam = array();
            for ($index = 0; $index < count($wsetparam); $index++) {
                array_push($fparam, $wsetparam[$index]);
            }
            $upP =$this->update("UPDATE   projectall set $wset WHERE $setfield $operation ($wparam)", $fparam);
            if ($upP) {
                $this->result = array("status" => "None");
                return $this->result;
            } else {
                $this->result = array("status" => "SuccedUpdate");
                return $this->result;
            }
        }
    }
    public function ADD($lessondata, $pjdata)
    {
        if (isset($_SESSION["UNM"])) {
            $uid = $pjdata[0]['uid'];
            $pjnm = $pjdata[0]['pjnm'];
            $psd = $pjdata[0]['psd'];
            $ptek = $pjdata[0]['ptek'];
            $pperiod = $pjdata[0]['pperiod'];
            $pselect = $pjdata[0]['pselect'];
            $pquota = $pjdata[0]['pjquota'];
            $addRows =$this->ekle("INSERT INTO projectall (uid,pjnm,pjtechnology,pjcntn,pjperiod,pjquota)
             values('$uid','$pjnm','$ptek','$psd','$pperiod','$pquota')");
            if ($addRows) {
                $projectRows =$this->getrows("SELECT  * FROM  projectall WHERE uid=?", array($uid));
                $lastindex = count($projectRows) - 1;
                $lastData = $projectRows[$lastindex]['pjid'];
                for ($i = 0; $i < count($lessondata); $i++) {
                    $addLess = $lessondata[$i]['lesson'];
                    $addlessRows =$this->ekle("INSERT INTO projectonlesson (pjid,lid)
                    values('$lastData','$addLess')");
                }
                if ($addlessRows) {
                    $this->result = array("status" => "SuccesAdd");
                    return $this->result;

                } else {
                    $this->result = array("status" => "None");
                    return $this->result;
                }
            } else {
                $this->result = array("status" => "None");
                return $this->result;
            }
        } else {
            $this->result = array("status" => "None");
            return $this->result;
        }
    }
    public function DEL($pjid, $where)
    {
        if (isset($_SESSION["UNM"])) {
            $del =$this->delete("DELETE FROM  projectall WHERE $where", array($pjid));
            if ($del) {
                $this->result = array("status" => "None");
                return $this->result;
            } else {
                $this->result = array("status" => "SuccesDel");
                return $this->result;
            }
        }
    }
}

?>