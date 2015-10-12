//Problem: Need to store items to the clipboard and display all items to be stored and accessed later.

// Things I still want to add: 
	//Ellipsis for overflowing text.
	//Close the popup.html when a clipboard item is selected and copied to OS clipboard.

//The clipboard object is defined here.
var clipboard = {};
var clipboardLS = {};
//The input text to be submitted to the clipboard is defined here.
var textToSubmit;
var testTheGet;
var initialBuild = "";

//Here the next key with an open space is defined...
var theNextKey;

//Build list in the DOM from existing Chrome Local Storage items if any exist...
chrome.storage.local.get(null, function(storedClipboard){ 
		
		//Here we log the contents of Local Storage to see what we have stored already...
		console.log(storedClipboard)
		
		//Each through local storage to populate the table...
		$.each( storedClipboard, function( key, value){
			
			buildThisRow( key , value );
		});
				
		//Here we set theNextKey on initial app load...
		theNextKey =  Object.keys(storedClipboard).pop();
		theNextKey++;
		
		//If there was nothing in Local Storage set the next key to be 1...
		if (!theNextKey){
			theNextKey = 1;
		};
		
		//Log the next open key to check my work...
		console.log("The next key to be added is " + theNextKey);

});

//Click handler for the Submit Button...
$( "#submitButton" ).click(function() {
	
	textToSubmit = $("input").val();
	
	//Making sure the the Click event is working...
	console.log("Click event fired and the content of the input area is " + textToSubmit + ".");
	
	//Transfer the contents of textToSubmit into the Clipboard if they are not empty.
	if( textToSubmit.length >= 1 ){
		
		console.log( "The text to submit is greater than 1!");
		
		//Because the input area was not empty, dump the contents of the input onto the local clipboard.
		clipboardLS[theNextKey] = textToSubmit;
		
		console.log(clipboardLS);
		
		//Set local storage with the updated clipboard...
		chrome.storage.local.set( clipboardLS );
		
		//The item submitted is appended to the DOM here...
		buildThisRow( theNextKey , textToSubmit );
	
		
		
		
		//Clear the itemInput after the transfer is complete.
		$("input").val("");

	} else {
		
		//If the input box was empty, return out of the click handler as there is nothing to add to the Clipboard.
		console.log("The text to submit was NOT greater than 1 and nothing was added to the clipboard.");
		return;
		
	};
	
	//Log the contents of the Clipboard to check my work.
	console.log(clipboardLS);
	console.log(Object.keys(clipboardLS).length);

	//Logging the key being added to the object.
	console.log( "Submitted in position " + theNextKey + "." );
	
	theNextKey++;
	console.log("The next key to be added is now... " + theNextKey);
});

	
//This function called on change of the Local Storage...
chrome.storage.onChanged.addListener(function ( theClipboard , areaName ){
	//var arrayOfKeys = Object.keys(theClipboard);
	
	//Here we log the contents of the changed data...
	console.log(theClipboard);
	
});

//This function clears the Local Storage when called...
function clearClipboard (){
	chrome.storage.local.clear( function() {
		
		console.log("Clipboard has been cleared");
	});
};

//Click handler for the clipboard table items...
$( ".clipboardTable" ).on('click', ".clipboardItem2", function(){
	
	//console.log("click worked " + this);
	//console.log($(this).text());
	
	copyThisText($(this).text());
	
});

function copyThisText(textToCopy){

    var input = document.createElement('textarea');
    document.body.appendChild(input);
    input.value = textToCopy;
    input.focus();
    input.select();
    document.execCommand('Copy');
    input.remove();
	
};

//Listener copying my table content to the OS Clipboard...
chrome.runtime.onMessage.addListener(function(message) {
	
	console.log("running the onMessage listener...");
	
    if (message && message.type == 'copy') {
        var input = document.createElement('textarea');
        document.body.appendChild(input);
        input.value = message.text;
        input.focus();
        input.select();
        document.execCommand('Copy');
        input.remove();
    }
});

$("#deleteAllButton").click( function(){
	clearClipboard ();
	$(".clipboardRow").remove();
	console.log("everything has been removed from Chrome Local Storage");
});



function buildThisRow( key , value ){
	//building a row in the table for the value that the user just submitted  
		$("<tr class = 'clipboardRow' id='" + key + "'><td class = 'deleteLineButton'><img src='media/trash_can.png'></td><td class = 'clipboardItem2'>" + value + "</td></tr>" ).appendTo(".clipboardTable").each(function(){
		//In the line above, I am putting the key directly in the html, and then setting the value as visible text in our DOM
						
			var thisRow = this;
			
			//setting instructions for the delete button of THIS row.
			$(thisRow).find(".deleteLineButton").on("click", function(){//Here, THIS is the HTML that we are appending above.  (tr.clipboardRow)
				//click instructions for the delete button in THIS row.
				
				chrome.storage.local.remove(key.toString(), function(data){
					console.log("just deleted an item from chrome local storage.  It's data is: "+ data);
					//We only want to remove the row from the dom after we KNOW that it has been removed from chrome local storage.  
										
					console.log(this);
					$(thisRow).fadeOut(250);

				});
			});
			
			//setting instructions for the click of the text in THIS row.
			$(thisRow).find(".clipboardItem2").on("click", function(){
				//same as above, THIS is the html row that we just appended to the clipboard table
				
				copyThisText(value);//We are passing the value of this key:value pair directly to this function so that when this part of the row is clicked, it will copy the VALUE, not necessarily the text in the DOM. 
				
			});
			
		});
};




