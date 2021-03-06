var state = 'welcome';
var user = '';
var currentTimezone = (((new Date().getTimezoneOffset())/60)*(-1));
var currTimezString = 'GMT'+((currentTimezone<0) ? '-' : '+')+('0'+Math.floor(Math.abs(currentTimezone))).slice(-2)+('0'+(((Math.abs(currentTimezone)-Math.floor(Math.abs(currentTimezone))))*60)).slice(-2);
var listViewDay = 0;
var isaa;
var events = [];
var cm = 0;
var cy = 0;
var viewstate;
var rn = 0;
var lwr = 0;
var fwr = 0;
var oss = 0;
var currentDatetime = new Date();
var currentDaytime;
var goheight;
var gowidth;
var gooffsettop;
var gooffsetleft;
if(currentDatetime.getHours()<6) {
    currentDaytime = 0;
} else if(currentDatetime.getHours()<10) {
    currentDaytime = 1;
} else if(currentDatetime.getHours()<17) {
    currentDaytime = 2;
} else if(currentDatetime.getHours()<22) {
    currentDaytime = 3;
} else {
    currentDaytime = 0;
}

/**
 * Wait for the document to be ready.
 * @returns {Array|Boolean} I have no idea...
 */
$(document).ready(function() {
    /**
     * Wait for the document to load.
     */
    $(window).load(function() {
        if($.cookie('overview')==undefined) {
            $.cookie('overview', 'true');
        } else if($.cookie('overview')=='false') {
            $('#calendar_wrapper #headline #settings #content #overview').attr('src', 'img/checkbox_unchecked.svg');
        }

        resizeFont();
        if($.cookie('user')==undefined) {
            $('#welcome h1').css('opacity', '1');
            setTimeout(function() {
                state = 'user';
                changeFullscreen('welcome', 'user', 'Choose your name<br><input id="username" type="text" maxlength="10">', '#04858f');
                setTimeout(function() {
                    $('#user #username').focus();
                }, 100);
            }, 3000);
        } else {
            state = 'user';
            $('#calendar_wrapper #headline #settings #content #loggedin').attr('src', 'img/checkbox_checked.svg');
            var tmpe = jQuery.Event("keypress");
            tmpe.which = 13;
            $(document).trigger(tmpe);
        }

        //Clicks
        
        /**
         * Create a new appointment entry on click on the plus.
         */
        $('#calendar_wrapper #headline #new_entry').click(function() {
            state = "newapt1";
            if(viewstate==0||viewstate==1) {
                viewswerehere = true;
                toggleViews();
            } else {
                viewswerehere = false;
            }
            toggleCalendar();
            $('#back_fullscreen').css({'opacity': '0', 'cursor': 'auto'});
            clearFullscreen('name', 'What\'s going on?*<br><input id="aptname" type="text"><br><span style="font-size:0.5em">*required</span>', '#024d25');
            $('#aptname').focus();
        });

        /**
         * Close the fullscreen on click on the x.
         */
        $('#close_fullscreen').click(function() {
            if(viewswerehere) {
                toggleViews();
            }
            toggleCalendar();
        });

        /**
         * Go to the next day on click on #next.
         */
        $('#calendar_wrapper #day #next').click(function() {
            $('#calendar_wrapper #appointment_list, #calendar_wrapper #day #current').css('opacity', '0');
            setTimeout(function() {
                listViewDay++;
                drawListView(listViewDay);
                $('#calendar_wrapper #appointment_list, #calendar_wrapper #day #current').css('opacity', '1');
            }, 500);
        });

        /**
         * Go to the previous day on click on #back.
         */
        $('#calendar_wrapper #day #back').click(function() {
            $('#calendar_wrapper #appointment_list, #calendar_wrapper #day #current').css('opacity', '0');
            setTimeout(function() {
                listViewDay--;
                drawListView(listViewDay);
                $('#calendar_wrapper #appointment_list, #calendar_wrapper #day #current').css('opacity', '1');
            }, 500);
        });

        /**
         * Close the detail view on click on the x.
         */
        $('#detail #info #close').click(function() {
            if(!editchecked){
                hideDetailView();
            }else{
                cAlert('Warning', 'Please save before closing the Detail View!', 4000, 'warning');
            }
        });

        $('#calendar_wrapper #headline #settings > img').click(function() {
            toggleSettings();
        });

        $('#calendar_wrapper #headline #settings #content #overview').click(function() {
            toggleOverview();
        });

        $('#calendar_wrapper #headline #settings #content #loggedin').click(function() {
            toggleStayLoggedIn();
        });
        
        $('#calendar_wrapper #headline #toggle_view #monthview').click(function() {
            if(viewstate==1){
                $("#views #time").remove();
                $("#views #container > div").remove();
                viewstate=0;
                createMonthView(cm,cy);
                $('#calendar_wrapper #headline #toggle_view #monthview').css({'border-radius': '1em', 'background-color': '#04959f'});
                $('#calendar_wrapper #headline #toggle_view #weekview').css({'border-radius': '0', 'background-color': '#04756f'});
            } else if(viewstate==0 || viewstate==3) {
                toggleViews();
                if(viewstate==0) {
                    $('#calendar_wrapper #headline #toggle_view #monthview').css({'border-radius': '1em', 'background-color': '#04959f'});
                } else {
                    $('#calendar_wrapper #headline #toggle_view #monthview').css({'border-radius': '0', 'background-color': '#04756f'});
                }
            }
        });
        
        $('#calendar_wrapper #headline #toggle_view #weekview').click(function() {
            if(viewstate==0){
                $("#views #days").prepend("<div class='time' id='time' style='float:left'>&nbsp;</div>");
                fwr = parseInt($('#views #' + isaa.toISOString().slice(0,10)).parent().attr('id').slice(1,2));
                changeToWeekView(fwr);
                viewstate=1;
                $('#calendar_wrapper #headline #toggle_view #weekview').css({'border-radius': '1em', 'background-color': '#04959f'});
                $('#calendar_wrapper #headline #toggle_view #monthview').css({'border-radius': '0', 'background-color': '#04756f'});
            } else if(viewstate==1 || viewstate==3) {
                toggleViews();
                if(viewstate==0) {
                    $('#calendar_wrapper #headline #toggle_view #weekview').css({'border-radius': '1em', 'background-color': '#04959f'});
                    fwr = parseInt($('#views #' + isaa.toISOString().slice(0,10)).parent().attr('id').slice(1,2));
                    changeToWeekView(fwr);
                    viewstate=1
                } else {
                    $('#calendar_wrapper #headline #toggle_view #weekview').css({'border-radius': '0', 'background-color': '#04756f'});
                }
            }
        });
        
        $('#back_fullscreen').click(function() {
            if(state.indexOf('newapt')!=-1) {
                currentScreen = parseInt(state.replace('newapt',''));
                if(currentScreen>1) {
                    if(currentScreen==2) {
                        $('#back_fullscreen').css({'opacity': '0', 'cursor': 'auto'});
                    }
                    state = 'newapt' + (currentScreen-1);
                    //console.log($('#fullscreen div:eq(' + (currentScreen-1) + ')').attr('id'));
                    changeFullscreen($('#fullscreen div:eq(' + (currentScreen-1) + ')').attr('id'), $('#fullscreen div:eq(' + (currentScreen-2) + ')').attr('id'));
                }
            }
        });

        /**
         * Delete an event after click on the trash.
         * @param {Object} event The click event
         */
        $(document).on('click', '#calendar_wrapper #appointment_list .aptlst #delete', function(event) {
            event.stopPropagation(); //Stay where you are, detail view!
            $.post('http://host.bisswanger.com/dhbw/calendar.php', {
                'user': user,
                'action': 'delete',
                'format': 'json',
                'id': $(this).parent().attr('id'),
            }, function(data, success) {
                if(data.error!=undefined) {
                    cAlert('Error', 'The element could not be deleted. The error is<br>#' + data.error.id + ': ' + data.error.text, 4000, 'error');
                } else {
                    syncEvents(function(data, success) {
                        cAlert('Deleted', 'The element was successfully deleted.', 4000, 'success');
                    });
                }
            });
        });

        /**
         * Show the detail view for the clicked element.
         */
        $(document).on('click', '#calendar_wrapper #appointment_list .aptlst', function() {
            drawDetailView($(this).attr('id'));
        });

        //Hovers

        /**
         * On mouseover, open trash.
         */
        $(document).on('mouseover', '#calendar_wrapper #appointment_list .aptlst #delete', function() {
            $(this).find('img').attr('src', 'img/trash_hover.svg');
        });

        /**
         * On mouseout, close trash.
         */
        $(document).on('mouseout', '#calendar_wrapper #appointment_list .aptlst #delete', function() {
            $(this).find('img').attr('src', 'img/trash.svg');
        });

        /**
         * On mouseover, highlight appointment.
         */
        $(document).on('mouseover', '#calendar_wrapper #appointment_list .aptlst', function() {
            $(this).find('#delete').css('opacity', '1');
            $(this).find('#time').css('color', '#000000');
        });

        /**
         * On mouseout, remove highlight from appointment.
         */
        $(document).on('mouseout', '#calendar_wrapper #appointment_list .aptlst', function() {
            $(this).find('#delete').css('opacity', '0');
            $(this).find('#time').css('color', '#bbbbbb');
        });
        
        /** EDIT FUNCTION FOCUSSES **/
        var editchecked = false;
        $('#detail #info #edit').click(function() {
            if(editchecked) {
                sc = 0;
                $('#status > img').each(function (){
                  if($(this).width() > 0){sc++}  
                });
                $('*:focus').focusout();
                if(sc>1){
                    editchecked = !editchecked;
                    cAlert('Warning', 'You have to choose a Status.', 2000, 'warning'); 
                }else if($('#alert').css('opacity') > 0){
                    editchecked = !editchecked;
                }else{
                    $(this).css({'transform': 'rotate(-360deg) scale(0)', 'background-color': 'transparent'});
                    setTimeout(function() {
                        $('#detail #info #edit img').attr('src', 'img/edit.svg');
                        $('#detail #info #edit').css({'transform': 'rotate(0deg) scale(1)'});
                    }, 250);
                    
                    //Disable inputs
                    $('#detail #info input[type="text"]').attr('disabled', 'true');
                    if(stattoggle!=false||stattoggle!=undefined) {
                        $('#detail #info #status').click();
                    }
                    $('#detail #info #status img').off('click');
                    $('#detail #info #status img').css({'cursor': 'auto'});
                    
                    editstart = $('#detail #info #startdatey').val() + '-' + $('#detail #info #startdatem').val() + '-' + $('#detail #info #startdated').val() + 'T' + $('#detail #info #starttimeh').val() + ':' + $('#detail #info #starttimem').val();
                    editend = $('#detail #info #enddatey').val() + '-' + $('#detail #info #enddatem').val() + '-' + $('#detail #info #enddated').val() + 'T' + $('#detail #info #endtimeh').val() + ':' + $('#detail #info #endtimem').val();
                    
                    /** TIMEZONE FIX **/
                    editstart = new Date((new Date(editstart + 'Z').getTime())+(1000*3600*currentTimezone*-1)).toISOString().substr(0,16);
                    editend = new Date((new Date(editend + 'Z').getTime())+(1000*3600*currentTimezone*-1)).toISOString().substr(0,16);
    
                    $.post('http://host.bisswanger.com/dhbw/calendar.php', {
                        'user': user,
                        'action': 'update',
                        'format': 'json',
                        'id': state.split('_')[1],
                        'title': $('#detail #info #title').val(),
                        'location': $('#detail #info #locin').val(),
                        'organizer': $('#detail #info #orgin').val(),
                        'start': editstart,
                        'end': editend,
                        'status': stattoggle.substr(0,1).toUpperCase()+stattoggle.substr(1),
                        'allday': 0,
                        'webpage': $('#detail #info #website').val()
                    }, function(data, success) {
                        if(data.error!=undefined) {
                            cAlert('No edit today<br>my app has broke away', 'Dang it!<br>#'+ data.error.id + ' with message<br>' + data.error.text + '<br>has occured.', 7500, 'error');
                            drawDetailView(state.split('_')[1]);
                        } else {
                            cAlert('Edit successful', $('#detail #info #title').val() + ' was edited.', 3500, 'success');
                        }
                        syncEvents();
                    });
                }
            } else {
                cAlert('Edit enabled', 'Just click on the entries you want to edit.<br>Afterwards, click on the save icon.', 3500);
                $(this).css({'transform': 'rotate(-360deg) scale(0)'});
                setTimeout(function() {
                    $('#detail #info #edit img').attr('src', 'img/save.svg');
                    $('#detail #info #edit').css({'transform': 'rotate(-720deg) scale(1)', 'background-color': 'rgba(0,0,0,0.3)'});
                }, 250);
                
                //Enable inputs
                $.each($('#detail #info #status img'), function(i, obj) {
                    if($(obj).css('width')!='0px') {
                        stattoggle = $(obj).attr('id');
                    }
                });
                
                $('#detail #info input[type="text"]').removeAttr('disabled');
                $('#detail #info #status img').click(toggleStatus);
                $('#detail #info #status img').css({'cursor': 'pointer'});
            }
            editchecked = !editchecked;
        });
        
        $('#detail #info #title').focusin(function() {
            $(this).css({'width': '90%', 'background-color': 'rgba(0,0,0,0.3)'});
        });
        
        $('#detail #info #title').focusout(function() {
            if($('#detail #info #title').val().length > 0){
                $('#detail #info #measure').css({'font-size': '1em', 'font-family': '"Slabo 27px", "Arial"'});
                $('#detail #info #measure').html($('#detail #title').val());
                $(this).css({'width': $('#detail #info #measure').width(), 'background-color': 'transparent'});
            }else{
                cAlert('Warning', 'It is necessary to enter a title', 4000, 'warning');
                $('#detail #info #title').focus();
            }
        });
        
        var fe;
        
        $.each($('#detail #info #time input[type="text"]'), function(i, obj) {
            $(obj).focusin(function() {
                $(this).css({'width': '7.5%', 'background-color': 'rgba(0,0,0,0.3)'});
                fe = $(this).attr('id');
            });
            
            $(obj).focusout(function() {
                if($('#'+fe).val().length > 0){
                    startdate = new Date($('#startdatey').val() + '/' + $('#startdatem').val() + '/' + $('#startdated').val() + ' ' + $('#starttimeh').val() + ':' + $('#starttimem').val());
                    enddate = new Date($('#enddatey').val() + '/' + $('#enddatem').val() + '/' + $('#enddated').val() + ' ' + $('#endtimeh').val() + ':' + $('#endtimem').val());
                    if(enddate.getTime() > startdate.getTime()){
                        $('#detail #info #measure').css({'font-size': '0.5em', 'font-family': '"PT Sans", "Arial"'});
                        $('#detail #info #measure').html($(this).val());
                        $(this).css({'width': $('#detail #info #measure').width(), 'background-color': 'transparent'});
                    }else{
                        cAlert('Warning', 'End should be after Start', 4000, 'warning');
                        $('#'+fe).focus();
                    }
                }else{
                    cAlert('Warning', 'It is necessary to enter every date field', 4000, 'warning');
                    $('#'+fe).focus();
                }
            });
        });
        
        $.each($('#detail #info #location input[type="text"]'), function(i, obj) {
            $(obj).focusin(function() {
                $(obj).css({'width': '90%', 'background-color': 'rgba(0,0,0,0.3)'});
                fe = $(this).attr('id');
            });
            
            $(obj).focusout(function() {
                if($('#'+fe).val().length > 0){
                    $('#detail #info #measure').css({'font-size': '0.5em', 'font-family': '"PT Sans", "Arial"'});
                    $('#detail #info #measure').html($(obj).val());
                    $(obj).css({'width': $('#detail #info #measure').width(), 'background-color': 'transparent'});
                }else{
                    cAlert('Warning', 'It is necessary to enter a location', 4000, 'warning');
                    $('#'+fe).focus();
                }
            });
        });
        
        $.each($('#detail #info #organizer input[type="text"]'), function(i, obj) {
            $(obj).focusin(function() {
                $(obj).css({'width': '45%', 'background-color': 'rgba(0,0,0,0.3)'});
                fe = $(this).attr('id');
                //console.log(fe);
            });
            
            $(obj).focusout(function() {
                 if(($('#'+fe).val().length > 0 && $('#'+fe).val().indexOf('@') != -1 && $('#'+fe).val().indexOf('.') != -1)|| fe == 'website'){   
                    $('#detail #info #measure').css({'font-size': '0.5em', 'font-family': '"PT Sans", "Arial"'});
                    if($(obj).val()!='') {
                        $('#detail #info #measure').html($(obj).val());
                    } else {
                        $('#detail #info #measure').html('no website');
                    }
                    $(obj).css({'width': $('#detail #info #measure').width(), 'background-color': 'transparent'});
                }else{
                    cAlert('Warning', 'It is necessary to enter a mailaddress', 4000, 'warning');
                    $('#'+fe).focus();
                }
            });
        });
        
        var stattoggle = true;
        function toggleStatus(event) {
            if(stattoggle != true) {
                $(this).parent().find('img').css({'width': '3%', 'background-color': 'rgba(0,0,0,0.3)', 'padding': '0 0.5%'});
                stattoggle = true;
            } else {
                $(this).parent().find('img:not(#'+event.target.id+')').css({'width': '0'});
                $(this).parent().find('img').css({'background-color': 'transparent', 'padding': '0 0'});
                stattoggle = event.target.id;
            }
        };
    });

    /** SVG ANIMATIONS **/

//    var settingsIcon = Snap('#calendar_wrapper #headline #settings');
//    var settingsIconGroup = settingsIcon.group();
//    var settingsIconLoad = Snap.load('img/settings.svg', function(fragment) {
//        settingsIconGroup.append(fragment);
//        settingsIconGroup.hover(function() {
//            settingsIconGroup.animate({ transform: 's2r45,150,150' }, 1000, mina.bounce );
//        }, function() {
//            settingsIconGroup.animate({ transform: 's1r0,150,150' }, 1000, mina.bounce );
//        });
//    });

    /**
     * Change the fullscreen message and color with a fancy animation.
     * @param {String} startid    ID of the element, which shall be animated out
     * @param {String} endid      ID of the element, which shall be created and animated in
     * @param {String} endcontent Content in the element, which shall be created and animated in
     * @param {String} endcolor   Color of the element, which shall be created and animated in
     */
    function changeFullscreen(startid, endid, endcontent, endcolor) {
        already = false;
        $.each($('#fullscreen div'), function(i, element) {
            if($(element).attr('id')==endid) {
                already = true;
            }
        });
        if(endcontent!=undefined && !already) {
            $('#fullscreen').append('<div id="'+endid+'" style="background-color:'+endcolor+'; z-index:'+(parseInt($('#'+startid).css('z-index'))-1)+'"><h1 style="opacity:0; margin-left:50%">'+endcontent+'</h1></div>');
        } else {
            $('#fullscreen #'+endid+' h1').css('margin-left', '50%');
            $('#fullscreen #'+endid).css({'display': 'flex', 'opacity': '1'});
        }
        $('#fullscreen #'+startid).css({'opacity': '0'});
        $('#fullscreen #'+startid+' h1').css({'margin-left': '-50%', 'opacity': '0'});
        setTimeout(function() {
            $('#fullscreen #'+endid+' h1').css({'margin-left': '0%', 'opacity': '1'});
            setTimeout(function() {
                $('#fullscreen #'+startid).css('display', 'none');
            }, 1000);
        }, 100);
    }

    /**
     * Animate the fullscreen to the top and make it smaller. Afterwards the free part below becomes the new fullscreen.
     * @param {String} id                   ID of the element which shall be animated to the top
     * @param {Number} percentage           New size of the element
     * @param {Number} fullscreenPercentage Margin from top after the animation
     * @param {String} color                New color of the animated element
     * @param {String} backgroundcolor      Background color which will be seen whilst the animation
     */
    function fromFullscreenToTop(id, percentage, fullscreenPercentage, color, backgroundcolor) {
        $('body').css('background-color', backgroundcolor);
        $('#'+id).css({'height': percentage + '%', 'background-color': color});
        setTimeout(function() {
            $('#'+id).css('display', 'none');
            $('#outer_fullscreen').append('<div id="outer_'+id+'" style="background-color:'+color+'; height:'+percentage+'%; top:'+(100-percentage-fullscreenPercentage)+'%">'+$('#'+id).html()+'</div>');
            $('#fullscreen').css({'height': fullscreenPercentage + '%', 'top': (100-fullscreenPercentage)+'%'});
        }, 1100);
    }

    /**
     * Delete everthing from the fullscreen and create the first new element.
     * @param {String} id      ID of the new first element
     * @param {String} content Content of the new first element
     * @param {String} color   Color of the new first element
     */
    function clearFullscreen(id, content, color) {
        $('#fullscreen').html('<div id="'+id+'" style="background-color:'+color+'"><h1>'+content+'</h1></div>');
        $('#outer_fullscreen').html('');
        $('#fullscreen, #outer_fullscreen').removeAttr('style');
    }

    /**
     * Toggles the calendar display. If displayed before, it animates out, if not, it animates in.
     */
    function toggleCalendar() {
        if($('#calendar_wrapper').css('margin-top')=='0px') {
            $('#calendar_wrapper').css('margin-top', '-150%');
        } else {
            state = 'calendar';
            $('#calendar_wrapper').css('margin-top', '0px');
        }
    }

    function toggleSettings() {
        if($('#calendar_wrapper #headline #settings #content').css('width')=='0px') {
            $('#calendar_wrapper #headline #settings #content').css({'padding': '0.125em 0.5em', 'width': '85%'});
            $('#calendar_wrapper #headline #text').css('opacity', '0');
            setTimeout(function() {
                $('#calendar_wrapper #headline #text').css({'width': '0px', 'margin-left': '-200%'});
            }, 1000);
        } else {
            $('#calendar_wrapper #headline #text').css({'width': 'auto', 'margin-left': '0'});
            $('#calendar_wrapper #headline #settings #content').css({'padding': '0.125em 0em', 'width': '0px'});
            $('#calendar_wrapper #headline #text').css('opacity', '1');
        }
    }

    function toggleOverview() {
        if($.cookie('overview')=='true') {
            $.cookie('overview', 'false');
            $('#calendar_wrapper #headline #settings #content #overview').attr('src', 'img/checkbox_unchecked.svg');
        } else {
            $.cookie('overview', 'true');
            $('#calendar_wrapper #headline #settings #content #overview').attr('src', 'img/checkbox_checked.svg');
        }
    }

    function toggleStayLoggedIn() {
        if($.cookie('user')==undefined) {
            $.cookie('user', user);
            $('#calendar_wrapper #headline #settings #content #loggedin').attr('src', 'img/checkbox_checked.svg');
        } else {
            $.removeCookie('user');
            $('#calendar_wrapper #headline #settings #content #loggedin').attr('src', 'img/checkbox_unchecked.svg');
        }
    }
    
    function toggleViews() {
        if($('#views').css('margin-top')=='0px') {
            $('#views').css('margin-top', '150%');
            viewstate = 3;
        } else {
            viewstate = 0;
            $("#views #container > div").remove();
            createMonthView(cm,cy);
            $('#views').css('margin-top', '0px');
            if($('#calendar_wrapper #headline #toggle_view #weekview').css('background-color')=='rgb(4, 149, 159)') {
                changeToWeekView(fwr);
                viewstate=1;
            }
        }
    }

    /**
     * Writes a custom alert in the lower right corner.
     * @param {String} headline The headline of the alert
     * @param {String} message  The message of the alert
     * @param {Number} time     Display time in milliseconds
     * @param {String} [type]   If you do not need a normal alert, hand over 'success' or 'error' for special alerts.
     */
    function cAlert(headline, message, time, type) {
        $('#alert #headline').removeAttr('class');
        $('#alert #headline').html(headline);
        $('#alert #content').html(message);
        if(type!=undefined) {
            $('#alert #headline').addClass(type);
        }
        $('#alert').css('display', 'block');
        $('#alert').css('opacity', '0.8');
        setTimeout(function() {
            $('#alert').css('opacity', '0');
            setTimeout(function() {
                $('#alert').css('display', 'none');
            }, 510);
        }, time);
    }

    /**
     * Calls resize font on window resize
     */
    $(window).resize(function() {
        resizeFont();
    });

    /**
     * Dynamically resizes the font throughout the document on window resize.
     */
    function resizeFont() {
        $("head > style").remove();
        $('html > head').append('<style>h1{font-size:'+($(window).width()/400)+'em;} #detail{font-size:'+($(window).width()/1600)+'em;} #calendar_wrapper #headline{font-size:'+($(window).width()/400)+'em;} #close_fullscreen{font-size:'+($(window).width()/800)+'em;}; #detail #info #close{font-size:'+($(window).width()/800)+'em;} #views #container{font-size:'+($(window).width()/400)+'em;} #views #header{font-size:'+($(window).width()/700)+'em;} #views .eventinweek>div{font-size:'+($(window).width()/1600)+'em}</style>');
        $('#views').css({'height': ($(window).height()-$('#calendar_wrapper #headline').outerHeight()) + 'px', 'top': $('#calendar_wrapper #headline').outerHeight() + 'px'});
        $('#views #container').css({'height': ($('#views').outerHeight()-$('#views #header').outerHeight()) + 'px'});
    }

    /** Graphics **/

    var aptstatus = '';

    /**
     * Catch all the keyboard inputs.
     * @param {Object} e Gotta catch them all event.
     */
    $(document).keypress(function(e) {
        if(e.which == 13) {
            if(state=='user') {
                userset = false;
                if($.cookie('user')==undefined) {
                    if($('#username').val().length > 0){
                        changeFullscreen('user', 'userloading', '<img src="img/loading.svg" style="height:100px; width:100px">','#04959f');
                        user = $('#user #username').val();
                        userset = true;
                    }else{
                        cAlert('Warning', 'It is necessary to enter a name!', 4000, 'warning');
                    }
                } else{
                    changeFullscreen('welcome', 'userloading', '<img src="img/loading.svg" style="height:100px; width:100px">','#04959f');
                    user = $.cookie('user');
                    userset = true;
                }
                
                if(userset){
                    state = "calendarlist"
                    var titles = [];
                    var times = [];
                    var eventData = []
                    syncEvents(function(data, success) {
                        i = 0;
                        tmpdate = new Date().getTime();
                        if(events[i]!=undefined) {
                            while(new Date(events[i].start).getTime()<tmpdate) {
                                i++;
                                if(events[i]==undefined) {
                                    break;
                                }
                            }
                        }
                        for(j = 0; j<3; j++) {
                            if(events[i]!=undefined) {
                                if(events[i].title.length>15) {
                                    titles[j] = events[i].title.slice(0,14)+'...';
                                } else {
                                    titles[j] = events[i].title;
                                }
                                times[j] = ' at ' + events[i].start.split('T')[1] + '.';                        
                                eventData[j] = getEventTimeData(events[i].start);
                            } else {
                                if(j==0) {
                                    titles[0] = 'Once you have appointments this will be what\'s coming up!';
                                    times[0] = '';
                                    eventData[0] = ['', '#024d25'];
                                    titles[1] = 'The colors indicate the time. This would be at night.';
                                    times[1] = '';
                                    eventData[1] = ['', '#010f47'];
                                    titles[2] = 'So welcome to 4D CAL! Hope you enjoy it!';
                                    times[2] = '';
                                    eventData[2] = ['', '#d90000'];
                                    break;
                                } else if(j==1) {
                                    titles[j] = 'Only one appointment coming up. That means:';
                                    times[j] = '';
                                    eventData[j] = ['', '#024d25'];
                                } else if(j==2) {
                                    titles[j] = 'Nothing more at';
                                    times[j] = 'the moment.';
                                    eventData[j] = ['Free Time!', '#024d25'];
                                }
                            }
                            i++;
                        }
                        if(currentDaytime==0) {
                            greeting = "Have a good night,";
                        } else if(currentDaytime==1) {
                            greeting = "Good morning,";
                        } else if(currentDaytime==2) {
                            greeting = "Hello";
                        } else {
                            greeting = "Good evening,";
                        }
                        changeFullscreen('userloading', 'hello', greeting+' '+user+'!', '#04959f');
                        if($.cookie('overview')=='true') {
                            setTimeout(function() {
                                fromFullscreenToTop('hello', 25, 75, '#04756f', eventData[0][1]);
                                setTimeout(function() {
                                    changeFullscreen('hello', 'nextaptmnt', eventData[0][0]+' '+titles[0]+times[0], eventData[0][1]);
                                }, 1100);
                                setTimeout(function() {
                                    fromFullscreenToTop('nextaptmnt', 25, 50, eventData[0][1], eventData[1][1]);
                                    setTimeout(function() {
                                        changeFullscreen('nextaptmnt', '2ndaptmnt', eventData[1][0]+' '+titles[1]+times[1], eventData[1][1]);
                                        setTimeout(function() {
                                            fromFullscreenToTop('2ndaptmnt', 25, 25, eventData[1][1], eventData[2][1])
                                            setTimeout(function() {
                                                changeFullscreen('2ndaptmnt', '3rdaptmnt', eventData[2][0]+' '+titles[2]+times[2], eventData[2][1]);
                                                setTimeout(function() {
                                                    toggleCalendar();
                                                    setTimeout(function() {
                                                        $('#close_fullscreen').css('display', 'block');
                                                    }, 1000);
                                                }, 2400);
                                            }, 1100);
                                        }, 2400);
                                    }, 1100);
                                }, 3500);
                            }, 2000);
                        } else {
                            setTimeout(function() {
                                toggleCalendar();
                                setTimeout(function() {
                                    $('#close_fullscreen').css('display', 'block');
                                }, 1000);
                            }, 2000);
                        }
                    });
                }
            } else if(state=='newapt1') {
                if($('#aptname').val().length > 0){
                    state = 'newapt2';
                    $('#back_fullscreen').css({'opacity': '1', 'cursor': 'pointer'});
                    changeFullscreen('name', 'place', 'Where do you go?*<br><input id="aptplace" type="text">', '#024d25');
                    $('#aptplace').focus();
                }else{
                    cAlert('Warning', 'It is necessary to enter a name!', 4000, 'warning');
                }
            } else if(state=='newapt2') {
                if($('#aptplace').val().length > 0){
                    state = 'newapt3';
                    changeFullscreen('place', 'corganizer', 'Who planned this?*<br><input id="aptorganizer" type="text" placeholder="Mail Address">', '#024d25');
                    $('#aptorganizer').focus();
                }else{
                    cAlert('Warning', 'It is necessary to enter a place!', 4000, 'warning');
                }
            } else if(state=='newapt3') {
                if($('#aptplace').val().length > 0 && $('#aptorganizer').val().indexOf('@') != -1 && $('#aptorganizer').val().indexOf('.') != -1){
                    state = 'newapt4';
                    changeFullscreen('corganizer', 'start', 'When do you go?*<br><input id="aptyear" type="text" maxlength="4" placeholder="YYYY" style="width:15%"><input id="aptmonth" type="text" maxlength="2" placeholder="MM" style="width:7.5%; margin:0 0.5%"><input id="aptday" type="text" maxlength="2" placeholder="DD" style="width:7.5%"><br><input id="apthour" type="text" maxlength="2" placeholder="HH" style="width:7.5%">:<input id="aptminute" type="text" maxlength="2" placeholder="MM" style="width:7.5%">', '#024d25');
                    $('#aptyear').focus();
                }else{
                    cAlert('Warning', 'It is necessary to enter an E-Mail-Address!', 4000, 'warning');
                }
            } else if(state=='newapt4') {
                if($('#aptyear').val().length + $('#aptmonth').val().length + $('#aptday').val().length + $('#apthour').val().length + $('#aptminute').val().length == 12){
                    state = 'newapt5';
                    changeFullscreen('start', 'end', 'How long is this event?*<br><input id="aptlhour" type="text" style="margin-bottom:2%; width:10%">h<input id="aptlminutes" type="text" maxlength="2" style="margin-bottom:2%; width:10%">min '+currTimezString+'<br><a href="javascript:void(0)" id="aptallday">All Day</a>', '#024d25');
                    aptallday = false;
                    $('#aptallday').click(function() {
                        aptallday = true;
                        var tmpe = jQuery.Event("keypress");
                        tmpe.which = 13;
                        $(document).trigger(tmpe);
                    });
                    $('#aptlhour').focus();
                }else{
                    cAlert('Warning', 'It is necessary to enter a full Date!', 4000, 'warning'); 
                }
            } else if(state=='newapt5') {
                if($('#aptlhour').val().length != 0 && $('#aptlminutes').val().length != 0){
                    state = 'newapt6';
                    changeFullscreen('end', 'status', 'Are you available whilst this?*<br><a href="javascript:void(0)" id="aptfree">Free</a><a href="javascript:void(0)" id="aptbusy">Busy</a><a href="javascript:void(0)" id="apttent">Tentative</a>', '#024d25');
                    $('#aptfree').click(function() {
                        aptstatus = 'Free';
                        state = 'newapt7';
                        changeFullscreen('status', 'webpage', 'Is there a website?<br><input id="aptwebsite" type="text"><br><span style="font-size:0.5em">Enter to skip</span>', '#024d25');
                        $('#aptwebsite').focus();
                    });
                    $('#aptbusy').click(function() {
                        aptstatus = 'Busy';
                        state = 'newapt7';
                        changeFullscreen('status', 'webpage', 'Is there a website?<br><input id="aptwebsite" type="text"><br><span style="font-size:0.5em">Enter to skip</span>', '#024d25');
                        $('#aptwebsite').focus();
                    });
                    $('#apttent').click(function() {
                        aptstatus = 'Tentative';
                        state = 'newapt7';
                        changeFullscreen('status', 'webpage', 'Is there a website?<br><input id="aptwebsite" type="text"><br><span style="font-size:0.5em">Enter to skip</span>', '#024d25');
                        $('#aptwebsite').focus();
                    });
                }else{
                     cAlert('Warning', 'It is necessary to enter a Duration!', 4000, 'warning');  
                }
            } else if(state=='newapt7') {
                state = 'newapt8';
                changeFullscreen('webpage', 'image', 'Do you want to attach an image?<br><a href="javascript:void(0)" id="aptimgsel">Choose Image</a><input id="aptimage" type="file" accept="image/jpeg, image/png" style="display:none;"><br><span style="font-size:0.5em">Enter to skip or continue</span>', '#024d25');
                $('#aptimgsel').click(function() {
                    $('#aptimage').click();
                    $('#aptimgsel').blur();
                });
            } else if(state=='newapt8') {
                $('#back_fullscreen').css({'opacity': '0', 'cursor': 'auto'});
                $('#close_fullscreen').css('opacity', '0');
                changeFullscreen('image', 'sumloading', '<img src="img/loading.svg" style="height:100px; width:100px">', '#024d25');
                
                if(aptallday) {
                    aptstart = $('#aptyear').val()+'-'+$('#aptmonth').val()+'-'+$('#aptday').val()+'T00:00';
                    aptend = $('#aptyear').val()+'-'+$('#aptmonth').val()+'-'+$('#aptday').val() + 'T23:59';
                    aptalldaynum = '1';
                } else {
                    enddate = new Date(parseInt($('#aptyear').val()),parseInt($('#aptmonth').val()-1),parseInt($('#aptday').val()),parseInt($('#apthour').val())+parseInt($('#aptlhour').val()),parseInt($('#aptminute').val())+parseInt($('#aptlminutes').val()),0,0);
                    aptstart = $('#aptyear').val()+'-'+$('#aptmonth').val()+'-'+$('#aptday').val()+'T'+$('#apthour').val()+':'+$('#aptminute').val();
                    aptend = enddate.getFullYear() + '-' + ('0' + (enddate.getMonth()+1)).slice(-2) + '-' + ('0' + enddate.getDate()).slice(-2) + 'T' + ('0' + enddate.getHours()).slice(-2) + ':' + ('0' + enddate.getMinutes()).slice(-2);
                    aptalldaynum = '0';
                }
                
                /** TIMEZONE FIX **/
                /*currentTimezone = (((new Date(aptstart + 'Z').getTimezoneOffset())/60)*(-1));
                currTimezString = 'GMT'+((currentTimezone<0) ? '-' : '+')+('0'+Math.floor(Math.abs(currentTimezone))).slice(-2)+('0'+(((Math.abs(currentTimezone)-Math.floor(Math.abs(currentTimezone))))*60)).slice(-2);*/
                try {
                    aptstart = new Date((new Date(aptstart + 'Z').getTime())+(1000*3600*currentTimezone*-1)).toISOString().substr(0,16);
                    aptend = new Date((new Date(aptend + 'Z').getTime())+(1000*3600*currentTimezone*-1)).toISOString().substr(0,16);
                    timeerror = false;
                } catch(e) {
                    timeerror = true;
                }
                
                $.post('http://host.bisswanger.com/dhbw/calendar.php', {
                    'user': user,
                    'action': 'add',
                    'format': 'json',
                    'title': $('#aptname').val(),
                    'location': $('#aptplace').val(),
                    'organizer': $('#aptorganizer').val(),
                    'start': aptstart,
                    'end': aptend,
                    'status': aptstatus,
                    'allday': 0,//aptalldaynum,
                    'webpage': $('#aptwebsite').val()
                }, function(data, success) {
                    /*currentTimezone = (isaa.getTimezoneOffset()/60)*(-1);
                    currTimezString = 'GMT'+((currentTimezone<0) ? '-' : '+')+('0'+Math.floor(Math.abs(currentTimezone))).slice(-2)+('0'+(((Math.abs(currentTimezone)-Math.floor(Math.abs(currentTimezone))))*60)).slice(-2);*/
                    if(data.error!=undefined || timeerror == true) {
                        changeFullscreen('image', 'summary', 'Oh Snap!<br>#' + data.error.id + ': ' + data.error.text + '<br>Please contact <a href="http://twitter.com/4dialects">us</a> about this error so we can fix it!', '#8f0000');
                    } else {
                        if(document.getElementById('aptimage').files[0]!=undefined) {
                            fd = new FormData();
                            fd.append("user", user);
                            fd.append("action", 'upload-image');
                            fd.append("format", 'json');
                            fd.append("id", data.add.id);
                            fd.append("file", document.getElementById('aptimage').files[0]);
                            $.ajax({
                                url: 'http://host.bisswanger.com/dhbw/calendar.php',
                                type: 'POST',
                                processData: false,
                                contentType: false,
                                data: fd,
                                success: function(imgData, imgSuccess) {
                                    if(imgData.error!=undefined) {
                                        changeFullscreen('image', 'summary', 'Your appoinment has been saved but:<br>No picture for you today!<br>#' + imgData.error.id + ': ' + imgData.error.text + '<br>Please contact <a href="http://twitter.com/4dialects">us</a> about this error so we can fix it!', '#ff8c00');
                                        syncEvents();
                                    } else {
                                        afterCreation();
                                    }
                                }
                            });
                        } else {
                            afterCreation();
                        }
                    }
                    function afterCreation() {
                        state = 'newaptsummary';
                        tmpname = ($('#aptname').val().length<23) ? $('#aptname').val() : $('#aptname').val().slice(0,20)+'...';
                        syncEvents(function(data, success) {
                            if(aptallday) {
                                changeFullscreen('sumloading', 'summary', 'Your appointment has been saved!<br>'+tmpname+'<br>All day on '+$('#aptyear').val()+'/'+$('#aptmonth').val()+'/'+$('#aptday').val()+'!', '#024d25');
                            } else {
                                changeFullscreen('sumloading', 'summary', 'Your appointment has been saved!<br>'+tmpname+'<br>On '+$('#aptyear').val()+'/'+$('#aptmonth').val()+'/'+$('#aptday').val()+' at '+$('#apthour').val()+':'+$('#aptminute').val()+'!', '#024d25');
                            }
                            setTimeout(function() {
                                state = 'calendar';
                                $('#close_fullscreen').css('opacity', '1');
                                toggleCalendar();
                                $('#calendar_wrapper #headline #toggle_view #monthview').css({'border-radius': '0', 'background-color': '#04756f'});
                                $('#calendar_wrapper #headline #toggle_view #weekview').css({'border-radius': '0', 'background-color': '#04756f'});
                            }, 4000);
                        });
                    }
                });
            }
        }
    });
    
    $(document).keyup(function (e) {
        notnum = new RegExp('[^0-9]');
        fe  = $('*:focus').attr('id');
        val = $('#'+fe).val();
        
        if(state=='newapt4'){
            if(val.match(notnum) != null){
                $('#'+fe).val(val.slice(0,$('#'+fe).val().length -1));
            }
            if($('#aptmonth').val() > 12){$('#aptmonth').val('')};
            if($('#aptday').val() > 31){$('#aptday').val('')};
            if($('#apthour').val() > 23){$('#apthour').val('')};
            if($('#aptminute').val() > 59){$('#aptminute').val('')};
            
            if(e.which != 8){
               if($('#'+fe).val().length >= 2){
                    switch(fe){
                        case 'aptyear':
                            if($('#aptyear').val().length == 4){
                                $('#aptmonth').focus();
                            }
                            break;
                        case 'aptmonth':  
                            $('#aptday').focus();
                            break;
                        case 'aptday':  
                            $('#apthour').focus();
                            break;
                        case 'apthour':  
                            $('#aptminute').focus();
                            break;
                    }
                } 
            }else{
                if(val.match(notnum) != null){
                    $('#'+fe).val(val.slice(0,$('#'+fe).val().length -1));
                }
                if($('#aptlminutes').val() > 59){$('#aptlminutes').val('')};
                if($('#'+fe).val().length == 0){
                    switch(fe){
                        case 'aptminute':  
                            $('#apthour').focus();
                            break;
                        case 'apthour':  
                            $('#aptday').focus();
                            break;
                        case 'aptday':  
                            $('#aptmonth').focus();
                            break;
                        case 'aptmonth':  
                            $('#aptyear').focus();
                            break;
                    }
                }
            }
        }
        if(state=='newapt5'){
            if(val.match(notnum) != null){
                    $('#'+fe).val(val.slice(0,$('#'+fe).val().length -1));
                }
            if(e.which != 8){
               if($('#'+fe).val().length == 2 && fe == 'aptlhour'){
                    $('#aptlminutes').focus();
                } 
            }else{
                if($('#'+fe).val().length == 0 && fe == 'aptlminutes'){
                    $('#aptlhour').focus();         
                }
            }
        } 
    });
    
    function getEventTimeData(datetime) {
        eventColor = '';
        eventWord = '';
        currentDate = new Date();
        eventDate = new Date(datetime + 'Z');
        if(currentDate.getDate()==eventDate.getDate()) {
            if(eventDate.getHours()<6) {
                eventWord = 'Early today:';
            } else if(eventDate.getHours()<10) {
                eventWord = 'This morning:';
            } else if(eventDate.getHours()<17) {
                eventWord = 'This afternoon:';
            } else if(eventDate.getHours()<22) {
                eventWord = 'This evening:';
            } else {
                eventWord = 'Tonight:';
            }
        } else if(currentDate.getDate()+1==eventDate.getDate()) {
            if(eventDate.getHours()<6) {
                eventWord = 'Early tomorrow:';
            } else if(eventDate.getHours()<10) {
                eventWord = 'Tomorrow morning:';
            } else if(eventDate.getHours()<17) {
                eventWord = 'Tomorrow afternoon:';
            } else if(eventDate.getHours()<22) {
                eventWord = 'Tomorrow evening:';
            } else {
                eventWord = 'Tomorrow night:';
            }
        } else {
            eventWord = 'On '+eventDate.getFullYear() + '/' + ('0' + (eventDate.getMonth()+1)).slice(-2) + '/' + ('0' + eventDate.getDate()).slice(-2)+':';
        }
        if(eventDate.getHours()<6) {
            eventColor =  '#010F47';
        } else if(eventDate.getHours()<10) {
            eventColor =  '#ff2d00';
        } else if(eventDate.getHours()<17) {
            eventColor =  '#ff8c00';
        } else if(eventDate.getHours()<22) {
            eventColor =  '#d90000';
        } else {
            eventColor =  '#010F47';
        }
        return [eventWord, eventColor];
    }

    function syncEvents(successFunc) {
        events = [];
        $.post('http://host.bisswanger.com/dhbw/calendar.php', {
                    'user': user,
                    'action': 'list',
                    'format': 'json',
                }, function(data, success) {
                    if(data.error!=undefined) {
                        cAlert(data.error.text, 'There seems to be a problem with the database.<br>Please try again later.', 5000, 'error');
                    } else {
                        $.each(data.events.events, function(i, obj) {
                            obj.start = new Date((new Date(obj.start + 'Z').getTime())+(1000*3600*currentTimezone)).toISOString().substr(0,16);
                            obj.end = new Date((new Date(obj.end + 'Z').getTime())+(1000*3600*currentTimezone)).toISOString().substr(0,16);
                            events.push(obj);
                        });
                        events.sort(function(a,b) {
                            return (new Date(a.start).getTime() < new Date(b.start).getTime()) ? -1 : 1;
                        });
                        drawListView(listViewDay);
                        drawMonthView(); //!IMPORTANT
                        if(viewstate==1) {
                            changeToWeekView(fwr);
                        }
                        if(successFunc!=undefined) {
                            successFunc(data, success);
                        }
                    }
        });
    }

    function drawListView(dayaddition) {
        $('#calendar_wrapper #appointment_list .aptlst').remove();
        $('#calendar_wrapper #appointment_list div').css('display', 'none');
        /*currentTimezone = (((new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+dayaddition, currentTimezone, 0, 0, 0).getTimezoneOffset())/60)*(-1));
        currTimezString = 'GMT'+((currentTimezone<0) ? '-' : '+')+('0'+Math.floor(Math.abs(currentTimezone))).slice(-2)+('0'+(((Math.abs(currentTimezone)-Math.floor(Math.abs(currentTimezone))))*60)).slice(-2);*/
        today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+dayaddition, currentTimezone, 0, 0, 0);
        isaa = today;
        if(state.split('_')[0]!='detail') {
            checkDateForDiff(isaa);
        }
        thistime = new Date();
        if(dayaddition==0) {
            $('#calendar_wrapper #day #current').html('Today');
        } else if(dayaddition==1) {
            $('#calendar_wrapper #day #current').html('Tomorrow');
        } else if(dayaddition==-1) {
            $('#calendar_wrapper #day #current').html('Yesterday');
        } else {
            $('#calendar_wrapper #day #current').html(today.getFullYear() + '/' + ('0' + (today.getMonth()+1)).slice(-2) + '/' + ('0' + today.getDate()).slice(-2));
        }
        thisDay = [];
        var i=0;
        if(events[i]!=undefined) {
            while(new Date(events[i].start + 'Z').getTime()<today.getTime()) {
                //console.log(new Date(events[i].start).getTime() + '#' + today.getTime());
                i++;
                if(events[i]==undefined) {
                    break;
                }
            }
            if(events[i]!=undefined) {
                while(new Date(events[i].start + 'Z').getTime()<today.getTime()+(24*3600*1000)) {
                    //alert(events[i].start);
                    eventdate = new Date(new Date(events[i].start + 'Z').getTime()-(3600*1000*currentTimezone));
                    eventdend = new Date(new Date(events[i].end + 'Z').getTime()-(3600*1000*currentTimezone));
                    if(eventdate.getDate() == eventdend.getDate()) {
                        eventlength = ((eventdate.getMinutes()<=eventdend.getMinutes()) ? (eventdend.getHours() - eventdate.getHours()) : (eventdend.getHours() - eventdate.getHours() - 1))
                            + ' hours '
                            + ((eventdate.getMinutes()<=eventdend.getMinutes()) ? (eventdend.getMinutes() - eventdate.getMinutes()) : (eventdend.getMinutes() - eventdate.getMinutes() + 60))
                            + ' minutes';
                        if(eventlength == '23 hours 59 minutes') {
                            eventlength = 'All day';
                        }
                    } else {
                        eventlength = 'Ends on ' + eventdend.getFullYear() + '/' + ('0' + eventdend.getMonth()+1).slice(-2) + '/' + ('0' + eventdend.getDate()).slice(-2);
                    }
                    eventrange = '';
                    if(eventlength == 'All day') {
                        eventrange = 'allday';
                        nexteventrange = 'early';
                    } else if(eventdate.getHours()<6) {
                        eventrange = 'early';
                        nexteventrange = 'morning';
                    } else if(eventdate.getHours()<10) {
                        eventrange = 'morning';
                        nexteventrange = 'afternoon';
                    } else if(eventdate.getHours()<17) {
                        eventrange = 'afternoon';
                        nexteventrange = 'evening';
                    } else if(eventdate.getHours()<22) {
                        eventrange = 'evening';
                        nexteventrange = 'night';
                    } else {
                        eventrange = 'night';
                        nexteventrange = 'endday';
                    }
                    $('#calendar_wrapper #appointment_list #'+eventrange).css('display', 'block');
                    if(eventlength!="All day") {
                        $('#appointment_list #'+nexteventrange).before('<div id="'+events[i].id+'"class="aptlst"><div id="time">'+events[i].start.slice(-5)+' - '+eventlength+'</div>'+events[i].title+'<div id="delete"><img src="img/trash.svg"></div></div>');
                    } else {
                        $('#appointment_list #'+nexteventrange).before('<div id="'+events[i].id+'"class="aptlst"><div style="height:0.35em"></div>'+events[i].title+'<div style="height:0.3em"></div><div id="delete"><img src="img/trash.svg"></div></div>');
                    }
                    i++;
                    if(events[i]==undefined) {
                        break;
                    }
                }
            }
        }
    }

    var firsttimemonth = true;
    function drawMonthView() {
        if(firsttimemonth) {
            init(0, events, isaa);
            firsttimemonth = !firsttimemonth;
        } else {
            $("#views #time").remove();
            $("#views #container > div").remove();
            createMonthView(cm,cy);
        }
    }

    function drawDetailView(id) {
        state = 'detail_'+id;
        $.each(events, function(i, element) {
            if(element.id==id) {
                $('#detail #title').val(element.title);
                $('#detail #status img').css({'width': '0px'});
                if(element.status=='Free') {
                    $('#detail #status img#free').css({'width': '3%'});
                } else if(element.status=='Busy') {
                    $('#detail #status img#busy').css({'width': '3%'});
                } else {
                    $('#detail #status img#tentative').css({'width': '3%'});
                }
                tmpeventstartdate = new Date(new Date(element.start+'Z').getTime()-(3600*1000*currentTimezone));
                tmpeventenddate = new Date(new Date(element.end+'Z').getTime()-(3600*1000*currentTimezone));
                $('#detail #time #text #startdatey').val(tmpeventstartdate.getFullYear());
                $('#detail #time #text #startdatem').val(('0' + (tmpeventstartdate.getMonth()+1)).slice(-2));
                $('#detail #time #text #startdated').val(('0' + tmpeventstartdate.getDate()).slice(-2));
                $('#detail #time #text #starttimeh').val(('0' + tmpeventstartdate.getHours()).slice(-2));
                $('#detail #time #text #starttimem').val(('0' + tmpeventstartdate.getMinutes()).slice(-2));
                $('#detail #time #text #enddatey').val(tmpeventenddate.getFullYear());
                $('#detail #time #text #enddatem').val(('0' + (tmpeventenddate.getMonth()+1)).slice(-2));
                $('#detail #time #text #enddated').val(('0' + tmpeventenddate.getDate()).slice(-2));
                $('#detail #time #text #endtimeh').val(('0' + tmpeventenddate.getHours()).slice(-2));
                $('#detail #time #text #endtimem').val(('0' + tmpeventenddate.getMinutes()).slice(-2));
                $('#detail #location #text #locin').val(element.location);
                $('#detail #organizer #text #orgin').val(element.organizer);
                $('#detail #organizer #text #website').val(element.webpage);
                $('#detailimg').css('background-image', 'url(' + ((element.imageurl=='') ? 'img/detail_standard.png' : element.imageurl) + ')');
                return false;
            }
        });
        /**ANI**/
        if(viewstate==3) {
            goheight = $('#calendar_wrapper #appointment_list #'+id).height();
            gowidth = $(window).width();
            gooffsettop = $('#calendar_wrapper #appointment_list #'+id).offset().top
            gooffsetleft = 0;
        } else if(viewstate==0) {
            goheight = $('#views .event-'+id).height();
            gowidth = $('#views .event-'+id).width();
            gooffsettop = $('#views .event-'+id).offset().top;
            gooffsetleft = $('#views .event-'+id).offset().left;
        }
        $('#detail').css('display', 'block');
        $('#detail').css({'margin-top': '-' + $('#detail #info').outerHeight() + 'px'});
        $('#detailimg').css({'height': goheight + 'px', 'width': gowidth + 'px', 'margin-left' : gooffsetleft + 'px', 'margin-top': gooffsettop + 'px', 'display': 'block'});

        setTimeout(function() {
            $('#detailimg').css({'opacity': '1', 'margin-top': '0', 'margin-left': '0',  'height': '100%', 'width': '100%'});
            setTimeout(function() {
                $('#detail #info #measure').css({'font-size': '1em', 'font-family': '"Slabo 27px", "Arial"'});
                $('#detail #info #measure').html($('#detail #title').val());
                $('#detail #title').width($('#detail #info #measure').width());
                $('#detail #info #measure').css({'font-size': '0.5em', 'font-family': '"PT Sans", "Arial"'});
                $.each($('#detail #time input[type="text"]'), function(i, obj) {
                    $('#detail #info #measure').html($(obj).val());
                    $(obj).width($('#detail #info #measure').width());
                });
                $('#detail #info #measure').html($('#detail #info #location input[type="text"]').val());
                $('#detail #info #location input[type="text"]').width($('#detail #info #measure').width());
                $.each($('#detail #organizer input[type="text"]'), function(i, obj) {
                    if($(obj).val()!='') {
                        $('#detail #info #measure').html($(obj).val());
                    } else {
                        $('#detail #info #measure').html('no website');
                    }
                    $(obj).width($('#detail #info #measure').width());
                });
                $('#detail').css({'opacity': '1', 'margin-top': '0px'});
            }, 300);
        }, 1);
    }

    function hideDetailView() {
        id = state.split('_')[1];
        state = 'calendar';
        $('#detail').css({'opacity': '0', 'margin-top': '-' + $('#detail #info').outerHeight() + 'px'});
        /*if(viewstate==3) {
            goheight = $('#calendar_wrapper #appointment_list #'+id).height();
            gowidth = $(window).width();
            gooffsettop = $('#calendar_wrapper #appointment_list #'+id).offset().top
            gooffsetleft = 0;
        } else if(viewstate==0) {
            goheight = $('#views .event-'+id).height();
            gowidth = $('#views .event-'+id).width();
            gooffsettop = $('#views .event-'+id).offset().top;
            gooffsetleft = $('#views .event-'+id).offset().left;
        }*/
        setTimeout(function() {
            $('#detailimg').css({'height': goheight + 'px', 'width': gowidth + 'px', 'margin-left': gooffsetleft + 'px', 'margin-top': gooffsettop + 'px'});
            setTimeout(function() {
                $('#detailimg').css('opacity', '0');
                setTimeout(function() {
                    $('#detail').css('display', 'none');
                    $('#detailimg').css('display', 'none');

                }, 150);
            }, 150);
        }, 500);
    }
    
    /**
     * This function measures the font size of a given font. Thanks to nrabinowitz from stackoverflow!
     * @param   {String} txt  The text which should be measured
     * @param   {String} font The font which is used to display the text
     * @returns {Object} Measure Object which contains width and height of text
     */
    function measureText(txt, font) {
        var id = 'text-width-tester',
            $tag = $('#' + id);
        if (!$tag.length) {
            $tag = $('<span id="' + id + '" style="display:none;font:' + font + ';">' + txt + '</span>');
            $('body').append($tag);
        } else {
            $tag.css({font:font}).html(txt);
        }
        return {
            width: $tag.width(),
            height: $tag.height()
        }
    }
    
    /** Toms Backstagebereich **/
    
    $("#views #back").click(function(){
        changeView(-1);
    });
        
    $("#views #forward").click(function(){
        changeView(1);
    });
    
    $(document).keydown(function(e){
        if(viewstate!=3){
            if(e.keyCode == 37){
                changeView(-1);
            }else if(e.keyCode == 39){
                changeView(1);
            }else if(e.keyCode == 27){
                $("#views #time").remove();
                $("#views #container > div").remove();
                viewstate=0;
                createMonthView(cm,cy);
            }
        }
    });
    
    
    //$("#views").prepend("<div class='overlay'><img src='img/loading.svg' style='width:10%;height:10%;'></img></div>");
    
    
    
    /**Initialize view
    * @param {Nus0 - Starts Monthview
    *            1 - Starts Weekview
    */
    function init(s,evar,sp){
        events = evar;
        cm = sp.getMonth() +1;
        cy = sp.getFullYear();
        $("#views #header #days").remove();
        $("#views #header").append("<div id='days'></div>");
        for(i=0;i<7;i++){
            if(i!=6){
                $("#views #days").append("<div class='cell h'>"+displayDay(i)+"</div>");
            }else{
                $("#views #days").append("<div class='lastcell cell h'>"+displayDay(i)+"</div>");
            }
        }
        viewstate = s;
        if(s==0){
            createMonthView(cm,cy);
        }else if(s==1){
            createMonthView(cm,cy);
            setTimeout(function() {
                changeToWeekView(fwr);
            }, 500);
        }
        
        resizeFont();
        viewstate = 3;
    }
    
    /**
    * Changes Week in Weekview or Month in Monthview
    * @param {Number} c  1 - Next
    *                   -1 - Previous
    */
    
    function checkDateForDiff(curdate){
        curmonth = curdate.getMonth()+1;
        //console.log(curmonth);
        if(curmonth>cm){
            viewstate=0;
            changeView(1);
            viewstate=3;
        }else if(curmonth<cm){
            viewstate=0;
            changeView(-1);
            viewstate=3;
        }
        //console.log("cm:"+cm);
    }
    
    function changeView(c){
        $("#views #container > div").remove();
        if(viewstate==0){
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
        }else if(viewstate==1){
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
            changeToWeekView(rn); //THIS WAS THE VERY IMPORTANT CHANGE
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
            $("#views #"+cellid).append("<div class='dates omonth' id='list-"+newid+"'>"+dc+"</div>");
            $("#views #"+cellid).append("<div id='"+newid+"' class='events pm'></div>");
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
            $("#views #"+cellid).append("<div class='dates' id='list-"+newid+"'>"+(i+1)+"</div>");
            $("#views #"+cellid).append("<div id='"+newid+"' class='events'></div>");
            lwr=week;
            if(n==6){week++;}
        }
        td = new Date();
        tdid=td.getFullYear()+"-"+(("0" + (td.getMonth()+1)).slice(-2))+"-"+(("0" + (td.getDate())).slice(-2));
        $("#list-"+tdid).css("background-color","#04756f");      
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
                $("#views #"+cellid).append("<div class='dates omonth' id='list-"+newid+"'>"+dc+"</div>");
                $("#views #"+cellid).append("<div id='"+newid+"' class='events nm'></div>");
                dc++;
            }
            n=-1;
        }
        
        if(viewstate==0){
            drawDates();   
        }
        
        
        $("#views .dates").on("click",function(){
            id = $(this).attr("id");
            id = id.slice(-10);
            date1 = new Date(new Date(id).getTime()-(currentTimezone*3600*1000));
            date2 = new Date();
            timeDiff = date1.getTime() - date2.getTime();
            diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            $('#calendar_wrapper #headline #toggle_view #monthview').css({'border-radius': '0', 'background-color': '#04756f'});
            $('#calendar_wrapper #headline #toggle_view #weekview').css({'border-radius': '0', 'background-color': '#04756f'});
            toggleViews();
            listViewDay = diffDays;
            drawListView(listViewDay);
        });
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
        viewstate=1;
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
        var head = [];
        head[0] = displayMonth((parseInt(divs[0].slice(5,7)))-1);
        head[1] = parseInt(divs[0].slice(8,10));
        head[2] = divs[0].slice(0,4);
        head[3] = displayMonth((parseInt(divs[6].slice(5,7)))-1);
        head[4] = parseInt(divs[6].slice(8,10));
        head[5] = divs[6].slice(0,4); 
        
        $("#views .head").html(head[0]+" "+head[1]+", "+head[2]+" - "+head[3]+" "+head[4]+", "+head[5]);
        
        drawDates();
    }
    
    /**
    * Gets Data of Events and Draws them into Weekview
    */
    function drawDates(){
        if(viewstate==0){
            for(i=0;i<events.length;i++){
                createEventInMonth(events[i].id,events[i].title,events[i].start,events[i].end);   
            }
            $(".eventinmonth").on("click",function(){
                rx = new RegExp("[0-9]+"); 
                id = parseInt(rx.exec($(this).attr("class")));
                drawDetailView(id);
            });
        }else if(viewstate==1){
            for(i=0;i<events.length;i++){
                createEventInWeek(events[i].id,events[i].title,events[i].start,events[i].end,events[i].allday,events[i].imageurl);   
            }
            
            $(".eventinweek").each(function (){
                day = $(this).attr("id");
                divs = [];
                $("#"+day+">div").each(function (){
                    if($(this).attr('id') != undefined){
                        divs.push('#'+$(this).attr('id'));     
                    }else{
                        divs.push('.'+$(this).attr('class')); 
                    }
                });
                if(divs.length > 1){
                   checkCollision(divs); 
                }
            });
            
            $(".eventinweek > div").on("click",function(){
                rx = new RegExp("[0-9]+"); 
                id = parseInt(rx.exec($(this).attr("class")));
                drawDetailView(id);
            });
        }
        
    }
    
    function checkCollision(divarray){
        for(i=0;i<divarray.length;i++){
            for(j=1;j<divarray.length;j++){
                if(i!=j){
                    $div1 = $(divarray[i]);
                    $div2 = $(divarray[j]);
                    
                    if($div1.attr('id') == undefined){
                        x1 = $div1.offset().left;
                        y1 = $div1.offset().top;
                        h1 = $div1.outerHeight(true);
                        w1 = $div1.outerWidth(true);
                        b1 = y1 + h1;
                        r1 = x1 + w1;
                        x2 = $div2.offset().left;
                        y2 = $div2.offset().top;
                        h2 = $div2.outerHeight(true);
                        w2 = $div2.outerWidth(true);
                        b2 = y2 + h2;
                        r2 = x2 + w2;
                        
                        if (!(b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2)){
                            $div1.css("width","45%"); 
                            $div2.css("width","45%"); 
                            $div1.css("float","left");
                            $div2.css("float","left");
                            $div2.css("margin-left","55%");  
                        }
                    }else{
                        $div1.css("width","45%"); 
                        $div2.css("width","45%"); 
                        $div1.css("float","left");
                        $div2.css("float","left");
                        $div2.css("margin-left","55%");  
                    }
                }
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
    function createEventInWeek(id,title,start,end,allday,imageurl){
        var day=start.slice(0,10);
        var startpoint=parseInt(start.slice(-5,-3));
        startpoint += (parseInt(start.slice(-2)))/60;
        var duration = calculateDuration(start,end);
        $("#views #"+day).append("<div class='event-"+id+"'></div>");
        $("#views .event-"+id).append("<div class='eventtitle'>"+title+"</div>");
        $("#views .event-"+id).css("position","absolute");
        $("#views .event-"+id).css("z-index",id);
        $("#views .event-"+id).css("overflow", "hidden");
        color = getEventTimeData(start);
        $("#views .event-"+id).css("background-color",color[1]);
        $("#views .event-"+id).css("margin-top",preciseStart(startpoint)+"px");
        $("#views .event-"+id).css("height",preciseHeight(id,startpoint,duration,day,allday,color[1]));
        sizecomp = $('.event-'+id).height() / $('.event-'+id+' .eventtitle').height();
        if(sizecomp<1){
            $('.event-'+id+' .eventtitle').css('font-size',sizecomp+'em');
        }
    }
    
    function createEventInMonth(id,title,start,end){
        var startday=start.slice(0,10);
        var endday=end.slice(0,10);
        var starttime = start.slice(11,16);
        var endtime = end.slice(11,16);
        startd = new Date(start);
        end = new Date(end);
        d1 = startd.getTime();
        d2 = end.getTime();
        c=0;
        while(d1<=d2){
            d = startd.getDate();
            startd.setDate(d+1);
            d1 = startd.getTime();
            if(c==0){
                line1 = title,line2 = starttime+" - 23:59";
            }else{
                line1 = title,line2 = " All Day ";
                startday = startday.slice(0,8) + ("0"+(parseInt(startday.slice(-2))+1)).slice(-2);
            }
            $("#views #"+startday).append("<div class='eventinmonth event-"+id+"'><div>"+line1+"</div><div>"+line2+"</div></div>");
            color = getEventTimeData(start);
            $("#views .event-"+id).css("background-color",color[1]);
            c++;
        }
        if(c!=1){
            line1 = title,line2 = "00:00 - " + endtime;
        }else{
            if(starttime!="00:00" || endtime!="23:59") {
                line1 = title,line2 = starttime + " - " + endtime;
            } else {
                line1 = title,line2 = " All Day ";
            }
        }
        $("#views #"+startday+" .event-"+id).html("<div>"+line1+"</div><div>"+line2+"</div>");
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
    function preciseHeight(id,start,dur,day,allday,color){
        var unit = 35.4;
        var pix=0;
        var step = 0.0166;
        for(pl=0;pl<dur;pl+=step){
            pix += unit*step;
        }
        var maxheight=$("#views #eiwc").height()-preciseStart(start);
        if(pix>maxheight && ((start + dur) != 24)){
            $('.event-'+id).attr('id','origin-'+id);
            drawOffset(id,(pix-maxheight),day,color);
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
    function drawOffset(id,pix,date,color){
        var day = parseInt(date.slice(-2));
        var month = parseInt(date.slice(5,7));
        var year = parseInt(date.slice(0,4));
        day++;
        if(day>new Date(year,month,0).getDate()){
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
        var maxheight = $("#views #eiwc").height();
        if(pix>maxheight){
            $("#views #"+date).append("<div id='offset-"+day+"-"+id+"' class='event-"+id+"'></div>");
            $("#views #offset-"+day+"-"+id).css("height",(maxheight+50)+"px");
            $("#views #offset-"+day+"-"+id).css("background-color",color);
            $("#views #offset-"+day+"-"+id).css("border-top","none");  
            drawOffset(id,(pix-maxheight),date,color);
        }else{
            $("#views #"+date).append("<div id='offset-"+day+"-"+id+"'></div>");
            $("#views #offset-"+day+"-"+id).css("height",pix+"px");
            $("#views #offset-"+day+"-"+id).css("background-color",color);
            $("#views #offset-"+day+"-"+id).css("border-top","none");
        }
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