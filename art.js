/*
(C) 2014 Jackson Henry
*/

var particleRadius = 20,
	numCloudParticles   = 50,
	cloudParticlesLeft     = [],
	cloudParticlesMiddle     = [],
	cloudParticlesRight     = [],
	cloudColor          = "rgba(255,0,0,0)",
	svgHeight           = innerHeight
	svgWidth     	    = innerWidth/3,	
	iterTime			= 10,//length of an iteration cycle in ms
	rayWidth            = 10,
	rayColor            = "rgba(255,255,255,0)",
	raySpeed			= 13,//ray speed in px per iteration
	rayDataLeft           = [],//data for each ray
	rayDataMiddle            = [],//data for each ray
	rayDataRight            = [],//data for each ray
	tau                 = 2*Math.PI,//used for conversion and polar coordinates
	dTheta              = tau/10,
	left                = d3.select("#left").append("svg")// add the svg element to body
							.attr("width" , svgWidth)
							.attr("height", svgHeight);
	middle              = d3.select("#center").append("svg")// add the svg element to body
							.attr("width" , svgWidth)
							.attr("height", svgHeight);
	right                 = d3.select("#right").append("svg")// add the svg element to body
							.attr("width" , svgWidth)
							.attr("height", svgHeight);


var lineFunction = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("basis-closed");

function makeCloud(svg,data)
{	
	if (svg == left)
	{
		for (var i = 0; i < numCloudParticles; i++) 
		{
			x = Math.random()*svgWidth
			y = Math.random()*svgHeight
			data.push([x,y])
		};
	}

	if (svg ==middle)
	{
		for (var i = 0; i < numCloudParticles; i++) 
		{
			x = svgWidth/2
			y =i/numCloudParticles*svgHeight
			data.push([x,y])
		};
	}

	if (svg ==right)
	{
		data.push([-10,-10])
	}

	// add a particle to the svg for each particle in the array
		svg.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.attr("cx",function(d){return(d[0])})
			.attr("cy",function(d){return(d[1])})
			.attr("r",particleRadius)
			.attr("fill",cloudColor);
}


function addRay(svg,data,origin,angle,r,color,refract)
{
	if (svg == middle)
	{
		angle = tau/6.6		
	}

	polCoords     = {r:r,theta:angle}
	cartCoords    = polToCart(polCoords)

	cartCoords.x += origin.x
	cartCoords.y +=origin.y

	data.push(
		{
			lineData:
			[
				origin,
				origin,
				cartCoords
			],
			origin  : origin,
			class   :'activeRay',
			color   : color,
			refract : refract
		})

	width = rayWidth
	if (svg == left)
	{
		width = 2
	}

	if (svg == right)
	{
		width = 25
	}

	svg.selectAll(".activeRay")
		.data(data)// associate all lines with a value in the rayData array
		.enter()// d3 magic
		.append("path")
		.attr("fill", "none")
		.attr("d", function(d){return(lineFunction(d.lineData))})
		.attr("class",function(d){return(d.class)})
		.attr("stroke-width",width)
		.attr("stroke",function(d){return(d.color)});
};

function refract(svg,data,origin,theta,dTheta)
{
	// addRay(svg,data,origin , theta+dTheta   , particleRadius*2 ,"rgba(255,0,0,.3)"   , false)
	// addRay(svg,data,origin , theta+2*dTheta , particleRadius*2 ,"rgba(255,127,0,.3)" , false)
	// addRay(svg,data,origin , theta+3*dTheta , particleRadius*2 ,"rgba(255,255,0,.3)" , false)
	// addRay(svg,data,origin , theta+4*dTheta , particleRadius*2 ,"rgba(0,255,0,.3)"   , false)
	// addRay(svg,data,origin , theta+5*dTheta , particleRadius*2 ,"rgba(0,0,255,.3)"   , false)
	// addRay(svg,data,origin , theta+6*dTheta , particleRadius*2 ,"rgba(143,0,255,.3)" , false)

	addRay(svg,data,origin , theta+dTheta   , particleRadius*2 ,"rgba(255,255,255,.1)" , false)
	addRay(svg,data,origin , theta+2*dTheta , particleRadius*2 ,"rgba(255,255,255,.15)" , false)
	addRay(svg,data,origin , theta+3*dTheta , particleRadius*2 ,"rgba(255,255,255,.2)" , false)
	addRay(svg,data,origin , theta+4*dTheta , particleRadius*2 ,"rgba(255,255,255,.25)" , false)
	addRay(svg,data,origin , theta+5*dTheta , particleRadius*2 ,"rgba(255,255,255,.3)" , false)
	addRay(svg,data,origin , theta+6*dTheta , particleRadius*2 ,"rgba(255,255,255,.35)" , false)
}

function sun(svg,data,frequency)
{
	color = rayColor
	if(svg == middle)
	{
		color = 'rgba(255,255,255,.4)'
	}

	if(svg == right)
	{
		color = 'rgba(255,255,255,.4)'
	}

	randomInt = Math.random()
	if (randomInt<=frequency)
	{
		x = Math.random()*svgWidth
		y = Math.random()*svgHeight
		var origin = {x:x,y:y}
		addRay(svg,data,origin,tau/4,.01,color,true)
	}
}

function replot(svg,rayData,cloudData)
{
	sun(svg,rayData,.05)

	// loop through all  rays
	for (var i = rayData.length - 1; i >= 0; i--)
	{
		hasNotColided = true

		var len  = rayData[i].lineData.length-1,
			rayX = rayData[i].lineData[len].x,
			rayY = rayData[i].lineData[len].y;
			
			
		// loop through all cloud particles
		for (var j = cloudData.length -1; j>=0 ;j--) 
		{
			var cloudParticleX = cloudData[j][0],
				cloudParticleY = cloudData[j][1],
				xSeperation    = Math.abs(rayX-cloudParticleX),
				ySeperation    = Math.abs(rayY-cloudParticleY);
			if (xSeperation<particleRadius && ySeperation<particleRadius)
			{
				hasNotColided     = false
				rayData[i].origin = {x:rayX,y:rayY}
				center            = rayData[i].origin
				polCoords         = {r:.1,theta:0}
				if (svg == left)
				{
					polCoords.theta   = Math.random()*tau
				}
				if (svg == middle)
				{
					polCoords.theta   = 0
				}
				polCoords.r      += particleRadius*2.5
				cartCoords        = polToCart(polCoords)
				cartCoords.x     += center.x
				cartCoords.y     += center.y

				rayData[i].lineData.push(cartCoords)

				if (rayData[i].refract)
				{
					if (svg == left)
					{
						refract(svg,rayData,center,polCoords.theta,dTheta)
						rayData[i].refract = false
					}
					if (svg == middle)
					{
						addRay(svg,rayData,center ,0, particleRadius*2 ,"rgba(255,255,255,.3)"   , false)
					}
					
				}
			}

			// var len  = data[i].lineData.length-1;
			center = rayData[i].origin
			x = rayX-center.x
			y = rayY-center.y
			polCoords = cartToPol({x:x,y:y})
			if (hasNotColided)
			{
				polCoords.r+=raySpeed;
				hasNotColided = true
			}
			cartCoords = polToCart(polCoords)
			cartCoords.x+=center.x
			cartCoords.y+=center.y
			rayData[i].lineData[len] = cartCoords
		};

		// if the rayhits the bottom of the svg then leave it there as a little marker (color observation)
		if (rayY>svgHeight || rayY<0 || rayX>svgWidth || rayX<0)
		{
			collectRay(rayData,rayData[i],i)
		  
		}
	}


	// update svg with new data
	svg.selectAll(".activeRay")
		.attr("d", function(d){return(lineFunction(d.lineData))})
		.attr("stroke", function(d){return(d.color)})
		.attr("class",function(d){return(d.class)});
};

function collectRay(data,ray,i)
{
	ray.lineData = [{x:0,y:0},{x:0,y:0}]
	ray.class = 'inactive'
	data.splice(i,1);
}

function polToCart(coordinates)
{
	r              = coordinates.r
	theta          = coordinates.theta
	x              = r*Math.cos(theta)
	y              = r*Math.sin(theta)
	newCoordinates = {x:x,y:y}
	return(newCoordinates)
}

function cartToPol(coordinates)
{
	x              = coordinates.x
	y              = coordinates.y
	r              = Math.sqrt(Math.pow(x,2)+Math.pow(y,2))
	theta          = Math.atan2(y,x)
	newCoordinates = {r:r,theta:theta}
	return(newCoordinates)
}

var xScale = d3.scale.linear()
	.domain([-svgWidth/2,svgWidth/2])
	.range([0,svgWidth])

var yScale = d3.scale.linear()
	.domain([-svgHeight/2,svgHeight/2])
	.range([svgHeight,0])

makeCloud(right,cloudParticlesRight)
window.setInterval(function(){replot(right,rayDataRight,cloudParticlesRight)},iterTime)

makeCloud(middle,cloudParticlesMiddle)
window.setInterval(function(){replot(middle,rayDataMiddle,cloudParticlesMiddle)},iterTime)

makeCloud(left,cloudParticlesLeft)
window.setInterval(function(){replot(left,rayDataLeft,cloudParticlesLeft)},iterTime)