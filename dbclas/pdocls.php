﻿<?php
class database
{
    public $iscon;
    protected $datab;
    public function __construct($username = "root", $password = "", $host = "localhost", $dbname = "bitirmeproje")
    {
        $this->iscon = true;
        try {
            $this->datab = new PDO("mysql:host={$host};dbname={$dbname};charset=utf8", $username, $password);
            $this->datab->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->datab->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo "Hata : " . $e->getMessage();
        }
    }
    public function disconnect()
    {
        $this->datab = null;
        $this->iscon = false;
    }
    public function getrow($query, $params = array())
    {
        try {
            $stmt = $this->datab->prepare($query);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            echo "Hata :" . $e->getMessage();
        }
    }
    public function getrows($query, $params = array())
    {
        try {
            $stmt = $this->datab->prepare($query);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            echo "Hata :" . $e->getMessage();
        }
    }
    public function ekle($query, $params = array())
    {
        try {
            $stmt = $this->datab->prepare($query);
            $stmt->execute($params);
            return true;
        } catch (PDOException $e) {
            echo "Kayıt Eklenemedi Hata  :" . $e->getMessage();
        }
    }
    public function update($query, $params = array())
    {
        $this->ekle($query, $params);
    }
    public function delete($query, $params = array())
    {
        $this->ekle($query, $params);
    }
} ?>