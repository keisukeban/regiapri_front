// グローバル変数
var items;
var categorys;
var tickets;
// 選択された商品のIDを格納する配列 eachで回す代わりとして使ってます IDでソートするときにも使います
var selected_item_id = [];
var selected_ticket_id = [];
$(function(){
    
	function getListJson(target){
		return $.get("php/getJson.php",{table:target},null,"json");
	};
	
	// 商品一覧を取得，出力
	(function append_items(){
		getListJson("items").done(function(resp){
			items = resp;
			var tmp = _.template($("#items_tmp").html());
			for(var i=0; i<items.length; i++){
				$("#items").append(tmp(items[i]));
			}
		});
	})();

	// カテゴリメニューを取得，出力
	(function append_categorys(){
		getListJson("categorys").done(function(resp){
			categorys = resp;
			var tmp = _.template($("#categorys_tmp").html());
			for(var i=0; i<categorys.length; i++){
				$("#categorys").append(tmp(categorys[i]));
			}
		});
	})();

	// 金券を取得，出力
	(function append_tickets(){
		getListJson("tickets").done(function(resp){
			tickets = resp;
			var tmp = _.template($("#tickets_tmp").html());
			for(var i=0; i<tickets.length; i++){
				$("#tickets").append(tmp(tickets[i]));
			}
		})
	})();

	// カテゴリ別に商品一覧を表示
	$("#categorys").change(function(){
		// valueにid入れてやす
		var selected = $("#categorys option:selected").val();
		if(selected == "all"){
			$("#items > p").show();
		}else{
			$("#items > p").hide();
			$("#items > p."+selected).show();
		}
	});

	// 会計へ商品を追加する
	$(document).on("click","#items input:button",function(){
		var item_id = $(this).attr("id");
		var tmp = _.template($("#selected_items_tmp").html());

			// 既にその商品が選択されているかどうかを調べる
			var flag = _.contains(selected_item_id, item_id);
			if(flag == true){
				var qty = $("#selected_items > #item"+item_id+" > .qty");
				// 値が消されてしまっていたら0にして
				if(qty.val() == ""){qty.val(0);}
				// 1プラスする(changeイベント)
				qty.val(parseInt(qty.val())+1).trigger("change",[true]);
			}else{
				selected_item_id.push(item_id);
				$("#selected_items").append(tmp(items[item_id]));
				$("#selected_items > #item"+item_id+" > .negiri_price").hide();
				selected_sort();
			}
			chg_qty();
			chg_price();
	});

	// 会計へ金券を追加する
	$("#ticket_add").on("click",function(){
		var ticket_id = $("#tickets option:selected").val();
		var tmp = _.template($("#selected_tickets_tmp").html());
		if(ticket_id !== ""){
			var flag = _.contains(selected_ticket_id, ticket_id)
			if(flag == true){
				var qty = $("#selected_items > #ticket"+ticket_id+" > .qty");
				if(qty.val() == ""){qty.val(0);}
				qty.val(parseInt(qty.val())+1).trigger("change",[true]);
			}else{
				selected_ticket_id.push(ticket_id);
				$("#selected_items").append(tmp(tickets[ticket_id]));
				selected_sort();
			}
		}
		chg_qty();
		chg_price();
	});

	// 選択商品一覧をソート．for文４回・・・
	function selected_sort(){
		selected_item_id = _.sortBy(selected_item_id);
		selected_ticket_id = _.sortBy(selected_ticket_id);
		var shelter_i = [];
		var shelter_t = [];
		for(var i=0; i<selected_item_id.length; i++){
			shelter_i.push($("#selected_items p[id^=item"+selected_item_id[i]+"]"));
		}
		for(var i=0; i<selected_ticket_id.length; i++){
			shelter_t.push($("#selected_items p[id^=ticket"+selected_ticket_id[i]+"]"));
		}
		$("#selected_items p").remove();
		for(var i=0; i<shelter_i.length; i++){
			$("#selected_items").append(shelter_i[i]);
		}
		for(var i=0; i<shelter_t.length; i++){
			$("#selected_items").append(shelter_t[i]);
		}
	}

	// 上下ボタンで個数を変更
	$(document).on("click","#selected_items .minus",function(){
		var minus = parseInt($("+",this).val()) -1;
		if(minus <= 0){minus = 1;}
		$("+",this).val(minus).trigger("change",[true]);
		chg_qty();
	});
	$(document).on("click","#selected_items .plus",function(){
		$(this).prev().val(parseInt($(this).prev().val())+1).trigger("change",[true]);
		chg_qty();
	});

//!	// 個数が変更されたら価格を変更
	$(document).on("change","#selected_items .qty",function(){
		$(this).nextAll(".sum_price").html(parseInt($(this).prevAll(".price").html()) * parseInt($(this).val()));
		chg_price();

	});

	// 会計に追加された商品を全消去
	$("#reset").click(function(){
		$("#selected_items > p").remove();
		selected_item_id = [];
		selected_ticket_id = [];
		chg_qty();
		chg_price();
	});

	// チェックされているものを消去する
	$("#check_reset").click(function(){
		var rm_i = [];
		var rm_t = [];
		$("#selected_items > p[id^=item]").each(function(i){
			if($("input:checkbox",this).prop("checked") == true){
				$(this).remove();
				rm_i.push(selected_item_id[i]);
			}
		});
		$("#selected_items > p[id^=ticket]").each(function(i){
			$(this).remove();
			rm_t.push(selected_ticket_id[i]);
		});
		// 第２引数にはない第１引数の要素
		selected_item_id = _.difference(selected_item_id,rm_i);
		selected_ticket_id = _.difference(selected_ticket_id,rm_t);
		chg_qty();
		chg_price();
	});

	// 値切り，チェックされているものの価格部分をtextと取り替える
	$("#pay_down").click(function(){
		$("#selected_items > p").each(function(){
			if($("input:checkbox",this).prop("checked") == true){
				$(".sum_price",this).hide();
				$(".negiri_price",this).show();
			}
		});
	});
	// 存在はしているsum_priceに代入
	$(document).on("change",".negiri_price",function(){
		$(this).prev(".sum_price").html($(this).val());
		chg_price();
	});


	// 会計に登録された商品の数と総計を取得
	// $("#selected_items").on("change remove",function(){
	// remove処理をしたときにchangeが発火してくれない！！
	// しかもchangeイベント取得のタイミングが早すぎて変化したあとの値をとれない！！
	//	なので関数にして，その都度実行するように・・．

	// 計何商品か
	function chg_qty(){
		var count = $("#selected_items p[id^=item]").length;
		$("#total_qty").html(count);
	}

	// 計何円か
	function chg_price(){
		var sum = 0;
		$("#selected_items .sum_price").each(function(){
			sum += parseInt($(this).html());
		});
		if(sum < 0){sum = 0;}
		$("#total_price").html(sum).trigger("change",[true]);
	}

	// おつり表示
	$("#total_price,#payment").change(function(){
		var oturi = parseInt($("#payment").val()) - parseInt($("#total_price").html());
		$("#change").html(oturi);
	});

	// phpにデータ送信
	$(".kakutei").click(function(){
		// $.post('ex.php',{送信するデータ}){...}
	});

});

	// http://javascript.eweb-design.com/1205_no.html より頂戴してしまった，textを数値のみ入力可能にする関数，使うべき？
	function numOnly(){
	m = String.fromCharCode(event.keyCode);
	if("0123456789\b\r".indexOf(m, 0) < 0){return false;}
	return true;
	}
