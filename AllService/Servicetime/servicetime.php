<?php
class Servicetime{ public $result=array(); public function getTime(){date_default_timezone_set('Europe/Istanbul');$this->result=array("Date"=>date("Y"));return $this->result;}}?>