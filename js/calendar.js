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
            hideDetailView();
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
        
        $('#calendar_wrapper #headline #toggle_view').click(function() {
            toggleViews();
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
                if(data.delete.status=='success') {
                    syncEvents(function(data, success) {
                        cAlert('Deleted', 'The element was successfully deleted.', 4000, 'success');
                    });
                } else {
                    cAlert('Error', 'The element could not be deleted. The error is', 4000, 'error');
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
        $('#fullscreen').append('<div id="'+endid+'" style="background-color:'+endcolor+'; z-index:'+(parseInt($('#'+startid).css('z-index'))-1)+'"><h1 style="opacity:0; margin-left:50%">'+endcontent+'</h1></div>');
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
            $('#calendar_wrapper #headline #settings #content').css({'padding': '0.125em 0.5em', 'width': '90%'});
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
        $('html > head').append('<style>h1{font-size:'+($(window).width()/400)+'em;} #detail{font-size:'+($(window).width()/1600)+'em;} #calendar_wrapper #headline{font-size:'+($(window).width()/400)+'em;} #close_fullscreen{font-size:'+($(window).width()/800)+'em;}; #detail #info #close{font-size:'+($(window).width()/800)+'em;} #views #container{font-size:'+($(window).width()/400)+'em;} #views #header{font-size:'+($(window).width()/700)+'em;}</style>');
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
                if($.cookie('user')==undefined) {
                    changeFullscreen('user', 'userloading', '<img src="img/loading.svg" style="height:100px; width:100px">','#04959f');
                    user = $('#user #username').val();
                } else {
                    changeFullscreen('welcome', 'userloading', '<img src="img/loading.svg" style="height:100px; width:100px">','#04959f');
                    user = $.cookie('user');
                }
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
                            titles[j] = events[i].title;
                            times[j] = events[i].start.split('T')[1];                        
                            eventData[j] = getEventTimeData(events[i].start);
                        } else {
                            if(j==0) {
                                titles[0] = 'This is where your day is shown and you have a quick look';
                                times[0] = 'it';
                                eventData[0] = ['', '#024d25'];
                                titles[1] = 'The colors indicate the daytime. This would be';
                                times[1] = 'night';
                                eventData[1] = ['', '#010f47'];
                                titles[2] = 'and enjoy making appointments';
                                times[2] = 'this place';
                                eventData[2] = ['So welcome -', '#d90000'];
                                break;
                            } else if(j==1) {
                                titles[j] = 'You\'re free';
                                times[j] = 'this time';
                                eventData[j] = ['Enjoy!', '#024d25'];
                            } else if(j==2) {
                                titles[j] = 'Nothing more';
                                times[j] = 'the moment';
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
                                changeFullscreen('hello', 'nextaptmnt', eventData[0][0]+' '+titles[0]+' at '+times[0]+'.', eventData[0][1]);
                            }, 1100);
                            setTimeout(function() {
                                fromFullscreenToTop('nextaptmnt', 25, 50, eventData[0][1], eventData[1][1]);
                                setTimeout(function() {
                                    changeFullscreen('nextaptmnt', '2ndaptmnt', eventData[1][0]+' '+titles[1]+' at '+times[1]+'.', eventData[1][1]);
                                    setTimeout(function() {
                                        fromFullscreenToTop('2ndaptmnt', 25, 25, eventData[1][1], eventData[2][1])
                                        setTimeout(function() {
                                            changeFullscreen('2ndaptmnt', '3rdaptmnt', eventData[2][0]+' '+titles[2]+' at '+times[2]+'.', eventData[2][1]);
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
            } else if(state=='newapt1') {
                state = 'newapt2';
                changeFullscreen('name', 'place', 'Where do you go?*<br><input id="aptplace" type="text">', '#024d25');
                $('#aptplace').focus();
            } else if(state=='newapt2') {
                state = 'newapt3';
                changeFullscreen('place', 'corganizer', 'Who planned this?*<br><input id="aptorganizer" type="text" placeholder="Mail Address">', '#024d25');
                $('#aptorganizer').focus();
            } else if(state=='newapt3') {
                state = 'newapt4';
                changeFullscreen('corganizer', 'start', 'When do you go?*<br><input id="aptyear" type="text" maxlength="4" placeholder="YYYY" style="width:15%"><input id="aptmonth" type="text" maxlength="2" placeholder="MM" style="width:7.5%; margin:0 0.5%"><input id="aptday" type="text" maxlength="2" placeholder="DD" style="width:7.5%"><br><input id="apthour" type="text" maxlength="2" placeholder="HH" style="width:7.5%">:<input id="aptminute" type="text" maxlength="2" placeholder="MM" style="width:7.5%">', '#024d25');
                $('#aptyear').focus();
            } else if(state=='newapt4') {
                state = 'newapt5';
                changeFullscreen('start', 'end', 'How long is this event?*<br><input id="aptlhour" type="text" style="margin-bottom:2%; width:10%">h<input id="aptlminutes" type="text" style="margin-bottom:2%; width:10%">min '+currTimezString+'<br><a href="javascript:void(0)" id="aptallday">All Day</a>', '#024d25');
                aptallday = false;
                $('#aptallday').click(function() {
                    aptallday = true;
                    var tmpe = jQuery.Event("keypress");
                    tmpe.which = 13;
                    $(document).trigger(tmpe);
                });
                $('#aptlhour').focus();
            } else if(state=='newapt5') {
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
                    changeFullscreen('availability', 'webpage', 'Is there a website?<br><input id="aptwebsite" type="text"><br><span style="font-size:0.5em">Enter to skip</span>', '#024d25');
                    $('#aptwebsite').focus();
                });
                $('#apttent').click(function() {
                    aptstatus = 'Tentative';
                    state = 'newapt7';
                    changeFullscreen('availability', 'webpage', 'Is there a website?<br><input id="aptwebsite" type="text"><br><span style="font-size:0.5em">Enter to skip</span>', '#024d25');
                    $('#aptwebsite').focus();
                });
            } else if(state=='newapt7') {
                state = 'newapt8';
                changeFullscreen('webpage', 'image', 'Do you want to attach an image?<br><a href="javascript:void(0)" id="aptimgsel">Choose Image</a><input id="aptimage" type="file" accept="image/jpeg, image/png" style="display:none;"><br><span style="font-size:0.5em">Enter to skip or continue</span>', '#024d25');
                $('#aptimgsel').click(function() {
                    $('#aptimage').click();
                    $('#aptimgsel').blur();
                });
            } else if(state=='newapt8') {
                if(aptallday) {
                    aptstart = $('#aptyear').val()+'-'+$('#aptmonth').val()+'-'+$('#aptday').val()+'T00:00';
                    aptend = $('#aptyear').val()+'-'+$('#aptmonth').val()+'-'+$('#aptday').val() + 'T23:59';
                    aptalldaynum = '1';
                } else {
                    enddate = new Date(parseInt($('#aptyear').val()),parseInt($('#aptmonth').val()),parseInt($('#aptday').val()),parseInt($('#apthour').val())+parseInt($('#aptlhour').val()),parseInt($('#aptminute').val())+parseInt($('#aptlminutes').val()),0,0);
                    aptstart = $('#aptyear').val()+'-'+$('#aptmonth').val()+'-'+$('#aptday').val()+'T'+$('#apthour').val()+':'+$('#aptminute').val();
                    aptend = enddate.getFullYear() + '-' + ('0' + (enddate.getMonth()+1)).slice(-2) + '-' + ('0' + enddate.getDate()).slice(-2) + 'T' + ('0' + enddate.getHours()).slice(-2) + ':' + ('0' + enddate.getMinutes()).slice(-2);
                    aptalldaynum = '0';
                }
                
                /** TIMEZONE FIX **/
                aptstart = new Date((new Date(aptstart + 'Z').getTime())+(1000*3600*currentTimezone*-1)).toISOString().substr(0,16);
                aptend = new Date((new Date(aptend + 'Z').getTime())+(1000*3600*currentTimezone*-1)).toISOString().substr(0,16);
                
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
                    'allday': aptalldaynum,
                    'webpage': $('#aptwebsite').val()
                }, function(data, success) {
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
                                afterCreation();
                            }
                        });
                    } else {
                        afterCreation();
                    }
                    function afterCreation() {
                        state = 'newaptsummary';
                        tmpname = ($('#aptname').val().length<23) ? $('#aptname').val() : $('#aptname').val().slice(0,20)+'...';
                        $('#close_fullscreen').css('opacity', '0');
                        changeFullscreen('image', 'sumloading', '<img src="img/loading.svg" style="height:100px; width:100px">', '#024d25');
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
                            }, 4000);
                        });
                    }
                });
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
                    if(successFunc!=undefined) {
                        successFunc(data, success);
                    }
        });
    }

    function drawListView(dayaddition) {
        $('#calendar_wrapper #appointment_list .aptlst').remove();
        $('#calendar_wrapper #appointment_list div').css('display', 'none');
        today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+dayaddition, currentTimezone, 0, 0, 0);
        isaa = today;
        checkDateForDiff(isaa);
        thistime = new Date();
        if(dayaddition==0) {
            $('#calendar_wrapper #day #current').html('Today');
        } else if(dayaddition==1) {
            $('#calendar_wrapper #day #current').html('Tomorrow');
        } else if(dayaddition==-1) {
            $('#calendar_wrapper #day #current').html('Yesterday');
        } else {
            $('#calendar_wrapper #day #current').html(today.getUTCFullYear() + '/' + ('0' + (today.getUTCMonth()+1)).slice(-2) + '/' + ('0' + today.getUTCDate()).slice(-2));
        }
        thisDay = [];
        var i=0;
        if(events[i]!=undefined) {
            while(new Date(events[i].start).getTime()<today.getTime()) {
                i++;
                if(events[i]==undefined) {
                    break;
                }
            }
            if(events[i]!=undefined) {
                while(new Date(events[i].start).getTime()<today.getTime()+(24*3600*1000)) {
                    eventdate = new Date(events[i].start);
                    eventlengthtmp = new Date(new Date(events[i].end).getTime()-eventdate.getTime());
                    eventlength = eventlengthtmp.getUTCHours() + ' hours ' + eventlengthtmp.getUTCMinutes() + ' minutes';
                    eventrange = '';
                    if(eventdate.getUTCHours()<6) {
                        eventrange = 'early';
                        nexteventrange = 'morning';
                    } else if(eventdate.getUTCHours()<10) {
                        eventrange = 'morning';
                        nexteventrange = 'afternoon';
                    } else if(eventdate.getUTCHours()<17) {
                        eventrange = 'afternoon';
                        nexteventrange = 'evening';
                    } else if(eventdate.getUTCHours()<22) {
                        eventrange = 'evening';
                        nexteventrange = 'night';
                    } else {
                        eventrange = 'night';
                        nexteventrange = 'endday';
                    }
                    $('#calendar_wrapper #appointment_list #'+eventrange).css('display', 'block');
                    $('#appointment_list #'+nexteventrange).before('<div id="'+events[i].id+'"class="aptlst"><div id="time">'+events[i].start.slice(-5)+' - '+eventlength+'</div>'+events[i].title+'<div id="delete"><img src="img/trash.svg"></div></div>');
                    i++;
                    if(events[i]==undefined) {
                        break;
                    }
                }
            }
        }
    }

    function drawMonthView() {
        init(0, events, isaa);
    }

    function drawDetailView(id) {
        state = 'detail_'+id;
        $.each(events, function(i, element) {
            if(element.id==id) {
                $('#detail #title').html(element.title);
                if(element.status=='Free') {
                    $('#detail #status img').attr('src', 'img/free.svg');
                } else if(element.status=='Busy') {
                    $('#detail #status img').attr('src', 'img/busy.svg');
                } else {
                    $('#detail #status img').attr('src', 'img/tentative.svg');
                }
                tmpeventstartdate = new Date(element.start);
                $('#detail #time #text').html(tmpeventstartdate.getFullYear() + '/' + ('0' + (tmpeventstartdate.getUTCMonth()+1)).slice(-2) + '/' + ('0' + tmpeventstartdate.getUTCDate()).slice(-2) + ' | ' + element.start.slice(-5) + ' - ' + element.end.slice(-5));
                $('#detail #location #text').html(element.location);
                $('#detail #organizer #text').html(element.organizer + ' | ' + ((element.webpage=='') ? 'no website' : element.webpage));
                $('#detailimg').css('background-image', 'url(' + ((element.imageurl=='') ? 'img/detail_standard.png' : element.imageurl) + ')');                
                return false;
            }
        });
        /**ANI**/
        $('#detail').css('display', 'block');
        $('#detail').css({'margin-top': '-' + $('#detail #info').outerHeight() + 'px'});
        $('#detailimg').css({'height': $('#calendar_wrapper #appointment_list #'+id).height() + 'px', 'margin-top': $('#calendar_wrapper #appointment_list #'+id).offset().top + 'px', 'display': 'block'});

        setTimeout(function() {
            $('#detailimg').css({'opacity': '1', 'margin-top': '0', 'height': '100%'});
            setTimeout(function() {
                $('#detail').css({'opacity': '1', 'margin-top': '0px'});
            }, 300);
        }, 1);
    }

    function hideDetailView() {
        id = state.split('_')[1];
        state = 'calendar';
        $('#detail').css({'opacity': '0', 'margin-top': '-' + $('#detail #info').outerHeight() + 'px'});
        setTimeout(function() {
            $('#detailimg').css({'height': $('#calendar_wrapper #appointment_list #'+id).height() + 'px', 'margin-top': $('#calendar_wrapper #appointment_list #'+id).offset().top + 'px'});
            setTimeout(function() {
                $('#detailimg').css('opacity', '0');
                setTimeout(function() {
                    $('#detail').css('display', 'none');
                    $('#detailimg').css('display', 'none');

                }, 150);
            }, 150);
        }, 500);
    }
    
    /** Toms Backstagebereich **/
    
    $("#views #back").click(function(){
        changeView(-1);
    });
        
    $("#views #forward").click(function(){
        changeView(1);
    });
    
    $(".eventinmonth").on("click",function(){
        console.log("!");
        //rx = new RegExp("[0-9]+"); 
        //id = parseInt(rx.exec($(this).attr("id")));
        //drawDetailView(id);
    });
    
    $("#views #weekview").click(function(){
        if(viewstate==0){
            $("#views #days").prepend("<div class='time' id='time' style='float:left'>&nbsp;</div>");
            changeToWeekView(fwr);
            viewstate=1;
        }
    });
    
    $("#views #monthview").click(function(){
        if(viewstate==1){
            $("#views #time").remove();
            $("#views #container > div").remove();
            viewstate=0;
            createMonthView(cm,cy);
        }
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
        cm = sp.getUTCMonth() +1;
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
        
        $("#views .overlay").remove();
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
        //console.log(cm+"/"+cy);
        
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
        if(viewstate==0){
            for(i=0;i<events.length;i++){
                createEventInMonth(events[i].id,events[i].title,events[i].start,events[i].end,events[i].status);   
            }
        }else if(viewstate==1){
            for(i=0;i<events.length;i++){
                createEventInWeek(events[i].id,events[i].title,events[i].start,events[i].end,events[i].status,events[i].allday,events[i].imageurl);   
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
    
    function createEventInMonth(id,title,start,end,status){
        var startday=start.slice(0,10);
        var endday=end.slice(0,10);
        var starttime = start.slice(11,16);
        var endtime = end.slice(11,16);
        var line1 = title,line2 = starttime+" - "+endtime;
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