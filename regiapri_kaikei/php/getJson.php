<?php

include 'path.php';
try{
    //内容を受け取る変数をnullで初期化しておく
    $table = null;

    //DBに接続
    $dbh = new PDO($dsn, $user, $password);

    //テーブルのデータを取得する
    $sql = 'select * from '.$_GET['table'];// from table名
    $stmt = $dbh->query($sql);// sqlの実行結果

    //取得したデータを配列に格納
    if($_GET['table']=="items"){
        while($row = $stmt->fetchObject()){
            $table[] = array(
                "id" => $row->id,
                "item_name" => $row->item_name,
                "item_price" => $row->item_price,
                "category_id" => $row->category_id
                );
        }
    }
    if($_GET['table']=="categorys"){
        while($row = $stmt->fetchObject()){
            $table[] = array(
                "id" => $row->id,
                "category_name" => $row->category_name,
                "shop_id" => $row->shop_id
                );
        }
    }
    if($_GET['table']=="tickets"){
        while($row = $stmt->fetchObject()){
            $table[] = array(
                "id" => $row->id,
                "ticket_name" => $row->ticket_name,
                "ticket_price" => $row->ticket_price
                );
        }
    }

    //JSON形式で返す
    header('Content-Type: application/json');
    echo json_encode( $table );

    exit;

}catch (PDOException $e){
    //例外処理
    die('Error:' . $e->getMessage());
}
?>