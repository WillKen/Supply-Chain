var contract;
var version="870f17de179c3e978c4b361b2cb9f0a25ca1f409"
var bank;
var user;
var companyInfo={
	"":""
};

var trans={
	"useAes": "false",
	"contractName": "Test2",
	"funcName": "",
	"funcParam": [],
	"user": "",
	"contractAddress": "",
	"groupId": 1
};

$(document).ready(function(){

	initSystem();

	$("#addCompany").click(function(){
		var param={
			"name":$("#name_new").val(),
			"assets":$("#assets_new").val()
		};

		$.post("addAccount",JSON.stringify(param),
		function(data){
			var temp=JSON.parse(data);
			for (var key in temp) {
				var tempKey=temp[key];
				companyInfo[tempKey]=key;
			}

			for (var key2 in companyInfo) {
				console.log(key2);     //获取key值
				console.log(companyInfo[key2]); //获取对应的value值
			}
			$("#i").append("<li><strong>[COMPANY] "+param.name+" Address: </strong>"+temp[param.name]+"</li>");
			$("#company_names").append("<option value ="+temp[param.name]+">"+param.name+"</option>");
			$("#event").append("<p><strong>Bank</strong> ["+ $("#addCompany").text()+"] "+param.name+"</p>");
			
			trans.funcName="join";
			trans.user=bank;
			trans.funcParam=[temp[param.name],param.name,0,param.assets];
			$.post("transaction",JSON.stringify(trans),
			function(){
				$("#name_new").val("");
				$("#assets_new").val("");
			});
		});
	});

    $("#getBalance0").click(function(){
		trans.funcName="property"
		trans.user=bank;
		trans.funcParam=[trans.user]
        $.post("transaction",JSON.stringify(trans),
		function(data){
			$("#event").append("<p><strong>Bank</strong> ["+ $("#getBalance0").text()+"] "+data+"</p>");
			alert("Balance: " + data);
		});
	});
	
	$("#getReceipt0").click(function(){
		trans.funcName="receipts"
		trans.user=bank;
		var rec=prompt("Please enter the Rec number","Start with \"0\"");
		if (rec!=null && rec!=""){
			trans.funcParam=[trans.user,rec]
	    	$.post("transaction",JSON.stringify(trans),function(data){
				$("#event").append("<p><strong>Bank</strong> ["+ $("#getReceipt0").text()+" "+rec+" ] "+data+"</p>");
				alert("Receipt: " + data);
			});
		}
	});

	$("#settleAccount0").click(function(){
		trans.funcName="SettleAccount"
		trans.funcParam=[]
		trans.user=bank;
		$.post("transaction",JSON.stringify(trans),
		function(data){
			$("#event").append("<p><strong>Bank</strong> ["+ $("#settleAccount0").text()+"] "+data+"</p>");
			alert("Data: \n" + data);
		});
	});

	$("#getBalance").click(function(){
		user=$('#company_names option:selected').val();
		trans.funcName="property"
		trans.user=user;
		trans.funcParam=[trans.user]
        $.post("transaction",JSON.stringify(trans),
		function(data){
			// console.log(trans.user);
			// console.log(companyInfo);
			for (var key in companyInfo) {
				console.log(key);     //获取key值
				console.log(companyInfo[key]); //获取对应的value值
			}
			$("#event").append("<p><strong>"+companyInfo[trans.user]+"</strong> ["+ $("#getBalance").text()+"] "+data+"</p>");
			alert("Balance: " + data);
		});
	});
	
	$("#getReceipt").click(function(){
		user=$('#company_names option:selected').val();
		trans.funcName="receipts"
		trans.user=user;
		var rec=prompt("Please enter the Rec number","Start with \"0\"");
		if (rec!=null && rec!=""){
			trans.funcParam=[trans.user,rec]
	    	$.post("transaction",JSON.stringify(trans),function(data){
				$("#event").append("<p><strong>"+companyInfo[trans.user]+"</strong> ["+ $("#getReceipt").text()+" "+rec+" ] "+data+"</p>");
				alert("Receipt: " + data);
			});
		}
	});

	$("#settleAccount").click(function(){
		user=$('#company_names option:selected').val();
		trans.funcName="SettleAccount"
		trans.funcParam=[]
		trans.user=user;
		$.post("transaction",JSON.stringify(trans),
		function(data){
			$("#event").append("<p><strong>"+companyInfo[trans.user]+"</strong> ["+ $("#settleAccount").text()+"] "+data+"</p>");
			alert("Data: \n" + data);
		});
	});

	$("#goods_trade").click(function(){
		var cAddress=$("#address_goods").val();
		var value=$("#value_goods").val();
		var time=$("#time").val();
		user=$('#company_names option:selected').val();
		trans.funcName="GoodsTrade";
		trans.funcParam=[cAddress,value,time];
		trans.user=user;
		$.post("transaction",JSON.stringify(trans),
		function(data){
			$("#event").append("<p><strong>"+companyInfo[trans.user]+"</strong> ["+ $("#goods_trade").text()+"] "+data+"</p>");
			alert("Data: \n" + data);
			$("#address_goods").val("");
			$("#value_goods").val("");
			$("#time").val("");
		});
	});

	$("#receipt_trade").click(function(){
		var cAddress=$("#address_receipte").val();
		var value=$("#value_receipte").val();
		var num=$("#num_receipt").val();
		user=$('#company_names option:selected').val();
		trans.funcName="ReceiptTrade";
		trans.funcParam=[cAddress,value,num];
		trans.user=user;
		$.post("transaction",JSON.stringify(trans),
		function(data){
			$("#event").append("<p><strong>"+companyInfo[trans.user]+"</strong> ["+ $("#receipt_trade").text()+"] "+data+"</p>");
			alert("Data: \n" + data);
			$("#address_receipte").val("");
			$("#value_receipte").val("");
			$("#num_receipt").val("");
		});
	});

	$("#finance").click(function(){
		var num=$("#num_finance").val();
		user=$('#company_names option:selected').val();
		trans.funcName="Financing";
		trans.funcParam=[num];
		trans.user=user;
		$.post("transaction",JSON.stringify(trans),
		function(data){
			$("#event").append("<p><strong>"+companyInfo[trans.user]+"</strong> ["+ $("#finance").text()+"] "+data+"</p>");
			alert("Data: \n" + data);
			$("#num_finance").val("");
		});
	});

});

function initSystem(){
	var n=trans.contractName;
	$.post("information","http://localhost:5002/WeBASE-Front/contract/cns?groupId=1&name="+n+"&version="+version,function(data){
		contract=data;
		trans.contractAddress=contract;
		alert("Smart contract address detected:\n"+contract);
		$("#i").append("<li><strong>[Contract] Address: </strong>"+contract+"</li>");
		getBankAddress();
	});
}

function getBankAddress(){

	trans.funcName="BANK"
	trans.funcParam=[]
	$.post("transaction",JSON.stringify(trans),function(data){
		bank=data.slice(2, -2);
		alert("Bank addresses detected:\n"+bank);
		$("#i").append("<li><strong>[BNAK] Address: </strong>"+bank+"</li>");
		getAddress();
	});
}

function getAddress(){
	$.post("getAddress","",function(data){
		// console.log(data);
		// $("#company_names").empty();
		// $("li").remove();
		var temp=JSON.parse(data);
		for (var key in temp) {
			console.log(key);     //获取key值
			console.log(temp[key]); //获取对应的value值
			// console.log(typeof key)
			// console.log(typeof temp[key])
			var tempkey=temp[key];
			companyInfo[tempkey]=key;
			$("#i").append("<li><strong>[COMPANY] "+key+" Address: </strong>"+temp[key]+"</li>");
			$("#company_names").append("<option value ="+temp[key]+">"+key+"</option>");
		}
		// for (var key in companyInfo) {
		// 	console.log(key);     //获取key值
		// 	console.log(companyInfo[key]); //获取对应的value值
		// }
	});
}