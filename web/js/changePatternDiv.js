function patternClick(t,r){
	if($("#li_pattern").attr("class") == "active"){
		return;
	}
	markPatternClick(2,0);
	document.getElementById("li_time").setAttribute("class","");
	document.getElementById("li_pattern").setAttribute("class","active");
	document.getElementById("li_about").setAttribute("class","");
	document.getElementById("right_box_down").innerHTML = 
		'<div id="div_pattern">'+
		'	<input name=T type="text" class="input" id="input_T" placeholder="請輸入時間" value="'+t+'">天內'+ 
		'	<input name=R type="text" class="input" id="input_R" placeholder="請輸入半徑" value="'+r+'">公里內(可小數)'+
		'	<input type="submit" class="myButton" value="Submit" onclick="parent_submitClick()">'+
		'</div>'+
		'<br>'+
		'<font size="3" color="#CD853F"style="margin-left: 15px;">*2 Thefts Pattern 意即Pattern發生竊盜案件數有2起的清單'+'</font>'+
		'<br>'+
		'<font size="3" color="#CD853F"style="margin-left: 20px;">座標數如不符合則代表某座標點有多起案件'+'</font>';
	var html_pattern_num ='';
	for(var i=0; i<pattern.length; i++){
		if(i == 0){
			html_pattern_num += '<li><a href="#" class="active" value = "2" id="pattern_num_2" onclick="pattern_numClick(2)">'+'2 Thefts Pattern</a></li>';
		}
		else{
			html_pattern_num += '<li><a href="#" class="" value = "'+(i+2)+'" id="pattern_num_'+(i+2)+'" onclick="pattern_numClick('+(i+2)+')">'+(i+2)+' Thefts Pattern</a></li>';
		}
	}
	
	document.getElementById("pattern").innerHTML = 
		'<div id="thefts_list" class="scroll_list">'+
			'<div id = "pattern_menu">'+
			'	<ol class="pattern_num">'+
					html_pattern_num+
			'	</ol>'+
			'</div>'+
		'</div>'+
		'<div id="pattern_list" class="scroll_list">'+
		'	<div id="pattern_list_inner">'+
		' 	</div>'+
		'</div>';
		
	pattern_list(2);
}

function parent_submitClick(){
	var t = document.getElementById('input_T').value;
	var r = document.getElementById('input_R').value;
	var r1 = /^[0-9]*[1-9][0-9]*$/　//正整數  
	var r2 = /^[0-9]*[\.]?[0-9]*$/
	var alert_str = "";
	var isRetrun = false;
	if(t > 20 || t < 1 || !(r1.test(t))){
		alert_str = '天數請輸入1~20間的正整數';
		isRetrun = true;
	}
	if(r > 5 || r <= 0 || !(r2.test(r))){
		if(isRetrun){
			alert_str += '\n';
		}
		alert_str += '直徑請輸入0~5間的數字(大於0可小數)';
		isRetrun = true;
	}
	if(isRetrun){
		alert(alert_str);
		return;
	}
	window.location = "index?T="+t+"&R="+r;
}

function pattern_numClick(num){
	for(var i=0; i<pattern.length; i++){
		document.getElementById("pattern_num_"+(i+2)).setAttribute("class","");
	}
	document.getElementById("pattern_num_"+num).setAttribute("class","active");
	pattern_list(num);
	markPatternClick(num,0);
}

function pattern_list(num){
	document.getElementById("");
	var btn_color = ["btn red", "btn blue", "btn orange", "btn purple", "btn green", "btn yellow"];
	var html_pattern_list_inner = "";;
	for(var i=0; i<pattern[num-2].length; i++){
		if(i == 0){
			html_pattern_list_inner += '<a id="btn_pattern_active" value = "0" class="'+btn_color[i%6]+'" onclick="markPatternClick('+num+','+i+')">Pattern '+(i+1)+'</a>';
		}
		else{
			html_pattern_list_inner += '<a id="btn_pattern_'+i+'" value = '+i+' class="'+btn_color[i%6]+'" onclick="markPatternClick('+num+','+i+')">Pattern '+(i+1)+'</a>';
		}
	}
	document.getElementById("pattern_list_inner").innerHTML = html_pattern_list_inner;
}

function markPatternClick(num, p_num){ //("pattern數目(ex:2,3,4)","的第幾個")
	var btn_name = '#btn_pattern_'+p_num;
	$('#btn_pattern_active').attr("id",'btn_pattern_'+$('#btn_pattern_active').attr('value'));
	$(btn_name).attr("id","btn_pattern_active");
	var marker_array = [];
	var addr0 = 0.0;
	var addr1 = 0.0;
	
	for(var i=0; i<num; i++){
		var id = parseInt(pattern[num-2][p_num][i]);
		var str = ""+data[id][3]+"-"+data[id][4];
		
		var bool = false;
		for(var j=0; j<marker_array.length; j++){
			if(marker_array[j]['addr'][0] == data[id][3] && marker_array[j]['addr'][1] == data[id][4]){
				marker_array[j]['text'] = marker_array[j]['text'] + "<br>犯罪類型: " + data[id][1] + "   時間: " + data[id][2];
				bool = true;
			}
		}
		if(bool == false){
			marker_array.push({'addr':[data[id][3],data[id][4]], 'text': "犯罪類型: " + data[id][1] + "   時間: " + data[id][2]});
		}
		addr0 += parseFloat(data[id][3]);
		addr1 += parseFloat(data[id][4]);
	}
	
	addr0 = addr0/parseFloat(num);
	addr1 = addr1/parseFloat(num);
	
	
	var radius;
	if('R' in getPara){
		radius = getPara['R'];
	}
	else{
		radius = 1;
	}
	
	var map = $(".map");
	map.tinyMap('clear');
	map.tinyMap('panTo', [addr0, addr1]);
	map.tinyMap('modify', {
		'circle': [{
			'center':[addr0, addr1],
			'radius': radius*500,
			'color': '#B22222',
			'fillcolor': '#B0E0E6',
		}],
		'marker': marker_array,
	});
}

function aboutClick(){
	if($("#li_about").attr("class") == "active"){
		return;
	}
	document.getElementById("li_time").setAttribute("class","");
	document.getElementById("li_pattern").setAttribute("class","");
	document.getElementById("li_about").setAttribute("class","active");
	document.getElementById("right_box_down").innerHTML = 
		'<font size="5" color="#FF6A6A" style="margin-left: 30px; font-weight: 600;">使用技術:</font><br>'+
		'<font size="4" color="#FF6A6A" style="margin-left: 80px; font-weight: 500;">1.Node.js後端</font><br>'+
		'<font size="4" color="#FF6A6A" style="margin-left: 80px; font-weight: 500;">2.運用分散式Spark計算Pattern</font><br>'+
		'<font size="4" color="#FF6A6A" style="margin-left: 80px; font-weight: 500;">3.Data visualization</font><br>'+
		'<font size="4" color="#1E90FF" style="margin-left: 30px; font-weight: 500;">(資料來源:台北市政府開放資料)</font>';
	document.getElementById("pattern").innerHTML = "";
}