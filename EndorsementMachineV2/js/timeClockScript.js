window.bgcount = 10
window.v_interval = 20
window.interval_id = null
window.v_year = '2022'
window.v_mon = '07'
window.v_day = '7'
window.v_zoom = 100
window.v_text = ""
window.v_custom_dir = null

window.v_posx = 50
window.v_posy = 50

window.wallpaperPropertyListener = 
{
	applyUserProperties: function(properties) 
	{
		if (properties.v_interval) 
		{
			window.v_interval = properties.v_interval.value;
			clearInterval(window.interval_id);
			window.interval_id = setInterval("next2()",window.v_interval*1000);
		}
		if (properties.v_year) 
		{
			window.v_year = properties.v_year.value;
		}
		if (properties.v_mon) 
		{
			window.v_mon = properties.v_mon.value;
		}
		if (properties.v_day) 
		{
			window.v_day = properties.v_day.value;
			y = Math.floor(window.v_day/365);

		}
		if(properties.v_folder)
		{
			window.v_custom_dir = properties.v_folder.value
			next2();
		}
		if(properties.v_zoom)
		{
			window.v_zoom = properties.v_zoom.value
			$("#front").css("transform","scale("+window.v_zoom/100+")")
			// $("#text").css("transform","translate(-200px,-200px) scale("+window.v_zoom/100+") ")
		}
		if(properties.v_text)
		{
			window.v_text = properties.v_text.value
			$("#text").text(window.v_text)
			if (window.v_text=="")
			{
				$("#text").css("opacity",'0')
			}
			else{
				$("#text").css("opacity",'1')
			}
		}
		if(properties.v_opa)
		{
			window.v_opa= properties.v_opa.value
			$("#front").css("opacity",window.v_opa/100)
		}
		if(properties.v_posx)
		{
			window.v_posx = properties.v_posx.value-50
			$("#front").css("left",""+window.v_posx+'%')
		}
		if(properties.v_posy)
		{
			window.v_posy = properties.v_posy.value-50
			$("#front").css("top",""+window.v_posy+'%')
		}
	}
}

function date2timestamp(y,m,d)
{
	v_date = new Date(''+y+'-'+m+'-'+d+" ");
	return v_date;
}

function setRandomBackground(propertyName, filePath) {
	// $("#bg").css("background-image",'url("file:///'+filePath+ '")')

	// $("#txt_debug").text($("#bg").css("background-image"))
}


function next2()
{
	if(window.v_custom_dir)
	{
		window.wallpaperRequestRandomFileForProperty('v_folder', setRandomBackground);
	}
	else
	{
		// n = Math.floor(Math.random()*window.bgcount)
		// $("#bg").css("background-image","url(./img/bg"+n+".jpg)");
	}
}

function refershCountDown()
{
	timeleft = date2timestamp(window.v_year,window.v_mon,window.v_day) - new Date();
	timeleft = Math.floor(timeleft/1000)
	if(timeleft<0)
	{
		timeleft = -timeleft
	}
	
	y = Math.floor((timeleft/(24*60*60*365)))
	d = Math.floor((timeleft/(24*60*60))%365)
	h = Math.floor((timeleft%(24*60*60))/(60*60))
	m = Math.floor((timeleft%(60*60))/60)
	s = Math.floor(timeleft%60)
	$("#t_y").text(""+y)	
	$("#t_d").text(""+d)
	$("#t_h").text(""+h)
	$("#t_m").text(""+m)
	$("#t_s").text(""+s)
	$("#cutbox0").css("top",150-(d%365)*150/365+"px")
	$("#cd0").css("top",(d%365)*150/365-150+"px")
	$("#cutbox1").css("top",150-h*150/24+"px")
	$("#cd1").css("top",h*150/24-150+"px")
	$("#cutbox2").css("top",150-m*150/60+"px")
	$("#cd2").css("top",m*150/60-150+"px")
	$("#cutbox3").css("top",150-s*150/60+"px")
	$("#cd3").css("top",s*150/60-150+"px")
	if(y==0)
	{
		$("#year_block").css("width",'0px')
		$("#year_block").css("height",'0px')
	}
	else{
		$("#year_block").css("width",'80px')
		$("#year_block").css("height",'80px')
	}
}

window.interval_id = setInterval("next2()",window.v_interval*1000);
setInterval("refershCountDown()",1000);

