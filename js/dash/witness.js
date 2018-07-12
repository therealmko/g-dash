var refreshRate = 60000;
var waccountuuid = '';
var waccountlabel = '';
var loadjsondata = '';
var totalNetworkWeight = '';
var nlgwaccountlist = [];
var nlgaccountlist = [];
var slidervalue = 1;

function changeWitnessAccount(wuuid) {
	$('#witnesswithdrawbutton').prop("disabled", true);
	$('#selectedwitnessaccountwithdraw').val("Loading...");
	$('#selectedwitnessaccount').val("Loading...");
	$('#selectedwitnessaccountkey').val("Loading...");
	$('#selectedwitnessaccountdelete').val("Loading...");
	
	waccountuuid = wuuid;
	loadjsondata();
}

//Create a new witness account
function addAccount() {
	var newaccountnametosend = $('#newaccountname').val();
	var addpasswordtosend = $('#newaccountpassword').val();
	$('#newaccountpassword').val("");
	$('#creataccountbutton').prop("disabled", true);
	
	$.post( "ajax/witnessactions.php?action=createaccount", { accountname: newaccountnametosend, addpassword: addpasswordtosend })
	 .done(function( data ) {
	 	var data = jQuery.parseJSON(data);
	 	if(data['message']==undefined) {
	 		$('#creationmessage').html("<div class='alert alert-info'>Witness account created</div>");
	 		
	 		setTimeout(function(){ 
				$('#newaccountname').val("");
				$('#addwitnessaccount').modal('toggle');
				$('#creationmessage').html("");
				$('#creataccountbutton').prop("disabled", false);
				loadjsondata();
			}, 5000);
	 	} else {
	 		$('#creationmessage').html("<div class='alert alert-danger'>"+data['message']+"</div>");
	 		$('#creataccountbutton').prop("disabled", false);
	 	}
		//console.log(data);
	});
}

//Collect information about funding the witness account
function createWitnessDetails() {
	var popupoptions = {
    	show: true,
        keyboard: false,
        backdrop: 'static'
	};
	
	$('#fundwitnessaccount').modal('toggle');
	$('#fundingpopup').modal(popupoptions);
	$('#confirmwitnessaccount').html($('#selectedwitnessaccount').val());
	$('#confirmguldenaccount').html($('#selectedguldenaccount').val());
	$('#confirmamount').html($('#lockamount').val());
	$('#confirmtime').html(slidervalue);
	
	if($.isNumeric($('#lockamount').val()) && $.isNumeric(slidervalue)) {
		
		$('#transactionmessage').html("");
		$('#conftransmes').html("");
		$('#confirmtransactionpass').prop("disabled", false);
		$('#confirmedsubmit').prop("disabled", false);
		$('#confirmedcancel').prop("disabled", false);
				
	} else {
		$('#conftransmes').html("<div class='alert alert-warning'>Transaction amount or lock time is not a number!</div>");
		$('#confirmtransactionpass').prop("disabled", true);
		$('#confirmedsubmit').prop("disabled", true);
	}
	
	$('#lockamount').val("");
}

//Confirm locking the witness account
function confirmWitnessDetails(confirmed) {
	if(confirmed=="true") {
		$('#confirmedsubmit').prop("disabled", true);
		$('#confirmedcancel').prop("disabled", true);
		
		var confirmwitnessaccount = $('#confirmwitnessaccount').html();
		var confirmguldenaccount = $('#confirmguldenaccount').html();
		var confirmtime = $('#confirmtime').html();
		var transactionamount = $('#confirmamount').html();
		var transactionpassphrase = $('#confirmtransactionpass').val();
		
		$.post( "ajax/witnessactions.php?action=fundaccount", { tolabel: confirmwitnessaccount, amount: transactionamount, pass: transactionpassphrase, fromlabel: confirmguldenaccount, locktime: confirmtime })
		 .done(function( data ) {
		 	var data = jQuery.parseJSON(data);
		 	
		 	if(data=="1") {
		 		$('#conftransmes').html("<div class='alert alert-success'>Funding witness account. It can take a while before this is visible.</div>");
		 		
				$('#confirmaddress').val("");
				$('#confirmamount').val("");
				$('#confirmtransactionpass').val("");
				setTimeout(function(){ 
					$('#conftransmes').html("");
					$('#fundingpopup').modal('toggle');
					loadjsondata();
					}, 5000);
				
		 	} else if(data=="-1") {
		 		$('#conftransmes').html("<div class='alert alert-warning'>Wallet password incorrect.</div>");
		 		$('#confirmtransactionpass').val("");
		 		$('#confirmedcancel').prop("disabled", false);
		 		$('#confirmedsubmit').prop("disabled", false);
		 	} else if(data=="-2") {
		 		$('#conftransmes').html("<div class='alert alert-warning'>Invalid Gulden address.</div>");
		 		$('#confirmtransactionpass').val("");
		 		$('#confirmedcancel').prop("disabled", false);
		 	} else if(data=="-6") {
		 		$('#conftransmes').html("<div class='alert alert-warning'>Insufficient funds.</div>");
		 		$('#confirmtransactionpass').val("");
		 		$('#confirmedcancel').prop("disabled", false);
		 	} else if(data=="-7") {
		 		$('#conftransmes').html("<div class='alert alert-warning'>Cannot fund a witness-only (imported) witness account.</div>");
		 		$('#confirmtransactionpass').val("");
		 		$('#confirmedcancel').prop("disabled", false);
		 	} else if(data=="-8") {
		 		$('#conftransmes').html("<div class='alert alert-warning'>Account already funded.</div>");
		 		$('#confirmtransactionpass').val("");
		 		$('#confirmedcancel').prop("disabled", false);
		 	} else {
		 		console.log(data);
		 		$('#conftransmes').html("<div class='alert alert-warning'>Unknown error creating transaction. See console log.</div>");
		 		$('#confirmtransactionpass').val("");
		 		$('#confirmedcancel').prop("disabled", false);
		 	}
		});
	} else {
		$('#confirmaddress').val("");
		$('#confirmamount').val("");
		$('#confirmtransactionpass').val("");
		$('#conftransmes').html("");
		$('#fundingpopup').modal('toggle');
	}
}

//Withdraw witness earnings from an active witness account
function withdrawWitnessEarnings() {
	$('#witnesswithdrawbutton').prop("disabled", true);
	
	var earningsfromaccount = $('#selectedwitnessaccountwithdraw').val();
	var earningstoaddress = $('#guldenaddresswithdraw').val();
	var earningswithdrawpass = $('#confirmwithdrawpass').val();
	$('#confirmwithdrawpass').val("");
	
	$.post( "ajax/witnessactions.php?action=withdrawearnings", { toaddress: earningstoaddress, pass: earningswithdrawpass, fromlabel: earningsfromaccount })
	 .done(function( data ) {
	 	var data = jQuery.parseJSON(data);
	 	
	 	if(data=="1") {
	 		$('#withdrawmessage').html("<div class='alert alert-success'>Withdrawing witness earnings.</div>");
	 		
			$('#guldenaddresswithdraw').val("");
			$('#confirmwithdrawpass').val("");
			setTimeout(function(){ 
				$('#withdrawmessage').html("");
				$('#withdrawwitnessaccount').modal('toggle');
				loadjsondata();
				}, 5000);
			
	 	} else if(data=="-1") {
	 		$('#withdrawmessage').html("<div class='alert alert-warning'>Wallet password incorrect.</div>");
	 	} else if(data=="-2") {
	 		$('#withdrawmessage').html("<div class='alert alert-warning'>Invalid Gulden address.</div>");
	 	} else if(data=="-6") {
	 		$('#withdrawmessage').html("<div class='alert alert-warning'>Insufficient funds.</div>");
	 	} else if(data=="-7") {
	 		$('#withdrawmessage').html("<div class='alert alert-warning'>Cannot fund a witness-only (imported) witness account.</div>");
	 	} else if(data=="-8") {
	 		$('#withdrawmessage').html("<div class='alert alert-warning'>Wallet is encrypted, but no password was passed.</div>");
	 	} else {
	 		console.log(data);
	 		$('#withdrawmessage').html("<div class='alert alert-warning'>Unknown error creating transaction. See console log.</div>");
	 	}
	 	
	 	$('#witnesswithdrawbutton').prop("disabled", false);
	});
}

//Calculate the potential weight using the slider in the fund witness account modal
function calculateWeight(sliderval) {
	if(sliderval > 0) {
		slidervalue = parseFloat(sliderval);
	}
	var lockedamount = parseFloat($('#lockamount').val());
	
	//To calculate the weight step by step
	var BlocksPerMonth = (576 * 30) + 50;
	var LockForMonthsInBlocks = parseFloat(BlocksPerMonth * slidervalue);
	var BlocksPerYear = 576 * 365;
	
	var calculatedWeight = Math.round((lockedamount + ((lockedamount*lockedamount) / 100000)) * (1 + (LockForMonthsInBlocks / BlocksPerYear)));
	var myWeightPercentage = ((calculatedWeight / totalNetworkWeight) * 100).toFixed(2);
	var minimumWeight = 10000;
	
	$('#lockweight').html(calculatedWeight + " (" + myWeightPercentage + "%)");
	if(calculatedWeight < minimumWeight) {
		$('#transactionmessage').html("<div class='alert alert-warning'>Your weight is too low</div>");
		$('#lockbutton').prop("disabled", true);
	} else {
		$('#transactionmessage').html("");
		$('#lockbutton').prop("disabled", false);
	}
}

//Create a list of all normal accounts used in the drop down menu's
function populateAccountList() {
	nlgaccountlist.forEach(function(item, index, array) {
		$("#selectedguldenaccount").append('<option value="' + item + '">' + item + '</option>');
		//console.log(item);
	});
}

//Import a witness account using the supplied witness key
function importWitnessAccount() {
	var importaccountnametosend = $('#importwaccountname').val();
	var importaccountkeytosend = $('#importwaccountkey').val();
	var importpass = $('#importpass').val();
	$('#importwaccountname').val("");
	$('#importwaccountkey').val("");
	$('#importpass').val("");
	
	$.post( "ajax/witnessactions.php?action=importaccount", { importaccountname: importaccountnametosend, importaccountkey: importaccountkeytosend, importpass: importpass })
	 .done(function( data ) {
	 	var data = jQuery.parseJSON(data);
	 	if(data['message']==undefined || data['message']==null) {
	 		$('#keyimportmessage').html("<div class='alert alert-info'>Witness account imported</div>");
	 		setTimeout(function(){ 
	 			$('#importwitnessaccount').modal('toggle');
	 			$('#keyimportmessage').html("");
				loadjsondata();
			}, 5000);
	 	} else {
	 		$('#keyimportmessage').html("<div class='alert alert-danger'>"+data['message']+"</div>");
	 		setTimeout(function(){ 
	 			$('#keyimportmessage').html("");
			}, 5000);
	 	}
	});
}

//Show the witness key to the user
function showWitnessKey() {
	var phrase = $('#rppass').val();
	var selectedwitnessaccountkey = $('#selectedwitnessaccountkey').val();
	
	$('#showkey').html("<img src='images/loading.gif' border='0' height='64' width='64'> Loading....");
	$.post( "ajax/witnessactions.php?action=exportkey", { selectedaccount: selectedwitnessaccountkey, pass: phrase })
	 .done(function( data ) {
	 	var data = jQuery.parseJSON(data);
		//console.log(data);
		$('#showkey').html(data);
	});
	
	$('#rppass').val("");
	setTimeout(function(){ $('#showkey').html(""); }, 20000);
}

//Rename the witness account
function renameWitnessAccount() {
	
	var changedaccsend = $('#renameaccountname').val();
	$('#renameaccountname').val("");
	
	$.post( "ajax/witnessactions.php?action=changeacc", { changedacc: changedaccsend, currentacc: waccountuuid })
	 .done(function( data ) {
	 	var data = jQuery.parseJSON(data);
		//console.log(data);
		loadjsondata();
	});
	
}

//Delete witness account
function confirmDeleteAccount(deletesure) {
	var selectedwitnessaccountdelete = $('#selectedwitnessaccountdelete').val();
	var delpass = $('#delpass').val();
	$('#delpass').val("");
	
	if(deletesure == "true") {
		$.post( "ajax/witnessactions.php?action=deleteaccount", { selectedaccount: selectedwitnessaccountdelete, pass: delpass })
		 .done(function( data ) {
		 	var data = jQuery.parseJSON(data);
			//console.log(data);
			$('#showdelresponse').html(data);
			setTimeout(function(){ 
	 			$('#deleteaccount').modal('toggle');
	 			$('#showdelresponse').html("");
				loadjsondata();
			}, 5000);
			
		});
	} else {
		$('#deleteaccount').modal('toggle');
	}
}

$(document).ready(function() {
	//Set the slider for funding the witness account
	var handle = $( "#locktime" );
    $( "#slider" ).slider({
      min: 1,
      max: 36,
      value: 1,
      create: function() {
        handle.text( $( this ).slider( "value" ) );
      },
      slide: function( event, ui ) {
        handle.text( ui.value );
        calculateWeight(ui.value);
      }
    });
    
    $('#lockamount').keyup(function() {
    	calculateWeight(0);
    });
	
  	//Load json data for the dashboard
	loadjsondata = function() {
	  $.getJSON( "ajax/witness.php?account="+waccountuuid, function( data ) {				 
		  if(data['errors']!='') {
		  	$('#errordiv').html("<div class='alert alert-warning'>"+data['errors']+"</div>");
		  }
		  
		  //$('#witnessnetworkpanel').html("");
		  if(data['server']['cpu']!='') {
		  	  if(data['disablewallet']=="1") {
		  	  	$('#witnessnetworkpanel').html("Wallet disabled in Gulden configuration");
		  	  } else {
		  	  	
		  	  	totalNetworkWeight = data['witness']['totalNetworkWeight'];
		  	  	
		  	  	$('#totalwitnesses').html(data['witness']['totalwitnesses']);
		  	  	$('#totalwitnessweight').html((totalNetworkWeight/1000000).toFixed(2)+" Mil");
		  	  	$('#pow2phase').html("Phase "+data['witness']['currentPhase']);
		  	  	$('#totalwitnesslocked').html((data['witness']['totalGuldenLocked']/1000000).toFixed(2)+" Mil");
		  	  	
		  	  	//Witness status panel
		  	  	//TODO: Can be removed after a G-DASH update when > Gulden 2.0 Phase 2 as witness accounts can be created from Phase 2 onwards
		  	  	if(data['witness']['currentPhase'] > 1) {
		  	  		$('#witnessstatuspanel').html("<ul>" +
		  	  									  "<li><a data-toggle='modal' href='#addwitnessaccount'>Create account</a></li>" +
		  	  									  "<li><a data-toggle='modal' href='#importwitnessaccount'>Import witness key</a></li>" +
		  	  									  "<li><a data-toggle='modal' href='#witnessstats'>Network statistics</a></li>" + 
		  	  									  "</ul>");
		  	  	} else {
		  	  		$('#witnessaccountspanel').html("Witness accounts can be created from Phase 2 onwards.");
		  	  		$('#witnessstatuspanel').html("Witness accounts can be created from Phase 2 onwards.");
		  	  	}
		  	  	
		  	  	//Witness list panel
		  	  	var witnesspanelbody = "";
		  	  	var witnessaccountsbody = "";
		  	  	//$('#witnesslistpanel').html("<div class='panel-group' id='allwitnesses'>");
		  	  	
		  	  	$.each(data['accountlist'], function( index, value ) {
		  	  		if(value['UUID']==waccountuuid) {
		  	  			$('#selectedwitnessaccount').val(value['label']);
		  	  			$('#selectedwitnessaccountwithdraw').val(value['label']);
		  	  			$('#selectedwitnessaccountkey').val(value['label']);
		  	  			$('#selectedwitnessaccountdelete').val(value['label']);
		  	  			$('#witnesswithdrawbutton').prop("disabled", false);
		  	  		}
		  	  		
		  	  		//Remove spaces from the div IDs
	  	  			var moreinfocollapsename = value['label'];
	  	  			moreinfocollapsename = moreinfocollapsename.split(' ').join('');
		  	  		
		  	  		//Witness account panel
		  	  		witnesspanelbody += "<div class='panel panel-default'>";
		  	  		
		  	  		//Witness account panel header
		  	  		witnesspanelbody += "<div class='panel-heading clearfix' id='" + value['label'] + "' name='" + value['label'] + "'>";
		  	  		
		  	  		//Create a left-pulled span for the heading
		  	  		witnesspanelbody += "<span class='pull-left' style='padding-top: 10px;'>";
		  	  		
		  	  		//Show the witness account type in the header and in the accounts list
		  	  		var witnessType = '';
		  	  		if(data['witnessaccountdetails'][value['label']]['witnessonly'] == true) {
		  	  			witnessType = "<i class='glyphicon glyphicon-eye-open'></i>";
		  	  		} else {
		  	  			witnessType = "<i class='glyphicon glyphicon-home'></i>";
		  	  		}
		  	  		
		  	  		//Add a link to the account panel
		  	  		witnessaccountsbody += witnessType + " " + "<a href='#" + value['label'] + "'>" + value['label'] + "</a><br>";
		  	  		
		  	  		//Show the label of the witness account in the header
		  	  		witnesspanelbody += witnessType + " " + value['label'] + " || " + data['witnessaccountdetails'][value['label']]['status'];
		  	  		
		  	  		//Close the heading span
		  	  		witnesspanelbody += "</span>";
		  	  		
		  	  		//Add an actions cog glyphicon at the right of the heading and create a drop down menu with the available actions
		  	  		witnesspanelbody += "<div class='dropdown pull-right'>";
			  	  		witnesspanelbody += "<button class='btn btn-secondary dropdown-toggle' type='button' id='" + moreinfocollapsename + "actions' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>";
			  	  		witnesspanelbody += "<i class='glyphicon glyphicon-cog' style='font-size:20px; padding-top: 2.5px;'></i>";
			  	  		witnesspanelbody += "<span class='caret'></span>";
			  	  		witnesspanelbody += "</button>";
		  	  		
			        	witnesspanelbody += "<ul class='dropdown-menu' aria-labelledby='" + moreinfocollapsename + "actions'>";
			        		//Witness actions
				  	  		//TODO: If statement can be removed after a G-DASH update when > Gulden 2.0 Phase 2 as witness accounts can be funded from Phase 2 onwards
				  	  		if(data['witness']['currentPhase'] > 1) {
				  	  			
				  	  			//Options available only for accounts that are not yet funded
				  	  			if(data['witnessaccountdetails'][value['label']]['status'] == "Not funded") {
					  	  			witnesspanelbody += "<li><a data-toggle='modal' href='#fundwitnessaccount' onclick=\"changeWitnessAccount('"+value['UUID']+"')\">Fund witness account</a></li>";
					  	  		} else {
					  	  			
					  	  			//Options only available for witness accounts with earnings more than zero
					  	  			if(data['witnessaccountdetails'][value['label']]['earningsavailable'] > 0) {
					  	  				witnesspanelbody += "<li><a data-toggle='modal' href='#withdrawwitnessaccount' onclick=\"changeWitnessAccount('"+value['UUID']+"')\">Withdraw witness earnings</a></li>";
					  	  			}
					  	  			
					  	  			//Options only available for non-imported accounts
					  	  			if(data['witnessaccountdetails'][value['label']]['witnessonly'] == false) {
						  	  			witnesspanelbody += "<li><a data-toggle='modal' href='#exportwitnesskey' onclick=\"changeWitnessAccount('"+value['UUID']+"')\">Get witness keys</a></li>";
						  	  			//TODO: Will make this available at a later stage (Phase 3+)
						  	  			//witnesspanelbody += "<li><a href='#'>Extend locking time and amount of witness account</a></li>";
					  	  			}
					  	  			
					  	  			//Options available for all funded accounts
					  	  			witnesspanelbody += "<li><a data-toggle='modal' href='#renameaccount' onclick=\"changeWitnessAccount('"+value['UUID']+"')\">Rename witness account</a></li>";
					  	  			witnesspanelbody += "<li><a href='#'>Show witness earnings graph</a></li>";
					  	  			witnesspanelbody += "<li class='divider'></li>";
					  	  			witnesspanelbody += "<li><a data-toggle='modal' href='#deleteaccount' onclick=\"changeWitnessAccount('"+value['UUID']+"')\">Delete witness account</a></li>";
					  	  			
					  	  		}
				  	  		} else {
				  	  			
				  	  			//Options available for non-funded witness accounts in Phase 2
				  	  			//TODO: Can be removed after Phase 2 is activated
				  	  			if(data['witnessaccountdetails'][value['label']]['status'] == "Not funded") {
					  	  			witnesspanelbody += "<li><a data-toggle='modal' href='#fundwitnessaccount' onclick=\"changeWitnessAccount('"+value['UUID']+"')\">Fund witness account</a></li>";
					  	  		}
				  	  			witnesspanelbody += "<li><a href='#'>Other witness actions are available from Phase 2 onwards.</a></li>";
				  	  		}
			        		
				    	witnesspanelbody += "</ul>";
			        witnesspanelbody += "</div>";
		  	  		
		  	  		//Close the header div
		  	  		witnesspanelbody += "</div>";
		  	  		
		  	  		//Witness account panel body
		  	  		witnesspanelbody += "<div class='panel-body'>";
		  	  		
		  	  		
		  	  		//Witness info (only if funded)
		  	  		if(data['witnessaccountdetails'][value['label']]['status'] != "Not funded") {
		  	  			
		  	  			//On update, check if the div is already expanded, so it will not close on update
		  	  			var collapseStateCheck = 'false';
		  	  			//TODO: Does not work yet
		  	  			/*
		  	  			if($('#'+moreinfocollapsename).attr('aria-expanded') == "true") {
		  	  				collapseStateCheck = 'true'
		  	  			}
		  	  			*/
		  	  			
		  	  			witnesspanelbody += "<div class='col-lg-12 col-md-12 alert alert-info' data-toggle='collapse' aria-expanded='" + collapseStateCheck + "' aria-controls='" + moreinfocollapsename + "' href='#" + moreinfocollapsename + "moreinfo'>"; //Alert-info div
							witnesspanelbody += "<div class='col-lg-12 col-md-12'>"; //Status div
								witnesspanelbody += "<b>Status</b>: " + data['witnessaccountdetails'][value['label']]['status_long'];
							witnesspanelbody += "</div><br><br>"; //End status div
							
							witnesspanelbody += "<div class='col-xs-12 col-sm-12 col-md-12 col-lg-12'>"; //Primary info div
								witnesspanelbody += "<i class='glyphicon glyphicon-resize-vertical huge pull-right' title='Click to expand for more info'></i>";
								witnesspanelbody += "Amount locked: " + data['witnessaccountdetails'][value['label']]['amount'] + " NLG<br>";
								witnesspanelbody += "Locking time: " + data['witnessaccountdetails'][value['label']]['lock_period_time'] + "<br>";
								witnesspanelbody += "Last witness action: " + data['witnessaccountdetails'][value['label']]['last_active_date'] + "<br>";
								witnesspanelbody += "Gulden earned: " + data['witnessaccountdetails'][value['label']]['totalearnings'] + " NLG<br>";
							witnesspanelbody += "</div>"; //End primary info div
							
							witnesspanelbody += "<div class='col-lg-12 col-md-12 collapse' id='" + moreinfocollapsename + "moreinfo'>"; //Secondary info div
								witnesspanelbody += "Locked since: " + data['witnessaccountdetails'][value['label']]['lock_from_date'] + "<br>";
								witnesspanelbody += "Locked until: " + data['witnessaccountdetails'][value['label']]['lock_until_date'] + "<br>";
								witnesspanelbody += "Witness cycles: " + data['witnessaccountdetails'][value['label']]['totalcycles'] + "<br>";
								witnesspanelbody += "Gulden available: " + data['witnessaccountdetails'][value['label']]['earningsavailable'] + " NLG<br>";
								witnesspanelbody += "Gulden immature: " + data['witnessaccountdetails'][value['label']]['earningsimmature'] + " NLG<br>";
								witnesspanelbody += "Current Weight: " + data['witnessaccountdetails'][value['label']]['raw_weight'] + " (" + data['witnessaccountdetails'][value['label']]['weight_percentage_raw'] + ")<br>";
								witnesspanelbody += "Adjusted Weight: " + data['witnessaccountdetails'][value['label']]['adjusted_weight'] + " (" + data['witnessaccountdetails'][value['label']]['weight_percentage_adj'] + ")<br>";
								witnesspanelbody += "Expected earnings: " + data['witnessaccountdetails'][value['label']]['expectedearnings'] + " NLG<br>";
							witnesspanelbody += "</div>"; //End secondary info div
							
							witnesspanelbody += "<div class='col-lg-12 col-md-12' id='" + moreinfocollapsename + "evenmoreinfo'>"; //Third info div
								witnesspanelbody += "&nbsp;";
							witnesspanelbody += "</div>"; //End third info div
						witnesspanelbody += "</div>"; //End alert-info div
		  	  		}
		  	  		
		  	  		//Close body
		  	  		witnesspanelbody += "</div>";
		  	  		
		  	  		//Close witness account panel
		  	  		witnesspanelbody += "</div>";
		  	  		
		  	  		nlgwaccountlist.push(value['label']);
		  	  	});
		  	  	
		  	  	$.each(data['regaccountlist'], function( index, value ) {
		  	  		nlgaccountlist.push(value['label']);
		  	  	});
		  	  	
		  	  	//Close witness panel-group div
		  	  	witnesspanelbody += "</div>";
		  	  	
		  	  	
		  	  	$('#witnesslistpanel').html(witnesspanelbody);
		  	  	$('#witnessaccountspanel').html(witnessaccountsbody);
		  	  	
		  	  	var accountListCount = $('#selectedguldenaccount option').length;
		  	  	if(accountListCount == 0) {
		  	  		populateAccountList();
		  	  	}
			  }
		  } else {
		  	  $('#witnessnetworkpanel').html("GuldenD is not running");
		  }
	   });
	};
	
	loadjsondata();
	
	//Load the json data for the dashboard every x seconds
	setInterval (function () {
		loadjsondata()
	}, refreshRate)
});
