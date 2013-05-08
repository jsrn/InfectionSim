function Person(x, y) {
	// Constants
	this.HEALTHY = 1;
	this.INFECTED = 2;
	this.RECOVERED = 3;
	this.DEAD = 4;
	// Code
	this.x = x;
	this.y = y;
	this.status = this.HEALTHY;
	this.getColour = function(){
		switch(this.status){
			case this.HEALTHY:
			return '#0f0';
			case this.DEAD:
			return '#000';
			case this.RECOVERED:
			return 'yellow';
			case this.INFECTED:
			return '#f00';
		}
	};
}

function startingPopulation(popSize){
	var people = new Array();
	for(var i = 0; i < popSize; i++){
		var person = new Person(6*d100(),5*d100());
		person.status = d3();
		people[i] = person;
	}
	return people;
}

function d100(){
	return Math.floor((Math.random()*100));
}

function d10(){
	return Math.floor((Math.random()*10));
}

function d3(){
	return Math.floor((Math.random()*3)) + 1;
}

function drawField(){
	var ctx = canvas.getContext('2d');

	ctx.beginPath();
	ctx.fillStyle = 'white';
	ctx.rect(0,0,600,500);
	ctx.fill();

	for(var i = 0; i < people.length; i++){
		var person = people[i];

		ctx.beginPath();
		ctx.arc(person.x, person.y, 3, 0, 2 * Math.PI, false);
		ctx.fillStyle = person.getColour();
		ctx.fill();
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000';
		ctx.stroke();
	}
}

function updateField(){
	// Status checks
	for(var i = 0; i < people.length; i++){
		var person = people[i];

		// If they're infected
		if(person.status == person.INFECTED){

			// Check if they've recovered
			if(d100() < rChance){
				person.status = person.RECOVERED;
				continue;
			}

			// Check if they've infected anyone else
			for(var i = 0; i < people.length; i++){
				var target = people[i];
				//if(person != target && withinRange(person, target)){
					//if(d100() < iChance && target.status != target.RECOVERED){
					if(d100() < iChance  && target.status != target.RECOVERED  && target.status != target.INFECTED){
						target.status = target.INFECTED;
					}
				//}
			}

			// Check if they've died :(
			if(d100() < mChance){
				person.status = person.DEAD;
			}
		}
	}

	// Clean up the bodies
	for(var i = 0; i < people.length; i++){
		var person = people[i];

		if(person.status == person.DEAD){
			people.splice(i, 1);
		}
	}
}

$(function() {
	// Buttonify button
	$("#reset-button").button();
	$("#reset-button").click(resetField);

	// Set default slider values
	mChance = d100();
	$("#mortalitySlider").slider({
		value: mChance,
		stop: function( event, ui ) {
			mChance = ui.value;
		}
	});

	rChance = d100();
	$("#recoverySlider").slider({ 
		value: rChance,
		stop: function( event, ui ) {
			rChance = ui.value;
		}
	});

	iChance = d100();
	$("#infectionSlider").slider({
		value: iChance,
		stop: function( event, ui ) {
			iChance = ui.value;
		}
	});

	canvas = document.getElementById('people-field');
	if(!canvas.getContext){
		document.write('You need Safari or Firefox 1.5+ to see this demo.');
	}

	people = startingPopulation(100);

    // Start loop
    timeStep = 1;
    var interval = 1000 / 1;
    setInterval( mainLoop, interval );
});

var mainLoop = function() {
    updateField();
    drawField();
    updateStats();
    timeStep++;
};

var resetField = function(){
	people = startingPopulation(100);
	timeStep = 0;
};

var withinRange = function(person1, person2){
	var radius = 100;

	var distance = Math.sqrt( Math.pow(person1.x-person2.x,2) + Math.pow(person1.y-person2.y,2) );
	return distance < radius;
};

var updateStats = function(){
	var infC = 0;
	var recC = 0;
	var heaC = 0;

	for(var i = 0; i < people.length; i++){
		var person = people[i];

		switch(person.status){
			case person.HEALTHY:
				heaC++;
				break;
			case person.INFECTED:
				infC++;
				break;
			case person.RECOVERED:
				recC++;
				break;
		}

		var total = infC + recC + heaC;

		var outp = "Healthy: " + heaC + "<br>";
		outp += "Infected: " + infC + "<br>";
		outp += "Recovered: " + recC + "<br>";
		outp += "<b>Total:</b> " + total + "<br><br>";
		outp += "Recovery Chance: " + rChance + "<br>";
		outp += "Infection Chance: " + iChance + "<br>";
		outp += "Mortality Chance: " + mChance + "<br><br>";
		outp += "Timestep: " + timeStep;
		$("#stats").html(outp);
	}
};