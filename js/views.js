var cm = 0;
var cy = 0;
var state;
var rn = 0;
var lwr = 0;
var fwr = 0;
var oss = 0;
var events = [];
$(document).ready(function(){
    $("#views").prepend("<div class='overlay'><img src='img/loading.svg' style='width:10%;height:10%;'></img></div>");
    
    $("#views #back").click(function(){
        changeView(-1);
    });
        
    $("#views #forward").click(function(){
        changeView(1);
    });
    
    $("#views #addperson").on("click",function(){
        addPerson();
    });
    
    $("#views #weekview").click(function(){
        if(state==0){
            $("#views #days").prepend("<div class='time' id='time' style='float:left'>&nbsp;</div>");
            changeToWeekView(fwr);
            state=1;
        }
    });
    
    $("#views #monthview").click(function(){
        if(state==1){
            $("#views #time").remove();
            $("#views #container > div").remove();
            state=0;
            createMonthView(cm,cy);
        }
    });
    
    //$(window).resize(function() {
        //resize();
    //});
    
    $(document).keydown(function(e){
    if(e.keyCode == 37){
        changeView(-1);
    }else if(e.keyCode == 39){
        changeView(1);
    }else if(e.keyCode == 27){
        $("#views #time").remove();
        $("#views #container > div").remove();
        state=0;
        createMonthView(cm,cy);
    }
    });
    
    
    /**Initialize view
    * @param {Nus0 - Starts Monthview
    *            1 - Starts Weekview
    */
    function init(s,evar){
        state = s;
        events = evar;
        var year = new Date().getFullYear();
        var month = new Date().getUTCMonth()+1;
        cm = month;
        cy = year;
        resize();
        $("#views #header").append("<div id='days'></div>");
        for(i=0;i<7;i++){
            if(i!=6){
                $("#views #days").append("<div class='cell h'>"+displayDay(i)+"</div>");
            }else{
                $("#views #days").append("<div class='lastcell cell h'>"+displayDay(i)+"</div>");
            }
        }
        
        if(state==0){
            createMonthView(cm,cy);
        }else if(state==1){
            createMonthView(cm,cy);
            setTimeout(function() {
                changeToWeekView(fwr);
            }, 500);
        }
        
        $("#views .overlay").remove();
    }
    
    /**
    * Changes Week in Weekview or Month in Monthview
    * @param {Number} c  1 - Next
    *                   -1 - Previous
    */
    function changeView(c){
        $("#views #container > div").remove();
        if(state==0){
            if(c<0){
                cm--;
                if(cm==0){
                    cm=12;
                    cy--;
                }
            }if(c>0){
                cm++;
                if(cm==13){
                    cm=1;
                    cy++;
                }
            }
            createMonthView(cm,cy);
        }else{
            if(c<0){
                rn--;
                if(rn<fwr){
                    cm--;
                    if(cm==0){
                        cm=12;
                        cy--;
                    }
                    createMonthView(cm,cy);
                    $("#views #container > div").remove();
                    rn=lwr;
                    if(new Date(Date.UTC(cy,cm,0)).getDay() != 6){
                        rn--;
                    }
                }
            }else if(c>0){
                rn++;
                if(rn>lwr){
                    rn=1;
                    cm++;
                    if(cm==13){
                        cm=1;
                        cy++;
                    }
                }
            }
            createMonthView(cm,cy);
            changeToWeekView(rn);
        }
    }
    
    /**
    * Draw Weekview
    * @param {String} m Month to display
    * @param {Number} y Year to display
    */
    function createMonthView(m,y){
        $("#views .head").html(displayMonth(m-1)+' '+y);
        createContainer();
        
        //needed vars
        var cellid,n,week,date,fdoc,ldop,dc,cw,pmy,pm,ny,nm,newid;
        week = 0;
        
        //previous month
        fdoc = new Date(Date.UTC(y,m-1,1)).getDay();
        if(m-1==0){
            pm = 12;
            pmy = y-1;
            ldop = new Date(Date.UTC(pmy,pm,0)).getDate();
        }else{
            pm = m-1;
            pmy = y;
            ldop = new Date(Date.UTC(pmy,pm,0)).getDate();
        }
        fwr=0;
        if(fdoc==0){
            fdoc=7;
            fwr=1;
            week++;
        }
        dc = ldop-fdoc+1;
        for(i=0;i<=fdoc-1;i++){
            cellid="r0f"+i;
            $("#views #"+cellid).css("color","grey");
            newid=pmy+"-"+(("0" + pm).slice(-2))+"-"+(("0" + dc).slice(-2));
            $("#views #"+cellid).append("<div class='dates omonth'>"+dc+"</div>");
            $("#views #"+cellid).append("<div id='"+newid+"' class='events pm 0e'></div>");
            dc++;
        }
        //current month
        date = new Date(Date.UTC(y,m,0));
        dc = date.getDate();
        //alert(dc);
        for(var i=0;i<=dc-1;i++){
            date.setDate(i+1);
            n = date.getDay();
            cellid="r"+week+"f"+n;
            newid=y+"-"+(("0" + m).slice(-2))+"-"+(("0" + (i+1)).slice(-2));
            $("#views #"+cellid).append("<div class='dates'>"+(i+1)+"</div>");
            $("#views #"+cellid).append("<div id='"+newid+"' class='events 0e'></div>");
            lwr=week;
            if(n==6){week++;}
        }
        //next month
        dc = 1;
        if(m==12){
            nm=1;
            ny=y+1;
        }else{
            nm=m+1;
            ny = y;
        }
        if(n==6){n=-1;}
        for(r=week;r<7;r++){
            for(f=n+1;f<7;f++){
                cellid="r"+r+"f"+f;
                $("#views #"+cellid).css("color","grey");
                newid=ny+"-"+(("0" + nm).slice(-2))+"-"+(("0" + dc).slice(-2));
                $("#views #"+cellid).append("<div class='dates omonth'>"+dc+"</div>");
                $("#views #"+cellid).append("<div id='"+newid+"' class='events nm 0e'></div>");
                dc++;
            }
            n=-1;
        }
        drawDates();
    }
    
    /**
    * Resizes Font
    */
    /*function resize(){
        $("head > style").remove();
        $('html > head').append('<style>#container{font-size:'+($(window).width()/400)+'em;} #header{font-size:'+($(window).width()/400)+'em;} </style>');
    }*/
    
    /**
    * Returns Name of Day
    * @param   {Number} d Daynumber (0-Sunday,1-Monday,...,6-Saturday)
    * @returns {String}   Name of Day
    */
    function displayDay(d){
        var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        return days[d];
    }
    
    /**
    * Returns Name of Month
    * @param   {Number} m Monthnumber (0-January,1-February,...,11-December)
    * @returns {String}   Name of Month
    */
    function displayMonth(m){
        var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        return months[m];
    }
    
    /**
    * Creates Container which will be filled with Month/Weekview
    */
    function createContainer(){
        for(r = 0; r<6;r++){
            for(f = 0; f<7;f++){
                if(f==6){
                    $("#views #container").append("<div id='new' class='lastcell cell '></div>");
                }else{
                    $("#views #container").append("<div id='new' class='cell'></div>"); 
                }
                $("#views #new").attr("id","r"+r+"f"+f);
            }
        }
    }
    
    /**
    * Changes from Month to Weekview, deletes unused divs and creates new ones for timeline and events
    * @param   {Number}   rownumber Number of row of week in container of monthview
    */
    function changeToWeekView(rownumber){
        state=1;
        var cellid;
        for(r=0;r<6;r++){
            for(f=0;f<7;f++){
                cellid = "r"+r+"f"+f;
                if(r!=rownumber){
                    $("#views #"+cellid).remove();
                }
            }
        }
        var divs = $("#views #container div[id]").map(function() { return this.id; }).get();
        divs.sort();
        $("#views .cell").addClass("week");
        $("#views .lastcell").addClass("week");
        $("#views .dates").addClass("w");
        $("#views #container").prepend("<div id='timelinecontainer' class='cell time'style='font-size:0.3em'>Time</div>");
        $("#views #container").append("<div id='timeline' class='cell time'></div>");
        for(i=0;i<24;i++){
            var time=("0"+i+":00").slice(-5);
            $("#views #timeline").append("<div class='time side'>"+time+"</div>"); 
        }
        
        for(i=0;i<7;i++){
            $("#views #"+divs[i]).remove();
        }
        
        $("#views #timeline").append("<div id='eiwc'></div>");
        for(i=0;i<7;i++){
            $("#views #eiwc").append("<div class='eventinweek' id='"+divs[i]+"'></div>");
        }
        $("#views #"+divs[6]).addClass("lastday");
        //2015-01-01
        $("#views .dates").css("background-color","#04756f");
        var head = [];
        head[0] = displayMonth((parseInt(divs[0].slice(5,7)))-1);
        head[1] = parseInt(divs[0].slice(8,10));
        head[2] = divs[0].slice(0,4);
        head[3] = displayMonth((parseInt(divs[6].slice(5,7)))-1);
        head[4] = parseInt(divs[6].slice(8,10));
        head[5] = divs[6].slice(0,4); 
        
        $("#views .head").html(head[0]+" "+head[1]+", "+head[2]+" - "+head[3]+" "+head[4]+", "+head[5]);
    }
    
    /**
    * Gets Data of Events and Draws them into Weekview
    */
    function drawDates(){
        if(state==0){
            for(i=0;i<events.length;i++){
                createEventInMonth(events[i].id,events[i].title,events[i].start,events[i].end,events[i].status,events[i].allday);   
            }
        }else if(state==1){
            for(i=0;i<events.length;i++){
                createEventInMonth(events[i].id,events[i].title,events[i].start,events[i].end,events[i].status,events[i].allday,events[i].imageurl);   
            }
        }
        
    }
    
    /**Creates Event in Weekview based on multiple Informations:
    * @param {Number}   id         ID
    * @param {String}   title      Title
    * @param {String}   organizer  Mailadress of Organizer
    * @param {String}   start      Start Date yyyy-mm-ddThh:mm
    * @param {String}   end        End Date yyyy-mm-ddThh:mm
    * @param {String}   status     Busy/Tentative/Free
    * @param {Boolean}  allday     0-Defined Time Range
    *                              1-All Day
    * @param {String}   webpage    Link(?)
    * @param {String}   imageurl   Background Image for Event Container
    * @param {Array(?)} categories Categories
    */
    function createEventInWeek(id,title,start,end,status,allday,imageurl){
        var day=start.slice(0,10);
        var startpoint=parseInt(start.slice(-5,-3));
        startpoint += (parseInt(start.slice(-2)))/60;
        var duration = calculateDuration(start,end);
        $("#views #"+day).append("<div id='event-"+id+"'></div>");
        $("#views #event-"+id).append("<div class='eventtitle'>"+title+"</div>");
        $("#views #event-"+id).append("<div class='eventinfo'></div>");
        $("#views #event-"+id).css("position","absolute");
        $("#views #event-"+id).css("z-index",id);
        if(status=="Free"){
            $("#views #event-"+id).css("background-color","rgba(255,255,255,0.3)");
        }else if(status=="Tentative"){
            $("#views #event-"+id).css("background-color","rgba(255,51,0,0.5)");
        }else if(status=="Busy"){
            $("#views #event-"+id).css("background-color","rgba(0,0,255,0.8)");
        }
        if(allday==0){
            $("#views #event-"+id).css("margin-top",preciseStart(startpoint)+"px");
            $("#views #event-"+id).css("height",preciseLength(id,startpoint,duration,day));
        }else{
            $("#views #event-"+id).css("margin-top",preciseStart(0));
            $("#views #event-"+id).css("height",preciseLength(0,0,24,0)); 
        }
        if(imageurl!=""){
            $("#views #event-"+id).css("background-image","url('"+imageurl+"')");
            $("#views #event-"+id).css("background-size","100% auto");   
            $("#views #event-"+id).css("background-repeat","no-repeat");
        }
        oss=0;
        drawDates();
    }
    
    function createEventInMonth(id,title,start,end,status,allday){
        var startday=start.slice(0,10);
        var endday=end.slice(0,10);
        var starttime = start.slice(11,16);
        var endtime = end.slice(11,16);
        var line1 = title,line2 = starttime+" - "+endtime;
        if(allday){
            line2 = "All Day";
        }
        $("#views #"+startday).append("<div class='eventinmonth' id='event-"+id+"'><div>"+line1+"</div><div>"+line2+"</div></div>");
        color = getEventTimeData(start);
        $("#views #event-"+id).css("background-color",color[1]);
    }
    
    /**Calculates Pixelvalue for start point
    * @param   {Number} h  Start x45t
    * @returns {Number}    Pixelvalue of start point
    */
    function preciseStart(h){
        var unit = 37;
        var pix = h*unit;
        return pix;   
    }
    
    /**
    * Calculates Pixelvalue for the Length of an Event
    * @param   {Number} id    ID of event
    * @param   {Number} start Start point
    * @param   {Number} dur   Duration of Event
    * @param   {Number} day   Date of Event
    * @returns {Number}       Pixelvalue of Length of Event
    */
    function preciseLength(id,start,dur,day){
        var unit = 37;
        var timepoint=start;
        var pix=0;
        var step = 0.01
        for(i=0;i<dur;i+=step){
            pix += unit*step;
        }
        var maxheight=$("#views #eiwc").height()-preciseStart(start);
        if(pix>maxheight){
            drawOffset(id,pix-maxheight,day);
            return (maxheight+50)+"px";
        }
        return pix+"px"; 
    }
    
    /**
    * If the event lasts longer than the day, drawOffset calculates the Pixelvalue for the event range on the next day
    * @param {Number} id   ID of Date
    * @param {Number} pix  Calculated Length for Event
    * @param {Number} date Date of Event
    */
    function drawOffset(id,pix,date){
        var day = parseInt(date.slice(-2));
        var month = parseInt(date.slice(5,7));
        var year = parseInt(date.slice(0,4));
        day++;
        if(day>new Date(Date.UTC(year,month,0)).getDate()){
            day=1;
            month++;
            if(month=13){
                month=1;
                year++;
            }
        }
        day = ("0"+day).slice(-2);
        month = ("0"+month).slice(-2);
        date=year+"-"+month+"-"+day;
        color=$("#views #event-"+id).css("background-color");
        width=$("#views #event-"+id).css("width");
        var maxheight = $("#views #eiwc").height();
        if(pix>maxheight){
            $("#views #"+date).append("<div id='offset-"+day+"'></div>");
            $("#views #offset-"+day).css("width",width);
            $("#views #offset-"+day).css("height",(maxheight+50)+"px");
            $("#views #offset-"+day).css("background-color",color);
            $("#views #offset-"+day).css("border-top","none");  
            //drawOffset(id,pix-maxheight,date);
        }else{
            $("#views #"+date).append("<div id='offset-"+day+"'></div>");
            $("#views #offset-"+day).css("height",pix+"px");
            $("#views #offset-"+day).css("width",width);   
            $("#views #offset-"+day).css("background-color",color);
            $("#views #offset-"+day).css("border-top","none");   
            $("#views #event-"+id+" span").appendTo("#offset-"+day);
            $("#views #event-"+id+" > .eventinfo").remove();
        }
        oss=1;
    }
    
    /**
    * Calculates the Duration of an Event
    * @param   {Number} start start point
    * @param   {Number} end   Endpoint
    * @returns {Num}          Duration
    */
    function calculateDuration(start,end){
        var start_actual_time = new Date(start);
        var end_actual_time = new Date(end);
        
        var diff = end_actual_time - start_actual_time;
        
        var diffSeconds = diff/1000;
        var hh = Math.floor(diffSeconds/3600);
        var mm = Math.floor(diffSeconds%3600)/60;  
        return hh+(mm/60);
    }
});
